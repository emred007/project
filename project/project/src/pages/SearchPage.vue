<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useFavoriteStore } from '@/stores/favorite'
import type { Product } from '@/types'
import ProductCard from '@/components/product/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const favoriteStore = useFavoriteStore()

const searchQuery = ref('')
const suggestions = ref<Product[]>([])
const recentSearches = ref<string[]>([])
const loading = ref(false)
const showSuggestions = ref(false)

const products = computed(() => productStore.products)
const totalProducts = computed(() => productStore.totalProducts)

const categories = computed(() => productStore.categories)

let searchTimeout: number | undefined

onMounted(async () => {
  await productStore.fetchCategories()
  const saved = localStorage.getItem('recentSearches')
  if (saved) {
    recentSearches.value = JSON.parse(saved)
  }

  if (route.query.q) {
    searchQuery.value = route.query.q as string
    await performSearch()
  }
})

watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (val.length >= 2) {
    searchTimeout = window.setTimeout(async () => {
      suggestions.value = await productStore.searchProducts(val)
      showSuggestions.value = true
    }, 300)
  } else {
    suggestions.value = []
    showSuggestions.value = false
  }
})

async function performSearch() {
  if (!searchQuery.value.trim()) return

  loading.value = true
  showSuggestions.value = false

  saveToRecent(searchQuery.value)

  router.push({ name: 'search', query: { q: searchQuery.value } })

  await productStore.fetchProducts({
    search: searchQuery.value,
    limit: 20,
  })

  loading.value = false
}

function saveToRecent(query: string) {
  const searches = recentSearches.value.filter((s) => s !== query)
  searches.unshift(query)
  recentSearches.value = searches.slice(0, 5)
  localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value))
}

function clearRecentSearches() {
  recentSearches.value = []
  localStorage.removeItem('recentSearches')
}

function useSuggestion(query: string) {
  searchQuery.value = query
  showSuggestions.value = false
  performSearch()
}

async function addToCart(product: Product) {
  await cartStore.addToCart(product, 1)
}

async function toggleFavorite(product: Product) {
  await favoriteStore.toggleFavorite(product)
}
</script>

<template>
  <v-container class="py-8">
    <v-card flat class="mb-6">
      <v-card-text>
        <v-menu
          v-model="showSuggestions"
          :close-on-content-click="false"
          location="bottom"
          max-height="400"
          width="100%"
          offset="4"
        >
          <template #activator="{ props: menuProps }">
            <v-form @submit.prevent="performSearch">
              <v-text-field
                v-bind="menuProps"
                v-model="searchQuery"
                placeholder="Ürün, marka veya kategori ara..."
                prepend-inner-icon="mdi-magnify"
                append-inner-icon="mdi-microphone"
                size="large"
                hide-details
                variant="outlined"
                density="comfortable"
                bg-color="surface-variant"
                @focus="showSuggestions = true"
              />
            </v-form>
          </template>

          <v-list v-if="suggestions.length || recentSearches.length">
            <v-list-subheader v-if="recentSearches.length">Son Aramalar</v-list-subheader>
            <v-list-item
              v-for="search in recentSearches"
              :key="search"
              prepend-icon="mdi-history"
              @click="useSuggestion(search)"
            >
              {{ search }}
              <template #append>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click.stop="recentSearches = recentSearches.filter((s) => s !== search)"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
            </v-list-item>

            <v-list-item v-if="recentSearches.length">
              <v-btn
                variant="text"
                size="small"
                color="grey"
                @click="clearRecentSearches"
              >
                Geçmişi Temizle
              </v-btn>
            </v-list-item>

            <v-divider v-if="suggestions.length && recentSearches.length" />

            <v-list-subheader v-if="suggestions.length">Öneriler</v-list-subheader>
            <v-list-item
              v-for="product in suggestions.slice(0, 5)"
              :key="product.id"
              prepend-icon="mdi-package-variant"
              :to="`/urun/${product.id}/${product.slug}`"
              @click="showSuggestions = false"
            >
              {{ product.name }}
              <template #append>
                <span class="text-body-2 text-medium-emphasis">{{ product.price?.toLocaleString('tr-TR') }} TL</span>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-slide-group v-if="categories.length" class="mt-4" show-arrows>
          <v-slide-group-item v-for="cat in categories.filter((c) => !c.parent_id)" :key="cat.id">
            <v-chip
              :to="`/kategori/${cat.slug}`"
              class="ma-1"
              variant="outlined"
            >
              {{ cat.name }}
            </v-chip>
          </v-slide-group-item>
        </v-slide-group>
      </v-card-text>
    </v-card>

    <div v-if="route.query.q">
      <h1 class="text-h5 font-weight-bold mb-4">
        "{{ route.query.q }}" için {{ totalProducts }} sonuç
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
        <p class="text-body-1 text-grey mt-2">Farklı anahtar kelimeler deneyin</p>
      </v-card>
    </div>

    <div v-else class="text-center py-16">
      <v-icon size="100" color="grey-lighten-1">mdi-magnify</v-icon>
      <h2 class="text-h5 mt-4">Ne aramak istersiniz?</h2>
      <p class="text-body-1 text-grey mt-2">Ürün, marka veya kategori arayabilirsiniz</p>
    </div>
  </v-container>
</template>
