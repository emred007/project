<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

onMounted(() => {
  cartStore.fetchCart()
})

const cartItems = computed(() => cartStore.items)
const loading = computed(() => cartStore.loading)
const subtotal = computed(() => cartStore.subtotal)
const discount = computed(() => cartStore.discount)
const shippingCost = computed(() => cartStore.shippingCost)
const tax = computed(() => cartStore.tax)
const total = computed(() => cartStore.total)

const couponCode = ref('')

function formatPrice(price: number): string {
  return price.toLocaleString('tr-TR')
}

async function updateQuantity(itemId: string, quantity: number) {
  if (quantity < 1) return
  await cartStore.updateQuantity(itemId, quantity)
}

async function removeItem(itemId: string) {
  await cartStore.removeFromCart(itemId)
}

async function applyCoupon() {
  const code = couponCode.value.trim()
  if (!code) return
  const ok = await cartStore.applyCoupon(code)
  if (ok) {
    couponCode.value = ''
  }
}

function proceedToCheckout() {
  router.push({ name: 'checkout' })
}
</script>

<template>
  <v-container class="py-6">
    <h1 class="text-h4 font-weight-bold mb-6">Sepetim</h1>

    <v-row v-if="loading && cartItems.length === 0">
      <v-col cols="12" md="8">
        <v-skeleton-loader type="card" height="400" />
      </v-col>
      <v-col cols="12" md="4">
        <v-skeleton-loader type="card" height="300" />
      </v-col>
    </v-row>

    <template v-else-if="cartItems.length">
      <v-row>
        <v-col cols="12" md="8">
          <v-card flat>
            <v-list>
              <v-list-item
                v-for="item in cartItems"
                :key="item.id"
                class="py-4"
              >
                <template #prepend>
                  <router-link :to="`/urun/${item.product_id}/${item.product?.slug}`">
                    <v-img
                      :src="item.product?.images?.[0] || 'https://via.placeholder.com/100'"
                      width="100"
                      height="100"
                      cover
                      class="rounded-lg mr-4"
                    />
                  </router-link>
                </template>

                <v-list-item-title class="text-subtitle-1 font-weight-medium mb-1">
                  <router-link :to="`/urun/${item.product_id}/${item.product?.slug}`">
                    {{ item.product?.name }}
                  </router-link>
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ item.product?.brand }}
                </v-list-item-subtitle>

                <div class="d-flex align-center ga-2 mt-2">
                  <v-btn
                    icon
                    size="small"
                    variant="outlined"
                    :disabled="item.quantity <= 1"
                    @click="updateQuantity(item.id, item.quantity - 1)"
                  >
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>
                  <span class="text-body-1 font-weight-bold mx-2">
                    {{ item.quantity }}
                  </span>
                  <v-btn
                    icon
                    size="small"
                    variant="outlined"
                    :disabled="(item.product?.stock || 0) <= item.quantity"
                    @click="updateQuantity(item.id, item.quantity + 1)"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </div>

                <template #append>
                  <div class="text-right">
                    <div class="text-h6 font-weight-bold text-primary">
                      {{ formatPrice((item.product?.discount_price || item.product?.price || 0) * item.quantity) }} TL
                    </div>
                    <div
                      v-if="item.product?.discount_price"
                      class="text-body-2 text-grey text-decoration-line-through"
                    >
                      {{ formatPrice((item.product?.price || 0) * item.quantity) }} TL
                    </div>
                    <v-btn
                      variant="text"
                      color="error"
                      size="small"
                      class="mt-2"
                      @click="removeItem(item.id)"
                    >
                      <v-icon start>mdi-delete-outline</v-icon>
                      Sil
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
              <v-divider />
            </v-list>

            <v-card-actions class="pa-4">
              <v-btn
                variant="outlined"
                color="error"
                @click="cartStore.clearCart()"
              >
                Sepeti Temizle
              </v-btn>
              <v-spacer />
              <v-btn
                variant="text"
                color="primary"
                to="/"
              >
                Alışverişe Devam Et
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card flat class="position-sticky" style="top: calc(var(--v-layout-top, 140px) + 16px)">
            <v-card-title class="pb-0">Sipariş Özeti</v-card-title>
            <v-card-text>
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-1">Ara Toplam</span>
                <span class="text-body-1 font-weight-medium">{{ formatPrice(subtotal) }} TL</span>
              </div>

              <div v-if="discount > 0" class="d-flex justify-space-between mb-2 text-success">
                <span class="text-body-1">İndirim</span>
                <span class="text-body-1 font-weight-medium">-{{ formatPrice(discount) }} TL</span>
              </div>

              <div v-if="cartStore.appliedCoupon" class="mb-2">
                <v-chip
                  closable
                  color="success"
                  variant="outlined"
                  size="small"
                  @click:close="cartStore.removeCoupon()"
                >
                  {{ cartStore.appliedCoupon.code }}
                </v-chip>
              </div>

              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-1">Kargo</span>
                <span class="text-body-1 font-weight-medium">
                  {{ shippingCost === 0 ? 'Ücretsiz' : `${formatPrice(shippingCost)} TL` }}
                </span>
              </div>

              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-1">KDV (%10)</span>
                <span class="text-body-1 font-weight-medium">{{ formatPrice(tax) }} TL</span>
              </div>

              <v-divider class="my-3" />

              <div class="d-flex justify-space-between mb-4">
                <span class="text-h6 font-weight-bold">Toplam</span>
                <span class="text-h6 font-weight-bold text-primary">{{ formatPrice(total) }} TL</span>
              </div>

              <div class="mb-4">
                <v-text-field
                  v-model="couponCode"
                  label="Kupon Kodu"
                  density="compact"
                  hide-details="auto"
                  :error-messages="cartStore.couponError ? [cartStore.couponError] : []"
                  @keyup.enter="applyCoupon"
                />
                <v-btn
                  variant="tonal"
                  color="primary"
                  block
                  class="mt-2"
                  :disabled="!couponCode.trim() || cartStore.loading"
                  :loading="cartStore.loading"
                  @click="applyCoupon"
                >
                  Uygula
                </v-btn>
              </div>

              <v-btn
                color="primary"
                size="x-large"
                block
                @click="proceedToCheckout"
              >
                Ödemeye Geç
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>

              <div class="mt-4 text-center">
                <v-icon color="success" class="mr-1">mdi-shield-check</v-icon>
                <span class="text-caption text-grey">256-bit SSL ile güvenli ödeme</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-card v-else flat class="text-center py-16">
      <v-icon size="120" color="grey-lighten-1">mdi-cart-outline</v-icon>
      <h2 class="text-h5 mt-4">Sepetiniz boş</h2>
      <p class="text-body-1 text-grey mt-2">
        Henüz sepetinize ürün eklemediniz
      </p>
      <v-btn color="primary" size="large" to="/" class="mt-4">
        Alışverişe Başla
      </v-btn>
    </v-card>
  </v-container>
</template>
