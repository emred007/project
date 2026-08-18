<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/plugins/supabase'
import type { Order } from '@/types'
import { buildSellerTransactions, computeSellerStats } from '@/utils/sellerStats'

const authStore = useAuthStore()
const stats = ref({
  totalRevenue: 0,
  pendingPayment: 0,
  completedPayment: 0,
  thisMonth: 0,
})
const transactions = ref<ReturnType<typeof buildSellerTransactions>>([])
const loading = ref(true)

onMounted(fetchData)

async function fetchData() {
  if (!authStore.user) return

  loading.value = true
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  const orders = (data || []) as Order[]
  const sellerStats = computeSellerStats(orders, authStore.user.id)

  stats.value = {
    totalRevenue: sellerStats.totalRevenue,
    pendingPayment: sellerStats.pendingPayment,
    completedPayment: sellerStats.completedPayment,
    thisMonth: sellerStats.thisMonth,
  }
  transactions.value = buildSellerTransactions(orders, authStore.user.id)
  loading.value = false
}

function formatPrice(price: number): string {
  return price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('tr-TR')
}
</script>

<template>
  <v-row>
    <v-col cols="6" sm="3">
      <v-card flat class="pa-4">
        <div class="text-caption text-grey">Toplam Kazanç</div>
        <div class="text-h4 font-weight-bold text-primary">{{ formatPrice(stats.totalRevenue) }} TL</div>
      </v-card>
    </v-col>
    <v-col cols="6" sm="3">
      <v-card flat class="pa-4">
        <div class="text-caption text-grey">Bekleyen Ödeme</div>
        <div class="text-h4 font-weight-bold text-warning">{{ formatPrice(stats.pendingPayment) }} TL</div>
      </v-card>
    </v-col>
    <v-col cols="6" sm="3">
      <v-card flat class="pa-4">
        <div class="text-caption text-grey">Tamamlanan</div>
        <div class="text-h4 font-weight-bold text-success">{{ formatPrice(stats.completedPayment) }} TL</div>
      </v-card>
    </v-col>
    <v-col cols="6" sm="3">
      <v-card flat class="pa-4">
        <div class="text-caption text-medium-emphasis">Bu Ay</div>
        <div class="text-h4 font-weight-bold text-primary">{{ formatPrice(stats.thisMonth) }} TL</div>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-card flat>
        <v-card-title>İşlem Geçmişi</v-card-title>
        <v-card-text>
          <v-table v-if="transactions.length" hover>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Açıklama</th>
                <th>Tutar</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in transactions" :key="t.id">
                <td>{{ formatDate(t.date) }}</td>
                <td>{{ t.description }}</td>
                <td :class="t.amount >= 0 ? 'text-success' : 'text-error'">
                  {{ t.amount >= 0 ? '+' : '' }}{{ formatPrice(t.amount) }} TL
                </td>
                <td>
                  <v-chip :color="t.status === 'completed' ? 'success' : 'warning'" size="small">
                    {{ t.status === 'completed' ? 'Tamamlandı' : 'Bekliyor' }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
          <v-card v-else flat class="text-center py-8">
            <v-icon size="80" color="grey-lighten-1">mdi-cash-multiple</v-icon>
            <div class="text-body-1 text-grey mt-2">Henüz satış yapılmadı</div>
            <div class="text-caption text-grey mt-1">
              Ürünleriniz satıldıkça kazançlarınız burada görünecek
            </div>
          </v-card>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
