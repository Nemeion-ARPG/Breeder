<template>
  <h1>
    Nemeion Breeder
  </h1>

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
      :apollo-feather-enabled="den.apolloFeatherEnabled"
      :selected-apollo-marking="den.selectedApolloMarking"
      :available-markings-for-apollo="availableMarkingsForApollo"
      :rank1-enabled="den.rank1Enabled"
      @update:apollo-feather-enabled="den.apolloFeatherEnabled = $event"
      @update:selected-apollo-marking="den.selectedApolloMarking = $event"
      @update:rank1-enabled="den.rank1Enabled = $event"
    />

    <OffspringOutput
      class="full-width-column"
      title="Offspring"
      :offspring="den.offspring"
      :limited-markings="[...den.father.limitedMarkings, ...den.mother.limitedMarkings]"
      :father-name="den.father.name"
      :mother-name="den.mother.name"
      :father-url="den.father.url"
      :mother-url="den.mother.url"
      :rank1-enabled="den.rank1Enabled"
      @generateOffspring="den.makeOffspring()"
      @reset="den.$reset()"
      @generateRandom="den.makeRandom()"
      @generateRandom5="den.makeRandom5()"
    />
  </main>
</template>

<script setup>
import ParentBuilder from '@/components/ParentBuilder.vue'
import AddonSelector from '@/components/AddonSelector.vue'
import OffspringOutput from '@/components/OffspringOutput.vue'

import denStore from '@/stores/den'
import { computed } from 'vue'
import { MARKINGS } from '@/Constants'

import DATA from '@/data.yaml'

const den = denStore()

const availableAddons = Object.entries(DATA.add_ons).map(([key, value]) => {
  return {
    id: key,
    ...value
  }
})

const availableMarkingsForApollo = computed(() => {
  return [
    { value: null, text: 'Select a marking...' },
    ...MARKINGS.allValues.map(marking => ({
      value: marking,
      text: DATA.markings.available[marking].display_name
    }))
  ]
})
</script>

<style scoped>
.full-width-column {
  width: 100%;
}

h1 {
  font-family: Georgia, serif;
  margin-bottom: 2rem;
}

@media (min-width: 1024px) {
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
