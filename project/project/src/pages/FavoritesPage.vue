<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useFavoriteStore } from '@/stores/favorite'
import ProductCard from '@/components/product/ProductCard.vue'

const favoriteStore = useFavoriteStore()

onMounted(() => {
  favoriteStore.fetchFavorites()
})

const favorites = computed(() => favoriteStore.items)
const loading = computed(() => favoriteStore.loading)

async function clearAll() {
  await favoriteStore.clearFavorites()
}
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Favorilerim</h1>
      <v-btn
        v-if="favorites.length"
        variant="outlined"
        color="error"
        @click="clearAll"
      >
        Tümünü Sil
      </v-btn>
    </div>

    <v-row v-if="loading && favorites.length === 0">
      <v-col v-for="i in 4" :key="i" cols="6" sm="4" md="3">
        <v-skeleton-loader type="card" height="300" />
      </v-col>
    </v-row>

    <v-row v-else-if="favorites.length">
      <v-col
        v-for="fav in favorites"
        :key="fav.id"
        cols="6"
        sm="4"
        md="3"
      >
        <ProductCard v-if="fav.product" :product="fav.product" />
      </v-col>
    </v-row>

    <v-card v-else flat class="text-center py-16">
      <v-icon size="120" color="grey-lighten-1">mdi-heart-outline</v-icon>
      <h2 class="text-h5 mt-4">Favori listeniz boş</h2>
      <p class="text-body-1 text-grey mt-2">
        Beğendiğiniz ürünleri favorilere ekleyerek takip edebilirsiniz
      </p>
      <v-btn color="primary" size="large" to="/" class="mt-4">
        Alışverişe Başla
      </v-btn>
    </v-card>
  </v-container>
</template>
