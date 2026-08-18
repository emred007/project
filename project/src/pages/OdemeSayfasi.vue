<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { supabase } from '@/plugins/supabase'
import type { Address, Product } from '@/types'
import {
  cardNumberDigits,
  digitsOnly,
  expiryDateError,
  formatCardNumberInput,
  formatExpiryInput,
} from '@/utils/paymentInputs'
import {
  blockNonDigitKey,
  formatTurkishPhoneInput,
  isValidTurkishPhone,
} from '@/utils/turkishInputs'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const authStore = useAuthStore()
const toast = useToastStore()

const loading = ref(false)

const addressForm = ref({
  full_name: '',
  phone: '',
  city: '',
  district: '',
  neighborhood: '',
  address: '',
  postal_code: '',
})

const cardForm = ref({
  card_number: '',
  card_holder: '',
  expiry_date: '',
  cvv: '',
})

const notes = ref('')

const cartItems = computed(() => cartStore.items)
const subtotal = computed(() => cartStore.subtotal)
const discount = computed(() => cartStore.discount)
const shippingCost = computed(() => cartStore.shippingCost)
const tax = computed(() => cartStore.tax)
const total = computed(() => cartStore.total)

function getCheckoutErrors(): string[] {
  const errors: string[] = []
  const addr = addressForm.value
  const card = cardForm.value
  const cardDigits = cardNumberDigits(card.card_number)

  if (!addr.full_name.trim()) errors.push('Ad soyad gerekli')
  if (!isValidTurkishPhone(addr.phone)) errors.push('Telefon 05 ile başlamalı ve 11 haneli olmalı')
  if (!addr.city.trim()) errors.push('İl gerekli')
  if (!addr.district.trim()) errors.push('İlçe gerekli')
  if (!addr.neighborhood.trim()) errors.push('Mahalle gerekli')
  if (!addr.address.trim()) errors.push('Adres gerekli')
  if (cardDigits.length !== 16) errors.push('Kart numarası 16 haneli olmalı')
  if (!card.card_holder.trim()) errors.push('Kart üzerindeki isim gerekli')

  const expiryErr = expiryDateError(card.expiry_date.trim())
  if (expiryErr) errors.push(expiryErr)

  if (card.cvv.length !== 3) errors.push('CVV 3 haneli olmalı')
  if (cartItems.value.length === 0) errors.push('Sepetiniz boş')
  if (cartItems.value.some((item) => !item.product)) errors.push('Sepetteki ürün bilgisi yüklenemedi')

  return errors
}

const checkoutHint = computed(() => {
  const errors = getCheckoutErrors()
  return errors.length ? errors[0] : ''
})

function onPhoneInput(value: string) {
  addressForm.value.phone = formatTurkishPhoneInput(value)
}

function onPostalCodeInput(value: string) {
  addressForm.value.postal_code = digitsOnly(value, 5)
}

function onCardNumberInput(value: string) {
  cardForm.value.card_number = formatCardNumberInput(value)
}

function onExpiryInput(value: string) {
  cardForm.value.expiry_date = formatExpiryInput(value)
}

function onCvvInput(value: string) {
  cardForm.value.cvv = digitsOnly(value, 3)
}

onMounted(async () => {
  await cartStore.fetchCart()
  await enrichCartProducts()
  if (cartItems.value.length === 0) {
    router.replace({ name: 'cart' })
    return
  }

  if (authStore.user?.full_name) {
    addressForm.value.full_name = authStore.user.full_name
  }
})

async function enrichCartProducts() {
  for (const item of cartStore.items) {
    if (item.product?.seller_id) continue

    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', item.product_id)
      .single()

    if (data) {
      item.product = data as Product
    }
  }
}

function formatPrice(price: number): string {
  return price.toLocaleString('tr-TR')
}

function buildAddress(): Address {
  return {
    id: `addr-${Date.now()}`,
    user_id: authStore.user!.id,
    title: 'Teslimat',
    full_name: addressForm.value.full_name.trim(),
    phone: addressForm.value.phone.trim(),
    city: addressForm.value.city.trim(),
    district: addressForm.value.district.trim(),
    neighborhood: addressForm.value.neighborhood.trim(),
    address: addressForm.value.address.trim(),
    postal_code: addressForm.value.postal_code.trim() || undefined,
    is_default: false,
    created_at: new Date().toISOString(),
  }
}

async function placeOrder() {
  await enrichCartProducts()

  const errors = getCheckoutErrors()
  if (errors.length) {
    toast.error(errors[0])
    return
  }

  if (addressForm.value.postal_code && !/^\d+$/.test(addressForm.value.postal_code)) {
    toast.error('Posta kodu sadece rakam içermelidir')
    return
  }

  loading.value = true

  const shippingAddress = buildAddress()

  const order = await orderStore.createOrder({
    shipping_address: shippingAddress,
    billing_address: shippingAddress,
    payment_method: 'credit_card',
    notes: notes.value.trim() || undefined,
  })

  loading.value = false

  if (order) {
    toast.success('Ödemeniz alındı, faturanız hazırlanıyor')
    router.push({ name: 'order-success', params: { orderId: order.id } })
  } else {
    toast.error(orderStore.error || 'Sipariş oluşturulamadı')
  }
}
</script>

