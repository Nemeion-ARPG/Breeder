<template>
    <div class="nemeion-summary">
        <h3>
            {{ headerText }}
        </h3>

        <div class="content">
            <label>GENDER: {{ reference.gender }}</label>
            <label>BUILD: {{ reference.build }}</label>
            <label>FUR: {{ reference.fur }}</label>
            <label>COAT: {{ reference.coat }}</label>
            <label>TRAITS: {{ selectedTraits }}</label>
            <label>MARKINGS: {{ selectedMarkings }}</label>
            <label>MUTATIONS: {{ selectedMutations }}</label>
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

.nemeion-summary .content > * {
    margin: 0.5rem 0;
}
</style>
