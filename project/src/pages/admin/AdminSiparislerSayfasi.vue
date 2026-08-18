<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'
import type { Order } from '@/types'

const adminStore = useAdminStore()
const toast = useToastStore()

const search = ref('')
const statusFilter = ref('')
const detailDialog = ref(false)
const selectedOrder = ref<Order | null>(null)

onMounted(() => {
  adminStore.fetchAllOrders()
})

const filteredOrders = computed(() => {
  let orders = adminStore.allOrders
  if (search.value) {
    const q = search.value.toLowerCase()
    orders = orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.user?.full_name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q)
    )
  }
  if (statusFilter.value) {
    orders = orders.filter((o) => o.status === statusFilter.value)
  }
  return orders
})

function getStatusColor(status: string): string {
  const c: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    shipped: 'secondary',
    delivered: 'success',
    cancelled: 'error',
  }
  return c[status] || 'grey'
}

function getStatusText(status: string): string {
  const t: Record<string, string> = {
    pending: 'Bekliyor',
    processing: 'İşleniyor',
    shipped: 'Kargoda',
    delivered: 'Teslim',
    cancelled: 'İptal',
  }
  return t[status] || status
}

function formatPrice(price: number): string {
  return price.toLocaleString('tr-TR')
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function orderItems(order: Order) {
  return Array.isArray(order.items) ? order.items : []
}

function orderProductSummary(order: Order): string {
  const items = orderItems(order)
  if (!items.length) return '—'
  const names = items.map((item) => item.product_name).filter(Boolean)
  if (names.length <= 2) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} +${names.length - 2} ürün`
}

function itemLineTotal(item: { unit_price: number; quantity: number; total?: number }) {
  return item.total ?? item.unit_price * item.quantity
}

function openDetail(order: Order) {
  selectedOrder.value = order
  detailDialog.value = true
}

async function updateStatus(orderId: string, status: string) {
  const ok = await adminStore.updateOrderStatus(orderId, status)
  if (ok) {
    toast.success('Sipariş durumu güncellendi')
    await adminStore.fetchAllOrders()
    if (selectedOrder.value?.id === orderId) {
      selectedOrder.value = adminStore.allOrders.find((o) => o.id === orderId) || null
    }
  } else {
    toast.error(adminStore.error || 'Durum güncellenemedi')
  }
}
</script>

<template>
  <v-card flat>
    <v-card-title class="text-h5">Sipariş Yönetimi</v-card-title>
    <v-card-text>
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Sipariş no veya müşteri ara..."
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="statusFilter"
            :items="[
              { title: 'Tümü', value: '' },
              { title: 'Bekleyen', value: 'pending' },
              { title: 'İşleniyor', value: 'processing' },
              { title: 'Kargoda', value: 'shipped' },
              { title: 'Teslim', value: 'delivered' },
              { title: 'İptal', value: 'cancelled' },
            ]"
            label="Durum"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>

      <v-table v-if="filteredOrders.length" hover>
        <thead>
          <tr>
            <th>Sipariş No</th>
            <th>Müşteri</th>
            <th>Tarih</th>
            <th>Ürün</th>
            <th>Toplam</th>
            <th>Durum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td class="font-weight-bold">{{ order.order_number }}</td>
            <td>
              <div>{{ order.user?.full_name || '—' }}</div>
              <div class="text-caption text-grey">{{ order.user?.email }}</div>
            </td>
            <td>{{ formatDate(order.created_at) }}</td>
            <td>
              <div class="font-weight-medium">{{ orderProductSummary(order) }}</div>
              <div class="text-caption text-grey">{{ orderItems(order).length }} ürün</div>
            </td>
            <td class="font-weight-bold text-primary">{{ formatPrice(order.total) }} TL</td>
            <td>
              <v-chip :color="getStatusColor(order.status)" size="small">
                {{ getStatusText(order.status) }}
              </v-chip>
            </td>
            <td>
              <v-btn icon="mdi-eye" variant="text" size="small" @click="openDetail(order)" />
              <v-menu>
                <template #activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props" />
                </template>
                <v-list density="compact">
                  <v-list-item @click="updateStatus(order.id, 'processing')">İşlemeye Al</v-list-item>
                  <v-list-item @click="updateStatus(order.id, 'shipped')">Kargoya Ver</v-list-item>
                  <v-list-item @click="updateStatus(order.id, 'delivered')">Teslim Et</v-list-item>
                  <v-list-item @click="updateStatus(order.id, 'cancelled')">İptal Et</v-list-item>
                </v-list>
              </v-menu>
            </td>
          </tr>
        </tbody>
      </v-table>

      <v-card v-else flat class="text-center py-8">
        <v-icon size="80" color="grey-lighten-1">mdi-truck-delivery</v-icon>
        <h2 class="text-h6 mt-4">Sipariş bulunamadı</h2>
      </v-card>
    </v-card-text>

    <v-dialog v-model="detailDialog" max-width="640">
      <v-card v-if="selectedOrder">
        <v-card-title>Sipariş {{ selectedOrder.order_number }}</v-card-title>
        <v-card-text>
          <v-list density="compact">
            <v-list-item>
              <v-list-item-title>Müşteri</v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedOrder.user?.full_name || '—' }} ({{ selectedOrder.user?.email || '—' }})
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Tarih</v-list-item-title>
              <v-list-item-subtitle>{{ formatDate(selectedOrder.created_at) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Ödeme</v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedOrder.payment_method }} · {{ selectedOrder.payment_status === 'paid' ? 'Ödendi' : 'Bekliyor' }}
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="selectedOrder.coupon_code">
              <v-list-item-title>Kupon</v-list-item-title>
              <v-list-item-subtitle>{{ selectedOrder.coupon_code }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <div class="text-subtitle-2 font-weight-bold mt-4 mb-2">Sipariş Edilen Ürünler</div>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Adet</th>
                <th>Birim Fiyat</th>
                <th>Toplam</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in orderItems(selectedOrder)" :key="item.id || item.product_id || index">
                <td>
                  <div class="d-flex align-center ga-3">
                    <v-avatar v-if="item.product_image" size="40" rounded>
                      <v-img :src="item.product_image" :alt="item.product_name" cover />
                    </v-avatar>
                    <span>{{ item.product_name || 'Ürün' }}</span>
                  </div>
                </td>
                <td>{{ item.quantity }}</td>
                <td>{{ formatPrice(item.unit_price) }} TL</td>
                <td>{{ formatPrice(itemLineTotal(item)) }} TL</td>
              </tr>
            </tbody>
          </v-table>

          <div class="d-flex justify-space-between mt-4">
            <span>Ara Toplam</span>
            <span>{{ formatPrice(selectedOrder.subtotal) }} TL</span>
          </div>
          <div v-if="selectedOrder.discount" class="d-flex justify-space-between text-success">
            <span>İndirim</span>
            <span>-{{ formatPrice(selectedOrder.discount) }} TL</span>
          </div>
          <div class="d-flex justify-space-between">
            <span>Kargo</span>
            <span>{{ formatPrice(selectedOrder.shipping_cost) }} TL</span>
          </div>
          <div class="d-flex justify-space-between font-weight-bold text-h6 mt-2">
            <span>Genel Toplam</span>
            <span class="text-primary">{{ formatPrice(selectedOrder.total) }} TL</span>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="detailDialog = false">Kapat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
