<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useFavoriteStore } from '@/stores/favorite'
import type { Product } from '@/types'
import { resolveProductImage } from '@/data/demoProducts'

const route = useRoute()
const router = useRouter()
const { mdAndUp } = useDisplay()
const productStore = useProductStore()
const cartStore = useCartStore()
const favoriteStore = useFavoriteStore()

const quantity = ref(1)
const selectedImage = ref(0)
const zoomModal = ref(false)
const loading = ref(true)

const product = computed(() => productStore.currentProduct)
const reviews = computed(() => productStore.reviews)

const isFavorite = computed(() =>
  product.value ? favoriteStore.isFavorite(product.value.id) : false
)

const discountPercent = computed(() => {
  if (product.value?.discount_price && product.value?.price) {
    return Math.round(
      ((product.value.price - product.value.discount_price) / product.value.price) * 100
    )
  }
  return 0
})

const totalPrice = computed(() => {
  if (!product.value) return 0
  const price = product.value.discount_price || product.value.price
  return price * quantity.value
})

const productImages = computed(() => {
  if (!product.value) return []
  const main = resolveProductImage(product.value)
  const rest = (product.value.images || []).filter((url) => url !== main)
  return [main, ...rest]
})

const inStock = computed(() => (product.value?.stock || 0) > 0)

async function fetchProduct() {
  const id = route.params.id as string
  loading.value = true
  await productStore.fetchProductById(id)
  if (product.value) {
    await productStore.fetchProductReviews(product.value.id)
  }
  loading.value = false
}

onMounted(fetchProduct)

watch(() => route.params.id, fetchProduct)

async function addToCart() {
  if (!product.value) return
  const success = await cartStore.addToCart(product.value as Product, quantity.value)
  if (success) {
    quantity.value = 1
  }
}

async function buyNow() {
  if (!product.value) return
  await cartStore.addToCart(product.value as Product, quantity.value)
  router.push({ name: 'checkout' })
}

async function toggleFavorite() {
  if (!product.value) return
  await favoriteStore.toggleFavorite(product.value as Product)
}

function formatPrice(price: number): string {
  return price.toLocaleString('tr-TR')
}
</script>

