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

defineProps({
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
