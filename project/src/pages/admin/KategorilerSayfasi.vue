<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'
import type { Category } from '@/types'

const adminStore = useAdminStore()
const toast = useToastStore()
const showForm = ref(false)
const editingCategory = ref<Category | null>(null)
const form = ref({ name: '', description: '', parent_id: '', is_active: true })

onMounted(() => { adminStore.fetchAllCategories() })

function openCreate() {
  editingCategory.value = null
  form.value = { name: '', description: '', parent_id: '', is_active: true }
  showForm.value = true
}

function openEdit(category: Category) {
  editingCategory.value = category
  form.value = {
    name: category.name,
    description: category.description || '',
    parent_id: category.parent_id || '',
    is_active: category.is_active,
  }
  showForm.value = true
}

async function save() {
  if (!form.value.name.trim()) {
    toast.error('Kategori adı gerekli')
    return
  }

  if (editingCategory.value) {
    const result = await adminStore.updateCategory(editingCategory.value.id, form.value)
    if (result) {
      toast.success('Kategori güncellendi')
      showForm.value = false
    } else {
      toast.error(adminStore.error || 'Kategori güncellenemedi')
    }
  } else {
    const result = await adminStore.createCategory(form.value)
    if (result) {
      toast.success('Kategori eklendi')
      showForm.value = false
    } else {
      toast.error(adminStore.error || 'Kategori eklenemedi')
    }
  }
}

async function deleteCategory(id: string) {
  if (confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
    const ok = await adminStore.deleteCategory(id)
    if (ok) {
      toast.success('Kategori silindi')
    } else {
      toast.error(adminStore.error || 'Kategori silinemedi')
    }
  }
}
</script>

<template>
  <v-card flat>
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h5">Kategori Yönetimi</span>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Kategori Ekle</v-btn>
    </v-card-title>
    <v-card-text>
      <v-table v-if="adminStore.allCategories.length" hover>
        <thead><tr><th>Kategori</th><th>Slug</th><th>Alt Kategori</th><th>Durum</th><th>İşlemler</th></tr></thead>
        <tbody>
          <tr v-for="cat in adminStore.allCategories.filter((c) => !c.parent_id)" :key="cat.id">
            <td class="font-weight-medium">{{ cat.name }}</td>
            <td><v-chip size="small">{{ cat.slug }}</v-chip></td>
            <td>{{ adminStore.allCategories.filter((c) => c.parent_id === cat.id).length }}</td>
            <td><v-chip :color="cat.is_active ? 'success' : 'error'" size="small">{{ cat.is_active ? 'Aktif' : 'Pasif' }}</v-chip></td>
            <td>
              <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEdit(cat)" />
              <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="deleteCategory(cat.id)" />
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-card v-else flat class="text-center py-8"><v-icon size="80" color="grey-lighten-1">mdi-folder-multiple</v-icon><h2 class="text-h6 mt-4">Kategori yok</h2></v-card>
    </v-card-text>

    <v-dialog v-model="showForm" max-width="500">
      <v-card>
        <v-card-title>{{ editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="save">
            <v-text-field v-model="form.name" label="Kategori Adı" :rules="[(v) => !!v || 'Ad gerekli']" />
            <v-textarea v-model="form.description" label="Açıklama" rows="2" />
            <v-checkbox v-model="form.is_active" label="Aktif" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer /><v-btn variant="text" @click="showForm = false">İptal</v-btn><v-btn color="primary" :loading="adminStore.loading" @click="save">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
