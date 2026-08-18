<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const form = ref({
  full_name: '',
  username: '',
  email: '',
  phone: '',
})

const loading = ref(false)
const success = ref(false)

onMounted(() => {
  if (authStore.user) {
    form.value = {
      full_name: authStore.user.full_name || '',
      username: authStore.user.username || '',
      email: authStore.user.email,
      phone: authStore.user.phone || '',
    }
  }
})

const userRole = computed(() => {
  const role = authStore.user?.role
  if (role === 'admin') return 'Yönetici'
  if (role === 'seller') return 'Satıcı'
  return 'Kullanıcı'
})

async function saveProfile() {
  loading.value = true
  success.value = false
  const updated = await authStore.updateProfile({
    full_name: form.value.full_name,
    username: form.value.username,
    phone: form.value.phone,
  })
  loading.value = false
  if (updated) {
    success.value = true
  }
}
</script>

<template>
  <v-card flat>
    <v-card-title class="text-h5 mb-4">Profil Bilgileri</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center ga-4 mb-6">
            <v-avatar color="primary" size="100">
              <span class="text-h3 text-white">{{ authStore.userInitials }}</span>
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold">{{ authStore.userName }}</div>
              <v-chip size="small" color="primary" class="mt-1">{{ userRole }}</v-chip>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-form @submit.prevent="saveProfile">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.full_name"
              label="Ad Soyad"
              prepend-inner-icon="mdi-account"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.username"
              label="Kullanıcı Adı"
              prepend-inner-icon="mdi-at"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.email"
              label="E-posta"
              prepend-inner-icon="mdi-email"
              disabled
              hint="E-posta adresi değiştirilemez"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.phone"
              label="Telefon"
              prepend-inner-icon="mdi-phone"
            />
          </v-col>
        </v-row>

        <v-alert v-if="success" type="success" class="mb-4">
          Profil başarıyla güncellendi
        </v-alert>

        <v-alert v-if="authStore.error" type="error" class="mb-4">
          {{ authStore.error }}
        </v-alert>

        <v-btn
          type="submit"
          color="primary"
          size="large"
          :loading="loading"
        >
          Kaydet
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
