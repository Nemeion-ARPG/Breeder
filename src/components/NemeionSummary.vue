<template>
    <div class="nemeion-summary">
        <div class="content">
            <label>{{ headerText }}</label>
            <label>B: {{ reference.build }} Build</label>
            <label>F: {{ reference.fur }} Fur</label>
            <label>C: {{ reference.coat }} Coat</label>
            <label>[Hereditary Markings]: {{ selectedMarkings }}</label>
            <label>[Mutations]: {{ selectedMutations }}</label>
            <label>[Traits]: {{ selectedTraits }}</label>
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
    return `${props.index + 1}) ${props.reference.gender} Cub`
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
