<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useFavoriteStore } from '@/stores/favorite'
import { getDemoProductsByCategorySlug } from '@/data/demoProducts'
import type { Product } from '@/types'
import ProductCard from '@/components/product/UrunKarti.vue'

const route = useRoute()
const productStore = useProductStore()
const cartStore = useCartStore()
const favoriteStore = useFavoriteStore()

const viewMode = ref<'grid' | 'list'>('grid')
const sortBy = ref('newest')
const page = ref(1)
const itemsPerPage = 20
const loading = ref(false)

const filters = ref({
  minPrice: 0,
  maxPrice: 100000,
  minRating: 0,
  brands: [] as string[],
  category: '',
})

const showFilters = ref(false)

const products = computed(() => productStore.products)
const categories = computed(() => productStore.categories)
const totalProducts = computed(() => productStore.totalProducts)
const totalPages = computed(() => Math.ceil(totalProducts.value / itemsPerPage))

const currentCategory = computed(() =>
  categories.value.find((c) => c.slug === route.params.slug)
)

const availableBrands = computed(() => {
  const slug = route.params.slug as string | undefined
  const base = slug ? getDemoProductsByCategorySlug(slug) : productStore.products
  const brands = new Set(base.map((p) => p.brand).filter(Boolean))
  return Array.from(brands).sort()
})

async function loadProducts() {
  loading.value = true
  await productStore.fetchProducts({
    category_slug: route.params.slug as string,
    min_price: filters.value.minPrice > 0 ? filters.value.minPrice : undefined,
    max_price: filters.value.maxPrice < 100000 ? filters.value.maxPrice : undefined,
    min_rating: filters.value.minRating > 0 ? filters.value.minRating : undefined,
    brand: filters.value.brands.length ? filters.value.brands.join(',') : undefined,
    sort: sortBy.value,
    page: page.value,
    limit: itemsPerPage,
  })
  loading.value = false
}

onMounted(async () => {
  await productStore.fetchCategories()
  await loadProducts()
})

watch(() => route.params.slug, () => {
  page.value = 1
  loadProducts()
})

watch([sortBy, filters], () => {
  page.value = 1
  loadProducts()
}, { deep: true })

async function addToCart(product: Product) {
  await cartStore.addToCart(product, 1)
}

async function toggleFavorite(product: Product) {
  await favoriteStore.toggleFavorite(product)
}
</script>

