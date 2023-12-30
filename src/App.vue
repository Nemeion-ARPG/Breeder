<template>
  <header>
    Nemeion Breeder
  </header>

  <main>
    <ParentBuilder
      title="Father"
      v-model:parentRef="den.father"
      :otherParentRef="den.mother"
    />
    <ParentBuilder
      title="Mother"
      v-model:parentRef="den.mother"
      :otherParentRef="den.father"
    />
  </main>
</template>

<script setup>
import ParentBuilder from '@/components/ParentBuilder.vue'

import denStore from '@/stores/den'

const den = denStore()
</script>

<style scoped>
header {
  line-height: 1.5;
}

@media (min-width: 1024px) {
  header {
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
}
</style>
