<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const fullName = ref('')
const username = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const acceptTerms = ref(false)
const loading = ref(false)

const passwordsMatch = computed(() => password.value === confirmPassword.value)

async function handleRegister() {
  if (!passwordsMatch.value) return

  loading.value = true
  const success = await authStore.register({
    email: email.value,
    password: password.value,
    full_name: fullName.value,
    username: username.value,
    phone: phone.value || undefined,
  })
  loading.value = false

  if (success) {
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <v-container fluid class="fill-height bg-background">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="5">
        <v-card class="pa-6 pa-sm-8" color="surface">
          <div class="text-center mb-6">
            <h1 class="text-h4 font-weight-bold text-primary mb-2">
              MarketPlace
            </h1>
            <p class="text-body-2 text-grey-darken-1">
              Yeni hesap oluşturun
            </p>
          </div>

          <v-form @submit.prevent="handleRegister">
            <v-text-field
              v-model="fullName"
              label="Ad Soyad"
              prepend-inner-icon="mdi-account-outline"
              :rules="[(v) => !!v || 'Ad soyad gerekli']"
              class="mb-3"
            />

            <v-text-field
              v-model="username"
              label="Kullanıcı Adı"
              prepend-inner-icon="mdi-at"
              :rules="[(v) => !!v || 'Kullanıcı adı gerekli', (v) => v.length >= 3 || 'En az 3 karakter']"
              class="mb-3"
            />

            <v-text-field
              v-model="email"
              label="E-posta Adresi"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              :rules="[
                (v) => !!v || 'E-posta gerekli',
                (v) => /.+@.+\..+/.test(v) || 'Geçerli bir e-posta girin',
              ]"
              class="mb-3"
            />

            <v-text-field
              v-model="phone"
              label="Telefon Numarası"
              prepend-inner-icon="mdi-phone-outline"
              placeholder="05XX XXX XX XX"
              class="mb-3"
            />

            <v-text-field
              v-model="password"
              label="Şifre"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="[(v) => !!v || 'Şifre gerekli', (v) => v.length >= 6 || 'En az 6 karakter']"
              @click:append-inner="showPassword = !showPassword"
              class="mb-3"
            />

            <v-text-field
              v-model="confirmPassword"
              label="Şifre Tekrar"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-check-outline"
              :rules="[(v) => !!v || 'Şifre tekrarı gerekli', (v) => passwordsMatch || 'Şifreler eşleşmiyor']"
              :error-messages="!passwordsMatch && confirmPassword ? 'Şifreler eşleşmiyor' : ''"
              class="mb-2"
            />

            <v-checkbox
              v-model="acceptTerms"
              :rules="[(v) => !!v || 'Kullanım şartlarını kabul etmelisiniz']"
              class="mb-4"
            >
              <template #label>
                <span class="text-body-2">
                  <a href="#" class="text-primary">Kullanım Şartları</a> ve
                  <a href="#" class="text-primary">Gizlilik Politikası</a>'nı okudum ve kabul ediyorum.
                </span>
              </template>
            </v-checkbox>

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
              :disabled="!acceptTerms"
              class="mb-6"
            >
              Kayıt Ol
            </v-btn>

            <v-divider class="mb-6" />

            <p class="text-center text-body-2">
              Zaten hesabınız var mı?
              <router-link :to="{ name: 'login' }" class="text-primary font-weight-medium text-decoration-none">
                Giriş Yap
              </router-link>
            </p>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
