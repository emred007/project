import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/AnaYerlesim.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/AnaSayfa.vue'),
        meta: { title: 'Ana Sayfa' },
      },
      {
        path: 'urun/:id/:slug?',
        name: 'product-detail',
        component: () => import('@/pages/UrunDetaySayfasi.vue'),
        meta: { title: 'Ürün Detayı' },
      },
      {
        path: 'kategori/:slug?',
        name: 'category',
        component: () => import('@/pages/KategoriSayfasi.vue'),
        meta: { title: 'Kategori' },
      },
      {
        path: 'arama',
        name: 'search',
        component: () => import('@/pages/AramaSayfasi.vue'),
        meta: { title: 'Arama' },
      },
      {
        path: 'sepet',
        name: 'cart',
        component: () => import('@/pages/SepetSayfasi.vue'),
        meta: { title: 'Sepetim', requiresAuth: true },
      },
      {
        path: 'favoriler',
        name: 'favorites',
        component: () => import('@/pages/FavorilerSayfasi.vue'),
        meta: { title: 'Favorilerim', requiresAuth: true },
      },
      {
        path: 'odeme',
        name: 'checkout',
        component: () => import('@/pages/OdemeSayfasi.vue'),
        meta: { title: 'Ödeme', requiresAuth: true },
      },
      {
        path: 'siparis-basarili/:orderId',
        name: 'order-success',
        component: () => import('@/pages/SiparisBasariliSayfasi.vue'),
        meta: { title: 'Sipariş Başarılı', requiresAuth: true },
      },
    ],
  },
  {
    path: '/admingiris',
    name: 'admin-login',
    component: () => import('@/pages/auth/AdminGirisSayfasi.vue'),
    meta: { title: 'Admin Girişi' },
  },
  {
    path: '/giris',
    name: 'login',
    component: () => import('@/pages/auth/GirisSayfasi.vue'),
    meta: { title: 'Giriş Yap', guest: true },
  },
  {
    path: '/kayit',
    name: 'register',
    component: () => import('@/pages/auth/KayitSayfasi.vue'),
    meta: { title: 'Kayıt Ol', guest: true },
  },
  {
    path: '/hesabim',
    component: () => import('@/layouts/HesapYerlesim.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'profile',
        component: () => import('@/pages/account/ProfilSayfasi.vue'),
        meta: { title: 'Profilim' },
      },
      {
        path: 'siparislerim',
        name: 'orders',
        component: () => import('@/pages/account/HesapSiparislerSayfasi.vue'),
        meta: { title: 'Siparişlerim' },
      },
      {
        path: 'siparislerim/:orderId',
        name: 'order-detail',
        component: () => import('@/pages/account/SiparisDetaySayfasi.vue'),
        meta: { title: 'Sipariş Detayı' },
      },
      {
        path: 'guvenlik',
        name: 'security',
        component: () => import('@/pages/account/GuvenlikSayfasi.vue'),
        meta: { title: 'Güvenlik' },
      },
    ],
  },
  {
    path: '/satici',
    component: () => import('@/layouts/SaticiYerlesim.vue'),
    meta: { requiresAuth: true, requiresSeller: true },
    children: [
      {
        path: '',
        name: 'seller-dashboard',
        component: () => import('@/pages/seller/SaticiPanelSayfasi.vue'),
        meta: { title: 'Satıcı Paneli' },
      },
      {
        path: 'urunler',
        name: 'seller-products',
        component: () => import('@/pages/seller/SaticiUrunlerSayfasi.vue'),
        meta: { title: 'Ürünlerim' },
      },
      {
        path: 'urun-ekle',
        name: 'seller-add-product',
        component: () => import('@/pages/seller/UrunEkleSayfasi.vue'),
        meta: { title: 'Ürün Ekle' },
      },
      {
        path: 'urun-duzenle/:id',
        name: 'seller-edit-product',
        component: () => import('@/pages/seller/UrunDuzenleSayfasi.vue'),
        meta: { title: 'Ürün Düzenle' },
      },
      {
        path: 'siparisler',
        name: 'seller-orders',
        component: () => import('@/pages/seller/SaticiSiparislerSayfasi.vue'),
        meta: { title: 'Siparişler' },
      },
      {
        path: 'kazanc',
        name: 'seller-earnings',
        component: () => import('@/pages/seller/KazancSayfasi.vue'),
        meta: { title: 'Kazançlarım' },
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminYerlesim.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/pages/admin/AdminPanelSayfasi.vue'),
        meta: { title: 'Admin Paneli' },
      },
      {
        path: 'kullanicilar',
        name: 'admin-users',
        component: () => import('@/pages/admin/KullanicilarSayfasi.vue'),
        meta: { title: 'Kullanıcı Yönetimi' },
      },
      {
        path: 'urunler',
        name: 'admin-products',
        component: () => import('@/pages/admin/AdminUrunlerSayfasi.vue'),
        meta: { title: 'Ürün Yönetimi' },
      },
      {
        path: 'urun-onay',
        name: 'admin-product-approval',
        component: () => import('@/pages/admin/UrunOnaySayfasi.vue'),
        meta: { title: 'Ürün Onay' },
      },
      {
        path: 'satici-basvurulari',
        name: 'admin-seller-applications',
        component: () => import('@/pages/admin/SaticiBasvurulariSayfasi.vue'),
        meta: { title: 'Satıcı Onay Formları' },
      },
      {
        path: 'siparisler',
        name: 'admin-orders',
        component: () => import('@/pages/admin/AdminSiparislerSayfasi.vue'),
        meta: { title: 'Sipariş Yönetimi' },
      },
      {
        path: 'kategoriler',
        name: 'admin-categories',
        component: () => import('@/pages/admin/KategorilerSayfasi.vue'),
        meta: { title: 'Kategori Yönetimi' },
      },
      {
        path: 'kuponlar',
        name: 'admin-coupons',
        component: () => import('@/pages/admin/KuponlarSayfasi.vue'),
        meta: { title: 'Kupon Yönetimi' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/BulunamadiSayfasi.vue'),
    meta: { title: 'Sayfa Bulunamadı' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  },
})

router.beforeEach(async (to, _from, next) => {
  document.title = to.meta.title ? `${to.meta.title} | Pazarium` : 'Pazarium'

  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      name: to.meta.requiresAdmin ? 'admin-login' : 'login',
      query: { redirect: to.fullPath },
    })
    return
  }

  if (to.name === 'admin-login' && authStore.isAdmin) {
    next({ name: 'admin-dashboard' })
    return
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  if (to.meta.requiresSeller && !authStore.isSeller && !authStore.isAdmin) {
    next({ name: 'home' })
    return
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'admin-login', query: { redirect: to.fullPath } })
    return
  }

  next()
})

export default router
