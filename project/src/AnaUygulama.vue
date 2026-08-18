<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useFavoriteStore } from '@/stores/favorite'
import { useToastStore } from '@/stores/toast'
import { clearLocalCart } from '@/data/localCart'
import { watch, onMounted } from 'vue'

const authStore = useAuthStore()
const cartStore = useCartStore()
const favoriteStore = useFavoriteStore()
const toastStore = useToastStore()

onMounted(async () => {
  await authStore.initialize()
  if (authStore.isAuthenticated) {
    cartStore.fetchCart()
    favoriteStore.fetchFavorites()
  }
})

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      cartStore.fetchCart()
      favoriteStore.fetchFavorites()
    } else {
      clearLocalCart()
      cartStore.reset()
      favoriteStore.reset()
    }
  }
)
</script>

<template>
  <v-app class="overflow-x-hidden">
    <router-view />

    <v-snackbar
      v-model="toastStore.show"
      :color="toastStore.color"
      :timeout="3000"
      location="bottom right"
    >
      {{ toastStore.message }}
    </v-snackbar>
  </v-app>
</template>
