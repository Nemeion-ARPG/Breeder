<template>
    <section class="offspring-output container">
        <header>
            <h2>{{ title }}</h2>
        </header>

        <div
            class="offspring-list"
            v-for="(offspring, index) in offspring"
        >
            <NemeionSummary
                :index="index"
                :reference="offspring"
                :filter-limited-markings="true"
            />

            <hr />
        </div>

        <p v-if="offspring.length > 0 && limitedMarkings.length > 0" class="limited-markings-section">
            The following <b>Limited Markings</b> may be applied freely to any cub in this litter at any time throughout the year:
            <br />
            <b>{{ limitedMarkings.join(', ') }}</b>
        </p>

        <footer>
            <BButton
                class="primary-button"
                @click="$emit('generateOffspring')"
                variant="secondary"
            >Roll</BButton>

            <BButton
                class="primary-button"
                @click="$emit('generateRandom')"
                variant="secondary"
            >Random</BButton>

            <BButton
                v-if="offspring.length > 0"
                class="primary-button"
                @click="copyResults"
                variant="secondary"
            >Copy Results</BButton>

            <BButton
                class="secondary-button"
                @click="$emit('reset')"
                variant="dark"
            >Reset</BButton>
        </footer>
    </section>
</template>

<script setup>
import { LIMITED_MARKINGS } from '@/Constants';
import NemeionSummary from '@/components/NemeionSummary.vue'

import Nemeion from '@/types/Nemeion'
import DATA from '@/data.yaml'

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    offspring: {
        type: Array,
        required: true,
        validator(value) {
            return value.every((element) => element instanceof Nemeion)
        }
    },
    limitedMarkings: {
        type: Array,
        required: true,
        validator(value) {
            return value.every(element => typeof element === 'string')
                && value.every(element => LIMITED_MARKINGS.allValues.includes(element))
        }
    }
})
defineEmits(['generateOffspring', 'reset', 'generateRandom'])

const copyResults = async () => {
    let text = ''
    
    props.offspring.forEach((cub, index) => {
        // Header
        text += `${index + 1}) ${cub.gender} Cub\n`
        
        // Build and Coat
        text += `**B:** ${cub.build} Build\n`
        text += `**C:** ${cub.coat} Coat\n`
        
        // Hereditary Markings
        const hereditaryMarkingsArray = cub.markings
            .filter(marking => !cub.limitedMarkings.includes(marking))
            .map(marking => {
                const markingData = DATA.markings.available[marking]
                const displayName = markingData.display_name
                // Bold Legendary markings - use zero-width space to prevent ** collision
                if (markingData.quality === 'Legendary') {
                    return `\u200B**${displayName}**`
                }
                return displayName
            })
        const hereditaryMarkings = hereditaryMarkingsArray.length > 0 ? hereditaryMarkingsArray.join(', ') : 'None'
        text += `**[Hereditary Markings]:** ${hereditaryMarkings}\n`
        
        // Mutations (if present)
        if (cub.mutations.length > 0) {
            const mutations = cub.mutations
                .map(mutation => DATA.mutations.available[mutation].display_name)
                .join(', ')
            text += `**[Mutations]:** ${mutations}\n`
        }
        
        // Traits (if present)
        if (cub.traits.length > 0) {
            const traits = cub.traits
                .map(trait => DATA.traits.available[trait].display_name)
                .join(', ')
            text += `**[Traits]:** ${traits}\n`
        }
        
        // Gift (if present)
        if (cub.fur) {
            text += `**[Gift]:** ${cub.fur}\n`
        }
        
        text += '\n.\n\n'
    })
    
    // Limited Markings section
    if (props.limitedMarkings.length > 0) {
        text += 'The following **Limited Markings** may be applied freely to any cub in this litter at any time throughout the year:\n'
        const limitedMarkingsText = props.limitedMarkings
            .map(marking => {
                const markingData = DATA.markings.available[marking]
                const displayName = markingData.display_name
                // Bold Legendary markings
                if (markingData.quality === 'Legendary') {
                    return `**${displayName}**`
                }
                return displayName
            })
            .join(', ')
        text += `${limitedMarkingsText}\n`
    }
    
    try {
        await navigator.clipboard.writeText(text)
        alert('Results copied to clipboard!')
    } catch (err) {
        console.error('Failed to copy:', err)
        alert('Failed to copy results to clipboard')
    }
}
</script>

<style scoped>
footer {
    display: flex;
    justify-content: space-evenly;    
    margin-bottom: 0.5rem;
}

:deep(.btn) {
    padding: 0.3rem 1.25rem;
}

:deep(.btn-check + .btn) {
    color: var(--color-text);
    background-color: var(--color-background-mute);
}

:deep(.btn-dark) {
    color: var(--color-text);
    background-color: var(--color-border-hover);
}

:deep(.btn-secondary) {
    color: var(--color-heading);
    background-color: var(--color-background-mute);
}

.limited-markings-section {
    margin: 1rem 0;
    padding: 0.75rem;
    background-color: var(--color-background-soft);
    border-left: 3px solid var(--color-border-hover);
}
</style>
