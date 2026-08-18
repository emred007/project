<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useFavoriteStore } from '@/stores/favorite'
import type { Product } from '@/types'
import ProductCard from '@/components/product/UrunKarti.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const favoriteStore = useFavoriteStore()

const loading = ref(false)

const products = computed(() => productStore.products)
const totalProducts = computed(() => productStore.totalProducts)
const activeTerm = computed(() => {
  const q = route.query.q
  return typeof q === 'string' ? q.trim() : ''
})

async function runSearch(term: string) {
  loading.value = true
  await productStore.fetchProducts({
    search: term,
    limit: 100,
  })
  loading.value = false
}

onMounted(async () => {
  if (activeTerm.value.length >= 2) {
    await runSearch(activeTerm.value)
    return
  }
  router.replace({ name: 'home' })
})

watch(
  () => route.query.q,
  async (q) => {
    const term = typeof q === 'string' ? q.trim() : ''
    if (term.length >= 2) {
      await runSearch(term)
    } else if (route.name === 'search') {
      router.replace({ name: 'home' })
    }
  }
)

async function addToCart(product: Product) {
  await cartStore.addToCart(product, 1)
}

async function toggleFavorite(product: Product) {
  await favoriteStore.toggleFavorite(product)
}
</script>

<template>
  <v-container class="py-8">
    <h1 class="text-h5 font-weight-bold mb-4">
      "{{ activeTerm }}" için {{ totalProducts }} sonuç
    </h1>

    <v-row v-if="loading">
      <v-col v-for="i in 8" :key="i" cols="6" sm="4" lg="3">
        <v-skeleton-loader type="card" height="300" />
      </v-col>
    </v-row>

    <v-row v-else-if="products.length">
      <v-col
        v-for="product in products"
        :key="product.id"
        cols="6"
        sm="4"
        lg="3"
      >
        <ProductCard
          :product="product"
          @add-to-cart="addToCart"
          @toggle-favorite="toggleFavorite"
        />
      </v-col>
    </v-row>

    <v-card v-else flat class="text-center py-16">
      <v-icon size="100" color="grey-lighten-1">mdi-package-variant</v-icon>
      <h2 class="text-h5 mt-4">Sonuç bulunamadı</h2>
      <p class="text-body-1 text-grey mt-2">Farklı bir ürün adı deneyin</p>
    </v-card>
  </v-container>
</template>
