<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    showText?: boolean
    textClass?: string
  }>(),
  {
    size: 32,
    showText: true,
    textClass: 'text-h6 font-weight-bold text-primary',
  }
)
</script>

<template>
  <div class="d-flex align-center ga-2">
    <img
      src="/pazarium-logo.svg"
      :width="size"
      :height="size"
      alt=""
      class="flex-shrink-0"
      aria-hidden="true"
    />
    <span v-if="showText" :class="textClass">Pazarium</span>
  </div>
</template>
