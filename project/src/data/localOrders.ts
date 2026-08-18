import type { Order } from '@/types'

const ORDERS_KEY = 'marketplace_local_orders'

function readOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    return raw ? (JSON.parse(raw) as Order[]) : []
  } catch {
    return []
  }
}

function writeOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

export function saveLocalOrder(order: Order) {
  const orders = readOrders()
  orders.unshift(order)
  writeOrders(orders)
}

export function getLocalOrder(orderId: string): Order | undefined {
  return readOrders().find((o) => o.id === orderId)
}

export function getLocalOrders(): Order[] {
  return readOrders()
}
