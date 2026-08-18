<script setup lang="ts">
import UstMenu from '@/components/layout/UstMenu.vue'
import AltMenu from '@/components/layout/AltMenu.vue'
import YukariKaydirButonu from '@/components/layout/YukariKaydirButonu.vue'
</script>

<template>
  <UstMenu />
  <v-main class="bg-background overflow-x-hidden">
    <router-view v-slot="{ Component }">
      <v-fade-transition mode="out-in">
        <component :is="Component" />
      </v-fade-transition>
    </router-view>
  </v-main>
  <AltMenu />
  <YukariKaydirButonu />
</template>
