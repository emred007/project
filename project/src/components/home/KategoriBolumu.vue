<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '@/types'
import { DEMO_CATEGORIES } from '@/data/demoProducts'

const props = defineProps<{
  categories: Category[]
  loading: boolean
}>()

const categoryImages = Object.fromEntries(
  DEMO_CATEGORIES.map((c) => [c.slug, c.image_url])
) as Record<string, string | undefined>

const rootCategories = computed(() =>
  props.categories.filter((c) => !c.parent_id)
)

function getCategoryImage(category: Category): string {
  return (
    category.image_url ||
    categoryImages[category.slug] ||
    'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800'
  )
}
</script>

<template>
  <v-sheet color="surface" class="py-8 py-md-10">
    <v-container>
      <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-2">
        <div class="text-h5 text-md-h4 font-weight-bold">
          Kategorilere Göz Atın
        </div>
        <v-btn variant="text" color="primary" to="/kategori" append-icon="mdi-arrow-right">
          Tümünü Gör
        </v-btn>
      </div>

      <v-row v-if="loading" dense>
        <v-col v-for="i in 8" :key="i" cols="6" sm="4" md="3">
          <v-skeleton-loader type="image, text" height="200" />
        </v-col>
      </v-row>

      <v-row v-else dense>
        <v-col
          v-for="category in rootCategories"
          :key="category.id"
          cols="6"
          sm="4"
          md="3"
        >
          <v-hover v-slot="{ isHovering, props: hoverProps }">
            <v-card
              v-bind="hoverProps"
              :to="{ name: 'category', params: { slug: category.slug } }"
              :elevation="isHovering ? 8 : 2"
              rounded="xl"
              class="overflow-hidden"
            >
              <v-img
                :src="getCategoryImage(category)"
                height="180"
                cover
                gradient="to top, rgba(0,0,0,.75), rgba(0,0,0,.05)"
              >
                <div class="fill-height d-flex flex-column justify-end pa-4">
                  <div class="text-h6 font-weight-bold text-white">
                    {{ category.name }}
                  </div>
                  <div
                    v-if="category.description"
                    class="text-caption text-white text-medium-emphasis text-truncate"
                  >
                    {{ category.description }}
                  </div>
                  <v-fade-transition>
                    <div v-if="isHovering" class="d-flex align-center mt-2">
                      <span class="text-caption font-weight-medium text-primary">Keşfet</span>
                      <v-icon size="small" color="primary" class="ml-1">mdi-arrow-right</v-icon>
                    </div>
                  </v-fade-transition>
                </div>
              </v-img>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>
