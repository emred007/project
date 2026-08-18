<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { supabase } from '@/plugins/supabase'
import { getLocalApprovedProducts, getLocalPendingProducts } from '@/data/localProducts'
import type { Product } from '@/types'

const adminStore = useAdminStore()
const products = ref<(Product & { categories?: { name?: string }; seller?: { full_name?: string } })[]>([])
const loading = ref(false)
const search = ref('')
const statusFilter = ref('')
const rejectDialog = ref(false)
const approveDialog = ref(false)
const selectedProduct = ref<Product | null>(null)
const rejectionReason = ref('')
const approveFlags = ref({ is_featured: false, is_bestseller: false, is_new: true })
const snackbar = ref(false)
const snackbarText = ref('')

onMounted(fetchProducts)

async function fetchProducts() {
  loading.value = true
  const { data } = await supabase
    .from('products')
    .select('*, categories(name), seller:users!products_seller_id_fkey(full_name)')
    .order('created_at', { ascending: false })

  const dbProducts = (data || []) as typeof products.value
  const localAll = [...getLocalPendingProducts(), ...getLocalApprovedProducts()]
  products.value = [...localAll, ...dbProducts]
  loading.value = false
}

const filteredProducts = computed(() => {
  let result = products.value
  if (search.value) {
    result = result.filter((p) => p.name.toLowerCase().includes(search.value.toLowerCase()))
  }
  if (statusFilter.value) {
    result = result.filter((p) => p.status === statusFilter.value)
  }
  return result
})

function toast(text: string) {
  snackbarText.value = text
  snackbar.value = true
}

function getStatusColor(status: string): string {
  const c: Record<string, string> = { approved: 'success', pending: 'warning', rejected: 'error' }
  return c[status] || 'grey'
}

function getStatusText(status: string): string {
  const t: Record<string, string> = { approved: 'Onaylı', pending: 'Bekliyor', rejected: 'Reddedildi' }
  return t[status] || status
}

function formatPrice(price: number): string {
  return price.toLocaleString('tr-TR')
}

function openApprove(product: Product) {
  selectedProduct.value = product
  approveFlags.value = { is_featured: product.is_featured, is_bestseller: product.is_bestseller, is_new: product.is_new }
  approveDialog.value = true
}

function openReject(product: Product) {
  selectedProduct.value = product
  rejectionReason.value = ''
  rejectDialog.value = true
}

async function confirmApprove() {
  if (!selectedProduct.value) return
  const ok = await adminStore.approveProduct(selectedProduct.value.id, approveFlags.value)
  if (ok) {
    toast('Ürün onaylandı')
    approveDialog.value = false
    await fetchProducts()
  }
}

async function confirmReject() {
  if (!selectedProduct.value || !rejectionReason.value.trim()) return
  const ok = await adminStore.rejectProduct(selectedProduct.value.id, rejectionReason.value.trim())
  if (ok) {
    toast('Ürün reddedildi')
    rejectDialog.value = false
    await fetchProducts()
  }
}

async function toggleFlag(product: Product, flag: 'is_featured' | 'is_bestseller' | 'is_new') {
  const updated = { [flag]: !product[flag] }
  await adminStore.updateProductFlags(product.id, updated)
  product[flag] = !product[flag]
  toast('Ürün güncellendi')
}
</script>

<template>
  <div>
    <v-card flat>
      <v-card-title class="d-flex flex-wrap justify-space-between align-center ga-4">
        <span class="text-h5">Ürün Yönetimi</span>
        <v-btn color="primary" variant="tonal" to="/admin/urun-onay" prepend-icon="mdi-check-decagram">
          Onay Bekleyenler
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="4">
            <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Ürün ara..." density="compact" hide-details clearable />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="statusFilter"
              :items="[
                { title: 'Tümü', value: '' },
                { title: 'Onaylı', value: 'approved' },
                { title: 'Bekleyen', value: 'pending' },
                { title: 'Reddedildi', value: 'rejected' },
              ]"
              label="Durum"
              density="compact"
              hide-details
            />
          </v-col>
        </v-row>

        <v-table v-if="filteredProducts.length" hover>
          <thead>
            <tr>
              <th>Ürün</th>
              <th>Satıcı</th>
              <th>Fiyat</th>
              <th>Stok</th>
              <th>Durum</th>
              <th>Vitrin</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td>
                <div class="d-flex align-center ga-2">
                  <v-avatar rounded="lg" size="48">
                    <v-img :src="product.images?.[0] || 'https://via.placeholder.com/50'" cover />
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ product.name }}</div>
                    <div class="text-caption text-medium-emphasis">{{ product.categories?.name || product.brand }}</div>
                  </div>
                </div>
              </td>
              <td>{{ product.seller?.full_name || 'Yerel' }}</td>
              <td class="font-weight-bold">{{ formatPrice(product.discount_price || product.price) }} TL</td>
              <td>
                <v-chip :color="product.stock > 0 ? 'success' : 'error'" size="small">{{ product.stock }}</v-chip>
              </td>
              <td>
                <v-chip :color="getStatusColor(product.status)" size="small">{{ getStatusText(product.status) }}</v-chip>
              </td>
              <td>
                <div v-if="product.status === 'approved'" class="d-flex ga-1 flex-wrap">
                  <v-chip :color="product.is_featured ? 'primary' : undefined" size="x-small" @click="toggleFlag(product, 'is_featured')">
                    Öne Çıkan
                  </v-chip>
                  <v-chip :color="product.is_bestseller ? 'accent' : undefined" size="x-small" @click="toggleFlag(product, 'is_bestseller')">
                    Çok Satan
                  </v-chip>
                  <v-chip :color="product.is_new ? 'success' : undefined" size="x-small" @click="toggleFlag(product, 'is_new')">
                    Yeni
                  </v-chip>
                </div>
                <span v-else class="text-caption text-medium-emphasis">—</span>
              </td>
              <td>
                <div class="d-flex ga-1">
                  <v-btn v-if="product.status === 'pending'" color="success" size="small" variant="text" @click="openApprove(product)">
                    Onayla
                  </v-btn>
                  <v-btn v-if="product.status === 'pending'" color="error" size="small" variant="text" @click="openReject(product)">
                    Reddet
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-card v-else flat class="text-center py-8">
          <v-icon size="80" color="grey-lighten-1">mdi-package-variant</v-icon>
          <div class="text-h6 mt-4">Ürün bulunamadı</div>
        </v-card>
      </v-card-text>
    </v-card>

    <v-dialog v-model="approveDialog" max-width="440">
      <v-card>
        <v-card-title>Ürünü Onayla</v-card-title>
        <v-card-text>
          <v-switch v-model="approveFlags.is_featured" label="Öne Çıkan" color="primary" hide-details />
          <v-switch v-model="approveFlags.is_bestseller" label="Çok Satan" color="primary" hide-details class="mt-2" />
          <v-switch v-model="approveFlags.is_new" label="Yeni Gelen" color="primary" hide-details class="mt-2" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="approveDialog = false">İptal</v-btn>
          <v-btn color="success" @click="confirmApprove">Onayla</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="rejectDialog" max-width="440">
      <v-card>
        <v-card-title>Ürünü Reddet</v-card-title>
        <v-card-text>
          <v-textarea v-model="rejectionReason" label="Red Sebebi" rows="3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="rejectDialog = false">İptal</v-btn>
          <v-btn color="error" :disabled="!rejectionReason.trim()" @click="confirmReject">Reddet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" color="success" location="bottom right">{{ snackbarText }}</v-snackbar>
  </div>
</template>
