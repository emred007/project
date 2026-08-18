import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { Favorite, Product } from '@/types'
import { useAuthStore } from './auth'
import { useToastStore } from './toast'
import {
  getLocalFavorites,
  mergeFavorites,
  removeLocalFavorite,
  toggleLocalFavorite,
  isOfflineProductId,
} from '@/data/localCart'
import { requireAuth } from '@/utils/requireAuth'

export const useFavoriteStore = defineStore('favorite', () => {
  const items = ref<Favorite[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const favoriteCount = computed(() => items.value.length)
  const favoriteProductIds = computed(() => items.value.map((item) => item.product_id))

  function isFavorite(productId: string): boolean {
    return items.value.some((item) => item.product_id === productId)
  }

  function syncFromLocal() {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      items.value = []
      return
    }
    items.value = [...getLocalFavorites()]
  }

  function reset() {
    items.value = []
    error.value = null
  }

  async function syncLocalFavoritesToDb(userId: string) {
    const localItems = getLocalFavorites().filter((f) => !isOfflineProductId(f.product_id))
    if (!localItems.length) return

    for (const item of localItems) {
      await supabase.from('favorites').upsert(
        { user_id: userId, product_id: item.product_id },
        { onConflict: 'user_id,product_id', ignoreDuplicates: true }
      )
    }

    localStorage.removeItem('marketplace_local_favorites')
  }

  async function enrichFavoriteProducts(favorites: Favorite[]) {
    for (const fav of favorites) {
      if (fav.product?.name) continue
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', fav.product_id)
        .single()
      if (data) fav.product = data as Product
    }
    return favorites
  }

  async function fetchFavorites() {
    const authStore = useAuthStore()

    if (!authStore.user) {
      items.value = []
      return
    }

    const offlineLocal = getLocalFavorites().filter((f) => isOfflineProductId(f.product_id))
    loading.value = true
    try {
      await syncLocalFavoritesToDb(authStore.user.id)

      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select('*, product:products(*)')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      items.value = mergeFavorites((data as Favorite[]) || [], offlineLocal)
      await enrichFavoriteProducts(items.value)
    } catch {
      items.value = [...getLocalFavorites()]
    } finally {
      loading.value = false
    }
  }

  async function toggleFavorite(product: Product) {
    if (!requireAuth('Favorilere eklemek için giriş yapmalısınız.')) {
      return false
    }

    const authStore = useAuthStore()
    const toast = useToastStore()
    loading.value = true
    error.value = null

    const existing = items.value.find((item) => item.product_id === product.id)
    const offline = isOfflineProductId(product.id)

    try {
      if (existing) {
        if (!offline) {
          let deleteQuery = supabase
            .from('favorites')
            .delete()
            .eq('user_id', authStore.user!.id)

          deleteQuery = !existing.id.startsWith('fav-')
            ? deleteQuery.eq('id', existing.id)
            : deleteQuery.eq('product_id', product.id)

          const { error: deleteError } = await deleteQuery
          if (deleteError) throw deleteError
        }
        if (existing.id.startsWith('fav-') || offline) {
          removeLocalFavorite(existing.id)
        }
        items.value = items.value.filter((item) => item.product_id !== product.id)
        toast.success('Favorilerden kaldırıldı')
      } else if (offline) {
        const { items: updated } = toggleLocalFavorite(product)
        items.value = [...updated]
        toast.success('Favorilere eklendi')
      } else {
        const { data, error: insertError } = await supabase
          .from('favorites')
          .insert({
            user_id: authStore.user!.id,
            product_id: product.id,
          })
          .select('*, product:products(*)')
          .single()

        if (insertError) throw insertError

        const favorite = (data as Favorite) || {
          id: crypto.randomUUID(),
          user_id: authStore.user!.id,
          product_id: product.id,
          product,
          created_at: new Date().toISOString(),
        }
        if (!favorite.product) favorite.product = product
        items.value = [favorite, ...items.value.filter((i) => i.product_id !== product.id)]
        toast.success('Favorilere eklendi')
      }
      return true
    } catch (e) {
      if (!existing) {
        const { items: updated } = toggleLocalFavorite(product)
        items.value = [...updated]
        toast.success('Favorilere eklendi')
        return true
      }
      error.value = e instanceof Error ? e.message : 'Favori işlemi başarısız'
      toast.error(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  async function removeFromFavorites(favoriteId: string) {
    const authStore = useAuthStore()
    const item = items.value.find((i) => i.id === favoriteId)

    if (favoriteId.startsWith('fav-')) {
      items.value = [...removeLocalFavorite(favoriteId)]
      return true
    }

    loading.value = true
    try {
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)

      if (deleteError) throw deleteError
      items.value = items.value.filter((i) => i.id !== favoriteId)
      if (item && isOfflineProductId(item.product_id)) {
        removeLocalFavorite(`fav-${item.product_id}`)
      }
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Favori silinemedi'
      return false
    } finally {
      loading.value = false
    }
  }

  async function clearFavorites() {
    const authStore = useAuthStore()
    if (authStore.user) {
      await supabase.from('favorites').delete().eq('user_id', authStore.user.id)
    }
    localStorage.removeItem('marketplace_local_favorites')
    items.value = []
    return true
  }

  return {
    items,
    loading,
    error,
    favoriteCount,
    favoriteProductIds,
    isFavorite,
    syncFromLocal,
    reset,
    fetchFavorites,
    toggleFavorite,
    removeFromFavorites,
    clearFavorites,
  }
})
