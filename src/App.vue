<template>
  <header>
    Nemeion Breeder
  </header>

  <main>
    <ParentBuilder
      class="full-width-column"
      title="Father"
      v-model:parentRef="den.father"
      :otherParentRef="den.mother"
    />

    <ParentBuilder
      class="full-width-column"
      title="Mother"
      v-model:parentRef="den.mother"
      :otherParentRef="den.father"
    />

    <AddonSelector
      class="full-width-column"
      title="Addons"
      v-model="den.selectedAddons"
      :available-addons="availableAddons"
    />

    <OffspringOutput
      class="full-width-column"
      title="Offspring"
      :offspring="den.offspring"
      @generateOffspring="den.makeOffspring()"
      @reset="den.$reset()"
      @generateRandom="den.makeRandom()"
    />
  </main>
</template>

<script setup>
import ParentBuilder from '@/components/ParentBuilder.vue'
import AddonSelector from '@/components/AddonSelector.vue'
import OffspringOutput from '@/components/OffspringOutput.vue'

import denStore from '@/stores/den'

import DATA from '@/data.yaml'

const den = denStore()

const availableAddons = Object.entries(DATA.add_ons).map(([key, value]) => {
  return {
    id: key,
    ...value
  }
})
</script>

<style scoped>

.full-width-column {
  width: 100%;
}

@media (min-width: 1024px) {
  header {
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  main {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 0.5rem;
  }
}

@media (min-width: 1600px) {
  main {
    max-width: 1600px;
    margin: 0 auto;
  }
}
</style>
