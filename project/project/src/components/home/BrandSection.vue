<script setup lang="ts">
defineProps<{
  brands: string[]
}>()
</script>

<template>
  <v-sheet color="grey-lighten-4" class="py-8 py-md-10">
    <v-container>
      <div class="text-h5 text-md-h4 font-weight-bold text-center mb-8">
        Popüler Markalar
      </div>

      <v-slide-group show-arrows>
        <v-slide-group-item v-for="brand in brands" :key="brand">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              :to="`/arama?q=${brand}`"
              :elevation="isHovering ? 4 : 0"
              width="140"
              height="80"
              flat
              class="ma-2 d-flex align-center justify-center"
            >
              <span class="text-subtitle-1 font-weight-bold text-medium-emphasis">
                {{ brand }}
              </span>
            </v-card>
          </v-hover>
        </v-slide-group-item>
      </v-slide-group>
    </v-container>
  </v-sheet>
</template>
