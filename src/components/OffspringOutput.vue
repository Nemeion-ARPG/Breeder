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
                @click="$emit('generateOffspring')"
                variant="light"
            >Roll</BButton>

            <BButton
                @click="$emit('generateRandom')"
                variant="light"
            >Random</BButton>

            <BButton
                @click="$emit('reset')"
                variant="light"
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
.offspring-output header {
    text-align: center;
}
</style>
