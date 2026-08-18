<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGoTo } from 'vuetify'

const visible = ref(false)
const goTo = useGoTo()

function onScroll() {
  visible.value = window.scrollY > 300
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <v-fade-transition>
    <v-btn
      v-show="visible"
      icon="mdi-chevron-up"
      color="primary"
      elevation="8"
      size="large"
      class="position-fixed"
      style="bottom: 24px; right: 24px; z-index: 1006"
      aria-label="Yukarı çık"
      @click="goTo(0, { duration: 400, easing: 'easeInOutCubic' })"
    />
  </v-fade-transition>
</template>
