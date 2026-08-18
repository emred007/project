import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useFavoriteStore } from '@/stores/favorite'
import { clearLocalCart } from '@/data/localCart'

export async function logoutAndGoHome(router: Router) {
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const favoriteStore = useFavoriteStore()

  await authStore.logout()

  clearLocalCart()
  cartStore.reset()
  favoriteStore.reset()

  await router.replace({ name: 'home' })
}
