<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderStore } from '@/stores/order'

const route = useRoute()
const orderStore = useOrderStore()

const orderId = route.params.orderId as string

onMounted(async () => {
  await orderStore.fetchOrderById(orderId)
})

const order = computed(() => orderStore.currentOrder)
const loading = computed(() => orderStore.loading)

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

function downloadInvoice() {
  if (!order.value) return
  const { content, filename } = orderStore.generateInvoice(order.value)
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <v-card flat>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>Sipariş Detayı</span>
      <v-btn
        v-if="order"
        variant="outlined"
        color="primary"
        prepend-icon="mdi-download"
        @click="downloadInvoice"
      >
        Fatura İndir
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-skeleton-loader v-if="loading" type="article@3" />

      <template v-else-if="order">
        <v-row class="mb-6">
          <v-col cols="12" sm="6" md="4">
            <div class="text-caption text-grey">Sipariş Numarası</div>
            <div class="text-h6 font-weight-bold">{{ order.order_number }}</div>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <div class="text-caption text-grey">Tarih</div>
            <div class="text-body-1">{{ formatDate(order.created_at) }}</div>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <div class="text-caption text-grey">Durum</div>
            <v-chip :color="getStatusColor(order.status)" size="small">
              {{ getStatusText(order.status) }}
            </v-chip>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <v-row>
          <v-col cols="12" md="6">
            <v-card color="grey-lighten-4" flat class="pa-4">
              <div class="text-subtitle-1 font-weight-bold mb-3">
                <v-icon start>mdi-truck</v-icon>
                Teslimat Adresi
              </div>
              <div class="text-body-2">
                <div>{{ order.shipping_address?.full_name }}</div>
                <div>{{ order.shipping_address?.phone }}</div>
                <div>{{ order.shipping_address?.address }}</div>
                <div>
                  {{ order.shipping_address?.neighborhood }},
                  {{ order.shipping_address?.district }}/{{ order.shipping_address?.city }}
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card color="grey-lighten-4" flat class="pa-4">
              <div class="text-subtitle-1 font-weight-bold mb-3">
                <v-icon start>mdi-receipt</v-icon>
                Fatura Adresi
              </div>
              <div class="text-body-2">
                <div>{{ order.billing_address?.full_name }}</div>
                <div>{{ order.billing_address?.phone }}</div>
                <div>{{ order.billing_address?.address }}</div>
                <div>
                  {{ order.billing_address?.neighborhood }},
                  {{ order.billing_address?.district }}/{{ order.billing_address?.city }}
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <div class="text-subtitle-1 font-weight-bold mb-3">
          <v-icon start>mdi-package-variant</v-icon>
          Ürünler
        </div>

        <v-list density="compact">
          <v-list-item v-for="item in order.items" :key="item.id" class="px-0">
            <template #prepend>
              <v-img :src="item.product_image" width="64" height="64" cover class="rounded mr-3" />
            </template>
            <v-list-item-title>{{ item.product_name }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ item.quantity }} adet x {{ formatPrice(item.unit_price) }} TL
            </v-list-item-subtitle>
            <template #append>
              <span class="font-weight-bold">{{ formatPrice(item.total) }} TL</span>
            </template>
          </v-list-item>
        </v-list>

        <v-divider class="my-4" />

        <v-row justify="end">
          <v-col cols="12" sm="6">
            <div class="d-flex justify-space-between mb-2">
              <span>Ara Toplam</span>
              <span>{{ formatPrice(order.subtotal) }} TL</span>
            </div>
            <div v-if="order.discount > 0" class="d-flex justify-space-between mb-2 text-success">
              <span>İndirim</span>
              <span>-{{ formatPrice(order.discount) }} TL</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Kargo</span>
              <span>{{ order.shipping_cost === 0 ? 'Ücretsiz' : `${formatPrice(order.shipping_cost)} TL` }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>KDV</span>
              <span>{{ formatPrice(order.tax) }} TL</span>
            </div>
            <v-divider class="my-2" />
            <div class="d-flex justify-space-between text-h6 font-weight-bold">
              <span>Toplam</span>
              <span class="text-primary">{{ formatPrice(order.total) }} TL</span>
            </div>
          </v-col>
        </v-row>
      </template>
    </v-card-text>
  </v-card>
</template>
