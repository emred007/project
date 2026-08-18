<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  const success = await authStore.login(email.value, password.value)
  loading.value = false

  if (!success) return

  if (!authStore.isAdmin) {
    authStore.error = 'Bu hesap admin yetkisine sahip değil.'
    await authStore.logout()
    return
  }

  const redirect = route.query.redirect as string
  router.push(redirect?.startsWith('/admin') ? redirect : { name: 'admin-dashboard' })
}
</script>

<template>
  <v-container fluid class="fill-height bg-grey-darken-4">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-6 pa-sm-8">
          <div class="text-center mb-8">
            <v-avatar color="error" size="64" class="mb-4">
              <v-icon size="36" color="white">mdi-shield-account</v-icon>
            </v-avatar>
            <h1 class="text-h4 font-weight-bold text-primary mb-2">
              Admin Paneli
            </h1>
            <p class="text-body-2 text-grey-darken-1">
              Yönetici hesabınızla giriş yapın
            </p>
          </div>

          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="email"
              label="E-posta Adresi"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              :rules="[
                (v) => !!v || 'E-posta gerekli',
                (v) => /.+@.+\..+/.test(v) || 'Geçerli bir e-posta girin',
              ]"
              class="mb-4"
            />

            <v-text-field
              v-model="password"
              label="Şifre"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="[(v) => !!v || 'Şifre gerekli', (v) => v.length >= 6 || 'En az 6 karakter']"
              @click:append-inner="showPassword = !showPassword"
              class="mb-6"
            />

            <v-alert
              v-if="authStore.error"
              type="error"
              :text="authStore.error"
              variant="tonal"
              class="mb-4"
            />

            <v-btn
              type="submit"
              color="error"
              block
              size="large"
              :loading="loading"
              prepend-icon="mdi-shield-account"
              class="mb-6"
            >
              Admin Girişi
            </v-btn>

            <p class="text-center text-body-2">
              <router-link to="/" class="text-primary font-weight-medium text-decoration-none">
                ← Ana Sayfaya Dön
              </router-link>
            </p>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
