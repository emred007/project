<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/plugins/supabase'
import type { Order, OrderStatus } from '@/types'
import {
  computeSellerStats,
  filterOrdersForSeller,
  getSellerOrderTotal,
} from '@/utils/sellerStats'

const authStore = useAuthStore()

const stats = ref({
  totalProducts: 0,
  pendingProducts: 0,
  totalSales: 0,
  totalRevenue: 0,
})

const recentOrders = ref<Order[]>([])
const topProducts = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!authStore.user) return

  const sellerId = authStore.user.id

  const [productsCount, pendingCount, ordersResult] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('seller_id', sellerId),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('seller_id', sellerId).eq('status', 'pending'),
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
  ])

  const allOrders = (ordersResult.data || []) as Order[]
  const sellerOrders = filterOrdersForSeller(allOrders, sellerId)
  const sellerStats = computeSellerStats(allOrders, sellerId)

  stats.value = {
    totalProducts: productsCount.count || 0,
    pendingProducts: pendingCount.count || 0,
    totalSales: sellerStats.totalSales,
    totalRevenue: sellerStats.totalRevenue,
  }

  recentOrders.value = sellerOrders.slice(0, 5)

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })
    .limit(5)
  topProducts.value = products || []

  loading.value = false
})

function formatPrice(price: number): string {
  return price.toLocaleString('tr-TR')
}

function getStatusColor(status: OrderStatus): string {
  const colors: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    shipped: 'secondary',
    delivered: 'success',
    cancelled: 'error',
  }
  return colors[status] || 'grey'
}

function getStatusText(status: OrderStatus): string {
  const texts: Record<string, string> = {
    pending: 'Bekliyor',
    processing: 'İşleniyor',
    shipped: 'Kargoda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal',
  }
  return texts[status] || status
}
</script>

<template>
  <v-row>
    <v-col cols="12">
      <h1 class="text-h4 font-weight-bold mb-6">Hoş geldiniz, {{ authStore.userName }}!</h1>
    </v-col>

    <v-col cols="12">
      <v-row>
        <v-col cols="6" sm="3">
          <v-card flat class="pa-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="primary-light" size="48">
                <v-icon color="primary">mdi-package-variant</v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-grey">Toplam Ürün</div>
                <div class="text-h4 font-weight-bold">{{ stats.totalProducts }}</div>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="6" sm="3">
          <v-card flat class="pa-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="success-light" size="48">
                <v-icon color="success">mdi-check-circle</v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-grey">Onaylanan Ürün</div>
                <div class="text-h4 font-weight-bold">{{ stats.totalProducts - stats.pendingProducts }}</div>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="6" sm="3">
          <v-card flat class="pa-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="accent-light" size="48">
                <v-icon color="accent">mdi-cash</v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-grey">Toplam Kazanç</div>
                <div class="text-h4 font-weight-bold">{{ formatPrice(stats.totalRevenue) }} TL</div>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="6" sm="3">
          <v-card flat class="pa-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="warning-light" size="48">
                <v-icon color="warning">mdi-truck-delivery</v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-grey">Toplam Satış</div>
                <div class="text-h4 font-weight-bold">{{ stats.totalSales }}</div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-col>

    <v-col cols="12" md="8">
      <v-card flat>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Son Siparişler</span>
          <v-btn variant="text" color="primary" to="/satici/siparisler">
            Tümünü Gör
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-list v-if="recentOrders.length" density="compact">
            <v-list-item v-for="order in recentOrders" :key="order.id" class="px-0">
              <v-list-item-title>{{ order.order_number }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ new Date(order.created_at).toLocaleDateString('tr-TR') }}
                · {{ formatPrice(getSellerOrderTotal(order, authStore.user!.id)) }} TL
              </v-list-item-subtitle>
              <template #append>
                <v-chip size="small" :color="getStatusColor(order.status)">
                  {{ getStatusText(order.status) }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
          <v-card v-else flat class="text-center py-8">
            <v-icon size="60" color="grey-lighten-1">mdi-truck-delivery</v-icon>
            <div class="text-body-1 text-grey mt-2">Henüz sipariş yok</div>
          </v-card>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card flat>
        <v-card-title>Ürün Durumu</v-card-title>
        <v-card-text>
          <div class="d-flex justify-space-between mb-4">
            <span>Onaylanan</span>
            <span class="text-success font-weight-bold">{{ stats.totalProducts - stats.pendingProducts }}</span>
          </div>
          <div class="d-flex justify-space-between mb-4">
            <span>Bekleyen</span>
            <span class="text-warning font-weight-bold">{{ stats.pendingProducts }}</span>
          </div>
          <v-progress-linear
            :model-value="stats.totalProducts > 0 ? ((stats.totalProducts - stats.pendingProducts) / stats.totalProducts) * 100 : 0"
            color="success"
            height="8"
            rounded
          />

          <v-btn
            v-if="stats.pendingProducts > 0"
            color="warning"
            variant="outlined"
            block
            class="mt-4"
            to="/satici/urunler"
          >
            {{ stats.pendingProducts }} ürün onay bekliyor
          </v-btn>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-card flat>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Ürünlerim</span>
          <v-btn color="primary" prepend-icon="mdi-plus" to="/satici/urun-ekle">
            Ürün Ekle
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row v-if="topProducts.length">
            <v-col v-for="product in topProducts" :key="product.id" cols="6" sm="4" md="2">
              <v-card flat hover :to="`/satici/urun-duzenle/${product.id}`">
                <v-img :src="product.images?.[0] || 'https://via.placeholder.com/200'" height="120" cover />
                <div class="text-caption text-truncate pa-2">{{ product.name }}</div>
                <v-chip :color="product.status === 'approved' ? 'success' : 'warning'" size="x-small" class="mx-2 mb-2">
                  {{ product.status === 'approved' ? 'Onaylı' : 'Bekliyor' }}
                </v-chip>
              </v-card>
            </v-col>
          </v-row>
          <v-card v-else flat class="text-center py-8">
            <v-icon size="60" color="grey-lighten-1">mdi-package-variant</v-icon>
            <div class="text-body-1 text-grey mt-2">Henüz ürün eklenmemiş</div>
            <v-btn color="primary" class="mt-4" to="/satici/urun-ekle">İlk Ürününü Ekle</v-btn>
          </v-card>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
