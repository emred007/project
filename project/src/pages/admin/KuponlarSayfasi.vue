<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import type { Coupon } from '@/types'

const adminStore = useAdminStore()
const showForm = ref(false)
const editingCoupon = ref<Coupon | null>(null)
const form = ref({
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: 0,
  min_order_amount: 0,
  max_discount: 0,
  usage_limit: 0,
  start_date: '',
  end_date: '',
  is_active: true,
})

onMounted(() => { adminStore.fetchAllCoupons() })

function openCreate() {
  editingCoupon.value = null
  form.value = { code: '', type: 'percentage', value: 0, min_order_amount: 0, max_discount: 0, usage_limit: 0, start_date: new Date().toISOString().substring(0, 16), end_date: new Date(Date.now() + 86400000 * 30).toISOString().substring(0, 16), is_active: true }
  showForm.value = true
}

function openEdit(coupon: Coupon) {
  editingCoupon.value = coupon
  form.value = {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    min_order_amount: coupon.min_order_amount || 0,
    max_discount: coupon.max_discount || 0,
    usage_limit: coupon.usage_limit || 0,
    start_date: new Date(coupon.start_date).toISOString().substring(0, 16),
    end_date: new Date(coupon.end_date).toISOString().substring(0, 16),
    is_active: coupon.is_active,
  }
  showForm.value = true
}

async function save() {
  if (!form.value.code.trim() || form.value.value <= 0) return
  const data = {
    ...form.value,
    code: form.value.code.trim().toUpperCase(),
    min_order_amount: form.value.min_order_amount || null,
    max_discount: form.value.max_discount || null,
    usage_limit: form.value.usage_limit || null,
    start_date: new Date(form.value.start_date).toISOString(),
    end_date: new Date(form.value.end_date).toISOString(),
  }
  const result = editingCoupon.value
    ? await adminStore.updateCoupon(editingCoupon.value.id, data)
    : await adminStore.createCoupon(data)
  if (result) showForm.value = false
}

async function deleteCoupon(id: string) { if (confirm('Bu kuponu silmek istediğinize emin misiniz?')) { await adminStore.deleteCoupon(id) } }

function formatPrice(price: number): string { return price.toLocaleString('tr-TR') }
function formatDate(date: string): string { return new Date(date).toLocaleDateString('tr-TR') }
</script>

<template>
  <v-card flat>
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h5">Kupon Yönetimi</span>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Kupon Ekle</v-btn>
    </v-card-title>
    <v-card-text>
      <v-table v-if="adminStore.allCoupons.length" hover>
        <thead><tr><th>Kod</th><th>İndirim</th><th>Minimum</th><th>Kullanım</th><th>Süre</th><th>Durum</th><th>İşlemler</th></tr></thead>
        <tbody>
          <tr v-for="coupon in adminStore.allCoupons" :key="coupon.id">
            <td class="font-weight-bold">{{ coupon.code }}</td>
            <td>{{ coupon.type === 'percentage' ? `%${coupon.value}` : `${formatPrice(coupon.value)} TL` }}</td>
            <td>{{ coupon.min_order_amount ? `${formatPrice(coupon.min_order_amount)} TL` : '-' }}</td>
            <td>{{ coupon.used_count }} / {{ coupon.usage_limit || '∞' }}</td>
            <td><div class="text-caption">{{ formatDate(coupon.start_date) }}</div><div class="text-caption">{{ formatDate(coupon.end_date) }}</div></td>
            <td><v-chip :color="coupon.is_active ? 'success' : 'error'" size="small">{{ coupon.is_active ? 'Aktif' : 'Pasif' }}</v-chip></td>
            <td>
              <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEdit(coupon)" />
              <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="deleteCoupon(coupon.id)" />
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-card v-else flat class="text-center py-8"><v-icon size="80" color="grey-lighten-1">mdi-ticket-percent</v-icon><h2 class="text-h6 mt-4">Kupon yok</h2></v-card>
    </v-card-text>

    <v-dialog v-model="showForm" max-width="600">
      <v-card>
        <v-card-title>{{ editingCoupon ? 'Kupon Düzenle' : 'Yeni Kupon' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="save">
            <v-text-field v-model="form.code" label="Kupon Kodu" :rules="[(v) => !!v || 'Kod gerekli']" />
            <v-radio-group v-model="form.type" inline label="İndirim Tipi">
              <v-radio label="Yüzde" value="percentage" />
              <v-radio label="Sabit" value="fixed" />
            </v-radio-group>
            <v-text-field v-model="form.value" :label="form.type === 'percentage' ? 'İndirim Yüzdesi' : 'İndirim Tutarı (TL)'" type="number" :rules="[(v: number) => v > 0 || '0 dan buyuk olmali']" />
            <v-text-field v-model="form.min_order_amount" label="Minimum Sipariş Tutarı (TL)" type="number" hint="Opsiyonel" />
            <v-text-field v-if="form.type === 'percentage'" v-model="form.max_discount" label="Maksimum İndirim (TL)" type="number" hint="Opsiyonel" />
            <v-text-field v-model="form.usage_limit" label="Kullanım Limiti" type="number" hint="Boş bırakılırsa sınırsız" />
            <v-row>
              <v-col cols="6"><v-text-field v-model="form.start_date" label="Başlangıç" type="datetime-local" /></v-col>
              <v-col cols="6"><v-text-field v-model="form.end_date" label="Bitiş" type="datetime-local" /></v-col>
            </v-row>
            <v-checkbox v-model="form.is_active" label="Aktif" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer /><v-btn variant="text" @click="showForm = false">İptal</v-btn><v-btn color="primary" @click="save">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
