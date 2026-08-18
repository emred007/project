import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { User, UserRole, SellerApplication } from '@/types'
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
  const registrationNotice = ref<string | null>(null)
  const sellerApplication = ref<SellerApplication | null>(null)
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

  async function fetchUserProfile(userId: string, retries = 2): Promise<boolean> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (!fetchError && data) {
        user.value = data as User
        return true
      }

      if (fetchError?.code === 'PGRST116') {
        const { data: authUser } = await supabase.auth.getUser()
        if (authUser.user) {
          await createUserProfile(authUser.user)
          return !!user.value
        }
      }

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 300))
      } else {
        console.error('Error fetching user profile:', fetchError)
      }
    }

    return false
  }

  async function createUserProfile(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .maybeSingle()

    if (existing) {
      await fetchUserProfile(authUser.id)
      return
    }

    const fullName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      'Yeni Kullanıcı'
    const username =
      (authUser.user_metadata?.username as string | undefined)?.replace(/[^a-zA-Z0-9_]/g, '_') ||
      authUser.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '_') ||
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
      await fetchUserProfile(authUser.id)
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
        const profileLoaded = await fetchUserProfile(data.user.id)
        if (!profileLoaded) {
          error.value = 'Kullanıcı profili yüklenemedi. Lütfen tekrar deneyin.'
          await supabase.auth.signOut()
          user.value = null
          return false
        }
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
    registrationNotice.value = null

    try {
      const { data: authData, error: registerError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            username: data.username.replace(/[^a-zA-Z0-9_]/g, '_'),
            phone: data.phone,
          },
        },
      })

      if (registerError) throw registerError

      if (authData.user?.identities?.length === 0) {
        error.value = 'Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.'
        return false
      }

      if (!authData.user) {
        error.value = 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.'
        return false
      }

      await fetchUserProfile(authData.user.id)
      if (!user.value) {
        await createUserProfile(authData.user)
      }

      if (authData.session && user.value) {
        return true
      }

      registrationNotice.value =
        'Kayıt oluşturuldu. E-postanıza gelen onay linkine tıklayın, ardından giriş yapın.'
      return false
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
      sellerApplication.value = null
      error.value = null
    } catch (e) {
      console.error('Logout error:', e)
      user.value = null
      sellerApplication.value = null
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

  async function fetchSellerApplication() {
    if (!user.value) {
      sellerApplication.value = null
      return null
    }

    const { data, error: fetchError } = await supabase
      .from('seller_applications')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fetchError) {
      sellerApplication.value = null
      return null
    }

    sellerApplication.value = data as SellerApplication | null
    return sellerApplication.value
  }

  async function submitSellerApplication(form: {
    shop_name: string
    shop_description?: string
    phone: string
    tax_id?: string
    address?: string
  }) {
    if (!user.value) return false

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('seller_applications')
        .insert({
          user_id: user.value.id,
          shop_name: form.shop_name.trim(),
          shop_description: form.shop_description?.trim() || null,
          phone: form.phone.trim(),
          tax_id: form.tax_id?.trim() || null,
          address: form.address?.trim() || null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      sellerApplication.value = data as SellerApplication
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Satıcı başvurusu gönderilemedi'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    registrationNotice,
    sellerApplication,
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
    fetchSellerApplication,
    submitSellerApplication,
  }
})
