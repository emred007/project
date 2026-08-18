<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const productId = route.params.id as string

const form = ref({
  name: '',
  description: '',
  price: 0,
  discount_price: 0,
  stock: 0,
  brand: '',
  category_id: '',
  images: [] as string[],
  specifications: {} as Record<string, string>,
})

const imageUrls = ref<string[]>([])
const newImageUrl = ref('')
const newSpecKey = ref('')
const newSpecValue = ref('')
const loading = ref(false)
const fetchLoading = ref(true)

const categories = computed(() =>
  productStore.categories.filter((c) => !c.parent_id)
)

onMounted(async () => {
  await productStore.fetchCategories()
  const product = await productStore.fetchProductById(productId)
  if (product) {
    form.value = {
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      discount_price: product.discount_price || 0,
      stock: product.stock || 0,
      brand: product.brand || '',
      category_id: product.category_id || '',
      images: product.images || [],
      specifications: (product.specifications as Record<string, string>) || {},
    }
    imageUrls.value = product.images || []
  }
  fetchLoading.value = false
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
  loading.value = true
  try {
    await productStore.updateProduct(productId, {
      name: form.value.name,
      description: form.value.description,
      price: form.value.price,
      discount_price: form.value.discount_price || null,
      stock: form.value.stock,
      brand: form.value.brand,
      category_id: form.value.category_id,
      images: imageUrls.value,
      specifications: form.value.specifications,
      status: 'pending',
    } as any)
    router.push({ name: 'seller-products' })
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-card flat>
    <v-card-title class="text-h5 mb-4">Ürün Düzenle</v-card-title>
    <v-card-text>
      <v-skeleton-loader v-if="fetchLoading" type="article@4" />
      <v-form v-else @submit.prevent="saveProduct">
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field v-model="form.name" label="Ürün Adı" :rules="[(v) => !!v || 'Ürün adı gerekli']" class="mb-4" />
            <v-textarea v-model="form.description" label="Ürün Açıklaması" rows="4" class="mb-4" />
            <v-row>
              <v-col cols="6"><v-text-field v-model="form.price" label="Fiyat (TL)" type="number" /></v-col>
              <v-col cols="6"><v-text-field v-model="form.discount_price" label="İndirimli Fiyat (TL)" type="number" /></v-col>
            </v-row>
            <v-row>
              <v-col cols="6"><v-text-field v-model="form.stock" label="Stok Miktarı" type="number" /></v-col>
              <v-col cols="6"><v-text-field v-model="form.brand" label="Marka" /></v-col>
            </v-row>
            <v-select v-model="form.category_id" :items="categories" item-title="name" item-value="id" label="Kategori" />
          </v-col>
          <v-col cols="12" md="4">
            <v-card color="grey-lighten-4" flat class="pa-4 mb-4">
              <div class="text-subtitle-2 font-weight-bold mb-3">Ürün Görselleri</div>
              <v-text-field v-model="newImageUrl" label="Resim URL" density="compact" append-inner-icon="mdi-plus" @click:append-inner="addImage" @keydown.enter.prevent="addImage" />
              <v-row class="mt-2">
                <v-col v-for="(url, i) in imageUrls" :key="i" cols="4">
                  <v-card relative>
                    <v-img :src="url" height="80" cover />
                    <v-btn icon size="x-small" color="error" class="position-absolute top-0 right-0" @click="removeImage(i)">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-alert type="warning" class="mt-4">Ürünü güncelledikten sonra tekrar onay bekleme sürecine gilecektir.</v-alert>
        <div class="d-flex ga-4 mt-6">
          <v-btn color="primary" size="large" type="submit" :loading="loading">Güncelle</v-btn>
          <v-btn variant="outlined" size="large" to="/satici/urunler">İptal</v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>
