<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import type { Product } from '@/types'

const adminStore = useAdminStore()

const search = ref('')
const rejectDialog = ref(false)
const approveDialog = ref(false)
const detailDialog = ref(false)
const selectedProduct = ref<(Product & { seller?: { full_name?: string; email?: string }; categories?: { name?: string } }) | null>(null)
const rejectionReason = ref('')
const approveFlags = ref({ is_featured: false, is_bestseller: false, is_new: true })
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

onMounted(() => {
  adminStore.fetchPendingProducts()
})

const filteredProducts = computed(() => {
  if (!search.value) return adminStore.pendingProducts
  return adminStore.pendingProducts.filter((p) =>
    p.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

function showMessage(text: string, color = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('tr-TR')
}

function formatPrice(price: number): string {
  return price.toLocaleString('tr-TR')
}

function productImage(product: Product): string {
  return product.images?.[0] || 'https://via.placeholder.com/200'
}

function sellerName(product: Product & { seller?: { full_name?: string; email?: string } }): string {
  return product.seller?.full_name || 'Yerel Satıcı'
}

function sellerEmail(product: Product & { seller?: { full_name?: string; email?: string } }): string {
  return product.seller?.email || '—'
}

function openDetail(product: Product) {
  selectedProduct.value = product
  detailDialog.value = true
}

function openApproveDialog(product: Product) {
  selectedProduct.value = product
  approveFlags.value = { is_featured: false, is_bestseller: false, is_new: true }
  approveDialog.value = true
}

function openRejectDialog(product: Product) {
  selectedProduct.value = product
  rejectionReason.value = ''
  rejectDialog.value = true
}

async function confirmApprove() {
  if (!selectedProduct.value) return
  const ok = await adminStore.approveProduct(selectedProduct.value.id, approveFlags.value)
  if (ok) {
    showMessage(`"${selectedProduct.value.name}" onaylandı ve mağazada yayınlandı.`)
    approveDialog.value = false
    detailDialog.value = false
    selectedProduct.value = null
  } else {
    showMessage(adminStore.error || 'Onaylama başarısız', 'error')
  }
}

async function confirmReject() {
  if (!selectedProduct.value || !rejectionReason.value.trim()) return
  const ok = await adminStore.rejectProduct(selectedProduct.value.id, rejectionReason.value.trim())
  if (ok) {
    showMessage(`"${selectedProduct.value.name}" reddedildi.`, 'warning')
    rejectDialog.value = false
    detailDialog.value = false
    selectedProduct.value = null
  } else {
    showMessage(adminStore.error || 'Reddetme başarısız', 'error')
  }
}
</script>

<template>
  <div>
    <v-card flat>
      <v-card-title class="d-flex flex-wrap justify-space-between align-center ga-4">
        <div>
          <div class="text-h5">Ürün Onay Sistemi</div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Satıcıların eklediği ürünleri inceleyin, onaylayın veya reddedin
          </div>
        </div>
        <v-chip color="warning" variant="flat">
          <v-icon start>mdi-clock-outline</v-icon>
          {{ filteredProducts.length }} ürün bekliyor
        </v-chip>
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Ürün ara..."
          density="compact"
          max-width="360"
          class="mb-4"
          hide-details
          clearable
        />

        <v-row v-if="filteredProducts.length">
          <v-col v-for="product in filteredProducts" :key="product.id" cols="12" sm="6" lg="4">
            <v-card variant="outlined" class="h-100">
              <v-img :src="productImage(product)" height="200" cover>
                <template #placeholder>
                  <v-skeleton-loader type="image" height="200" />
                </template>
                <div class="pa-2">
                  <v-chip color="warning" size="small">Onay Bekliyor</v-chip>
                </div>
              </v-img>

              <v-card-text>
                <div class="text-caption text-medium-emphasis mb-1">{{ product.brand }}</div>
                <div class="text-subtitle-1 font-weight-bold mb-2">{{ product.name }}</div>
                <div class="text-h6 text-primary font-weight-bold mb-2">
                  {{ formatPrice(product.discount_price || product.price) }} TL
                </div>

                <v-list density="compact" class="pa-0 bg-transparent">
                  <v-list-item prepend-icon="mdi-account" class="px-0" min-height="32">
                    <v-list-item-title class="text-body-2">{{ sellerName(product) }}</v-list-item-title>
                    <v-list-item-subtitle class="text-caption">{{ sellerEmail(product) }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-package-variant" class="px-0" min-height="32">
                    <v-list-item-title class="text-body-2">Stok: {{ product.stock }} adet</v-list-item-title>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-calendar" class="px-0" min-height="32">
                    <v-list-item-title class="text-body-2">{{ formatDate(product.created_at) }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>

              <v-card-actions class="px-4 pb-4 pt-0 flex-wrap ga-2">
                <v-btn variant="tonal" size="small" @click="openDetail(product)">
                  <v-icon start>mdi-eye</v-icon>
                  İncele
                </v-btn>
                <v-spacer />
                <v-btn color="success" variant="flat" size="small" @click="openApproveDialog(product)">
                  <v-icon start>mdi-check</v-icon>
                  Onayla
                </v-btn>
                <v-btn color="error" variant="outlined" size="small" @click="openRejectDialog(product)">
                  <v-icon start>mdi-close</v-icon>
                  Reddet
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-card v-else flat class="text-center py-12">
          <v-icon size="80" color="success">mdi-check-all</v-icon>
          <div class="text-h6 mt-4">Tüm ürünler incelendi!</div>
          <p class="text-body-2 text-medium-emphasis">Onay bekleyen ürün bulunmuyor.</p>
        </v-card>
      </v-card-text>
    </v-card>

    <!-- Onay dialog -->
    <v-dialog v-model="approveDialog" max-width="480">
      <v-card>
        <v-card-title>Ürünü Onayla</v-card-title>
        <v-card-text>
          <p class="text-body-2 mb-4">
            <strong>{{ selectedProduct?.name }}</strong> mağazada yayınlanacak. Ana sayfa bölümlerini seçin:
          </p>
          <v-switch v-model="approveFlags.is_featured" label="Öne Çıkan Ürünler" color="primary" hide-details />
          <v-switch v-model="approveFlags.is_bestseller" label="Çok Satanlar" color="primary" hide-details class="mt-2" />
          <v-switch v-model="approveFlags.is_new" label="Yeni Gelenler" color="primary" hide-details class="mt-2" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="approveDialog = false">İptal</v-btn>
          <v-btn color="success" variant="flat" @click="confirmApprove">Onayla ve Yayınla</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Red dialog -->
    <v-dialog v-model="rejectDialog" max-width="500">
      <v-card>
        <v-card-title>Ürünü Reddet</v-card-title>
        <v-card-text>
          <v-alert type="warning" variant="tonal" class="mb-4">
            Satıcı bu red nedenini ürün listesinde görebilecek.
          </v-alert>
          <v-textarea
            v-model="rejectionReason"
            label="Red Sebebi"
            rows="3"
            :rules="[(v) => !!v?.trim() || 'Red sebebi gerekli']"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="rejectDialog = false">İptal</v-btn>
          <v-btn color="error" :disabled="!rejectionReason.trim()" @click="confirmReject">Reddet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Detay dialog -->
    <v-dialog v-model="detailDialog" max-width="640">
      <v-card v-if="selectedProduct">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Ürün Detayı</span>
          <v-btn icon="mdi-close" variant="text" @click="detailDialog = false" />
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="5">
              <v-img :src="productImage(selectedProduct)" height="220" cover rounded="lg" />
            </v-col>
            <v-col cols="12" sm="7">
              <div class="text-h6 font-weight-bold mb-2">{{ selectedProduct.name }}</div>
              <div class="text-body-2 text-medium-emphasis mb-3">{{ selectedProduct.description }}</div>
              <v-chip class="mr-2" size="small">{{ selectedProduct.brand }}</v-chip>
              <v-chip size="small" color="primary">{{ formatPrice(selectedProduct.price) }} TL</v-chip>
              <v-divider class="my-4" />
              <div class="text-body-2"><strong>Satıcı:</strong> {{ sellerName(selectedProduct) }}</div>
              <div class="text-body-2"><strong>E-posta:</strong> {{ sellerEmail(selectedProduct) }}</div>
              <div class="text-body-2"><strong>Stok:</strong> {{ selectedProduct.stock }}</div>
              <div class="text-body-2"><strong>SKU:</strong> {{ selectedProduct.sku || '—' }}</div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" variant="outlined" @click="openRejectDialog(selectedProduct!)">Reddet</v-btn>
          <v-btn color="success" variant="flat" @click="openApproveDialog(selectedProduct!)">Onayla</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3500" location="bottom right">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>
