<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()
const search = ref('')
const roleFilter = ref('')

onMounted(() => {
  adminStore.fetchAllUsers()
})

const filteredUsers = computed(() => {
  let users = adminStore.allUsers
  if (search.value) {
    users = users.filter((u) =>
      u.full_name?.toLowerCase().includes(search.value.toLowerCase()) ||
      u.email.toLowerCase().includes(search.value.toLowerCase())
    )
  }
  if (roleFilter.value) {
    users = users.filter((u) => u.role === roleFilter.value)
  }
  return users
})

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('tr-TR')
}

function getRoleColor(role: string): string {
  const colors: Record<string, string> = { admin: 'error', seller: 'success', user: 'primary' }
  return colors[role] || 'grey'
}

function getRoleText(role: string): string {
  const texts: Record<string, string> = { admin: 'Admin', seller: 'Satıcı', user: 'Kullanıcı' }
  return texts[role] || role
}

async function changeRole(userId: string, newRole: 'user' | 'seller' | 'admin') {
  await adminStore.updateUserRole(userId, newRole)
}
</script>

<template>
  <v-card flat>
    <v-card-title class="d-flex flex-wrap justify-space-between align-center ga-4">
      <span class="text-h5">Kullanıcı Yönetimi</span>
    </v-card-title>
    <v-card-text>
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="4">
          <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Kullanıcı ara..." density="compact" hide-details />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select v-model="roleFilter" :items="[{ title: 'Tümü', value: '' }, { title: 'Admin', value: 'admin' }, { title: 'Satıcı', value: 'seller' }, { title: 'Kullanıcı', value: 'user' }]" label="Rol" density="compact" hide-details />
        </v-col>
      </v-row>
      <v-table v-if="filteredUsers.length" hover>
        <thead>
          <tr>
            <th>Kullanıcı</th>
            <th>E-posta</th>
            <th>Rol</th>
            <th>Kayıt Tarihi</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>
              <div class="d-flex align-center ga-3">
                <v-avatar color="primary" size="40"><span class="text-white text-body-2">{{ (user.full_name || user.username || '?')[0] }}</span></v-avatar>
                <div><div class="font-weight-medium">{{ user.full_name || user.username }}</div><div class="text-caption text-grey">@{{ user.username }}</div></div>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td><v-chip :color="getRoleColor(user.role)" size="small">{{ getRoleText(user.role) }}</v-chip></td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <v-menu>
                <template #activator="{ props }"><v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props" /></template>
                <v-list density="compact">
                  <v-list-item @click="changeRole(user.id, 'admin')"><v-list-item-title>Admin Yap</v-list-item-title></v-list-item>
                  <v-list-item @click="changeRole(user.id, 'seller')"><v-list-item-title>Satıcı Yap</v-list-item-title></v-list-item>
                  <v-list-item @click="changeRole(user.id, 'user')"><v-list-item-title>Kullanıcı Yap</v-list-item-title></v-list-item>
                </v-list>
              </v-menu>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-card v-else flat class="text-center py-8"><v-icon size="80" color="grey-lighten-1">mdi-account-group</v-icon><h2 class="text-h6 mt-4">Kullanıcı bulunamadı</h2></v-card>
    </v-card-text>
  </v-card>
</template>
