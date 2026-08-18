<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/plugins/supabase'

const authStore = useAuthStore()
const stats = ref({ totalRevenue: 0, pendingPayment: 0, completedPayment: 0, thisMonth: 0 })
const transactions = ref<any[]>([])
const loading = ref(false)

onMounted(fetchData)

async function fetchData() {
  loading.value = true
  stats.value = { totalRevenue: Math.floor(Math.random() * 50000) + 10000, pendingPayment: Math.floor(Math.random() * 5000), completedPayment: Math.floor(Math.random() * 40000) + 5000, thisMonth: Math.floor(Math.random() * 10000) + 2000 }
  transactions.value = [
    { id: '1', type: 'sale', amount: 1250, status: 'completed', date: new Date().toISOString(), description: 'Sipariş #MP-12345' },
    { id: '2', type: 'commission', amount: -125, status: 'completed', date: new Date().toISOString(), description: 'Komisyon kesintisi' },
    { id: '3', type: 'sale', amount: 890, status: 'pending', date: new Date(Date.now() - 86400000).toISOString(), description: 'Sipariş #MP-12346' },
    { id: '4', type: 'payout', amount: -5000, status: 'completed', date: new Date(Date.now() - 172800000).toISOString(), description: 'Banka transferi' },
  ]
  loading.value = false
}

function formatPrice(price: number): string { return price.toLocaleString('tr-TR') }
function formatDate(date: string): string { return new Date(date).toLocaleDateString('tr-TR') }
function getTransactionColor(type: string): string { return type === 'sale' ? 'success' : type === 'commission' ? 'warning' : 'info' }
</script>

<template>
  <v-row>
    <v-col cols="6" sm="3"><v-card flat class="pa-4"><div class="text-caption text-grey">Toplam Kazanç</div><div class="text-h4 font-weight-bold text-primary">{{ formatPrice(stats.totalRevenue) }} TL</div></v-card></v-col>
    <v-col cols="6" sm="3"><v-card flat class="pa-4"><div class="text-caption text-grey">Bekleyen Ödeme</div><div class="text-h4 font-weight-bold text-warning">{{ formatPrice(stats.pendingPayment) }} TL</div></v-card></v-col>
    <v-col cols="6" sm="3"><v-card flat class="pa-4"><div class="text-caption text-grey">Tamamlanan</div><div class="text-h4 font-weight-bold text-success">{{ formatPrice(stats.completedPayment) }} TL</div></v-card></v-col>
    <v-col cols="6" sm="3"><v-card flat class="pa-4"><div class="text-caption text-medium-emphasis">Bu Ay</div><div class="text-h4 font-weight-bold text-primary">{{ formatPrice(stats.thisMonth) }} TL</div></v-card></v-col>
    <v-col cols="12"><v-card flat><v-card-title>İşlem Geçmişi</v-card-title><v-card-text><v-table hover><thead><tr><th>Tarih</th><th>Açıklama</th><th>Tutar</th><th>Durum</th></tr></thead><tbody><tr v-for="t in transactions" :key="t.id"><td>{{ formatDate(t.date) }}</td><td>{{ t.description }}</td><td :class="t.amount >= 0 ? 'text-success' : 'text-error'">{{ t.amount >= 0 ? '+' : '' }}{{ formatPrice(t.amount) }} TL</td><td><v-chip :color="t.status === 'completed' ? 'success' : 'warning'" size="small">{{ t.status === 'completed' ? 'Tamamlandı' : 'Bekliyor' }}</v-chip></td></tr></tbody></v-table></v-card-text></v-card></v-col>
  </v-row>
</template>
