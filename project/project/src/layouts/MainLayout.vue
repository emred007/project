<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ScrollToTopFab from '@/components/layout/ScrollToTopFab.vue'
</script>

<template>
  <AppHeader />
  <v-main class="bg-background overflow-x-hidden">
    <router-view v-slot="{ Component }">
      <v-fade-transition mode="out-in">
        <component :is="Component" />
      </v-fade-transition>
    </router-view>
  </v-main>
  <AppFooter />
  <ScrollToTopFab />
</template>
