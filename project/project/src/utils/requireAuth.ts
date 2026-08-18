import router from '@/plugins/router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

export function requireAuth(message: string): boolean {
  const authStore = useAuthStore()
  if (authStore.isAuthenticated) return true

  useToastStore().warning(message)
  router.push({
    name: 'login',
    query: { redirect: router.currentRoute.value.fullPath },
  })
  return false
}
