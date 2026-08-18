import type { Order, OrderItem, OrderStatus } from '@/types'

export const SELLER_COMMISSION_RATE = 0.1

export interface SellerStats {
  totalSales: number
  totalRevenue: number
  grossRevenue: number
  pendingPayment: number
  completedPayment: number
  thisMonth: number
}

export interface SellerTransaction {
  id: string
  type: 'sale' | 'commission'
  amount: number
  status: 'completed' | 'pending'
  date: string
  description: string
}

function isCompletedOrder(status: OrderStatus): boolean {
  return status === 'delivered'
}

function isPendingOrder(status: OrderStatus): boolean {
  return status !== 'delivered' && status !== 'cancelled'
}

export function getSellerItemsFromOrder(order: Order, sellerId: string): OrderItem[] {
  return (order.items || []).filter((item) => item.seller_id === sellerId)
}

export function filterOrdersForSeller(orders: Order[], sellerId: string): Order[] {
  return orders.filter((order) => getSellerItemsFromOrder(order, sellerId).length > 0)
}

export function getSellerOrderTotal(order: Order, sellerId: string): number {
  return getSellerItemsFromOrder(order, sellerId).reduce((sum, item) => sum + Number(item.total), 0)
}

export function computeSellerStats(orders: Order[], sellerId: string): SellerStats {
  const sellerOrders = filterOrdersForSeller(orders, sellerId)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  let totalSales = 0
  let grossRevenue = 0
  let pendingPayment = 0
  let completedPayment = 0
  let thisMonth = 0

  for (const order of sellerOrders) {
    if (order.status === 'cancelled') continue

    const items = getSellerItemsFromOrder(order, sellerId)
    const gross = items.reduce((sum, item) => sum + Number(item.total), 0)
    const net = gross * (1 - SELLER_COMMISSION_RATE)

    totalSales += items.reduce((sum, item) => sum + item.quantity, 0)
    grossRevenue += gross

    if (isCompletedOrder(order.status)) {
      completedPayment += net
    } else if (isPendingOrder(order.status)) {
      pendingPayment += net
    }

    if (new Date(order.created_at) >= monthStart) {
      thisMonth += net
    }
  }

  const totalRevenue = completedPayment + pendingPayment

  return {
    totalSales,
    totalRevenue,
    grossRevenue,
    pendingPayment,
    completedPayment,
    thisMonth,
  }
}

export function buildSellerTransactions(orders: Order[], sellerId: string): SellerTransaction[] {
  const transactions: SellerTransaction[] = []

  for (const order of filterOrdersForSeller(orders, sellerId)) {
    if (order.status === 'cancelled') continue

    const completed = isCompletedOrder(order.status)
    const status = completed ? 'completed' : 'pending'

    for (const item of getSellerItemsFromOrder(order, sellerId)) {
      const gross = Number(item.total)
      const commission = gross * SELLER_COMMISSION_RATE

      transactions.push({
        id: `${order.id}-${item.product_id}-sale`,
        type: 'sale',
        amount: gross,
        status,
        date: order.created_at,
        description: `${item.product_name} — Sipariş #${order.order_number}`,
      })

      transactions.push({
        id: `${order.id}-${item.product_id}-commission`,
        type: 'commission',
        amount: -commission,
        status,
        date: order.created_at,
        description: `Komisyon kesintisi — #${order.order_number}`,
      })
    }
  }

  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}
