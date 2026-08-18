<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme, useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useFavoriteStore } from '@/stores/favorite'
import { useProductStore } from '@/stores/product'
import { DEMO_CATEGORIES } from '@/data/demoProducts'
import { logoutAndGoHome } from '@/composables/useLogout'
import MarkaLogosu from '@/components/layout/MarkaLogosu.vue'

const route = useRoute()
const router = useRouter()
const theme = useTheme()
const { mdAndUp } = useDisplay()
const authStore = useAuthStore()
const cartStore = useCartStore()
const favoriteStore = useFavoriteStore()
const productStore = useProductStore()

const search = ref('')
const mobileMenu = ref(false)
const userMenu = ref(false)
const scrolled = ref(false)
const showPromo = ref(localStorage.getItem('promo_dismissed') !== 'true')

const isDark = computed(() => theme.global.current.value.dark)

const topCategories = computed(() => {
  const cats = productStore.categories.length ? productStore.categories : DEMO_CATEGORIES
  return cats.filter((c) => !c.parent_id)
})

const navItems = computed(() => [
  { title: 'Ana Sayfa', to: { name: 'home' } },
  ...topCategories.value.map((cat) => ({
    title: cat.name,
    to: { name: 'category', params: { slug: cat.slug } },
  })),
])

const activeTab = computed(() => {
  if (route.name === 'home') return 0
  if (route.name !== 'category') return undefined
  const slug = route.params.slug as string
  const idx = navItems.value.findIndex(
    (item) => 'params' in item.to && item.to.params?.slug === slug
  )
  return idx >= 0 ? idx : undefined
})

const userMenuItems = computed(() => {
  const items = [
    { title: 'Profilim', to: { name: 'profile' }, icon: 'mdi-account' },
    { title: 'Siparişlerim', to: { name: 'orders' }, icon: 'mdi-package-variant' },
    { title: 'Favorilerim', to: { name: 'favorites' }, icon: 'mdi-heart' },
  ]

  if (authStore.isSeller || authStore.isAdmin) {
    items.push({ title: 'Satıcı Paneli', to: { name: 'seller-dashboard' }, icon: 'mdi-store' })
  }

  if (authStore.isAdmin) {
    items.push({ title: 'Admin Paneli', to: { name: 'admin-dashboard' }, icon: 'mdi-shield-account' })
  }

  return items
})

function dismissPromo() {
  showPromo.value = false
  localStorage.setItem('promo_dismissed', 'true')
}

function onScroll() {
  scrolled.value = window.scrollY > 24
}

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

function handleSearch() {
  if (search.value.trim()) {
    router.push({ name: 'search', query: { q: search.value.trim() } })
    mobileMenu.value = false
  }
}

function syncSearchFromRoute() {
  if (route.name === 'search' && typeof route.query.q === 'string') {
    search.value = route.query.q
  }
}

async function handleLogout() {
  userMenu.value = false
  await logoutAndGoHome(router)
}

onMounted(() => {
  productStore.fetchCategories()
  syncSearchFromRoute()
  window.addEventListener('scroll', onScroll, { passive: true })
})

watch(() => route.query.q, syncSearchFromRoute)

onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <!-- Promo: ayrı ince bar, app bar ile çakışmaz -->
  <v-system-bar
    v-if="showPromo"
    app
    color="primary"
    height="32"
    class="px-3 px-md-6 text-white"
  >
    <v-icon size="small" class="mr-2">mdi-truck-fast</v-icon>
    <span class="text-caption text-truncate flex-grow-1">
      500 TL üzeri ücretsiz kargo
      <span v-if="mdAndUp"> — Yeni üyelere %10 indirim: <strong>HOSGELDIN</strong></span>
    </span>
    <v-btn
      icon="mdi-close"
      variant="text"
      size="x-small"
      @click="dismissPromo"
    />
  </v-system-bar>

  <v-app-bar
    app
    color="surface"
    :elevation="scrolled ? 2 : 0"
    :border="scrolled"
  >
    <v-container fluid class="pa-0 px-3 px-md-6">
      <!-- Ana satır -->
      <div class="d-flex align-center ga-2 py-2" style="min-height: 56px">
        <v-app-bar-nav-icon
          class="d-md-none flex-shrink-0"
          @click="mobileMenu = true"
        />

        <router-link to="/" class="text-decoration-none flex-shrink-0">
          <MarkaLogosu />
        </router-link>

        <v-spacer class="d-md-none" />

        <div v-if="mdAndUp" class="flex-grow-1 mx-4" style="max-width: 560px">
          <v-form @submit.prevent="handleSearch">
            <v-text-field
              v-model="search"
              placeholder="Ürün adı ara..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              rounded="pill"
              bg-color="surface"
            />
          </v-form>
        </div>

        <v-spacer v-if="mdAndUp" />

        <div class="d-flex align-center ga-1 flex-shrink-0">
          <v-btn
            icon
            variant="text"
            size="small"
            @click="toggleTheme"
          >
            <v-icon size="20">
              {{ isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}
            </v-icon>
          </v-btn>

          <v-btn
            v-if="authStore.isAdmin"
            variant="tonal"
            color="error"
            size="small"
            :to="{ name: 'admin-dashboard' }"
            class="d-none d-md-flex mr-1"
            prepend-icon="mdi-shield-account"
          >
            Admin
          </v-btn>

          <template v-if="!authStore.isAuthenticated">
            <v-btn variant="text" size="small" :to="{ name: 'login' }" class="d-none d-sm-flex">
              Giriş
            </v-btn>
            <v-btn variant="flat" color="primary" size="small" :to="{ name: 'register' }" class="d-none d-sm-flex">
              Kayıt Ol
            </v-btn>
          </template>

          <v-menu v-else v-model="userMenu">
            <template #activator="{ props }">
              <v-btn v-bind="props" variant="text" size="small" class="px-1">
                <v-avatar size="28" color="primary" class="mr-1">
                  <span class="text-white text-caption">{{ authStore.userInitials }}</span>
                </v-avatar>
                <span class="d-none d-lg-inline text-body-2">{{ authStore.userName }}</span>
                <v-icon end size="small">mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list density="compact" nav min-width="200">
              <v-list-item
                v-for="item in userMenuItems"
                :key="item.title"
                :to="item.to"
                :prepend-icon="item.icon"
                :title="item.title"
              />
              <v-divider class="my-1" />
              <v-list-item prepend-icon="mdi-logout" title="Çıkış Yap" @click="handleLogout" />
            </v-list>
          </v-menu>

          <v-btn :to="{ name: 'favorites' }" icon variant="text" size="small">
            <v-badge
              v-if="favoriteStore.favoriteCount > 0"
              :content="favoriteStore.favoriteCount"
              color="primary"
              floating
            >
              <v-icon size="22">mdi-heart-outline</v-icon>
            </v-badge>
            <v-icon v-else size="22">mdi-heart-outline</v-icon>
          </v-btn>

          <v-btn :to="{ name: 'cart' }" icon variant="text" size="small">
            <v-badge
              v-if="cartStore.itemCount > 0"
              :content="cartStore.itemCount"
              color="primary"
              floating
            >
              <v-icon size="22">mdi-cart-outline</v-icon>
            </v-badge>
            <v-icon v-else size="22">mdi-cart-outline</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Mobil arama -->
      <div v-if="!mdAndUp" class="pb-2">
        <v-form @submit.prevent="handleSearch">
          <v-text-field
            v-model="search"
            placeholder="Ara..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            rounded="pill"
            bg-color="surface"
          />
        </v-form>
      </div>
    </v-container>

    <!-- Kategori sekmeleri -->
    <template v-if="mdAndUp" #extension>
      <v-container fluid class="pa-0 px-3 px-md-6 border-t">
        <v-tabs
          :model-value="activeTab"
          color="primary"
          density="compact"
          height="44"
          show-arrows
        >
          <v-tab
            v-for="(item, index) in navItems"
            :key="item.title"
            :to="item.to"
            :value="index"
            class="text-body-2 text-capitalize"
          >
            {{ item.title }}
          </v-tab>
        </v-tabs>
      </v-container>
    </template>
  </v-app-bar>

  <v-navigation-drawer v-model="mobileMenu" temporary width="300">
    <v-list nav>
      <v-list-subheader>Kategoriler</v-list-subheader>
      <v-list-item
        v-for="item in navItems"
        :key="item.title"
        :to="item.to"
        :title="item.title"
        @click="mobileMenu = false"
      />

      <v-divider class="my-3" />

      <v-list-item
        v-if="!authStore.isAuthenticated"
        :to="{ name: 'login' }"
        prepend-icon="mdi-login"
        title="Giriş Yap"
        @click="mobileMenu = false"
      />
      <v-list-item
        v-if="!authStore.isAuthenticated"
        :to="{ name: 'register' }"
        prepend-icon="mdi-account-plus"
        title="Kayıt Ol"
        @click="mobileMenu = false"
      />

      <v-divider class="my-3" />

      <v-list-item
        prepend-icon="mdi-theme-light-dark"
        :title="isDark ? 'Açık Tema' : 'Koyu Tema'"
        @click="toggleTheme"
      />
    </v-list>
  </v-navigation-drawer>
</template>
