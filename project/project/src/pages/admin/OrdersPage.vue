<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()
const search = ref('')
const statusFilter = ref('')

onMounted(() => { adminStore.fetchAllOrders() })

const filteredOrders = computed(() => {
  let orders = adminStore.allOrders
  if (search.value) orders = orders.filter((o) => o.order_number.toLowerCase().includes(search.value.toLowerCase()))
  if (statusFilter.value) orders = orders.filter((o) => o.status === statusFilter.value)
  return orders
})

function getStatusColor(status: string): string { const c: Record<string, string> = { pending: 'warning', processing: 'info', shipped: 'secondary', delivered: 'success', cancelled: 'error' }; return c[status] || 'grey' }
function getStatusText(status: string): string { const t: Record<string, string> = { pending: 'Bekliyor', processing: 'İşleniyor', shipped: 'Kargoda', delivered: 'Teslim', cancelled: 'İptal' }; return t[status] || status }
function formatPrice(price: number): string { return price.toLocaleString('tr-TR') }
function formatDate(date: string): string { return new Date(date).toLocaleDateString('tr-TR') }

async function updateStatus(orderId: string, status: string) { await adminStore.updateOrderStatus(orderId, status) }
</script>

<template>
  <v-card flat>
    <v-card-title class="text-h5">Sipariş Yönetimi</v-card-title>
    <v-card-text>
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="4"><v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Sipariş no ara..." density="compact" hide-details /></v-col>
        <v-col cols="12" sm="6" md="4"><v-select v-model="statusFilter" :items="[{ title: 'Tümü', value: '' }, { title: 'Bekleyen', value: 'pending' }, { title: 'İşleniyor', value: 'processing' }, { title: 'Kargoda', value: 'shipped' }, { title: 'Teslim', value: 'delivered' }]" label="Durum" density="compact" hide-details /></v-col>
      </v-row>
      <v-table v-if="filteredOrders.length" hover>
        <thead><tr><th>Sipariş No</th><th>Tarih</th><th>Ürün</th><th>Toplam</th><th>Durum</th><th>İşlemler</th></tr></thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td class="font-weight-bold">{{ order.order_number }}</td>
            <td>{{ formatDate(order.created_at) }}</td>
            <td>{{ order.items?.length || 0 }} ürün</td>
            <td class="font-weight-bold text-primary">{{ formatPrice(order.total) }} TL</td>
            <td><v-chip :color="getStatusColor(order.status)" size="small">{{ getStatusText(order.status) }}</v-chip></td>
            <td>
              <v-menu>
                <template #activator="{ props }"><v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props" /></template>
                <v-list density="compact">
                  <v-list-item @click="updateStatus(order.id, 'processing')">İşlemeye Al</v-list-item>
                  <v-list-item @click="updateStatus(order.id, 'shipped')">Kargoya Ver</v-list-item>
                  <v-list-item @click="updateStatus(order.id, 'delivered')">Teslim Et</v-list-item>
                </v-list>
              </v-menu>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-card v-else flat class="text-center py-8"><v-icon size="80" color="grey-lighten-1">mdi-truck-delivery</v-icon><h2 class="text-h6 mt-4">Sipariş bulunamadı</h2></v-card>
    </v-card-text>
  </v-card>
</template>
