<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const theme = useTheme()

const menuItems = [
  { title: 'Panel', icon: 'mdi-view-dashboard', to: { name: 'seller-dashboard' } },
  { title: 'Ürünlerim', icon: 'mdi-package-variant', to: { name: 'seller-products' } },
  { title: 'Ürün Ekle', icon: 'mdi-plus-circle', to: { name: 'seller-add-product' } },
  { title: 'Siparişler', icon: 'mdi-truck-delivery', to: { name: 'seller-orders' } },
  { title: 'Kazançlarım', icon: 'mdi-cash', to: { name: 'seller-earnings' } },
]

const userName = computed(() => authStore.userName)
const isDark = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <v-navigation-drawer app permanent color="grey-darken-4" width="260">
      <div class="pa-6">
        <router-link to="/" class="text-decoration-none">
          <div class="text-h5 font-weight-bold text-primary">
            MarketPlace
          </div>
          <v-chip size="x-small" color="primary" class="ml-1">Satıcı</v-chip>
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
        <v-list-item to="/" prepend-icon="mdi-home" title="Mağazaya Git" />
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
            <v-avatar color="primary" size="36" class="mr-2">
              <span class="text-white text-body-2">{{ userName.charAt(0) }}</span>
            </v-avatar>
            {{ userName }}
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item to="/hesabim" prepend-icon="mdi-account" title="Profil" />
          <v-list-item to="/satici" prepend-icon="mdi-store" title="Satıcı Paneli" />
          <v-divider />
          <v-list-item prepend-icon="mdi-logout" title="Çıkış Yap" @click="authStore.logout()" />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="bg-background overflow-x-hidden">
      <v-container class="py-6">
        <router-view />
      </v-container>
    </v-main>
</template>
