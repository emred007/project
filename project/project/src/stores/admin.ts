import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { User, Product, Order, Category, Banner, Coupon, ProductStatus } from '@/types'
import {
  approveLocalProduct,
  getLocalPendingProducts,
  rejectLocalProduct,
  updateLocalProductFlags,
} from '@/data/localProducts'

export const useAdminStore = defineStore('admin', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const dashboardStats = ref({
    totalUsers: 0,
    totalProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })

  const pendingProducts = ref<Product[]>([])
  const allUsers = ref<User[]>([])
  const allOrders = ref<Order[]>([])
  const allCategories = ref<Category[]>([])
  const allBanners = ref<Banner[]>([])
  const allCoupons = ref<Coupon[]>([])

  const recentOrders = computed(() => allOrders.value.slice(0, 10))

  async function fetchDashboardStats() {
    loading.value = true
    try {
      const [usersCount, productsCount, pendingCount, ordersData] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('total'),
      ])

      dashboardStats.value = {
        totalUsers: usersCount.count || 0,
        totalProducts: productsCount.count || 0,
        pendingProducts: pendingCount.count || 0,
        totalOrders: ordersData.data?.length || 0,
        totalRevenue: ordersData.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
      }
    } catch (e) {
      console.error('Error fetching dashboard stats:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchPendingProducts() {
    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*, categories(name), seller:users!products_seller_id_fkey(full_name, email)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      const dbPending = fetchError ? [] : ((data as unknown as Product[]) || [])
      const localPending = getLocalPendingProducts().filter((p) => p.status === 'pending')

      pendingProducts.value = [...localPending, ...dbPending]
    } catch (e) {
      pendingProducts.value = getLocalPendingProducts().filter((p) => p.status === 'pending')
      error.value = e instanceof Error ? e.message : 'Bekleyen ürünler yüklenemedi'
    } finally {
      loading.value = false
    }
  }

  async function approveProduct(
    productId: string,
    flags?: { is_featured?: boolean; is_bestseller?: boolean; is_new?: boolean }
  ) {
    if (productId.startsWith('local-')) {
      approveLocalProduct(productId, flags)
      pendingProducts.value = pendingProducts.value.filter((p) => p.id !== productId)
      return true
    }

    loading.value = true
    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({
          status: 'approved' as ProductStatus,
          is_featured: flags?.is_featured ?? false,
          is_bestseller: flags?.is_bestseller ?? false,
          is_new: flags?.is_new ?? true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)

      if (updateError) throw updateError

      pendingProducts.value = pendingProducts.value.filter((p) => p.id !== productId)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ürün onaylanamadı'
      return false
    } finally {
      loading.value = false
    }
  }

  async function rejectProduct(productId: string, reason: string) {
    if (productId.startsWith('local-')) {
      rejectLocalProduct(productId, reason)
      pendingProducts.value = pendingProducts.value.filter((p) => p.id !== productId)
      return true
    }

    loading.value = true
    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({
          status: 'rejected' as ProductStatus,
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)

      if (updateError) throw updateError

      pendingProducts.value = pendingProducts.value.filter((p) => p.id !== productId)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ürün reddedilemedi'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchAllUsers() {
    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      allUsers.value = data as User[]
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Kullanıcılar yüklenemedi'
    } finally {
      loading.value = false
    }
  }

  async function updateUserRole(userId: string, role: 'user' | 'seller' | 'admin') {
    loading.value = true
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role,
          is_seller: role === 'seller',
          is_admin: role === 'admin',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) throw updateError

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Kullanıcı rolü güncellenemedi'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchAllOrders(options?: { status?: string; limit?: number }) {
    loading.value = true
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false })

      if (options?.status) {
        query = query.eq('status', options.status)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      allOrders.value = data as Order[]
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Siparişler yüklenemedi'
    } finally {
      loading.value = false
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    loading.value = true
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (updateError) throw updateError

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Sipariş durumu güncellenemedi'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchAllCategories() {
    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (fetchError) throw fetchError

      allCategories.value = data as Category[]
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Kategoriler yüklenemedi'
    } finally {
      loading.value = false
    }
  }

  async function createCategory(category: Partial<Category>) {
    loading.value = true
    try {
      const slug = category.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const { data, error: insertError } = await supabase
        .from('categories')
        .insert({ ...category, slug })
        .select()
        .single()

      if (insertError) throw insertError

      allCategories.value.push(data as Category)
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Kategori oluşturulamadı'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateCategory(id: string, updates: Partial<Category>) {
    loading.value = true
    try {
      const { data, error: updateError } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      const index = allCategories.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        allCategories.value[index] = data as Category
      }

      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Kategori güncellenemedi'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteCategory(id: string) {
    loading.value = true
    try {
      const { error: deleteError } = await supabase.from('categories').delete().eq('id', id)

      if (deleteError) throw deleteError

      allCategories.value = allCategories.value.filter((c) => c.id !== id)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Kategori silinemedi'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchAllBanners() {
    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true })

      if (fetchError) throw fetchError

      allBanners.value = data as Banner[]
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Bannerlar yüklenemedi'
    } finally {
      loading.value = false
    }
  }

  async function createBanner(banner: Partial<Banner>) {
    loading.value = true
    try {
      const { data, error: insertError } = await supabase
        .from('banners')
        .insert(banner)
        .select()
        .single()

      if (insertError) throw insertError

      allBanners.value.push(data as Banner)
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Banner oluşturulamadı'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateBanner(id: string, updates: Partial<Banner>) {
    loading.value = true
    try {
      const { data, error: updateError } = await supabase
        .from('banners')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      const index = allBanners.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        allBanners.value[index] = data as Banner
      }

      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Banner güncellenemedi'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteBanner(id: string) {
    loading.value = true
    try {
      const { error: deleteError } = await supabase.from('banners').delete().eq('id', id)

      if (deleteError) throw deleteError

      allBanners.value = allBanners.value.filter((b) => b.id !== id)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Banner silinemedi'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchAllCoupons() {
    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      allCoupons.value = data as Coupon[]
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Kuponlar yüklenemedi'
    } finally {
      loading.value = false
    }
  }

  async function createCoupon(coupon: Partial<Coupon>) {
    loading.value = true
    try {
      const { data, error: insertError } = await supabase
        .from('coupons')
        .insert({ ...coupon, code: coupon.code?.toUpperCase() })
        .select()
        .single()

      if (insertError) throw insertError

      allCoupons.value.push(data as Coupon)
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Kupon oluşturulamadı'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateCoupon(id: string, updates: Partial<Coupon>) {
    loading.value = true
    try {
      const { data, error: updateError } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      const index = allCoupons.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        allCoupons.value[index] = data as Coupon
      }

      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Kupon güncellenemedi'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteCoupon(id: string) {
    loading.value = true
    try {
      const { error: deleteError } = await supabase.from('coupons').delete().eq('id', id)

      if (deleteError) throw deleteError

      allCoupons.value = allCoupons.value.filter((c) => c.id !== id)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Kupon silinemedi'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateProductFlags(
    productId: string,
    flags: { is_featured?: boolean; is_bestseller?: boolean; is_new?: boolean }
  ) {
    if (productId.startsWith('local-')) {
      return updateLocalProductFlags(productId, flags)
    }

    loading.value = true
    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({ ...flags, updated_at: new Date().toISOString() })
        .eq('id', productId)

      if (updateError) throw updateError
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ürün güncellenemedi'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    dashboardStats,
    pendingProducts,
    allUsers,
    allOrders,
    allCategories,
    allBanners,
    allCoupons,
    recentOrders,
    fetchDashboardStats,
    fetchPendingProducts,
    approveProduct,
    rejectProduct,
    updateProductFlags,
    fetchAllUsers,
    updateUserRole,
    fetchAllOrders,
    updateOrderStatus,
    fetchAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchAllBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    fetchAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
  }
})
