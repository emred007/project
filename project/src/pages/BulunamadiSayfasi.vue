<script setup lang="ts">
</script>

<template>
  <v-container fluid class="fill-height bg-background">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4" class="text-center">
        <div class="text-display-4 font-weight-bold text-primary mb-4">404</div>
        <h1 class="text-h4 font-weight-bold mb-4">Sayfa Bulunamadı</h1>
        <p class="text-body-1 text-grey mb-6">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <v-btn color="primary" size="large" to="/">
          <v-icon start>mdi-home</v-icon>
          Ana Sayfaya Dön
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
