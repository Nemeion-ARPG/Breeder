<template>
    <section class="parent-builder container">
        <header>
            <h2>{{ title }}</h2>
        </header>

        <BOverlay
            :show="showSummary"
            variant="dark"
            opacity="0.95"
            no-center
        >
            <div class="content-container">
                <div class="build-selector">
                    <div>
                        <label>Build</label>
                    </div>
            
                    <BFormRadioGroup
                        v-model="parentRef.build"
                        :options="availableBuilds"
                        :name="`${title}-build`"
                        buttons
                        button-variant="dark"
                    />
                </div>

                <div class="coat-selector">
                    <div>
                        <label>Coat</label>
                    </div>
                    
                    <BFormRadioGroup
                        v-model="parentRef.coat"
                        :options="availableCoats"
                        :name="`${title}-coat`"
                        buttons
                        button-variant="dark"
                    />
                </div>

                <div class="trait-selector">
                    <div>
                        <label>Traits</label>
                    </div>

                    <BFormCheckboxGroup
                        class="form-checkbox-group"
                        v-model="parentRef.traits"
                        :options="availableTraits"
                    />
                </div>

                <div class="markings-selector">
                    <div>
                        <label>Markings</label>
                    </div>

                    <BFormCheckboxGroup
                        class="form-checkbox-group"
                        v-model="parentRef.markings"
                        :options="availableMarkings"
                    />
                </div>

                <div class="mutations-selector">
                    <div>
                        <label>Mutations</label>
                    </div>

                    <BFormCheckboxGroup
                        class="form-checkbox-group"
                        v-model="parentRef.mutations"
                        :options="availableMutations"
                    />
                </div>

                <div class="fur-selector">
                    <div>
                        <label>Gifts</label>
                    </div>
                    
                    <BFormCheckboxGroup
                        class="form-checkbox-group"
                        v-model="parentRef.furs"
                        :options="availableFurs"
                    />
                </div>

                <footer class="button-container">

                    <BButton
                        class="summary-button"
                        variant="dark"
                        @click="showSummary = !showSummary"
                    >
                        View Summary
                    </BButton>
                </footer>
            </div>

            <template #overlay>
                <NemeionSummary :reference="parentRef" />

                <div class="button-container">
                    <BButton
                        @click="showSummary = !showSummary"
                        variant="secondary"
                    >
                        Hide Summary
                    </BButton>
                </div>
            </template>
        </BOverlay>
    </section>
</template>

<script setup>
import NemeionSummary from '@/components/NemeionSummary.vue'
import Nemeion from '@/types/Nemeion'

import { ref, computed } from 'vue'

import DATA from '@/data.yaml'
import { BUILDS, FURS, COATS, TRAITS, MARKINGS, MUTATIONS } from '@/Constants';
import { sortData } from '@/utils'

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    parentRef: {
        type: Nemeion,
        required: true
    },
    otherParentRef: {
        type: Nemeion,
        required: true
    }
})

defineEmits(['update:parentRef'])

const showSummary = ref(false)
const availableFurs = computed(() => {
    return FURS.allValues.map(fur => ({
        value: fur,
        text: fur
    }))
})
const availableCoats = computed(() => COATS.allValues)
const availableTraits = computed(() => {
    let options = []
    for (const trait in sortData(DATA.traits.available)) {
        options.push({
            value: trait,
            text: DATA.traits.available[trait].display_name
        })
    }
    return options
})
const availableMarkings = computed(() => {
    let options = []
    for (const marking in sortData(DATA.markings.available)) {
        options.push({
            value: marking,
            text: DATA.markings.available[marking].display_name
        })
    }
    return options
})
const availableMutations = computed(() => {
    let options = []
    for (const mutation in DATA.mutations.available) {
        options.push({
            value: mutation,
            text: DATA.mutations.available[mutation].display_name
        })
    }
    return options
})
const availableBuilds = computed(() => {
    let otherParentBuild = props.otherParentRef.build
    return BUILDS.allValues
        .map((item) => {
            let disabled = otherParentBuild
                ? !DATA.builds.available[item].inherit_chance[otherParentBuild]
                : false
            return {
                value: item,
                text: item,
                disabled
            }
        })
})
</script>

<style scoped>
.content-container > * {
    margin-bottom: 0.5rem;
}

label {
    color: var(--color-text);
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 0.1rem;
}

.form-selector {
    color: var(--color-text);
    background: var(--color-background-soft);
    padding: 0.5rem;
}

.form-checkbox-group {
    color: var(--color-text);
    background: var(--color-background-soft);
    padding: 0.5rem;
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid var(--color-border);
    border-radius: 0.25rem;
}

:deep(.form-check) {
    margin-bottom: 0.25rem;
}

:deep(.form-check-input) {
    background-color: var(--color-background-mute);
    border-color: var(--color-border);
}

:deep(.form-check-input:checked) {
    background-color: var(--color-border-hover);
    border-color: var(--color-border-hover);
}

:deep(.form-check-label) {
    color: var(--color-text);
    margin-left: 0.5rem;
}

:deep(.btn-check:checked + .btn) {
    color: var(--color-heading);
    background-color: var(--color-border-hover);
}

:deep(.btn-check:disabled + .btn) {
    background-color: var(--color-background-soft);
}

:deep(.btn-check + .btn) {
    color: var(--color-text);
    background-color: var(--color-background-mute);
}

:deep(option:checked) {
    color: var(--color-text);
    background-color: var(--color-border-hover);
}

:deep(select) {
    border-color: var(--color-border);
}

.button-container {
    display: flex;
    justify-content: center;
}
</style>
