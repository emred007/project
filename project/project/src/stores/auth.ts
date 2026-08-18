import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { User, UserRole } from '@/types'
import {
  DEMO_ADMIN_USER,
  clearDemoAdminSession,
  isDemoAdminCredentials,
  isDemoAdminSession,
  saveDemoAdminSession,
} from '@/data/demoAdmin'
import { translateAuthError } from '@/utils/authErrors'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.is_admin === true)
  const isSeller = computed(() => user.value?.role === 'seller' || user.value?.is_seller)
  const userName = computed(() => user.value?.full_name || user.value?.username || 'Misafir')
  const userInitials = computed(() => {
    if (!user.value) return '?'
    const names = user.value.full_name?.split(' ') || [user.value.username]
    return names
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  })

  async function initialize() {
    try {
      if (isDemoAdminSession()) {
        user.value = { ...DEMO_ADMIN_USER }
        isInitialized.value = true
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
    } catch (e) {
      console.error('Auth initialization error:', e)
    } finally {
      isInitialized.value = true
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        user.value = null
        clearDemoAdminSession()
      }
    })
  }

  async function fetchUserProfile(userId: string) {
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        const { data: authUser } = await supabase.auth.getUser()
        if (authUser.user) {
          await createUserProfile(authUser.user)
          return
        }
      }
      console.error('Error fetching user profile:', fetchError)
      return
    }

    user.value = data as User
  }

  async function createUserProfile(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
    const fullName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      'Yeni Kullanıcı'
    const username =
      authUser.user_metadata?.username ||
      authUser.email?.split('@')[0] ||
      `user_${authUser.id.slice(0, 8)}`

    const { data, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email,
        full_name: fullName,
        username,
        role: 'user' as UserRole,
        is_seller: false,
        is_admin: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user profile:', insertError)
      return
    }

    user.value = data as User
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null

    if (isDemoAdminCredentials(email, password)) {
      user.value = { ...DEMO_ADMIN_USER }
      saveDemoAdminSession()
      loading.value = false
      return true
    }

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) throw loginError

      clearDemoAdminSession()

      if (data.user) {
        await fetchUserProfile(data.user.id)
      }

      return true
    } catch (e) {
      error.value = translateAuthError(e, 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.')
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(data: {
    email: string
    password: string
    full_name: string
    username: string
    phone?: string
  }) {
    loading.value = true
    error.value = null

    try {
      const { data: authData, error: registerError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            username: data.username,
            phone: data.phone,
          },
        },
      })

      if (registerError) throw registerError

      if (authData.user) {
        await createUserProfile(authData.user)
      }

      return true
    } catch (e) {
      error.value = translateAuthError(e, 'Kayıt yapılamadı. Lütfen bilgilerinizi kontrol edin.')
      return false
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle() {
    loading.value = true
    error.value = null

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (googleError) throw googleError
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Google ile giriş yapılamadı'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      clearDemoAdminSession()
      await supabase.auth.signOut()
      user.value = null
    } catch (e) {
      console.error('Logout error:', e)
      user.value = null
      clearDemoAdminSession()
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(updates: Partial<User>) {
    if (!user.value) return false

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      user.value = data as User
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Profil güncellenemedi'
      return false
    } finally {
      loading.value = false
    }
  }

  async function becomeSeller() {
    if (!user.value) return false

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          is_seller: true,
          role: 'seller',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      user.value = data as User
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Satıcı olabilirken bir hata oluştu'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    isInitialized,
    isAuthenticated,
    isAdmin,
    isSeller,
    userName,
    userInitials,
    initialize,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    becomeSeller,
  }
})
