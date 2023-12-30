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
            />

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
