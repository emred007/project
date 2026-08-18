<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'
import type { SellerApplication } from '@/types'

const adminStore = useAdminStore()
const toast = useToastStore()

const search = ref('')
const statusFilter = ref('pending')
const rejectDialog = ref(false)
const detailDialog = ref(false)
const selectedApplication = ref<SellerApplication | null>(null)
const rejectionReason = ref('')

onMounted(() => {
  adminStore.fetchSellerApplications()
})

const filteredApplications = computed(() => {
  let apps = adminStore.sellerApplications
  if (statusFilter.value) {
    apps = apps.filter((a) => a.status === statusFilter.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    apps = apps.filter(
      (a) =>
        a.shop_name.toLowerCase().includes(q) ||
        a.user?.full_name?.toLowerCase().includes(q) ||
        a.user?.email?.toLowerCase().includes(q)
    )
  }
  return apps
})

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
  }
  return colors[status] || 'grey'
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    pending: 'Bekliyor',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
  }
  return texts[status] || status
}

function openDetail(app: SellerApplication) {
  selectedApplication.value = app
  detailDialog.value = true
}

function openRejectDialog(app: SellerApplication) {
  selectedApplication.value = app
  rejectionReason.value = ''
  rejectDialog.value = true
}

async function approve(app: SellerApplication) {
  const ok = await adminStore.approveSellerApplication(app.id)
  if (ok) {
    toast.success(`${app.shop_name} başvurusu onaylandı`)
    await adminStore.fetchSellerApplications()
  } else {
    toast.error(adminStore.error || 'Onaylanamadı')
  }
}

async function confirmReject() {
  if (!selectedApplication.value) return
  const ok = await adminStore.rejectSellerApplication(
    selectedApplication.value.id,
    rejectionReason.value
  )
  if (ok) {
    toast.success('Başvuru reddedildi')
    rejectDialog.value = false
    detailDialog.value = false
    await adminStore.fetchSellerApplications()
  } else {
    toast.error(adminStore.error || 'Reddedilemedi')
  }
}
</script>

<template>
  <v-card flat>
    <v-card-title class="d-flex flex-wrap justify-space-between align-center ga-4">
      <span class="text-h5">Satıcı Onay Formları</span>
      <v-chip color="warning" v-if="adminStore.sellerApplications.filter((a) => a.status === 'pending').length">
        {{ adminStore.sellerApplications.filter((a) => a.status === 'pending').length }} bekleyen
      </v-chip>
    </v-card-title>
    <v-card-text>
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Mağaza veya kullanıcı ara..."
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="statusFilter"
            :items="[
              { title: 'Bekleyen', value: 'pending' },
              { title: 'Onaylanan', value: 'approved' },
              { title: 'Reddedilen', value: 'rejected' },
              { title: 'Tümü', value: '' },
            ]"
            label="Durum"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>

      <v-table v-if="filteredApplications.length" hover>
        <thead>
          <tr>
            <th>Mağaza</th>
            <th>Başvuran</th>
            <th>Telefon</th>
            <th>Tarih</th>
            <th>Durum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in filteredApplications" :key="app.id">
            <td class="font-weight-medium">{{ app.shop_name }}</td>
            <td>
              <div>{{ app.user?.full_name || '—' }}</div>
              <div class="text-caption text-grey">{{ app.user?.email }}</div>
            </td>
            <td>{{ app.phone }}</td>
            <td>{{ formatDate(app.created_at) }}</td>
            <td>
              <v-chip :color="getStatusColor(app.status)" size="small">
                {{ getStatusText(app.status) }}
              </v-chip>
            </td>
            <td>
              <v-btn icon="mdi-eye" variant="text" size="small" @click="openDetail(app)" />
              <v-btn
                v-if="app.status === 'pending'"
                icon="mdi-check"
                variant="text"
                size="small"
                color="success"
                @click="approve(app)"
              />
              <v-btn
                v-if="app.status === 'pending'"
                icon="mdi-close"
                variant="text"
                size="small"
                color="error"
                @click="openRejectDialog(app)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>

      <v-card v-else flat class="text-center py-8">
        <v-icon size="80" color="grey-lighten-1">mdi-file-document-outline</v-icon>
        <h2 class="text-h6 mt-4">Başvuru bulunamadı</h2>
      </v-card>
    </v-card-text>

    <v-dialog v-model="detailDialog" max-width="560">
      <v-card v-if="selectedApplication">
        <v-card-title>Başvuru Detayı</v-card-title>
        <v-card-text>
          <v-list density="compact">
            <v-list-item>
              <v-list-item-title>Mağaza</v-list-item-title>
              <v-list-item-subtitle>{{ selectedApplication.shop_name }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Başvuran</v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedApplication.user?.full_name }} ({{ selectedApplication.user?.email }})
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Telefon</v-list-item-title>
              <v-list-item-subtitle>{{ selectedApplication.phone }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="selectedApplication.tax_id">
              <v-list-item-title>TC Kimlik No</v-list-item-title>
              <v-list-item-subtitle>{{ selectedApplication.tax_id }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="selectedApplication.address">
              <v-list-item-title>Adres</v-list-item-title>
              <v-list-item-subtitle>{{ selectedApplication.address }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="selectedApplication.shop_description">
              <v-list-item-title>Açıklama</v-list-item-title>
              <v-list-item-subtitle>{{ selectedApplication.shop_description }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="selectedApplication.rejection_reason">
              <v-list-item-title>Red Sebebi</v-list-item-title>
              <v-list-item-subtitle>{{ selectedApplication.rejection_reason }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions v-if="selectedApplication.status === 'pending'">
          <v-spacer />
          <v-btn color="error" variant="text" @click="openRejectDialog(selectedApplication)">Reddet</v-btn>
          <v-btn color="success" @click="approve(selectedApplication)">Onayla</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="rejectDialog" max-width="480">
      <v-card>
        <v-card-title>Başvuruyu Reddet</v-card-title>
        <v-card-text>
          <v-textarea v-model="rejectionReason" label="Red sebebi (opsiyonel)" rows="3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="rejectDialog = false">İptal</v-btn>
          <v-btn color="error" @click="confirmReject">Reddet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
