import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/HomePage.vue'),
        meta: { title: 'Ana Sayfa' },
      },
      {
        path: 'urun/:id/:slug?',
        name: 'product-detail',
        component: () => import('@/pages/ProductDetailPage.vue'),
        meta: { title: 'Ürün Detayı' },
      },
      {
        path: 'kategori/:slug?',
        name: 'category',
        component: () => import('@/pages/CategoryPage.vue'),
        meta: { title: 'Kategori' },
      },
      {
        path: 'arama',
        name: 'search',
        component: () => import('@/pages/SearchPage.vue'),
        meta: { title: 'Arama' },
      },
      {
        path: 'sepet',
        name: 'cart',
        component: () => import('@/pages/CartPage.vue'),
        meta: { title: 'Sepetim', requiresAuth: true },
      },
      {
        path: 'favoriler',
        name: 'favorites',
        component: () => import('@/pages/FavoritesPage.vue'),
        meta: { title: 'Favorilerim', requiresAuth: true },
      },
      {
        path: 'odeme',
        name: 'checkout',
        component: () => import('@/pages/CheckoutPage.vue'),
        meta: { title: 'Ödeme', requiresAuth: true },
      },
      {
        path: 'siparis-basarili/:orderId',
        name: 'order-success',
        component: () => import('@/pages/OrderSuccessPage.vue'),
        meta: { title: 'Sipariş Başarılı', requiresAuth: true },
      },
    ],
  },
  {
    path: '/admingiris',
    name: 'admin-login',
    component: () => import('@/pages/auth/AdminLoginPage.vue'),
    meta: { title: 'Admin Girişi' },
  },
  {
    path: '/giris',
    name: 'login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { title: 'Giriş Yap', guest: true },
  },
  {
    path: '/kayit',
    name: 'register',
    component: () => import('@/pages/auth/RegisterPage.vue'),
    meta: { title: 'Kayıt Ol', guest: true },
  },
  {
    path: '/hesabim',
    component: () => import('@/layouts/AccountLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'profile',
        component: () => import('@/pages/account/ProfilePage.vue'),
        meta: { title: 'Profilim' },
      },
      {
        path: 'adreslerim',
        name: 'addresses',
        component: () => import('@/pages/account/AddressesPage.vue'),
        meta: { title: 'Adreslerim' },
      },
      {
        path: 'siparislerim',
        name: 'orders',
        component: () => import('@/pages/account/OrdersPage.vue'),
        meta: { title: 'Siparişlerim' },
      },
      {
        path: 'siparislerim/:orderId',
        name: 'order-detail',
        component: () => import('@/pages/account/OrderDetailPage.vue'),
        meta: { title: 'Sipariş Detayı' },
      },
      {
        path: 'guvenlik',
        name: 'security',
        component: () => import('@/pages/account/SecurityPage.vue'),
        meta: { title: 'Güvenlik' },
      },
      {
        path: 'bildirimler',
        name: 'notifications',
        component: () => import('@/pages/account/NotificationsPage.vue'),
        meta: { title: 'Bildirimler' },
      },
    ],
  },
  {
    path: '/satici',
    component: () => import('@/layouts/SellerLayout.vue'),
    meta: { requiresAuth: true, requiresSeller: true },
    children: [
      {
        path: '',
        name: 'seller-dashboard',
        component: () => import('@/pages/seller/DashboardPage.vue'),
        meta: { title: 'Satıcı Paneli' },
      },
      {
        path: 'urunler',
        name: 'seller-products',
        component: () => import('@/pages/seller/ProductsPage.vue'),
        meta: { title: 'Ürünlerim' },
      },
      {
        path: 'urun-ekle',
        name: 'seller-add-product',
        component: () => import('@/pages/seller/AddProductPage.vue'),
        meta: { title: 'Ürün Ekle' },
      },
      {
        path: 'urun-duzenle/:id',
        name: 'seller-edit-product',
        component: () => import('@/pages/seller/EditProductPage.vue'),
        meta: { title: 'Ürün Düzenle' },
      },
      {
        path: 'siparisler',
        name: 'seller-orders',
        component: () => import('@/pages/seller/OrdersPage.vue'),
        meta: { title: 'Siparişler' },
      },
      {
        path: 'kazanc',
        name: 'seller-earnings',
        component: () => import('@/pages/seller/EarningsPage.vue'),
        meta: { title: 'Kazançlarım' },
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/pages/admin/DashboardPage.vue'),
        meta: { title: 'Admin Paneli' },
      },
      {
        path: 'kullanicilar',
        name: 'admin-users',
        component: () => import('@/pages/admin/UsersPage.vue'),
        meta: { title: 'Kullanıcı Yönetimi' },
      },
      {
        path: 'urunler',
        name: 'admin-products',
        component: () => import('@/pages/admin/ProductsPage.vue'),
        meta: { title: 'Ürün Yönetimi' },
      },
      {
        path: 'urun-onay',
        name: 'admin-product-approval',
        component: () => import('@/pages/admin/ProductApprovalPage.vue'),
        meta: { title: 'Ürün Onay' },
      },
      {
        path: 'siparisler',
        name: 'admin-orders',
        component: () => import('@/pages/admin/OrdersPage.vue'),
        meta: { title: 'Sipariş Yönetimi' },
      },
      {
        path: 'kategoriler',
        name: 'admin-categories',
        component: () => import('@/pages/admin/CategoriesPage.vue'),
        meta: { title: 'Kategori Yönetimi' },
      },
      {
        path: 'bannerlar',
        name: 'admin-banners',
        component: () => import('@/pages/admin/BannersPage.vue'),
        meta: { title: 'Banner Yönetimi' },
      },
      {
        path: 'kuponlar',
        name: 'admin-coupons',
        component: () => import('@/pages/admin/CouponsPage.vue'),
        meta: { title: 'Kupon Yönetimi' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
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
  document.title = to.meta.title ? `${to.meta.title} | MarketPlace` : 'MarketPlace'

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
