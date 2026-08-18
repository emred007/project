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

  async function fetchFavorites() {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      items.value = []
      return
    }

    const localItems = getLocalFavorites()
    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select('*, product:products(*)')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      items.value = mergeFavorites((data as Favorite[]) || [], localItems)
    } catch {
      items.value = [...localItems]
    } finally {
      loading.value = false
    }
  }

  async function toggleFavorite(product: Product) {
    if (!requireAuth('Favorilere eklemek için giriş yapmalısınız.')) {
      return false
    }

    const toast = useToastStore()
    loading.value = true
    error.value = null

    const { added, items: updated } = toggleLocalFavorite(product)
    items.value = [...updated]

    toast.success(added ? 'Favorilere eklendi' : 'Favorilerden kaldırıldı')
    loading.value = false
    return true
  }

  async function removeFromFavorites(favoriteId: string) {
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
      items.value = items.value.filter((item) => item.id !== favoriteId)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Favori silinemedi'
      return false
    } finally {
      loading.value = false
    }
  }

  async function clearFavorites() {
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
