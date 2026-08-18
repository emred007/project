<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Product } from '@/types'
import { resolveProductImage } from '@/data/demoProducts'
import { useFavoriteStore } from '@/stores/favorite'
import { useCartStore } from '@/stores/cart'

const props = defineProps<{
  product: Product
}>()

const router = useRouter()
const favoriteStore = useFavoriteStore()
const cartStore = useCartStore()

const isFavorite = computed(() => favoriteStore.isFavorite(props.product.id))

const discountPercent = computed(() => {
  if (props.product.is_new) return 0
  if (props.product.discount_price && props.product.price) {
    return Math.round(
      ((props.product.price - props.product.discount_price) / props.product.price) * 100
    )
  }
  return 0
})

const imageUrl = computed(() => resolveProductImage(props.product))

function goToProduct() {
  router.push(`/urun/${props.product.id}/${props.product.slug}`)
}

async function handleAddToCart(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  await cartStore.addToCart(props.product, 1)
}

async function handleToggleFavorite(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  await favoriteStore.toggleFavorite(props.product)
}
</script>

<template>
  <v-hover v-slot="{ isHovering, props: hoverProps }">
    <v-card
      v-bind="hoverProps"
      color="surface"
      class="d-flex flex-column h-100"
      :elevation="isHovering ? 8 : 2"
      rounded="xl"
      hover
    >
      <div class="position-relative cursor-pointer" @click="goToProduct">
        <v-img
          :src="imageUrl"
          height="200"
          cover
          bg-color="surface-variant"
        >
          <template #placeholder>
            <v-skeleton-loader type="image" height="200" color="surface-variant" />
          </template>

          <div class="d-flex flex-column fill-height pa-2">
            <div class="d-flex justify-space-between align-start ga-1">
              <v-chip v-if="discountPercent > 0" color="error" size="small" variant="flat">
                %{{ discountPercent }} İndirim
              </v-chip>
              <v-spacer v-if="discountPercent === 0" />
              <v-chip v-if="product.is_new" color="success" size="small" variant="flat">
                Yeni
              </v-chip>
            </div>

            <v-spacer />

            <div class="d-flex justify-end">
              <v-btn
                icon
                size="small"
                variant="flat"
                :color="isFavorite ? 'error' : 'surface'"
                border
                elevation="1"
                @click.stop.prevent="handleToggleFavorite"
              >
                <v-icon :color="isFavorite ? 'white' : undefined" size="20">
                  {{ isFavorite ? 'mdi-heart' : 'mdi-heart-outline' }}
                </v-icon>
              </v-btn>
            </div>
          </div>
        </v-img>
      </div>

      <v-card-text class="flex-grow-1 pb-2 cursor-pointer" @click="goToProduct">
        <div class="text-caption text-medium-emphasis mb-1">{{ product.brand }}</div>
        <div class="text-subtitle-2 font-weight-medium text-truncate mb-2" :title="product.name">
          {{ product.name }}
        </div>

        <v-rating
          :model-value="product.rating"
          color="star"
          density="compact"
          size="small"
          readonly
          half-increments
          class="mb-2"
        />

        <div class="d-flex align-center flex-wrap ga-2">
          <span class="text-h6 font-weight-bold text-primary">
            {{ product.discount_price?.toLocaleString('tr-TR') || product.price?.toLocaleString('tr-TR') }} TL
          </span>
          <span
            v-if="product.discount_price"
            class="text-body-2 text-medium-emphasis text-decoration-line-through"
          >
            {{ product.price?.toLocaleString('tr-TR') }} TL
          </span>
        </div>
      </v-card-text>

      <v-card-actions class="pt-0 px-4 pb-4">
        <v-btn
          color="primary"
          variant="flat"
          block
          :disabled="product.stock === 0"
          @click.stop.prevent="handleAddToCart"
        >
          <v-icon start>mdi-cart-plus</v-icon>
          {{ product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-hover>
</template>
