<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/plugins/supabase'
import { useToastStore } from '@/stores/toast'
import {
  blockNonDigitKey,
  formatTcKimlikInput,
  formatTurkishPhoneInput,
  isValidTcKimlik,
  isValidTurkishPhone,
} from '@/utils/turkishInputs'

const authStore = useAuthStore()
const toast = useToastStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const loading = ref(false)
const successMessage = ref('')
const error = ref('')

const sellerForm = ref({
  shop_name: '',
  shop_description: '',
  phone: '',
  tax_id: '',
  address: '',
})

const isSeller = computed(() => authStore.isSeller)
const application = computed(() => authStore.sellerApplication)
const hasPendingApplication = computed(() => application.value?.status === 'pending')
const hasRejectedApplication = computed(() => application.value?.status === 'rejected')

onMounted(async () => {
  if (authStore.user?.role === 'user') {
    await authStore.fetchSellerApplication()
  }
})

function onSellerPhoneInput(value: string) {
  sellerForm.value.phone = formatTurkishPhoneInput(value)
}

function onTcKimlikInput(value: string) {
  sellerForm.value.tax_id = formatTcKimlikInput(value)
}

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

    successMessage.value = 'Şifre başarıyla değiştirildi'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Şifre değiştirilemedi'
  } finally {
    loading.value = false
  }
}

async function submitSellerApplication() {
  if (!sellerForm.value.shop_name.trim()) {
    toast.error('Mağaza adı zorunludur')
    return
  }
  if (!isValidTurkishPhone(sellerForm.value.phone)) {
    toast.error('Telefon numarası 05 ile başlamalı ve 11 haneli olmalıdır')
    return
  }
  if (!isValidTcKimlik(sellerForm.value.tax_id)) {
    toast.error('Geçerli bir TC kimlik numarası girin (11 hane)')
    return
  }

  loading.value = true
  const ok = await authStore.submitSellerApplication({
    ...sellerForm.value,
    phone: formatTurkishPhoneInput(sellerForm.value.phone),
    tax_id: formatTcKimlikInput(sellerForm.value.tax_id),
  })
  loading.value = false

  if (ok) {
    toast.success('Satıcı başvurunuz alındı. Admin onayından sonra bilgilendirileceksiniz.')
    sellerForm.value = { shop_name: '', shop_description: '', phone: '', tax_id: '', address: '' }
  } else {
    toast.error(authStore.error || 'Başvuru gönderilemedi')
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

      <v-card v-if="isSeller" color="success-light" flat class="pa-4">
        <div class="text-subtitle-1 font-weight-bold mb-1">Satıcı Hesabı</div>
        <div class="text-body-2 text-grey-darken-1">
          Satıcı paneline giderek ürünlerinizi yönetebilirsiniz.
        </div>
        <v-btn color="success" to="/satici" class="mt-3">
          Satıcı Paneline Git
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </v-card>

      <v-card v-else-if="hasPendingApplication" color="warning-light" flat class="pa-4">
        <div class="d-flex align-center ga-3">
          <v-icon color="warning" size="32">mdi-clock-outline</v-icon>
          <div>
            <div class="text-subtitle-1 font-weight-bold mb-1">Başvurunuz İnceleniyor</div>
            <div class="text-body-2 text-grey-darken-1">
              "{{ application?.shop_name }}" mağaza başvurunuz admin onayı bekliyor.
            </div>
          </div>
        </div>
      </v-card>

      <v-card v-else color="accent-light" flat class="pa-4">
        <div class="text-subtitle-1 font-weight-bold mb-2">Satıcı Başvurusu</div>
        <div class="text-body-2 text-grey-darken-1 mb-4">
          Satıcı olmak için aşağıdaki formu doldurun. Başvurunuz admin tarafından incelendikten sonra onaylanır.
        </div>

        <v-alert
          v-if="hasRejectedApplication"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          Önceki başvurunuz reddedildi.
          <span v-if="application?.rejection_reason"> Sebep: {{ application.rejection_reason }}</span>
          Yeniden başvurabilirsiniz.
        </v-alert>

        <v-form @submit.prevent="submitSellerApplication">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="sellerForm.shop_name"
                label="Mağaza Adı *"
                :rules="[(v) => !!v || 'Mağaza adı gerekli']"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                :model-value="sellerForm.phone"
                label="Telefon *"
                placeholder="05XXXXXXXXX"
                inputmode="numeric"
                autocomplete="tel"
                maxlength="11"
                hint="11 hane, 05 ile başlamalı"
                :rules="[(v) => !!v || 'Telefon gerekli']"
                @update:model-value="onSellerPhoneInput"
                @keydown="blockNonDigitKey"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="sellerForm.shop_description"
                label="Mağaza Açıklaması"
                rows="3"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                :model-value="sellerForm.tax_id"
                label="TC Kimlik No *"
                placeholder="11 haneli TC kimlik no"
                inputmode="numeric"
                maxlength="11"
                hint="11 hane, sadece rakam"
                :rules="[(v) => !!v || 'TC kimlik no gerekli']"
                @update:model-value="onTcKimlikInput"
                @keydown="blockNonDigitKey"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="sellerForm.address" label="İş Yeri Adresi" />
            </v-col>
          </v-row>

          <v-btn color="accent" type="submit" :loading="loading">
            Başvuruyu Gönder
          </v-btn>
        </v-form>
      </v-card>
    </v-card-text>
  </v-card>
</template>
