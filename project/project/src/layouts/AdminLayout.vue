<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const theme = useTheme()

const menuItems = [
  { title: 'Panel', icon: 'mdi-view-dashboard', to: { name: 'admin-dashboard' } },
  { title: 'Kullanıcılar', icon: 'mdi-account-group', to: { name: 'admin-users' } },
  { title: 'Ürünler', icon: 'mdi-package-variant', to: { name: 'admin-products' } },
  { title: 'Ürün Onay', icon: 'mdi-check-decagram', to: { name: 'admin-product-approval' } },
  { title: 'Siparişler', icon: 'mdi-truck-delivery', to: { name: 'admin-orders' } },
  { title: 'Kategoriler', icon: 'mdi-folder-multiple', to: { name: 'admin-categories' } },
  { title: 'Bannerlar', icon: 'mdi-image-multiple', to: { name: 'admin-banners' } },
  { title: 'Kuponlar', icon: 'mdi-ticket-percent', to: { name: 'admin-coupons' } },
]

const userName = computed(() => authStore.userName)
const isDark = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <v-navigation-drawer app permanent color="grey-darken-4" width="260">
      <div class="pa-6">
        <router-link to="/" class="text-decoration-none">
          <div class="text-h5 font-weight-bold text-primary">
            MarketPlace
          </div>
          <v-chip size="x-small" color="error" class="ml-1">Admin</v-chip>
        </router-link>
      </div>

      <v-list nav density="compact" class="text-white">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          color="primary"
        />
        <v-divider class="my-4" color="grey-darken-2" />
        <v-list-item to="/" prepend-icon="mdi-store" title="Mağazaya Git" />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="surface" elevation="1" height="64" border>
      <v-spacer />
      <v-btn
        icon
        variant="text"
        class="mr-2"
        @click="toggleTheme"
      >
        <v-icon>{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
      </v-btn>
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text">
            <v-avatar color="error" size="36" class="mr-2">
              <span class="text-white text-body-2">{{ userName.charAt(0) }}</span>
            </v-avatar>
            {{ userName }}
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item to="/hesabim" prepend-icon="mdi-account" title="Profil" />
          <v-list-item to="/admin" prepend-icon="mdi-shield-account" title="Admin Paneli" />
          <v-divider />
          <v-list-item prepend-icon="mdi-logout" title="Çıkış Yap" @click="handleLogout" />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="bg-background overflow-x-hidden">
      <v-container class="py-6">
        <router-view />
      </v-container>
    </v-main>
</template>
