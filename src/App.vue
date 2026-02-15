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
      :reset-nonce="resetNonce"
    />

    <ParentBuilder
      class="full-width-column"
      title="Mother"
      v-model:parentRef="den.mother"
      :otherParentRef="den.father"
      :reset-nonce="resetNonce"
    />

    <AddonSelector
      class="full-width-column"
      title="Addons"
      v-model="den.selectedAddons"
      :available-addons="availableAddons"
      :apollo-feather-enabled="den.apolloFeatherEnabled"
      :selected-apollo-marking="den.selectedApolloMarking"
      :available-markings-for-apollo="availableMarkingsForApollo"
      :heritage-enabled="den.heritageEnabled"
      :selected-heritage-trait="den.selectedHeritageTrait"
      :heritage-double-enabled="den.heritageDoubleEnabled"
      :selected-heritage-double-trait="den.selectedHeritageDoubleTrait"
      :available-traits-for-heritage="availableTraitsForHeritage"
      :rank1-enabled="den.rank1Enabled"
      :inbreeding-enabled="den.inbreedingEnabled"
      @update:apollo-feather-enabled="den.apolloFeatherEnabled = $event"
      @update:selected-apollo-marking="den.selectedApolloMarking = $event"
      @update:heritage-enabled="den.heritageEnabled = $event"
      @update:selected-heritage-trait="den.selectedHeritageTrait = $event"
      @update:heritage-double-enabled="den.heritageDoubleEnabled = $event"
      @update:selected-heritage-double-trait="den.selectedHeritageDoubleTrait = $event"
      @update:rank1-enabled="den.rank1Enabled = $event"
      @update:inbreeding-enabled="den.inbreedingEnabled = $event"
    />

    <OffspringOutput
      class="full-width-column"
      title="Offspring"
      :offspring="den.offspring"
      :limited-markings="limitedMarkingsSorted"
      :father-name="den.father.name"
      :mother-name="den.mother.name"
      :father-url="den.father.url"
      :mother-url="den.mother.url"
      :rank1-enabled="den.rank1Enabled"
      @generateOffspring="den.makeOffspring()"
      @reset="resetAll"
      @generateRandom="den.makeRandom()"
      @generateRandom1="den.makeRandom1()"
      @generateRandom5="den.makeRandom5()"
    />
  </main>
</template>

<script setup>
import ParentBuilder from '@/components/ParentBuilder.vue'
import AddonSelector from '@/components/AddonSelector.vue'
import OffspringOutput from '@/components/OffspringOutput.vue'

import denStore from '@/stores/den'
import { computed, ref } from 'vue'
import { MARKINGS, MUTATIONS, COATS } from '@/Constants'

import DATA from '@/data.yaml'

const den = denStore()

const resetNonce = ref(0)

const resetAll = () => {
  den.$reset()
  resetNonce.value += 1
}

const limitedMarkingsSorted = computed(() => {
  const combined = [...den.father.limitedMarkings, ...den.mother.limitedMarkings]
  return [...new Set(combined)].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
})

const availableAddons = Object.entries(DATA.add_ons).map(([key, value]) => {
  return {
    id: key,
    ...value
  }
})

const availableMarkingsForApollo = computed(() => {
  return [
    { value: null, text: 'Select a marking...' },
    ...MARKINGS.allValues
      .filter(marking => DATA.markings.available[marking].quality !== 'Limited')
      .map(marking => ({
        value: marking,
        text: DATA.markings.available[marking].display_name
      }))
  ]
})

const availableTraitsForHeritage = computed(() => {
  return [
    { value: null, text: 'Select a trait...' },
    // Markings (excluding Limited)
    ...MARKINGS.allValues
      .filter(marking => DATA.markings.available[marking].quality !== 'Limited')
      .map(marking => ({
        value: `marking:${marking}`,
        text: `[Marking] ${DATA.markings.available[marking].display_name}`
      })),
    // Mutations
    ...MUTATIONS.allValues.map(mutation => ({
      value: `mutation:${mutation}`,
      text: `[Mutation] ${DATA.mutations.available[mutation].display_name}`
    })),
    // Coats
    ...COATS.allValues.map(coat => ({
      value: `coat:${coat}`,
      text: `[Coat] ${coat} Coat`
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
