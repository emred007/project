<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/plugins/supabase'
import type { Address } from '@/types'

const authStore = useAuthStore()

const addresses = ref<Address[]>([])
const loading = ref(false)
const showForm = ref(false)

const form = ref({
  title: '',
  full_name: '',
  phone: '',
  city: '',
  district: '',
  neighborhood: '',
  address: '',
  postal_code: '',
  is_default: false,
})

onMounted(fetchAddresses)

async function fetchAddresses() {
  if (!authStore.user) return
  loading.value = true
  const { data } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', authStore.user.id)
    .order('is_default', { ascending: false })
  if (data) addresses.value = data as Address[]
  loading.value = false
}

async function saveAddress() {
  if (!authStore.user) return
  loading.value = true
  if (form.value.is_default) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', authStore.user.id)
  }
  await supabase.from('addresses').insert({
    user_id: authStore.user.id,
    ...form.value,
  })
  showForm.value = false
  resetForm()
  await fetchAddresses()
}

async function setDefault(id: string) {
  if (!authStore.user) return
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', authStore.user.id)
  await supabase.from('addresses').update({ is_default: true }).eq('id', id)
  await fetchAddresses()
}

async function deleteAddress(id: string) {
  await supabase.from('addresses').delete().eq('id', id)
  await fetchAddresses()
}

function resetForm() {
  form.value = {
    title: '',
    full_name: '',
    phone: '',
    city: '',
    district: '',
    neighborhood: '',
    address: '',
    postal_code: '',
    is_default: false,
  }
}
</script>

<template>
  <v-card flat>
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h5">Adreslerim</span>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showForm = true">
        Yeni Adres
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row v-if="addresses.length">
        <v-col v-for="addr in addresses" :key="addr.id" cols="12" sm="6" lg="4">
          <v-card :color="addr.is_default ? 'primary-light' : 'surface-variant'" flat class="pa-4 h-100">
            <div class="d-flex justify-space-between align-start mb-2">
              <v-chip :color="addr.is_default ? 'primary' : 'default'" size="small">
                {{ addr.title }}
              </v-chip>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props" />
                </template>
                <v-list density="compact">
                  <v-list-item @click="setDefault(addr.id)">
                    <v-list-item-title>Varsayılan Yap</v-list-item-title>
                  </v-list-item>
                  <v-list-item color="error" @click="deleteAddress(addr.id)">
                    <v-list-item-title>Sil</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
            <div class="font-weight-bold">{{ addr.full_name }}</div>
            <div class="text-body-2">{{ addr.phone }}</div>
            <div class="text-caption text-grey mt-2">
              {{ addr.address }}, {{ addr.neighborhood }}
              <br>{{ addr.district }}/{{ addr.city }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-card v-else flat class="text-center py-8">
        <v-icon size="80" color="grey-lighten-1">mdi-map-marker</v-icon>
        <h2 class="text-h6 mt-4">Henüz adres eklenmemiş</h2>
        <v-btn color="primary" class="mt-4" @click="showForm = true">Adres Ekle</v-btn>
      </v-card>
    </v-card-text>

    <v-dialog v-model="showForm" max-width="600">
      <v-card>
        <v-card-title>Yeni Adres Ekle</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveAddress">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.title" label="Adres Başlığı" placeholder="Ev, İş vs." />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.full_name" label="Ad Soyad" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.phone" label="Telefon" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.city" label="İl" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.district" label="İlçe" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.neighborhood" label="Mahalle" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="form.address" label="Adres Detayı" rows="3" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.postal_code" label="Posta Kodu" />
              </v-col>
              <v-col cols="12">
                <v-checkbox v-model="form.is_default" label="Varsayılan adres yap" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showForm = false">İptal</v-btn>
          <v-btn color="primary" :loading="loading" @click="saveAddress">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