<template>
  <v-container class="py-6">
    <h1 class="text-h4 font-weight-bold mb-6">Ödeme</h1>

    <v-row>
      <v-col cols="12" md="8">
        <v-card flat class="mb-4">
          <v-card-title class="text-h6">Teslimat Bilgileri</v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="addressForm.full_name"
                  label="Ad Soyad *"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="addressForm.phone"
                  label="Telefon *"
                  placeholder="05XXXXXXXXX"
                  density="comfortable"
                  inputmode="numeric"
                  autocomplete="tel"
                  maxlength="11"
                  hint="11 hane, 05 ile başlamalı"
                  @update:model-value="onPhoneInput"
                  @keydown="blockNonDigitKey"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="addressForm.city"
                  label="İl *"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="addressForm.district"
                  label="İlçe *"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="addressForm.neighborhood"
                  label="Mahalle *"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="addressForm.postal_code"
                  label="Posta Kodu"
                  placeholder="34000"
                  density="comfortable"
                  inputmode="numeric"
                  autocomplete="postal-code"
                  maxlength="5"
                  hint="Sadece rakam"
                  @update:model-value="onPostalCodeInput"
                  @keydown="blockNonDigitKey"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="addressForm.address"
                  label="Adres Detayı *"
                  rows="2"
                  density="comfortable"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card flat class="mb-4">
          <v-card-title class="text-h6">Kart Bilgileri</v-card-title>
          <v-card-text autocomplete="off">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  :model-value="cardForm.card_number"
                  label="Kart Numarası *"
                  placeholder="1234 5678 9012 3456"
                  prepend-inner-icon="mdi-credit-card"
                  density="comfortable"
                  inputmode="numeric"
                  autocomplete="cc-number"
                  name="cc-number"
                  maxlength="19"
                  hint="16 hane"
                  @update:model-value="onCardNumberInput"
                  @keydown="blockNonDigitKey"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="cardForm.card_holder"
                  label="Kart Üzerindeki İsim *"
                  prepend-inner-icon="mdi-account"
                  density="comfortable"
                  autocomplete="cc-name"
                  name="cc-name"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  :model-value="cardForm.expiry_date"
                  label="Son Kullanma *"
                  placeholder="12/28"
                  density="comfortable"
                  inputmode="numeric"
                  autocomplete="cc-exp"
                  name="cc-exp"
                  maxlength="5"
                  hint="AA/YY — ay 01-12"
                  :error-messages="cardForm.expiry_date ? expiryDateError(cardForm.expiry_date) : undefined"
                  @update:model-value="onExpiryInput"
                  @keydown="blockNonDigitKey"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  :model-value="cardForm.cvv"
                  label="CVV *"
                  type="password"
                  placeholder="123"
                  density="comfortable"
                  inputmode="numeric"
                  autocomplete="cc-csc"
                  name="cc-csc"
                  maxlength="3"
                  hint="3 hane"
                  @update:model-value="onCvvInput"
                  @keydown="blockNonDigitKey"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-textarea
          v-model="notes"
          label="Sipariş Notu (Opsiyonel)"
          rows="2"
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-card flat class="position-sticky" style="top: calc(var(--v-layout-top, 140px) + 16px)">
          <v-card-title>Sipariş Özeti</v-card-title>
          <v-card-text>
            <div v-for="item in cartItems" :key="item.id" class="d-flex ga-2 mb-3">
              <v-img
                :src="item.product?.images?.[0]"
                width="48"
                height="48"
                cover
                class="rounded"
              />
              <div class="flex-grow-1">
                <div class="text-body-2">{{ item.product?.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.quantity }} adet</div>
              </div>
              <div class="text-body-2 font-weight-medium">
                {{ formatPrice((item.product?.discount_price || item.product?.price || 0) * item.quantity) }} TL
              </div>
            </div>

            <v-divider class="my-3" />

            <div class="d-flex justify-space-between mb-2">
              <span>Ara Toplam</span>
              <span>{{ formatPrice(subtotal) }} TL</span>
            </div>
            <div v-if="discount > 0" class="d-flex justify-space-between mb-2 text-success">
              <span>İndirim</span>
              <span>-{{ formatPrice(discount) }} TL</span>
            </div>
            <div v-if="cartStore.appliedCoupon" class="mb-2">
              <v-chip color="success" size="small" variant="outlined">
                {{ cartStore.appliedCoupon.code }}
              </v-chip>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Kargo</span>
              <span>{{ shippingCost === 0 ? 'Ücretsiz' : `${formatPrice(shippingCost)} TL` }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>KDV (%10)</span>
              <span>{{ formatPrice(tax) }} TL</span>
            </div>

            <v-divider class="my-3" />

            <div class="d-flex justify-space-between text-h6 font-weight-bold mb-4">
              <span>Toplam</span>
              <span class="text-primary">{{ formatPrice(total) }} TL</span>
            </div>

            <v-alert
              v-if="checkoutHint"
              type="warning"
              variant="tonal"
              density="compact"
              class="mb-3"
            >
              {{ checkoutHint }}
            </v-alert>

            <v-btn
              color="primary"
              size="x-large"
              block
              :loading="loading"
              @click="placeOrder"
            >
              Ödemeyi Tamamla
              <v-icon end>mdi-lock</v-icon>
            </v-btn>

            <div class="text-center mt-4">
              <v-icon color="success" class="mr-1">mdi-shield-check</v-icon>
              <span class="text-caption text-medium-emphasis">256-bit SSL ile güvenli ödeme</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
