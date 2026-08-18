<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()
const loading = ref(true)

onMounted(async () => {
  await adminStore.fetchDashboardStats()
  loading.value = false
})

function formatPrice(price: number): string {
  return price.toLocaleString('tr-TR')
}
</script>

<template>
  <v-row>
    <v-col cols="12">
      <h1 class="text-h4 font-weight-bold mb-6">Admin Paneli</h1>
    </v-col>

    <v-col cols="6" sm="3">
      <v-card flat class="pa-4">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary-light" size="48">
            <v-icon color="primary">mdi-account-group</v-icon>
          </v-avatar>
          <div>
            <div class="text-caption text-grey">Toplam Kullanıcı</div>
            <div class="text-h4 font-weight-bold">{{ adminStore.dashboardStats.totalUsers }}</div>
          </div>
        </div>
      </v-card>
    </v-col>

    <v-col cols="6" sm="3">
      <v-card flat class="pa-4">
        <div class="d-flex align-center ga-3">
          <v-avatar color="success-light" size="48">
            <v-icon color="success">mdi-package-variant</v-icon>
          </v-avatar>
          <div>
            <div class="text-caption text-grey">Toplam Ürün</div>
            <div class="text-h4 font-weight-bold">{{ adminStore.dashboardStats.totalProducts }}</div>
          </div>
        </div>
      </v-card>
    </v-col>

    <v-col cols="6" sm="3">
      <v-card flat class="pa-4">
        <div class="d-flex align-center ga-3">
          <v-avatar color="warning-light" size="48">
            <v-icon color="warning">mdi-clock-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-caption text-grey">Bekleyen Ürün</div>
            <div class="text-h4 font-weight-bold">{{ adminStore.dashboardStats.pendingProducts }}</div>
          </div>
        </div>
      </v-card>
    </v-col>

    <v-col cols="6" sm="3">
      <v-card flat class="pa-4">
        <div class="d-flex align-center ga-3">
          <v-avatar color="accent-light" size="48">
            <v-icon color="accent">mdi-cash</v-icon>
          </v-avatar>
          <div>
            <div class="text-caption text-grey">Toplam Ciro</div>
            <div class="text-h4 font-weight-bold">{{ formatPrice(adminStore.dashboardStats.totalRevenue) }} TL</div>
          </div>
        </div>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-card v-if="adminStore.dashboardStats.pendingProducts > 0" color="warning-light" flat class="pa-4">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center ga-3">
            <v-icon color="warning" size="32">mdi-alert-circle</v-icon>
            <div>
              <div class="font-weight-bold">Onay Bekleyen Ürünler</div>
              <div class="text-body-2 text-grey-darken-1">
                {{ adminStore.dashboardStats.pendingProducts }} ürün onayınızı bekliyor
              </div>
            </div>
          </div>
          <v-btn color="warning" to="/admin/urun-onay">
            İncele
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </v-card>
    </v-col>

    <v-col cols="12" md="8">
      <v-card flat>
        <v-card-title>Son Siparişler</v-card-title>
        <v-card-text>
          <v-list density="compact">
            <v-list-item v-for="i in 5" :key="i">
              <v-list-item-title>Sipariş #{{ 1000 + i }}</v-list-item-title>
              <v-list-item-subtitle>{{ new Date().toLocaleDateString('tr-TR') }}</v-list-item-subtitle>
              <template #append>
                <v-chip size="small" color="warning">Bekliyor</v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card flat>
        <v-card-title>Hızlı İşlemler</v-card-title>
        <v-card-text>
          <v-btn color="primary" variant="outlined" block class="mb-2" to="/admin/kategoriler">
            <v-icon start>mdi-folder-multiple</v-icon> Kategori Ekle
          </v-btn>
          <v-btn color="secondary" variant="outlined" block class="mb-2" to="/admin/bannerlar">
            <v-icon start>mdi-image</v-icon> Banner Ekle
          </v-btn>
          <v-btn color="accent" variant="outlined" block to="/admin/kuponlar">
            <v-icon start>mdi-ticket-percent</v-icon> Kupon Ekle
          </v-btn>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
