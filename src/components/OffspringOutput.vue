<template>
    <section class="offspring-output container">
        <header>
            <h2>{{ title }}</h2>
        </header>

        <p v-if="hasBlessing" class="gift-blessing-section">
            🌟 A god has blessed this litter! 🌟
        </p>
        <p v-if="hasCurse" class="gift-curse-section">
            ⚡ A god has cursed this litter! ⚡
        </p>

        <p v-if="offspring.length > 0 && (fatherName || motherName)" class="parent-names-section">
            <a v-if="fatherUrl" :href="fatherUrl" target="_blank" class="parent-link">{{ fatherName || 'Unknown' }}</a>
            <span v-else>{{ fatherName || 'Unknown' }}</span>
            X 
            <a v-if="motherUrl" :href="motherUrl" target="_blank" class="parent-link">{{ motherName || 'Unknown' }}</a>
            <span v-else>{{ motherName || 'Unknown' }}</span>
        </p>

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
    },
    fatherName: {
        type: String,
        required: true
    },
    motherName: {
        type: String,
        required: true
    },
    fatherUrl: {
        type: String,
        required: true
    },
    motherUrl: {
        type: String,
        required: true
    }
})
defineEmits(['generateOffspring', 'reset', 'generateRandom'])

import { computed } from 'vue'

const hasGift = computed(() => {
    return props.offspring.some(cub => cub.fur)
})

const hasBlessing = computed(() => {
    return props.offspring.some(cub => cub.fur && cub.fur.includes('(Blessing)'))
})

const hasCurse = computed(() => {
    return props.offspring.some(cub => cub.fur && cub.fur.includes('(Curse)'))
})

const copyResults = async () => {
    let text = ''
    
    // Add blessing/curse message if any cub has a gift
    if (hasBlessing.value) {
        text += '🌟 A god has blessed this litter! At least one cub in this litter bears the mark of divine favor. 🌟\n.\n'
    }
    if (hasCurse.value) {
        text += '⚡ A god has cursed this litter! At least one cub in this litter bears the mark of divine wrath. ⚡\n.\n'
    }
    
    // Add parent names if provided
    if (props.fatherName || props.motherName) {
        const fatherText = props.fatherUrl 
            ? `<a href="${props.fatherUrl}">${props.fatherName || 'Unknown'}</a>`
            : (props.fatherName || 'Unknown')
        const motherText = props.motherUrl
            ? `<a href="${props.motherUrl}">${props.motherName || 'Unknown'}</a>`
            : (props.motherName || 'Unknown')
        text += `${fatherText} x ${motherText}\n.\n`
    }
    
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
                // Italicize Legendary markings
                if (markingData.quality === 'Legendary') {
                    return `*${displayName}*`
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
        
        text += '.\n'
    })
    
    // Limited Markings section
    if (props.limitedMarkings.length > 0) {
        text += 'The following **Limited Markings** may be applied freely to any cub in this litter at any time throughout the year:\n'
        const limitedMarkingsText = props.limitedMarkings
            .map(marking => {
                const markingData = DATA.markings.available[marking]
                const displayName = markingData.display_name


    // Italicize Legendary markings
    if (markingData.quality === 'Legendary') {
        return `*${displayName}*`
            }
                return displayName
            })
            .join(', ')
        text += `**${limitedMarkingsText}**\n`
    }
    
    // Create HTML version with clickable links
    const htmlText = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
    
    try {
        // Copy both plain text and HTML to clipboard
        await navigator.clipboard.write([
            new ClipboardItem({
                'text/plain': new Blob([text], { type: 'text/plain' }),
                'text/html': new Blob([htmlText], { type: 'text/html' })
            })
        ])
        alert('Results copied to clipboard!')
    } catch (err) {
        // Fallback to plain text only if rich clipboard fails
        try {
            await navigator.clipboard.writeText(text)
            alert('Results copied to clipboard!')
        } catch (fallbackErr) {
            console.error('Failed to copy:', fallbackErr)
            alert('Failed to copy results to clipboard')
        }
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

.gift-blessing-section {
    margin: 1rem 0;
    padding: 1rem;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--color-heading);
    background: linear-gradient(135deg, var(--color-background-soft) 0%, var(--color-background-mute) 100%);
    border: 2px solid var(--color-border-hover);
    border-radius: 0.5rem;
}

.gift-curse-section {
    margin: 1rem 0;
    padding: 1rem;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--color-heading);
    background: linear-gradient(135deg, var(--color-background-soft) 0%, var(--color-background-mute) 100%);
    border: 2px solid var(--color-border-hover);
    border-radius: 0.5rem;
}

.parent-names-section {
    margin: 1rem 0;
    padding: 0.75rem;
    text-align: center;
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--color-text);
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border);
    border-radius: 0.25rem;
}

.parent-link {
    color: var(--color-heading);
    text-decoration: none;
    border-bottom: 1px solid var(--color-heading);
}

.parent-link:hover {
    color: var(--color-border-hover);
    border-bottom-color: var(--color-border-hover);
}
</style>
