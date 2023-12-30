<template>
    <div class="nemeion-summary">
        <h3>
            {{ headerText }}
        </h3>

        <div>
            <label>Gender: {{ reference.gender }}</label>
            <label>Build: {{ reference.build }}</label>
            <label>Fur: {{ reference.fur }}</label>
            <label>Coat: {{ reference.coat }}</label>
            <label>Traits: {{ selectedTraits }}</label>
            <label>Markings: {{ selectedMarkings }}</label>
            <label>Mutations: {{ selectedMutations }}</label>
        </div>
    </div>
</template>

<script setup>
import Nemeion from '@/types/Nemeion'

import { computed } from 'vue'

import DATA from '@/data.yaml'

const props = defineProps({
    index: {
        type: Number,
        required: false
    },
    reference: {
        type: Nemeion,
        required: true
    }
})
const headerText = computed(() => {
    if (props.index === undefined || props.index === null) {
        return 'Summary'
    }
    return `#${props.index + 1} Summary`
})
const selectedTraits = computed(() => {
    return props.reference.traits
        .map(trait => DATA.traits.available[trait].display_name)
        .join(', ')
})
const selectedMarkings = computed(() => {
    return props.reference.markings
        .map(marking => DATA.markings.available[marking].display_name)
        .join(', ')
})
const selectedMutations = computed(() => {
    return props.reference.mutations
        .map(mutation => DATA.mutations.available[mutation].display_name)
        .join(', ')
})
</script>

<style scoped>
.nemeion-summary label {
    display: block;
}
</style>
