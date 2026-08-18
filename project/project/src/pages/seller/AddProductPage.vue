<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/product'
import type { Category } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const productStore = useProductStore()

const form = ref({
  name: '',
  description: '',
  price: 0,
  discount_price: 0,
  stock: 0,
  sku: '',
  brand: '',
  category_id: '',
  images: [] as string[],
  specifications: {} as Record<string, string>,
})

const newSpecKey = ref('')
const newSpecValue = ref('')
const imageUrls = ref<string[]>([])
const newImageUrl = ref('')
const loading = ref(false)
const error = ref('')

const categories = computed(() =>
  productStore.categories.filter((c) => !c.parent_id)
)

onMounted(() => {
  productStore.fetchCategories()
})

function addImage() {
  if (newImageUrl.value.trim()) {
    imageUrls.value.push(newImageUrl.value.trim())
    newImageUrl.value = ''
  }
}

function removeImage(index: number) {
  imageUrls.value.splice(index, 1)
}

function addSpec() {
  if (newSpecKey.value && newSpecValue.value) {
    form.value.specifications[newSpecKey.value] = newSpecValue.value
    newSpecKey.value = ''
    newSpecValue.value = ''
  }
}

function removeSpec(key: string) {
  delete form.value.specifications[key]
}

async function saveProduct() {
  if (!authStore.user) return

  loading.value = true
  error.value = ''

  try {
    const product = {
      name: form.value.name,
      description: form.value.description,
      price: form.value.price,
      discount_price: form.value.discount_price || null,
      stock: form.value.stock,
      sku: form.value.sku || null,
      brand: form.value.brand,
      category_id: form.value.category_id,
      images: imageUrls.value,
      specifications: form.value.specifications,
      seller_id: authStore.user.id,
      status: 'pending' as const,
    }

    await productStore.createProduct(product as any)

    router.push({ name: 'seller-products' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ürün eklenemedi'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-card flat>
    <v-card-title class="text-h5 mb-2">Yeni Ürün Ekle</v-card-title>
    <v-card-text>
      <v-alert type="info" variant="tonal" class="mb-4" icon="mdi-shield-check">
        Ürününüz kaydedildikten sonra admin onayına gönderilir. Onaylandıktan sonra mağazada görünür hale gelir.
      </v-alert>
      <v-form @submit.prevent="saveProduct">
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="form.name"
              label="Ürün Adı"
              :rules="[(v) => !!v || 'Ürün adı gerekli']"
              class="mb-4"
            />

            <v-textarea
              v-model="form.description"
              label="Ürün Açıklaması"
              rows="4"
              :rules="[(v) => !!v || 'Açıklama gerekli']"
              class="mb-4"
            />

            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="form.price"
                  label="Fiyat (TL)"
                  type="number"
                  :rules="[(v: number) => v > 0 || 'Fiyat 0 dan buyuk olmali']"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="form.discount_price"
                  label="İndirimli Fiyat (TL)"
                  type="number"
                  hint="Opsiyonel"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="form.stock"
                  label="Stok Miktarı"
                  type="number"
                  :rules="[(v) => v >= 0 || 'Stok 0 veya pozitif olmalı']"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="form.sku"
                  label="SKU (Opsiyonel)"
                  hint="Ürün kodu"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6">
                <v-text-field v-model="form.brand" label="Marka" :rules="[(v) => !!v || 'Marka gerekli']" />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="form.category_id"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  label="Kategori"
                  :rules="[(v) => !!v || 'Kategori gerekli']"
                />
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" md="4">
            <v-card color="grey-lighten-4" flat class="pa-4 mb-4">
              <div class="text-subtitle-2 font-weight-bold mb-3">Ürün Görselleri</div>
              <v-text-field
                v-model="newImageUrl"
                label="Resim URL'si"
                density="compact"
                append-inner-icon="mdi-plus"
                @click:append-inner="addImage"
                @keydown.enter.prevent="addImage"
                hint="URL girip + butonuna tıklayın"
              />
              <v-row class="mt-2">
                <v-col v-for="(url, i) in imageUrls" :key="i" cols="4">
                  <v-card relative>
                    <v-img :src="url" height="80" cover />
                    <v-btn
                      icon
                      size="x-small"
                      color="error"
                      class="position-absolute top-0 right-0"
                      @click="removeImage(i)"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>

            <v-card color="grey-lighten-4" flat class="pa-4">
              <div class="text-subtitle-2 font-weight-bold mb-3">Teknik Özellikler</div>
              <div class="d-flex ga-2 mb-2">
                <v-text-field v-model="newSpecKey" label="Özellik" density="compact" hide-details />
                <v-text-field v-model="newSpecValue" label="Değer" density="compact" hide-details />
                <v-btn icon="mdi-plus" variant="text" @click="addSpec" :disabled="!newSpecKey || !newSpecValue" />
              </div>
              <v-list density="compact">
                <v-list-item v-for="(value, key) in form.specifications" :key="key" class="px-0">
                  <v-list-item-title>{{ key }}: {{ value }}</v-list-item-title>
                  <template #append>
                    <v-btn icon="mdi-close" size="x-small" variant="text" @click="removeSpec(key)" />
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>

        <v-card color="warning-light" flat class="mt-4 pa-4">
          <v-icon start color="warning">mdi-information</v-icon>
          <span class="text-body-2">Ürününüz ekledikten sonra admin onayı bekleyecektir.</span>
        </v-card>

        <div class="d-flex ga-4 mt-6">
          <v-btn
            color="primary"
            size="large"
            type="submit"
            :loading="loading"
          >
            Ürünü Gönder (Onay İçin)
          </v-btn>
          <v-btn
            variant="outlined"
            size="large"
            to="/satici/urunler"
          >
            İptal
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>
