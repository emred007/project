<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/plugins/supabase'
import type { Notification } from '@/types'

const authStore = useAuthStore()
const notifications = ref<Notification[]>([])
const loading = ref(false)

onMounted(fetchNotifications)

async function fetchNotifications() {
  if (!authStore.user) return
  loading.value = true
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', authStore.user.id)
    .order('created_at', { ascending: false })
    .limit(50)
  if (data) notifications.value = data as Notification[]
  loading.value = false
}

async function markAsRead(id: string) {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  const index = notifications.value.findIndex((n) => n.id === id)
  if (index !== -1) notifications.value[index].is_read = true
}

async function markAllAsRead() {
  if (!authStore.user) return
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', authStore.user.id)
  notifications.value.forEach((n) => (n.is_read = true))
}

function getIcon(type: string): string {
  const icons: Record<string, string> = {
    info: 'mdi-information',
    success: 'mdi-check-circle',
    warning: 'mdi-alert',
    error: 'mdi-alert-circle',
  }
  return icons[type] || 'mdi-bell'
}

function getColor(type: string): string {
  const colors: Record<string, string> = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error',
  }
  return colors[type] || 'grey'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <v-card flat>
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h5">Bildirimler</span>
      <v-btn variant="text" color="primary" @click="markAllAsRead">
        Tümünü Okundu İşaretle
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-list v-if="notifications.length">
        <v-list-item
          v-for="notification in notifications"
          :key="notification.id"
          :class="{ 'bg-grey-lighten-4': !notification.is_read }"
          class="mb-2 rounded"
          @click="notification.is_read = true; markAsRead(notification.id)"
        >
          <template #prepend>
            <v-avatar :color="getColor(notification.type)" size="40">
              <v-icon color="white">{{ getIcon(notification.type) }}</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-bold">
            {{ notification.title }}
          </v-list-item-title>
          <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>

          <template #append>
            <span class="text-caption text-grey">{{ formatDate(notification.created_at) }}</span>
          </template>
        </v-list-item>
      </v-list>

      <v-card v-else flat class="text-center py-8">
        <v-icon size="80" color="grey-lighten-1">mdi-bell-outline</v-icon>
        <h2 class="text-h6 mt-4">Henüz bildirim yok</h2>
      </v-card>
    </v-card-text>
  </v-card>
</template>
