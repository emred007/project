<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { logoutAndGoHome } from '@/composables/useLogout'

const router = useRouter()
const authStore = useAuthStore()

const menuItems = [
  { title: 'Profilim', icon: 'mdi-account', to: { name: 'profile' } },
  { title: 'Siparişlerim', icon: 'mdi-package-variant', to: { name: 'orders' } },
  { title: 'Favorilerim', icon: 'mdi-heart', to: { name: 'favorites' } },
  { title: 'Güvenlik', icon: 'mdi-shield-account', to: { name: 'security' } },
]

const userName = computed(() => authStore.userName)
const userInitials = computed(() => authStore.userInitials)

async function handleLogout() {
  await logoutAndGoHome(router)
}
</script>

<template>
  <v-app-bar app color="surface" elevation="1" height="72" border>
      <v-container fluid class="d-flex align-center py-0 px-4 px-md-6">
        <router-link to="/" class="text-decoration-none">
          <v-toolbar-title class="text-h6 text-md-h5 font-weight-bold text-primary">
            Pazarium
          </v-toolbar-title>
        </router-link>
        <v-spacer />
        <v-btn icon variant="text" to="/sepet">
          <v-icon>mdi-cart-outline</v-icon>
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-main class="bg-background overflow-x-hidden">
      <v-container class="py-6">
        <v-row>
          <v-col cols="12" md="3" lg="2">
            <v-card flat class="mb-4">
              <v-card-text class="text-center">
                <v-avatar size="80" color="primary" class="mb-3">
                  <span class="text-h4 text-white">{{ userInitials }}</span>
                </v-avatar>
                <div class="text-h6 font-weight-medium">{{ userName }}</div>
              </v-card-text>
            </v-card>

            <v-list nav rounded="lg">
              <v-list-item
                v-for="item in menuItems"
                :key="item.title"
                :to="item.to"
                :prepend-icon="item.icon"
                :title="item.title"
                color="primary"
              />
              <v-divider class="my-2" />
              <v-list-item
                prepend-icon="mdi-logout"
                title="Çıkış Yap"
                @click="handleLogout"
              />
            </v-list>
          </v-col>

          <v-col cols="12" md="9" lg="10">
            <router-view />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
</template>
