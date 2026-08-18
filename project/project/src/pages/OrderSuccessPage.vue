<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const orderId = route.params.orderId as string
const order = computed(() => orderStore.currentOrder)
const loading = computed(() => orderStore.loading)

onMounted(async () => {
  await orderStore.fetchOrderById(orderId)
})

function formatPrice(price: number): string {
  return price.toLocaleString('tr-TR')
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
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="text-center pa-8">
          <v-avatar color="success" size="100" class="mb-6">
            <v-icon color="white" size="60">mdi-check</v-icon>
          </v-avatar>

          <v-skeleton-loader v-if="loading" type="heading, paragraph@3" class="d-inline-block" />

          <template v-else-if="order">
            <h1 class="text-h4 font-weight-bold mb-2">Sipariş Başarılı!</h1>
            <p class="text-body-1 text-grey mb-4">
              Siparişiniz başarıyla oluşturuldu.
            </p>

            <v-card color="grey-lighten-4" flat class="pa-4 mb-6 text-left">
              <div class="d-flex justify-space-between align-center mb-4">
                <span class="text-body-1">Sipariş Numarası</span>
                <v-chip color="primary" size="large">
                  {{ order.order_number }}
                </v-chip>
              </div>

              <v-divider class="mb-4" />

              <div class="text-subtitle-1 font-weight-bold mb-2">Sipariş Detayları</div>
              <v-list density="compact" bg-color="transparent">
                <v-list-item v-for="item in order.items" :key="item.id" class="px-0">
                  <template #prepend>
                    <v-img
                      :src="item.product_image"
                      width="64"
                      height="64"
                      cover
                      class="rounded mr-4"
                    />
                  </template>
                  <v-list-item-title>{{ item.product_name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.quantity }} adet x {{ formatPrice(item.unit_price) }} TL
                  </v-list-item-subtitle>
                  <template #append>
                    <span class="text-body-1 font-weight-bold">{{ formatPrice(item.total) }} TL</span>
                  </template>
                </v-list-item>
              </v-list>

              <v-divider class="my-4" />

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

              <v-divider class="my-4" />

              <div class="d-flex justify-space-between">
                <span class="text-h6 font-weight-bold">Toplam</span>
                <span class="text-h6 font-weight-bold text-primary">{{ formatPrice(order.total) }} TL</span>
              </div>
            </v-card>

            <v-btn
              color="primary"
              size="large"
              class="mb-4"
              block
              @click="downloadInvoice"
            >
              <v-icon start>mdi-download</v-icon>
              Fatura İndir
            </v-btn>

            <v-btn
              variant="outlined"
              size="large"
              block
              to="/hesabim/siparislerim"
            >
              Siparişlerimi Görüntüle
            </v-btn>

            <v-btn
              variant="text"
              size="large"
              block
              class="mt-2"
              to="/"
            >
              Alışverişe Devam Et
            </v-btn>
          </template>

          <v-alert v-else type="error" class="mt-4">
            Sipariş bilgileri yüklenemedi
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