<template>
  <v-container class="py-8">
    <v-row v-if="loading">
      <v-col cols="12" md="6">
        <v-skeleton-loader type="image" height="500" />
      </v-col>
      <v-col cols="12" md="6">
        <v-skeleton-loader type="article, actions" />
      </v-col>
    </v-row>

    <template v-else-if="product">
      <v-row>
        <v-col cols="12" md="6" lg="5">
          <div class="mb-4">
            <v-card
              rounded="lg"
              hover
              ripple
              @click="zoomModal = true"
            >
              <v-img
                :src="productImages[selectedImage] || 'https://via.placeholder.com/600'"
                :height="mdAndUp ? 500 : 320"
                cover
              >
                <template #placeholder>
                  <v-skeleton-loader type="image" :height="mdAndUp ? 500 : 320" />
                </template>

                <div v-if="discountPercent > 0" class="pa-4">
                  <v-chip color="error" size="large">
                    %{{ discountPercent }} İndirim
                  </v-chip>
                </div>
              </v-img>
            </v-card>
          </div>

          <div class="d-flex flex-wrap ga-2">
            <v-card
              v-for="(image, index) in productImages"
              :key="index"
              :border="selectedImage === index ? 'primary md opacity-100' : undefined"
              rounded="lg"
              hover
              ripple
              @click="selectedImage = index"
            >
              <v-img :src="image" width="80" height="80" cover />
            </v-card>
          </div>
        </v-col>

        <v-col cols="12" md="6" lg="7">
          <v-card flat class="product-info">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-chip size="small" color="grey-lighten-2" class="mr-2">
                  {{ product.brand }}
                </v-chip>
                <v-chip v-if="product.is_new" size="small" color="success">
                  Yeni
                </v-chip>
              </div>

              <h1 class="text-h4 text-md-h3 font-weight-bold mb-4">
                {{ product.name }}
              </h1>

              <div class="d-flex align-center ga-4 mb-4">
                <v-rating
                  :model-value="product.rating"
                  color="star"
                  density="compact"
                  size="large"
                  readonly
                  half-increments
                />
                <span class="text-body-1 text-grey">
                  {{ product.rating.toFixed(1) }} ({{ product.review_count }} değerlendirme)
                </span>
              </div>

              <v-divider class="my-4" />

              <div class="price-section mb-6">
                <div class="d-flex align-baseline ga-4 flex-wrap">
                  <span class="text-h3 text-md-h2 font-weight-bold text-primary">
                    {{ formatPrice(product.discount_price || product.price) }} TL
                  </span>
                  <span
                    v-if="product.discount_price"
                    class="text-h5 text-grey text-decoration-line-through"
                  >
                    {{ formatPrice(product.price) }} TL
                  </span>
                </div>
                <div v-if="discountPercent > 0" class="text-success text-body-1 mt-2">
                  {{ formatPrice(product.price - (product.discount_price || 0)) }} TL tasarruf edin!
                </div>
              </div>

              <div class="mb-6">
                <div class="text-body-2 text-grey mb-2">Stok Durumu</div>
                <v-chip :color="inStock ? 'success' : 'error'" size="small">
                  <v-icon start>{{ inStock ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                  {{ inStock ? `${product.stock} adet stokta` : 'Stokta yok' }}
                </v-chip>
              </div>

              <div class="mb-6">
                <div class="text-body-2 mb-2">Adet</div>
                <div class="d-flex align-center ga-2">
                  <v-btn
                    icon
                    variant="outlined"
                    size="small"
                    :disabled="quantity <= 1"
                    @click="quantity--"
                  >
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>
                  <v-text-field
                    :model-value="quantity"
                    type="number"
                    hide-details
                    density="compact"
                    style="max-width: 80px"
                    centered
                    readonly
                  />
                  <v-btn
                    icon
                    variant="outlined"
                    size="small"
                    :disabled="quantity >= (product.stock || 0)"
                    @click="quantity++"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>

              <div class="d-flex flex-wrap ga-3 mb-6">
                <v-btn
                  color="primary"
                  size="x-large"
                  :disabled="!inStock"
                  @click="addToCart"
                >
                  <v-icon start>mdi-cart-plus</v-icon>
                  Sepete Ekle
                </v-btn>
                <v-btn
                  color="primary"
                  variant="tonal"
                  size="x-large"
                  :disabled="!inStock"
                  @click="buyNow"
                >
                  Hemen Al
                </v-btn>
                <v-btn
                  :color="isFavorite ? 'error' : 'primary'"
                  variant="outlined"
                  size="x-large"
                  @click="toggleFavorite"
                >
                  <v-icon>{{ isFavorite ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
                </v-btn>
              </div>

              <v-divider class="my-4" />

              <div class="text-body-1 text-grey-darken-2 mb-4">
                <div class="text-subtitle-1 font-weight-bold mb-2">Ürün Açıklaması</div>
                {{ product.description }}
              </div>

              <v-expansion-panels v-if="product.specifications && Object.keys(product.specifications).length">
                <v-expansion-panel title="Teknik Özellikler">
                  <v-expansion-panel-text>
                    <v-table density="compact">
                      <tbody>
                        <tr v-for="(value, key) in product.specifications" :key="key">
                          <td class="font-weight-medium">{{ key }}</td>
                          <td>{{ value }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-8">
        <v-col cols="12">
          <v-card flat>
            <v-card-title class="text-h6">Değerlendirmeler</v-card-title>
            <v-card-text>
              <div v-if="reviews.length === 0" class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1">mdi-comment-outline</v-icon>
                <p class="text-body-1 text-grey mt-4">Henüz değerlendirme yok.</p>
              </div>

              <v-list v-else>
                <v-list-item v-for="review in reviews" :key="review.id" class="mb-4">
                  <template #prepend>
                    <v-avatar color="primary" size="48">
                      <span class="text-white">{{ review.user?.full_name?.[0] || '?' }}</span>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold">
                    {{ review.user?.full_name || 'Anonim' }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <v-rating
                      :model-value="review.rating"
                      color="star"
                      density="compact"
                      size="small"
                      readonly
                    />
                  </v-list-item-subtitle>
                  <v-list-item-text class="mt-2">{{ review.comment }}</v-list-item-text>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-row v-else>
      <v-col cols="12" class="text-center py-16">
        <v-icon size="100" color="grey-lighten-1">mdi-package-variant</v-icon>
        <h2 class="text-h5 mt-4">Ürün bulunamadı</h2>
        <v-btn color="primary" to="/" class="mt-4">Ana Sayfaya Dön</v-btn>
      </v-col>
    </v-row>

    <v-dialog v-model="zoomModal" max-width="90vw">
      <v-card>
        <v-toolbar density="compact" color="transparent">
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="zoomModal = false" />
        </v-toolbar>
        <v-img
          :src="productImages[selectedImage]"
          max-height="85vh"
          contain
        />
      </v-card>
    </v-dialog>
  </v-container>
</template>
