<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const showRegisteredNotice = ref(false)

onMounted(() => {
  if (route.query.registered === '1' && authStore.registrationNotice) {
    showRegisteredNotice.value = true
  }
})

async function handleLogin() {
  loading.value = true
  const success = await authStore.login(email.value, password.value)
  loading.value = false

  if (success) {
    const redirect = route.query.redirect as string
    router.push(redirect || { name: 'home' })
  }
}
</script>

<template>
  <v-container fluid class="fill-height bg-background">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-6 pa-sm-8" color="surface">
          <div class="text-center mb-8">
            <h1 class="text-h4 font-weight-bold text-primary mb-2">
              Pazarium
            </h1>
            <p class="text-body-2 text-grey-darken-1">
              Hesabınıza giriş yapın
            </p>
          </div>

          <v-alert
            v-if="showRegisteredNotice && authStore.registrationNotice"
            type="success"
            :text="authStore.registrationNotice"
            variant="tonal"
            class="mb-4"
          />

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
              class="mb-2"
            />

            <div class="d-flex justify-space-between align-center mb-6">
              <v-checkbox
                v-model="rememberMe"
                label="Beni hatırla"
                hide-details
                density="compact"
              />
              <a href="#" class="text-caption text-primary text-decoration-none">
                Şifremi unuttum
              </a>
            </div>

            <v-alert
              v-if="authStore.error"
              type="error"
              :text="authStore.error"
              variant="tonal"
              class="mb-4"
            />

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="loading"
              class="mb-6"
            >
              Giriş Yap
            </v-btn>

            <v-divider class="mb-6" />

            <p class="text-center text-body-2">
              Hesabınız yok mu?
              <router-link :to="{ name: 'register' }" class="text-primary font-weight-medium text-decoration-none">
                Kayıt Ol
              </router-link>
            </p>
          </v-form>
        </v-card>

        <p class="text-center text-caption text-grey mt-4">
          Giriş yaparak
          <a href="#" class="text-primary">Kullanım Şartları</a> ve
          <a href="#" class="text-primary">Gizlilik Politikası</a>'nı kabul etmiş olursunuz.
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>
