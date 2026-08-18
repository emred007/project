<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '@/types'
import ProductCard from '@/components/product/UrunKarti.vue'

const props = defineProps<{
  products: Product[]
  loading: boolean
}>()

const featuredProducts = computed(() => props.products.slice(0, 4))

const perks = [
  'Her hafta onlarca yeni ürün ekleniyor',
  'İlk haftaya özel indirim fırsatları',
  'Sınırlı stok — tükenmeden yakalayın',
]

const highlights = [
  { icon: 'mdi-truck-fast', title: 'Hızlı Kargo', text: '500 TL üzeri ücretsiz' },
  { icon: 'mdi-shield-check', title: 'Orijinal Ürün', text: 'Satıcı garantili' },
  { icon: 'mdi-reload', title: 'Kolay İade', text: '14 gün içinde' },
]
</script>

<template>
  <v-sheet color="surface-variant" class="py-10 py-md-12">
    <v-container>
      <v-card color="surface" rounded="xl" elevation="1" class="overflow-hidden">
        <v-row no-gutters>
          <!-- Sol: metin paneli -->
          <v-col cols="12" lg="4">
            <div class="pa-6 pa-md-8 bg-primary h-100 d-flex flex-column">
              <v-chip color="surface" size="small" variant="flat" class="align-self-start mb-4">
                <v-icon start size="small">mdi-sparkles</v-icon>
                BU HAFTA YENİ
              </v-chip>

              <h2 class="text-h4 text-md-h3 font-weight-bold text-white mb-3">
                Yeni Gelenler
              </h2>

              <p class="text-body-2 text-white mb-5" style="opacity: 0.92">
                Raflara yeni eklenen ürünleri ilk siz keşfedin. Modadan teknolojiye,
                her kategoride taze fırsatlar burada.
              </p>

              <v-list bg-color="transparent" density="compact" class="pa-0 mb-6 flex-grow-1">
                <v-list-item
                  v-for="(perk, i) in perks"
                  :key="i"
                  class="px-0"
                  min-height="36"
                >
                  <template #prepend>
                    <v-icon color="surface" size="18" class="mr-2">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2 text-white" style="opacity: 0.95">
                    {{ perk }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>

              <div class="d-flex align-center ga-4 mb-6">
                <div>
                  <div class="text-h5 font-weight-bold text-white">
                    {{ loading ? '—' : `${Math.max(products.length, 8)}+` }}
                  </div>
                  <div class="text-caption text-white" style="opacity: 0.85">yeni ürün</div>
                </div>
                <v-divider vertical color="surface" opacity="0.4" />
                <div>
                  <div class="text-h5 font-weight-bold text-white">%40</div>
                  <div class="text-caption text-white" style="opacity: 0.85">indirime varan</div>
                </div>
              </div>

              <v-btn
                color="surface"
                size="large"
                block
                to="/kategori"
              >
                Tümünü Keşfet
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </v-col>

          <!-- Sağ: öne çıkan 4 ürün -->
          <v-col cols="12" lg="8" class="pa-4 pa-md-6">
            <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
              <div class="text-subtitle-1 font-weight-bold text-high-emphasis">
                Editörün Seçtikleri
              </div>
              <v-chip color="success" size="small" variant="flat">
                <v-icon start size="small">mdi-new-box</v-icon>
                Yeni
              </v-chip>
            </div>

            <v-row v-if="loading" dense>
              <v-col v-for="i in 4" :key="i" cols="6">
                <v-skeleton-loader type="card" height="320" />
              </v-col>
            </v-row>

            <v-row v-else-if="featuredProducts.length" dense>
              <v-col
                v-for="product in featuredProducts"
                :key="product.id"
                cols="6"
              >
                <ProductCard :product="product" />
              </v-col>
            </v-row>

            <v-card v-else flat color="surface-variant" rounded="lg" class="pa-8 text-center">
              <v-icon size="48" color="primary" class="mb-3">mdi-package-variant</v-icon>
              <div class="text-body-1 text-medium-emphasis">Yeni ürünler yükleniyor...</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Alt: daha fazla ürün + avantajlar -->
        <v-divider />

        <div class="pa-4 pa-md-6">
          <v-row dense class="mb-6">
            <v-col
              v-for="item in highlights"
              :key="item.title"
              cols="12"
              sm="4"
            >
              <div class="d-flex align-center ga-3">
                <v-avatar color="primary-light" size="40" rounded="lg">
                  <v-icon color="primary" size="20">{{ item.icon }}</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-bold">{{ item.title }}</div>
                  <div class="text-caption text-medium-emphasis">{{ item.text }}</div>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-card>
    </v-container>
  </v-sheet>
</template>
