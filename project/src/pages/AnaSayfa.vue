<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/product/UrunKarti.vue'
import CategorySection from '@/components/home/KategoriBolumu.vue'
import NewArrivalsSection from '@/components/home/YeniGelenlerBolumu.vue'

const productStore = useProductStore()
const { height, smAndUp, mdAndUp } = useDisplay()

const currentSlide = ref(0)
const skeletons = ref(true)

const fallbackBanners = [
  {
    title: 'Yeni Sezon Fırsatları',
    subtitle: 'Tüm moda ürünlerde %50\'ye varan indirim!',
    image: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=1920',
    link: '/kategori/moda',
  },
  {
    title: 'Elektronik Festivali',
    subtitle: 'En yeni teknolojik ürünler burada!',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1920&q=80',
    link: '/kategori/elektronik',
  },
  {
    title: 'Ev Dekorasyonu',
    subtitle: 'Evinizi yenileyin, %40 indirim fırsatı!',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920',
    link: '/kategori/ev-yasam',
  },
]

const banners = computed(() => {
  if (productStore.banners.length) {
    return productStore.banners.map((b) => ({
      title: b.title,
      subtitle: b.subtitle || '',
      image: b.image_url,
      link: b.link_url || '/kategori',
    }))
  }
  return fallbackBanners
})

const reviews = [
  { name: 'Ahmet Y.', rating: 5, text: 'Mükemmel alışveriş deneyimi! Ürün tam açıklandığı gibi geldi.' },
  { name: 'Fatma K.', rating: 5, text: 'Hızlı kargo ve güvenli paketleme. Kesinlikle tavsiye ederim.' },
  { name: 'Mehmet S.', rating: 5, text: 'Fiyat/performans olarak harika. Tekrar alışveriş yapacağım.' },
]

const carouselHeight = computed(() => {
  if (mdAndUp.value) return Math.min(Math.round(height.value * 0.55), 560)
  if (smAndUp.value) return 380
  return 280
})

onMounted(async () => {
  skeletons.value = true
  await Promise.all([
    productStore.fetchCategories(),
    productStore.fetchBanners(),
    productStore.fetchFeaturedProducts(8),
    productStore.fetchBestsellers(8),
    productStore.fetchNewArrivals(8),
  ])
  skeletons.value = false
})

const featuredProducts = computed(() => productStore.featuredProducts)
const bestsellers = computed(() => productStore.bestsellers)
const newArrivals = computed(() => productStore.newArrivals)
const categories = computed(() => productStore.categories)

let slideInterval: number | undefined

onMounted(() => {
  slideInterval = window.setInterval(() => {
    const count = banners.value.length || 1
    currentSlide.value = (currentSlide.value + 1) % count
  }, 5000)
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
})
</script>

<template>
  <div>
    <v-carousel
      v-model="currentSlide"
      :height="carouselHeight"
      hide-delimiter-background
      show-arrows="hover"
      cycle
      interval="5000"
      rounded="0"
    >
      <v-carousel-item
        v-for="(banner, index) in banners"
        :key="banner.title + index"
      >
        <v-img
          :src="banner.image"
          :height="carouselHeight"
          cover
          gradient="to right, rgba(0,0,0,.75), rgba(0,0,0,.15)"
        >
          <v-container class="fill-height d-flex align-center">
            <v-row class="w-100">
              <v-col cols="12" md="7" lg="6">
                <div class="text-h4 text-sm-h3 text-md-h2 font-weight-bold text-white mb-4">
                  {{ banner.title }}
                </div>
                <div class="text-body-1 text-sm-h6 text-white mb-6">
                  {{ banner.subtitle }}
                </div>
                <v-btn
                  color="primary"
                  size="large"
                  :to="banner.link"
                >
                  {{ productStore.banners[index]?.button_text || 'Hemen Keşfet' }}
                  <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-img>
      </v-carousel-item>
    </v-carousel>

    <CategorySection :categories="categories" :loading="skeletons" />

    <v-sheet color="background" class="py-8 py-md-10">
      <v-container>
        <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-2">
          <div class="text-h5 text-md-h4 font-weight-bold">Öne Çıkan Ürünler</div>
          <v-btn variant="text" color="primary" to="/kategori" append-icon="mdi-arrow-right">
            Tümünü Gör
          </v-btn>
        </div>

        <v-row v-if="skeletons" dense>
          <v-col v-for="i in 4" :key="i" cols="6" sm="4" md="3">
            <v-skeleton-loader type="card" height="350" />
          </v-col>
        </v-row>

        <v-row v-else dense>
          <v-col
            v-for="product in featuredProducts"
            :key="product.id"
            cols="6"
            sm="4"
            md="3"
          >
            <ProductCard :product="product" />
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>

    <v-sheet color="surface" class="py-8 py-md-10">
      <v-container>
        <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-2">
          <div class="text-h5 text-md-h4 font-weight-bold d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-fire</v-icon>
            Çok Satanlar
          </div>
          <v-btn variant="text" color="primary" to="/kategori" append-icon="mdi-arrow-right">
            Tümünü Gör
          </v-btn>
        </div>

        <v-slide-group show-arrows>
          <v-slide-group-item v-for="product in bestsellers" :key="product.id">
            <div class="ma-2" style="width: 240px">
              <ProductCard :product="product" />
            </div>
          </v-slide-group-item>
        </v-slide-group>
      </v-container>
    </v-sheet>

    <NewArrivalsSection :products="newArrivals" :loading="skeletons" />

    <v-sheet color="primary" class="py-12 py-md-16">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="7" class="text-center text-md-start">
            <div class="text-h4 text-md-h3 font-weight-bold text-white mb-4">
              Satıcı Olun, Kazancınızı Artırın!
            </div>
            <p class="text-body-1 text-md-h6 text-white mb-6" style="opacity: 0.9">
              Milyonlarca müşteriye ulaşın, ürünlerinizi güvenli bir platformda satın.
            </p>
            <v-btn color="surface" size="x-large" to="/hesabim/guvenlik">
              Hemen Başla
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="12" md="5" class="text-center d-none d-md-flex justify-center">
            <v-icon size="180" color="white" class="opacity-20">mdi-store</v-icon>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>

    <v-sheet color="background" class="py-8 py-md-10">
      <v-container>
        <div class="text-h5 text-md-h4 font-weight-bold text-center mb-8">
          Müşterilerimiz Ne Diyor?
        </div>
        <v-row dense>
          <v-col v-for="review in reviews" :key="review.name" cols="12" md="4">
            <v-card color="surface" class="pa-6 h-100" rounded="xl">
              <div class="d-flex align-center mb-4">
                <v-avatar color="primary" size="48" class="mr-3">
                  <span class="text-h6 text-white">{{ review.name[0] }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-bold">{{ review.name }}</div>
                  <v-rating :model-value="review.rating" color="star" density="compact" readonly />
                </div>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0">{{ review.text }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
  </div>
</template>
