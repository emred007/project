<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/product'
import type { Address } from '@/types'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const authStore = useAuthStore()
const productStore = useProductStore()

const step = ref(1)
const loading = ref(false)
const paymentMethod = ref('card')

const addresses = ref<Address[]>([])
const selectedShippingAddress = ref<Address | null>(null)
const selectedBillingAddress = ref<Address | null>(null)
const sameBillingAddress = ref(true)

const addressForm = ref({
  title: '',
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

onMounted(async () => {
  await cartStore.fetchCart()
  if (authStore.user) {
    await fetchAddresses()
  }
})

async function fetchAddresses() {
  const { supabase } = await import('@/plugins/supabase')
  const { data } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', authStore.user!.id)
    .order('is_default', { ascending: false })

  if (data) {
    addresses.value = data as Address[]
    const defaultAddr = addresses.value.find((a) => a.is_default) || addresses.value[0]
    selectedShippingAddress.value = defaultAddr || null
    selectedBillingAddress.value = defaultAddr || null
  }
}

function formatPrice(price: number): string {
  return price.toLocaleString('tr-TR')
}

async function saveAddress() {
  const { supabase } = await import('@/plugins/supabase')
  await supabase
    .from('addresses')
    .insert({
      user_id: authStore.user!.id,
      ...addressForm.value,
    })
  await fetchAddresses()
  addressForm.value = {
    title: '',
    full_name: '',
    phone: '',
    city: '',
    district: '',
    neighborhood: '',
    address: '',
    postal_code: '',
  }
  step.value = 1
}

async function placeOrder() {
  if (!selectedShippingAddress.value) return

  loading.value = true

  const billingAddress = sameBillingAddress.value
    ? selectedShippingAddress.value
    : selectedBillingAddress.value || selectedShippingAddress.value

  const order = await orderStore.createOrder({
    shipping_address: selectedShippingAddress.value,
    billing_address: billingAddress,
    payment_method: paymentMethod.value === 'card' ? 'credit_card' : 'cash_on_delivery',
    notes: notes.value || undefined,
  })

  loading.value = false

  if (order) {
    router.push({ name: 'order-success', params: { orderId: order.id } })
  }
}
</script>

<template>
  <v-container class="py-6">
    <h1 class="text-h4 font-weight-bold mb-6">Ödeme</h1>

    <v-stepper v-model="step" alt-labels class="elevation-0">
      <v-stepper-header class="elevation-0">
        <v-stepper-item :complete="step > 1" :value="1">Teslimat Adresi</v-stepper-item>
        <v-divider />
        <v-stepper-item :complete="step > 2" :value="2">Ödeme</v-stepper-item>
        <v-divider />
        <v-stepper-item :value="3">Onay</v-stepper-item>
      </v-stepper-header>

      <v-stepper-window>
        <v-stepper-window-item :value="1">
          <v-row>
            <v-col cols="12" md="8">
              <v-card flat class="mb-4">
                <v-card-title class="d-flex justify-space-between">
                  Teslimat Adresi
                  <v-btn
                    color="primary"
                    variant="text"
                    @click="step = 4"
                  >
                    <v-icon start>mdi-plus</v-icon>
                    Yeni Adres Ekle
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col
                      v-for="addr in addresses"
                      :key="addr.id"
                      cols="12"
                      sm="6"
                    >
                      <v-card
                        :color="selectedShippingAddress?.id === addr.id ? 'primary-light' : 'surface-variant'"
                        hover
                        class="pa-4"
                        ripple
                        @click="selectedShippingAddress = addr"
                      >
                        <div class="d-flex justify-space-between align-start">
                          <div>
                            <div class="font-weight-bold mb-1">{{ addr.title }}</div>
                            <div class="text-body-2">{{ addr.full_name }}</div>
                            <div class="text-caption text-grey">{{ addr.phone }}</div>
                            <div class="text-caption mt-2">{{ addr.address }}</div>
                            <div class="text-caption">{{ addr.neighborhood }}, {{ addr.district }}/{{ addr.city }}</div>
                          </div>
                          <v-icon
                            v-if="selectedShippingAddress?.id === addr.id"
                            color="primary"
                          >
                            mdi-check-circle
                          </v-icon>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>

                  <v-checkbox
                    v-model="sameBillingAddress"
                    label="Fatura adresi teslimat adresi ile aynı"
                    class="mt-4"
                  />
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card flat>
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
                      <div class="text-caption text-grey">{{ item.quantity }} adet</div>
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
                  <div class="d-flex justify-space-between mb-2">
                    <span>Kargo</span>
                    <span>{{ shippingCost === 0 ? 'Ücretsiz' : `${formatPrice(shippingCost)} TL` }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span>KDV</span>
                    <span>{{ formatPrice(tax) }} TL</span>
                  </div>

                  <v-divider class="my-3" />

                  <div class="d-flex justify-space-between text-h6 font-weight-bold">
                    <span>Toplam</span>
                    <span class="text-primary">{{ formatPrice(total) }} TL</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-stepper-window-item>

        <v-stepper-window-item :value="2">
          <v-row>
            <v-col cols="12" md="8">
              <v-card flat>
                <v-card-title>Ödeme Yöntemi</v-card-title>
                <v-card-text>
                  <v-radio-group v-model="paymentMethod" inline>
                    <v-radio label="Kredi/Banka Kartı" value="card">
                      <template #label>
                        <div class="d-flex align-center ga-2">
                          <v-icon>mdi-credit-card</v-icon>
                          <span>Kredi/Banka Kartı</span>
                        </div>
                      </template>
                    </v-radio>
                    <v-radio label="Kapıda Ödeme" value="cash">
                      <template #label>
                        <div class="d-flex align-center ga-2">
                          <v-icon>mdi-cash</v-icon>
                          <span>Kapıda Ödeme</span>
                        </div>
                      </template>
                    </v-radio>
                  </v-radio-group>

                  <div v-if="paymentMethod === 'card'" class="mt-6">
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          v-model="cardForm.card_number"
                          label="Kart Numarası"
                          placeholder="XXXX XXXX XXXX XXXX"
                          prepend-inner-icon="mdi-credit-card"
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          v-model="cardForm.card_holder"
                          label="Kart Üzerindeki İsim"
                          prepend-inner-icon="mdi-account"
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          v-model="cardForm.expiry_date"
                          label="Son Kullanma Tarihi"
                          placeholder="AA/YY"
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          v-model="cardForm.cvv"
                          label="CVV"
                          type="password"
                          placeholder="XXX"
                        />
                      </v-col>
                    </v-row>
                  </div>

                  <v-textarea
                    v-model="notes"
                    label="Sipariş Notu (Opsiyonel)"
                    placeholder="Siparişinizle ilgili özel istekleriniz"
                    rows="3"
                    class="mt-4"
                  />
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card flat>
                <v-card-title>Toplam</v-card-title>
                <v-card-text>
                  <div class="text-h4 font-weight-bold text-primary mb-4">
                    {{ formatPrice(total) }} TL
                  </div>

                  <v-btn
                    color="primary"
                    size="x-large"
                    block
                    :loading="loading"
                    @click="placeOrder"
                  >
                    Siparişi Tamamla
                  </v-btn>

                  <div class="text-center mt-4">
                    <v-icon color="success" class="mr-1">mdi-shield-check</v-icon>
                    <span class="text-caption text-grey">Güvenli ödeme 256-bit SSL</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-stepper-window-item>

        <v-stepper-window-item :value="4">
          <v-card flat>
            <v-card-title>Yeni Adres Ekle</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="saveAddress">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="addressForm.title" label="Adres Başlığı" placeholder="Ev, İş vs." />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="addressForm.full_name" label="Ad Soyad" />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="addressForm.phone" label="Telefon" placeholder="05XX XXX XX XX" />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="addressForm.city" label="İl" />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="addressForm.district" label="İlçe" />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="addressForm.neighborhood" label="Mahalle" />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea v-model="addressForm.address" label="Adres Detayı" rows="3" />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="addressForm.postal_code" label="Posta Kodu" />
                  </v-col>
                </v-row>

                <v-btn color="primary" type="submit">Adresi Kaydet</v-btn>
                <v-btn variant="text" @click="step = 1">İptal</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-stepper-window-item>
      </v-stepper-window>

      <v-stepper-actions>
        <template #prev>
          <v-btn
            v-if="step > 1 && step !== 4"
            variant="text"
            @click="step--"
          >
            Geri
          </v-btn>
          <v-btn
            v-if="step === 4"
            variant="text"
            @click="step = 1"
          >
            İptal
          </v-btn>
        </template>
        <template #next>
          <v-btn
            v-if="step < 2"
            color="primary"
            :disabled="!selectedShippingAddress"
            @click="step = 2"
          >
            Devam Et
          </v-btn>
        </template>
      </v-stepper-actions>
    </v-stepper>
  </v-container>
</template>
