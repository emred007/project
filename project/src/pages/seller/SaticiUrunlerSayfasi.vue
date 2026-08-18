<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/plugins/supabase'
import { getLocalSellerProducts } from '@/data/localProducts'
import type { Product } from '@/types'

const authStore = useAuthStore()

const products = ref<Product[]>([])
const loading = ref(false)
const search = ref('')
const statusFilter = ref('')
const statusDialog = ref(false)
const selectedProduct = ref<Product | null>(null)
const rejectionReason = ref('')

const filteredProducts = computed(() => {
  let result = products.value
  if (search.value) {
    result = result.filter((p) =>
      p.name.toLowerCase().includes(search.value.toLowerCase())
    )
  }
  if (statusFilter.value) {
    result = result.filter((p) => p.status === statusFilter.value)
  }
  return result
})

onMounted(fetchProducts)

async function fetchProducts() {
  if (!authStore.user) return
  loading.value = true
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', authStore.user.id)
    .order('created_at', { ascending: false })

  const dbProducts = (data || []) as Product[]
  const localProducts = getLocalSellerProducts(authStore.user.id)
  const merged = new Map<string, Product>()
  for (const p of localProducts) merged.set(p.id, p)
  for (const p of dbProducts) merged.set(p.id, p)
  products.value = Array.from(merged.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  loading.value = false
}

async function deleteProduct(id: string) {
  if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
  await supabase.from('products').delete().eq('id', id)
  products.value = products.value.filter((p) => p.id !== id)
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    approved: 'success',
    pending: 'warning',
    rejected: 'error',
  }
  return colors[status] || 'grey'
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    approved: 'Onaylı',
    pending: 'Bekliyor',
    rejected: 'Reddedildi',
  }
  return texts[status] || status
}

function formatPrice(price: number): string {
  return price.toLocaleString('tr-TR')
}
</script>

<template>
  <v-card flat>
    <v-card-title class="d-flex flex-wrap justify-space-between align-center ga-4">
      <span class="text-h5">Ürünlerim</span>
      <v-btn color="primary" prepend-icon="mdi-plus" to="/satici/urun-ekle">
        Ürün Ekle
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Ürün ara..."
            density="compact"
            hide-details
            clearable
          />
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
            <th>Fiyat</th>
            <th>Stok</th>
            <th>Durum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td>
              <div class="d-flex align-center ga-3">
                <v-img
                  :src="product.images?.[0] || 'https://via.placeholder.com/60'"
                  width="60"
                  height="60"
                  cover
                  class="rounded"
                />
                <div>
                  <div class="font-weight-medium">{{ product.name }}</div>
                  <div class="text-caption text-grey">{{ product.brand }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="font-weight-bold text-primary">{{ formatPrice(product.discount_price || product.price) }} TL</div>
              <div v-if="product.discount_price" class="text-caption text-grey text-decoration-line-through">
                {{ formatPrice(product.price) }} TL
              </div>
            </td>
            <td>
              <v-chip :color="product.stock > 0 ? 'success' : 'error'" size="small">
                {{ product.stock }} adet
              </v-chip>
            </td>
            <td>
              <v-chip :color="getStatusColor(product.status)" size="small">
                {{ getStatusText(product.status) }}
              </v-chip>
              <div v-if="product.status === 'rejected'" class="text-caption text-error mt-1">
                {{ product.rejection_reason }}
              </div>
            </td>
            <td>
              <v-btn icon variant="text" size="small" :to="`/satici/urun-duzenle/${product.id}`">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon variant="text" size="small" color="error" @click="deleteProduct(product.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <v-card v-else-if="!loading" flat class="text-center py-8">
        <v-icon size="80" color="grey-lighten-1">mdi-package-variant</v-icon>
        <h2 class="text-h6 mt-4">Ürün bulunamadı</h2>
      </v-card>

      <v-skeleton-loader v-else type="table-row@5" />
    </v-card-text>
  </v-card>
</template>
