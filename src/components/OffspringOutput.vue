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

            <p v-if="limitedMarkings.length > 0">
                The following <b>Limited Markings</b> may be applied freely to any cub in this litter at any time throughout the year:
                <br />
                <b>{{ limitedMarkings.join(',') }}</b>
            </p>

            <hr />
        </div>

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
</style>
