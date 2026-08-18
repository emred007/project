<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import type { Banner } from '@/types'

const adminStore = useAdminStore()
const showForm = ref(false)
const editingBanner = ref<Banner | null>(null)
const form = ref({ title: '', subtitle: '', image_url: '', link_url: '', button_text: '', is_active: true })

onMounted(() => { adminStore.fetchAllBanners() })

function openCreate() { editingBanner.value = null; form.value = { title: '', subtitle: '', image_url: '', link_url: '', button_text: '', is_active: true }; showForm.value = true }
function openEdit(banner: Banner) { editingBanner.value = banner; form.value = { title: banner.title, subtitle: banner.subtitle || '', image_url: banner.image_url, link_url: banner.link_url || '', button_text: banner.button_text || '', is_active: banner.is_active }; showForm.value = true }

async function save() {
  if (!form.value.title || !form.value.image_url) return
  if (editingBanner.value) { await adminStore.updateBanner(editingBanner.value.id, form.value) } else { await adminStore.createBanner(form.value) }
  showForm.value = false
}

async function deleteBanner(id: string) { if (confirm('Bu banneri silmek istediğinize emin misiniz?')) { await adminStore.deleteBanner(id) } }
</script>

<template>
  <v-card flat>
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h5">Banner Yönetimi</span>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Banner Ekle</v-btn>
    </v-card-title>
    <v-card-text>
      <v-row v-if="adminStore.allBanners.length">
        <v-col v-for="banner in adminStore.allBanners" :key="banner.id" cols="12" sm="6" md="4">
          <v-card flat hover>
            <v-img :src="banner.image_url" height="150" cover />
            <v-card-text>
              <div class="text-subtitle-1 font-weight-bold">{{ banner.title }}</div>
              <div class="text-caption text-grey">{{ banner.subtitle }}</div>
              <v-chip :color="banner.is_active ? 'success' : 'error'" size="x-small" class="mt-2">{{ banner.is_active ? 'Aktif' : 'Pasif' }}</v-chip>
            </v-card-text>
            <v-card-actions class="pt-0">
              <v-btn size="small" variant="text" @click="openEdit(banner)">Düzenle</v-btn>
              <v-btn size="small" variant="text" color="error" @click="deleteBanner(banner.id)">Sil</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-card v-else flat class="text-center py-8"><v-icon size="80" color="grey-lighten-1">mdi-image</v-icon><h2 class="text-h6 mt-4">Banner yok</h2></v-card>
    </v-card-text>

    <v-dialog v-model="showForm" max-width="600">
      <v-card>
        <v-card-title>{{ editingBanner ? 'Banner Düzenle' : 'Yeni Banner' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="save">
            <v-text-field v-model="form.title" label="Başlık" :rules="[(v) => !!v || 'Başlık gerekli']" />
            <v-text-field v-model="form.subtitle" label="Alt Başlık" />
            <v-text-field v-model="form.image_url" label="Resim URL" :rules="[(v) => !!v || 'Resim URL gerekli']" />
            <v-text-field v-model="form.link_url" label="Link URL" />
            <v-text-field v-model="form.button_text" label="Buton Metni" />
            <v-checkbox v-model="form.is_active" label="Aktif" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer /><v-btn variant="text" @click="showForm = false">İptal</v-btn><v-btn color="primary" @click="save">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
