import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { CartItem, Product, Coupon } from '@/types'
import { useAuthStore } from './auth'
import { useToastStore } from './toast'
import {
  addToLocalCart,
  clearLocalCart,
  getLocalCartItems,
  isOfflineProductId,
  mergeCartItems,
  removeFromLocalCart,
  updateLocalCartQuantity,
} from '@/data/localCart'
import { requireAuth } from '@/utils/requireAuth'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const appliedCoupon = ref<Coupon | null>(null)
  const couponError = ref<string | null>(null)

  const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => {
      const price = item.product?.discount_price || item.product?.price || 0
      return sum + price * item.quantity
    }, 0)
  })

  const discount = computed(() => {
    if (!appliedCoupon.value) return 0

    if (appliedCoupon.value.type === 'percentage') {
      const amount = subtotal.value * (appliedCoupon.value.value / 100)
      return appliedCoupon.value.max_discount
        ? Math.min(amount, appliedCoupon.value.max_discount)
        : amount
    }

    return appliedCoupon.value.value
  })

  const shippingCost = computed(() => {
    if (subtotal.value >= 500) return 0
    return 29.99
  })

  const tax = computed(() => {
    const taxableAmount = subtotal.value - discount.value
    return taxableAmount * 0.1
  })

  const total = computed(() => {
    return subtotal.value - discount.value + shippingCost.value + tax.value
  })

  function syncFromLocal() {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      items.value = []
      return
    }
    items.value = getLocalCartItems()
  }

  function reset() {
    items.value = []
    appliedCoupon.value = null
    error.value = null
    couponError.value = null
  }

  async function fetchCart() {
    const authStore = useAuthStore()

    if (!authStore.user) {
      items.value = []
      return
    }

    loading.value = true
    const localItems = getLocalCartItems()
    try {
      const { data, error: fetchError } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('user_id', authStore.user.id)

      if (fetchError) throw fetchError

      items.value = mergeCartItems((data as CartItem[]) || [], localItems)
    } catch (e) {
      console.error('Error fetching cart:', e)
      items.value = localItems
    } finally {
      loading.value = false
    }
  }

  async function addToCart(product: Product, quantity = 1) {
    if (!requireAuth('Sepete eklemek için giriş yapmalısınız.')) {
      return false
    }

    const authStore = useAuthStore()
    const toast = useToastStore()
    loading.value = true
    error.value = null

    const useLocal = isOfflineProductId(product.id)

    if (useLocal) {
      items.value = addToLocalCart(product, quantity)
      toast.success(`${product.name} sepete eklendi`)
      loading.value = false
      return true
    }

    try {
      const existingItem = items.value.find((item) => item.product_id === product.id)

      if (existingItem && !existingItem.id.startsWith('cart-')) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.stock) {
          error.value = 'Yeterli stok yok'
          toast.error('Yeterli stok yok')
          return false
        }

        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id)

        if (updateError) throw updateError
        existingItem.quantity = newQuantity
      } else {
        const { data, error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: authStore.user!.id,
            product_id: product.id,
            quantity,
          })
          .select('*, product:products(*)')
          .single()

        if (insertError) throw insertError
        items.value.push(data as CartItem)
      }

      toast.success(`${product.name} sepete eklendi`)
      return true
    } catch (e) {
      items.value = addToLocalCart(product, quantity)
      toast.success(`${product.name} sepete eklendi`)
      return true
    } finally {
      loading.value = false
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) {
      return removeFromCart(itemId)
    }

    const item = items.value.find((i) => i.id === itemId)
    if (!item) return false

    if (item.product && quantity > item.product.stock) {
      error.value = 'Yeterli stok yok'
      useToastStore().error('Yeterli stok yok')
      return false
    }

    if (itemId.startsWith('cart-')) {
      items.value = updateLocalCartQuantity(itemId, quantity)
      return true
    }

    loading.value = true
    try {
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)

      if (updateError) throw updateError
      item.quantity = quantity
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Miktar güncellenemedi'
      return false
    } finally {
      loading.value = false
    }
  }

  async function removeFromCart(itemId: string) {
    if (itemId.startsWith('cart-')) {
      items.value = removeFromLocalCart(itemId)
      useToastStore().success('Ürün sepetten kaldırıldı')
      return true
    }

    loading.value = true
    try {
      const { error: deleteError } = await supabase.from('cart_items').delete().eq('id', itemId)
      if (deleteError) throw deleteError
      items.value = items.value.filter((item) => item.id !== itemId)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ürün silinemedi'
      return false
    } finally {
      loading.value = false
    }
  }

  async function clearCart() {
    clearLocalCart()
    const authStore = useAuthStore()
    if (!authStore.user) {
      items.value = []
      return true
    }

    loading.value = true
    try {
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', authStore.user.id)

      if (deleteError) throw deleteError
      items.value = []
      appliedCoupon.value = null
      return true
    } catch (e) {
      items.value = []
      return true
    } finally {
      loading.value = false
    }
  }

  async function applyCoupon(code: string) {
    couponError.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single()

      if (fetchError) {
        couponError.value = 'Geçersiz kupon kodu'
        return false
      }

      const coupon = data as Coupon
      const now = new Date()
      const startDate = new Date(coupon.start_date)
      const endDate = new Date(coupon.end_date)

      if (now < startDate || now > endDate) {
        couponError.value = 'Kupon süresi dolmuş'
        return false
      }

      if (coupon.min_order_amount && subtotal.value < coupon.min_order_amount) {
        couponError.value = `Minimum sipariş tutarı ${coupon.min_order_amount} TL olmalıdır`
        return false
      }

      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        couponError.value = 'Kupon kullanım limiti dolmuş'
        return false
      }

      appliedCoupon.value = coupon
      return true
    } catch {
      couponError.value = 'Kupon uygulanamadı'
      return false
    }
  }

  function removeCoupon() {
    appliedCoupon.value = null
  }

  async function transferFavoritesToCart(favoriteIds: string[]) {
    for (const productId of favoriteIds) {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (product) {
        await addToCart(product as Product, 1)
      }
    }
  }

  return {
    items,
    loading,
    error,
    appliedCoupon,
    couponError,
    itemCount,
    subtotal,
    discount,
    shippingCost,
    tax,
    total,
    syncFromLocal,
    reset,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    transferFavoritesToCart,
  }
})