<template>
  <v-container class="py-4">
    <v-breadcrumbs class="pa-0 mb-4">
      <v-breadcrumbs-item to="/">Ana Sayfa</v-breadcrumbs-item>
      <v-breadcrumbs-divider />
      <v-breadcrumbs-item>Kategoriler</v-breadcrumbs-item>
      <v-breadcrumbs-divider v-if="currentCategory" />
      <v-breadcrumbs-item v-if="currentCategory">
        {{ currentCategory.name }}
      </v-breadcrumbs-item>
    </v-breadcrumbs>

    <v-row>
      <v-col cols="12" md="3" lg="2" class="d-none d-md-block">
        <v-card flat class="position-sticky" style="top: calc(var(--v-layout-top, 140px) + 16px)">
          <v-card-title class="text-h6 pb-0">Filtreler</v-card-title>
          <v-card-text>
            <div class="mb-6">
              <div class="text-subtitle-2 font-weight-bold mb-2">Fiyat Aralığı</div>
              <div class="d-flex ga-2">
                <v-text-field
                  v-model.number="filters.minPrice"
                  label="Min (TL)"
                  type="number"
                  min="0"
                  density="compact"
                  hide-details
                />
                <v-text-field
                  v-model.number="filters.maxPrice"
                  label="Max (TL)"
                  type="number"
                  min="0"
                  density="compact"
                  hide-details
                />
              </div>
            </div>

            <div class="mb-6">
              <div class="text-subtitle-2 font-weight-bold mb-2">Puan</div>
              <v-rating
                v-model="filters.minRating"
                color="star"
                hover
                clearable
                density="compact"
              />
              <div v-if="filters.minRating > 0" class="text-caption text-medium-emphasis mt-1">
                {{ filters.minRating }} yıldızlı ürünler
              </div>
            </div>

            <div v-if="availableBrands.length" class="mb-6">
              <div class="text-subtitle-2 font-weight-bold mb-2">Marka</div>
              <v-checkbox
                v-for="brand in availableBrands"
                :key="brand"
                v-model="filters.brands"
                :label="brand"
                :value="brand"
                density="compact"
                hide-details
              />
            </div>

            <v-btn
              color="primary"
              variant="outlined"
              block
              @click="loadProducts"
            >
              Filtrele
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="9" lg="10">
        <v-card flat class="mb-4">
          <v-card-text class="d-flex align-center flex-wrap ga-4">
            <h1 class="text-h5 font-weight-bold">
              {{ currentCategory?.name || 'Tüm Ürünler' }}
              <v-chip color="primary" size="small" class="ml-2">
                {{ totalProducts }} ürün
              </v-chip>
            </h1>

            <v-spacer />

            <div class="d-flex align-center ga-2">
              <v-btn
                icon
                :color="viewMode === 'grid' ? 'primary' : 'default'"
                variant="text"
                @click="viewMode = 'grid'"
              >
                <v-icon>mdi-view-grid</v-icon>
              </v-btn>
              <v-btn
                icon
                :color="viewMode === 'list' ? 'primary' : 'default'"
                variant="text"
                @click="viewMode = 'list'"
              >
                <v-icon>mdi-view-list</v-icon>
              </v-btn>
            </div>

            <v-select
              v-model="sortBy"
              :items="[
                { title: 'En Yeni', value: 'newest' },
                { title: 'En Çok Satanlar', value: 'popular' },
                { title: 'En Yüksek Puan', value: 'rating' },
                { title: 'Fiyat (Düşükten Yükseğe)', value: 'price-asc' },
                { title: 'Fiyat (Yüksekten Düşüğe)', value: 'price-desc' },
              ]"
              item-title="title"
              item-value="value"
              label="Sırala"
              density="compact"
              hide-details
              style="max-width: 200px"
            />

            <v-btn
              variant="outlined"
              class="d-md-none"
              prepend-icon="mdi-filter"
              @click="showFilters = true"
            >
              Filtreler
            </v-btn>
          </v-card-text>
        </v-card>

        <v-row v-if="loading">
          <v-col v-for="i in 8" :key="i" cols="6" sm="4" lg="3">
            <v-skeleton-loader type="card" height="300" />
          </v-col>
        </v-row>

        <v-row v-else-if="products.length">
          <v-col
            v-for="product in products"
            :key="product.id"
            :cols="viewMode === 'grid' ? 6 : 12"
            :sm="viewMode === 'grid' ? 4 : 12"
            :lg="viewMode === 'grid' ? 3 : 12"
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
          <h2 class="text-h5 mt-4">Ürün bulunamadı</h2>
          <p class="text-body-1 text-grey mt-2">Farklı filtreler deneyin</p>
        </v-card>

        <v-pagination
          v-if="totalPages > 1"
          v-model="page"
          :length="totalPages"
          :total-visible="5"
          class="mt-6"
          @update:model-value="loadProducts"
        />
      </v-col>
    </v-row>

    <v-navigation-drawer
      v-model="showFilters"
      temporary
      location="right"
      width="300"
    >
      <v-card-title class="d-flex justify-space-between align-center">
        Filtreler
        <v-btn icon variant="text" @click="showFilters = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-card-text>
        <div class="mb-6">
          <div class="text-subtitle-2 font-weight-bold mb-2">Fiyat Aralığı</div>
          <div class="d-flex ga-2">
            <v-text-field
              v-model.number="filters.minPrice"
              label="Min (TL)"
              type="number"
              min="0"
              density="compact"
              hide-details
            />
            <v-text-field
              v-model.number="filters.maxPrice"
              label="Max (TL)"
              type="number"
              min="0"
              density="compact"
              hide-details
            />
          </div>
        </div>

        <div class="mb-6">
          <div class="text-subtitle-2 font-weight-bold mb-2">Puan</div>
          <v-rating
            v-model="filters.minRating"
            color="star"
            hover
            clearable
            density="compact"
          />
        </div>

        <div v-if="availableBrands.length" class="mb-6">
          <div class="text-subtitle-2 font-weight-bold mb-2">Marka</div>
          <v-checkbox
            v-for="brand in availableBrands"
            :key="brand"
            v-model="filters.brands"
            :label="brand"
            :value="brand"
            density="compact"
            hide-details
          />
        </div>

        <v-btn
          color="primary"
          block
          @click="showFilters = false; loadProducts()"
        >
          Uygula
        </v-btn>
      </v-card-text>
    </v-navigation-drawer>
  </v-container>
</template>
