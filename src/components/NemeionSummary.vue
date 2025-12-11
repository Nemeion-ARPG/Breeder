<template>
    <div class="nemeion-summary">
        <div class="content">
            <label>{{ headerText }}</label>
            <label>B: {{ reference.build }} Build</label>
            <label>C: {{ reference.coat }} Coat</label>
            <label>[Hereditary Markings]: <span v-html="selectedMarkings"></span></label>
            <label v-if="reference.mutations.length > 0">[Mutations]: {{ selectedMutations }}</label>
            <label v-if="reference.traits.length > 0">[Traits]: {{ selectedTraits }}</label>
            <label v-if="reference.titan_traits.length > 0">[Titan Traits]: {{ selectedTitanTraits }}</label>
            <label v-if="reference.fur">[Gift]: {{ reference.fur }}</label>

        </div>
    </div>
</template>

<script setup>
import Nemeion from '@/types/Nemeion'

import { computed } from 'vue'

import DATA from '@/data.yaml'
import { MARKING_QUALITIES } from '@/Constants';

const props = defineProps({
    index: {
        type: Number,
        required: false
    },
    filterLimitedMarkings: {
        type: Boolean,
        required: false,
        default: false
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
const selectedTitanTraits = computed(() => {
    return props.reference.titan_traits
        .map(trait => DATA.titan_traits.available[trait].display_name)
        .join(', ')
})
const selectedMarkings = computed(() => {
    const markings = props.reference.markings
        .filter(marking => {
            console.log('fizz', props.reference.limitedMarkings)
            return props.filterLimitedMarkings
                ? !props.reference.limitedMarkings.includes(marking)
                : true
        })
        .map(marking => {
            const markingData = DATA.markings.available[marking]
            const displayName = markingData.display_name
            // Italicize Legendary markings
            if (markingData.quality === 'Legendary') {
                return `<i>${displayName}</i>`
            }
            return displayName
        })
        .join(', ')
    
    return markings || 'None'
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
