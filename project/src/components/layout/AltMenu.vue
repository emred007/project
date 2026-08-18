<script setup lang="ts">
import MarkaLogosu from '@/components/layout/MarkaLogosu.vue'

const currentYear = new Date().getFullYear()

const links = {
  company: [
    { title: 'Hakkımızda', href: '#' },
    { title: 'Kariyer', href: '#' },
    { title: 'İletişim', href: '#' },
    { title: 'Blog', href: '#' },
  ],
  help: [
    { title: 'Yardım Merkezi', href: '#' },
    { title: 'Sıkça Sorulan Sorular', href: '#' },
    { title: 'İade ve Değişim', href: '#' },
    { title: 'Kargo Takibi', href: '#' },
  ],
  seller: [
    { title: 'Satıcı Ol', href: '/hesabim/guvenlik' },
    { title: 'Satıcı Paneli', href: '/satici' },
    { title: 'Satış Kılavuzu', href: '#' },
  ],
}
</script>

<template>
  <v-footer class="bg-grey-darken-3 text-white mt-auto">
    <v-container class="py-12">
      <v-row>
        <v-col cols="12" md="4" class="mb-6 mb-md-0">
          <MarkaLogosu
            :size="36"
            text-class="text-h5 font-weight-bold text-primary"
            class="mb-4"
          />
          <p class="text-body-2 text-grey-lighten-1 mb-4">
            Türkiye'nin en büyük online alışveriş platformu. Milyonlarca ürün,
            güvenli ödeme ve hızlı kargo ile alışverişin keyfini çıkarın.
          </p>
          <div class="d-flex ga-2">
            <v-btn icon variant="text" size="small" color="grey-lighten-1">
              <v-icon>mdi-facebook</v-icon>
            </v-btn>
            <v-btn icon variant="text" size="small" color="grey-lighten-1">
              <v-icon>mdi-twitter</v-icon>
            </v-btn>
            <v-btn icon variant="text" size="small" color="grey-lighten-1">
              <v-icon>mdi-instagram</v-icon>
            </v-btn>
            <v-btn icon variant="text" size="small" color="grey-lighten-1">
              <v-icon>mdi-youtube</v-icon>
            </v-btn>
          </div>
        </v-col>

        <v-col cols="6" sm="3" md="2">
          <div class="text-subtitle-1 font-weight-bold mb-4">Şirket</div>
          <v-list density="compact" bg-color="transparent" class="pa-0">
            <v-list-item
              v-for="link in links.company"
              :key="link.title"
              :href="link.href"
              :title="link.title"
              class="text-grey-lighten-1 px-0"
              min-height="32"
            />
          </v-list>
        </v-col>

        <v-col cols="6" sm="3" md="2">
          <div class="text-subtitle-1 font-weight-bold mb-4">Yardım</div>
          <v-list density="compact" bg-color="transparent" class="pa-0">
            <v-list-item
              v-for="link in links.help"
              :key="link.title"
              :href="link.href"
              :title="link.title"
              class="text-grey-lighten-1 px-0"
              min-height="32"
            />
          </v-list>
        </v-col>

        <v-col cols="6" sm="3" md="2">
          <div class="text-subtitle-1 font-weight-bold mb-4">Satıcı</div>
          <v-list density="compact" bg-color="transparent" class="pa-0">
            <v-list-item
              v-for="link in links.seller"
              :key="link.title"
              :href="link.href"
              :title="link.title"
              class="text-grey-lighten-1 px-0"
              min-height="32"
            />
          </v-list>
        </v-col>

        <v-col cols="6" sm="3" md="2">
          <div class="text-subtitle-1 font-weight-bold mb-4">Uygulama</div>
          <v-btn variant="outlined" color="grey-lighten-2" block class="mb-2">
            <v-icon start>mdi-apple</v-icon>
            App Store
          </v-btn>
          <v-btn variant="outlined" color="grey-lighten-2" block>
            <v-icon start>mdi-google-play</v-icon>
            Play Store
          </v-btn>
        </v-col>
      </v-row>

      <v-divider class="my-8" color="grey-darken-2" />

      <v-row align="center">
        <v-col cols="12" md="6" class="text-center text-md-start">
          <span class="text-caption text-grey-lighten-1">
            &copy; {{ currentYear }} Pazarium. Tüm hakları saklıdır.
          </span>
        </v-col>
        <v-col cols="12" md="6" class="d-flex justify-center justify-md-end flex-wrap ga-2">
          <v-chip size="small" variant="outlined" color="grey-lighten-1">
            Güvenli Alışveriş
          </v-chip>
          <v-chip size="small" variant="outlined" color="grey-lighten-1">
            SSL Sertifikalı
          </v-chip>
          <v-chip size="small" variant="outlined" color="grey-lighten-1">
            3D Secure
          </v-chip>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>
