<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/plugins/supabase'
import type { Order } from '@/types'
import { filterOrdersForSeller, getSellerOrderTotal } from '@/utils/sellerStats'

const authStore = useAuthStore()
const orders = ref<Order[]>([])
const loading = ref(false)
const statusFilter = ref('')

onMounted(fetchOrders)

async function fetchOrders() {
  if (!authStore.user) return
  loading.value = true
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (data) {
    orders.value = filterOrdersForSeller(data as Order[], authStore.user.id)
  }
  loading.value = false
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = { pending: 'warning', processing: 'info', shipped: 'secondary', delivered: 'success', cancelled: 'error' }
  return colors[status] || 'grey'
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = { pending: 'Bekliyor', processing: 'İşleniyor', shipped: 'Kargoda', delivered: 'Teslim Edildi', cancelled: 'İptal' }
  return texts[status] || status
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatPrice(price: number): string {
  return price.toLocaleString('tr-TR')
}
</script>

<template>
  <v-card flat>
    <v-card-title class="text-h5">Siparişlerim</v-card-title>
    <v-card-text>
      <v-select v-model="statusFilter" :items="[{ title: 'Tümü', value: '' }, { title: 'Bekleyen', value: 'pending' }, { title: 'Kargoda', value: 'shipped' }, { title: 'Teslim Edildi', value: 'delivered' }]" label="Durum" density="compact" style="max-width: 200px" class="mb-4" />
      <v-table v-if="orders.length" hover>
        <thead>
          <tr>
            <th>Sipariş No</th>
            <th>Ürünler</th>
            <th>Tarih</th>
            <th>Toplam</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders.filter((o) => !statusFilter || o.status === statusFilter)" :key="order.id">
            <td class="font-weight-bold">{{ order.order_number }}</td>
            <td>{{ order.items?.length }} ürün</td>
            <td>{{ formatDate(order.created_at) }}</td>
            <td class="font-weight-bold">
              {{ formatPrice(getSellerOrderTotal(order, authStore.user!.id)) }} TL
            </td>
            <td><v-chip :color="getStatusColor(order.status)" size="small">{{ getStatusText(order.status) }}</v-chip></td>
          </tr>
        </tbody>
      </v-table>
      <v-card v-else flat class="text-center py-8">
        <v-icon size="80" color="grey-lighten-1">mdi-truck-delivery</v-icon>
        <h2 class="text-h6 mt-4">Henüz sipariş yok</h2>
      </v-card>
    </v-card-text>
  </v-card>
</template>
