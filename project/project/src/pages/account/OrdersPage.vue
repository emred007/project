<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useOrderStore } from '@/stores/order'

const orderStore = useOrderStore()

onMounted(() => {
  orderStore.fetchOrders()
})

const orders = computed(() => orderStore.orders)
const loading = computed(() => orderStore.loading)

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatPrice(price: number): string {
  return price.toLocaleString('tr-TR')
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    shipped: 'secondary',
    delivered: 'success',
    cancelled: 'error',
  }
  return colors[status] || 'grey'
}

function getStatusText(status: string): string {
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
  <v-card flat>
    <v-card-title class="text-h5 mb-4">Siparişlerim</v-card-title>
    <v-card-text>
      <v-list v-if="orders.length">
        <v-list-item
          v-for="order in orders"
          :key="order.id"
          :to="`/hesabim/siparislerim/${order.id}`"
          class="mb-4 border rounded-lg"
        >
          <template #prepend>
            <v-avatar color="grey-lighten-2" size="64">
              <v-icon size="32" color="grey">mdi-package-variant</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-bold">
            {{ order.order_number }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ formatDate(order.created_at) }} - {{ order.items?.length || 0 }} ürün
          </v-list-item-subtitle>

          <template #append>
            <div class="text-right">
              <v-chip :color="getStatusColor(order.status)" size="small" class="mb-1">
                {{ getStatusText(order.status) }}
              </v-chip>
              <div class="text-h6 font-weight-bold">{{ formatPrice(order.total) }} TL</div>
            </div>
          </template>
        </v-list-item>
      </v-list>

      <v-skeleton-loader v-else-if="loading" type="list-item@3" />

      <v-card v-else flat class="text-center py-8">
        <v-icon size="80" color="grey-lighten-1">mdi-package-variant</v-icon>
        <h2 class="text-h6 mt-4">Henüz sipariş yok</h2>
        <p class="text-body-1 text-grey mt-2">Alışverişe başlayın</p>
        <v-btn color="primary" to="/" class="mt-4">Alışverişe Başla</v-btn>
      </v-card>
    </v-card-text>
  </v-card>
</template>
