import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { Order, OrderItem, Address, OrderStatus } from '@/types'
import { useAuthStore } from './auth'
import { useCartStore } from './cart'
import { getLocalOrder, saveLocalOrder } from '@/data/localOrders'
import { isOfflineProductId } from '@/data/localCart'

function buildStockItems(items: { product_id: string; quantity: number }[]) {
  return items
    .filter((item) => !isOfflineProductId(item.product_id))
    .map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }))
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `MP-${timestamp}-${random}`
  }

  async function fetchOrders() {
    const authStore = useAuthStore()
    if (!authStore.user) return

    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      orders.value = data as Order[]
    } catch (e) {
      console.error('Error fetching orders:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderById(orderId: string) {
    loading.value = true

    const local = getLocalOrder(orderId)
    if (local) {
      currentOrder.value = local
      loading.value = false
      return local
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (fetchError) throw fetchError

      currentOrder.value = data as Order
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Sipariş bulunamadı'
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderByNumber(orderNumber: string) {
    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single()

      if (fetchError) throw fetchError

      currentOrder.value = data as Order
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Sipariş bulunamadı'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createOrder(data: {
    shipping_address: Address
    billing_address: Address
    payment_method: string
    notes?: string
  }): Promise<Order | null> {
    const authStore = useAuthStore()
    const cartStore = useCartStore()

    if (!authStore.user) {
      error.value = 'Sipariş oluşturmak için giriş yapmalısınız'
      return null
    }

    if (cartStore.items.length === 0) {
      error.value = 'Sepetiniz boş'
      return null
    }

    loading.value = true
    error.value = null

    const orderNumber = generateOrderNumber()
    const orderId = crypto.randomUUID()

    const orderItems: Partial<OrderItem>[] = cartStore.items.map((item) => ({
      product_id: item.product_id,
      product_name: item.product?.name || '',
      product_image: item.product?.images?.[0] || '',
      quantity: item.quantity,
      unit_price: item.product?.discount_price || item.product?.price || 0,
      total: (item.product?.discount_price || item.product?.price || 0) * item.quantity,
      seller_id: item.product?.seller_id || '',
    }))

    const subtotal = cartStore.subtotal
    const discount = cartStore.discount
    const shippingCost = cartStore.shippingCost
    const tax = cartStore.tax
    const total = cartStore.total

    const orderPayload = {
      order_number: orderNumber,
      user_id: authStore.user.id,
      status: 'processing' as OrderStatus,
      items: orderItems,
      shipping_address: data.shipping_address,
      billing_address: data.billing_address,
      subtotal,
      discount,
      shipping_cost: shippingCost,
      tax,
      total,
      coupon_code: cartStore.appliedCoupon?.code,
      payment_method: data.payment_method,
      payment_status: 'paid',
      notes: data.notes,
    }

    const stockItems = buildStockItems(cartStore.items)

    try {
      if (stockItems.length > 0) {
        const { error: stockError } = await supabase.rpc('decrement_products_stock', {
          p_items: stockItems,
        })
        if (stockError) throw stockError
      }

      const { data: order, error: insertError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single()

      if (insertError) {
        if (stockItems.length > 0) {
          await supabase.rpc('restore_products_stock', { p_items: stockItems })
        }
        throw insertError
      }

      if (cartStore.appliedCoupon?.id && !cartStore.appliedCoupon.id.startsWith('demo-')) {
        await supabase.rpc('increment_coupon_usage', {
          p_coupon_id: cartStore.appliedCoupon.id,
        })
      }

      await cartStore.clearCart()

      currentOrder.value = order as Order
      orders.value.unshift(order as Order)

      return order as Order
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message.includes('Yetersiz stok')
            ? 'Bir veya daha fazla ürün için yeterli stok yok'
            : e.message
          : 'Sipariş oluşturulamadı'

      const isStockOrDbError =
        e &&
        typeof e === 'object' &&
        'message' in e &&
        typeof (e as { message: string }).message === 'string' &&
        ((e as { message: string }).message.includes('Yetersiz stok') ||
          (e as { message: string }).message.includes('decrement_products_stock'))

      if (isStockOrDbError) {
        return null
      }

      const localOrder: Order = {
        id: orderId,
        ...orderPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Order

      saveLocalOrder(localOrder)
      await cartStore.clearCart()

      currentOrder.value = localOrder
      orders.value.unshift(localOrder)

      return localOrder
    } finally {
      loading.value = false
    }
  }

  async function cancelOrder(orderId: string) {
    loading.value = true
    try {
      const { data, error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single()

      if (updateError) throw updateError

      const index = orders.value.findIndex((o) => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = data as Order
      }

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Sipariş iptal edilemedi'
      return false
    } finally {
      loading.value = false
    }
  }

  function generateInvoice(order: Order): { content: string; filename: string } {
    const invoiceContent = `
FATURA
================

Sipariş No: ${order.order_number}
Tarih: ${new Date(order.created_at).toLocaleDateString('tr-TR')}

MÜŞTERİ BİLGİLERİ
-----------------
Ad Soyad: ${order.shipping_address.full_name}
Telefon: ${order.shipping_address.phone}
Adres: ${order.shipping_address.address}
        ${order.shipping_address.neighborhood}
        ${order.shipping_address.district}/${order.shipping_address.city}

ÜRÜNLER
-------
${order.items
  .map(
    (item) =>
      `${item.product_name}
  Adet: ${item.quantity} x ${item.unit_price.toLocaleString('tr-TR')} TL = ${item.total.toLocaleString('tr-TR')} TL`
  )
  .join('\n')}

---
Ara Toplam: ${order.subtotal.toLocaleString('tr-TR')} TL
İndirim: -${order.discount.toLocaleString('tr-TR')} TL
Kargo: ${order.shipping_cost.toLocaleString('tr-TR')} TL
KDV (%10): ${order.tax.toLocaleString('tr-TR')} TL
---
GENEL TOPLAM: ${order.total.toLocaleString('tr-TR')} TL

Ödeme Yöntemi: ${order.payment_method}
Ödeme Durumu: ${order.payment_status}
Sipariş Durumu: ${order.status}
    `

    return {
      content: invoiceContent,
      filename: `fatura-${order.order_number}.txt`,
    }
  }

  return {
    orders,
    currentOrder,
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    fetchOrderByNumber,
    createOrder,
    cancelOrder,
    generateInvoice,
  }
})
