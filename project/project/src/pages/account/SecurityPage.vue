<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/plugins/supabase'

const authStore = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const loading = ref(false)
const successMessage = ref('')
const error = ref('')

async function changePassword() {
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Yeni şifreler eşleşmiyor'
    return
  }

  if (newPassword.value.length < 6) {
    error.value = 'Şifre en az 6 karakter olmalı'
    return
  }

  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.value,
    })

    if (updateError) throw updateError

    successMessage.value = 'Sifre basariyla degistirildi'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Şifre değiştirilemedi'
  } finally {
    loading.value = false
  }
}

async function becomeSeller() {
  loading.value = true
  const result = await authStore.becomeSeller()
  loading.value = false
  if (result) {
    successMessage.value = 'Artik satici olabilirsiniz! Urunlerinizi eklemeye baslayabilirsiniz.'
  }
}
</script>

<template>
  <v-card flat>
    <v-card-title class="text-h5 mb-4">Güvenlik</v-card-title>
    <v-card-text>
      <v-card color="grey-lighten-4" flat class="pa-4 mb-6">
        <div class="text-subtitle-1 font-weight-bold mb-4">
          <v-icon start>mdi-lock</v-icon>
          Şifre Değiştir
        </div>

        <v-form @submit.prevent="changePassword">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="currentPassword"
                label="Mevcut Şifre"
                :type="showCurrentPassword ? 'text' : 'password'"
                :append-inner-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showCurrentPassword = !showCurrentPassword"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="newPassword"
                label="Yeni Şifre"
                :type="showNewPassword ? 'text' : 'password'"
                :append-inner-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showNewPassword = !showNewPassword"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="confirmPassword"
                label="Yeni Şifre Tekrar"
                :type="showNewPassword ? 'text' : 'password'"
              />
            </v-col>
          </v-row>

          <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
          <v-alert v-if="successMessage" type="success" class="mb-4">{{ successMessage }}</v-alert>

          <v-btn color="primary" type="submit" :loading="loading">
            Şifreyi Değiştir
          </v-btn>
        </v-form>
      </v-card>

      <v-card v-if="authStore.user?.role === 'user'" color="accent-light" flat class="pa-4">
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="text-subtitle-1 font-weight-bold mb-1">Satıcı Ol</div>
            <div class="text-body-2 text-grey-darken-1">
              Ürünlerinizi satmaya başlayın ve gelir elde edin!
            </div>
          </div>
          <v-btn color="accent" :loading="loading" @click="becomeSeller">
            Satıcı Ol
          </v-btn>
        </div>
      </v-card>

      <v-card v-else color="success-light" flat class="pa-4">
        <div class="text-subtitle-1 font-weight-bold mb-1">Satıcı Hesabı</div>
        <div class="text-body-2 text-grey-darken-1">
          Satıcı paneline giderek ürünlerinizi yönetebilirsiniz.
        </div>
        <v-btn color="success" to="/satici" class="mt-3">
          Satıcı Paneline Git
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </v-card>
    </v-card-text>
  </v-card>
</template>
