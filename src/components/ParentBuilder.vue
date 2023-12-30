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
            <div>
                <div class="build-selector">
                    <div>
                        <label>Build</label>
                    </div>
            
                    <BFormRadioGroup
                        v-model="parentRef.build"
                        :options="availableBuilds"
                        :name="`${title}-build`"
                        buttons
                    />
                </div>

                <div class="fur-selector">
                    <div>
                        <label>Fur</label>
                    </div>
                    
                    <BFormRadioGroup
                        v-model="parentRef.fur"
                        :options="availableFurs"
                        :name="`${title}-fur`"
                        buttons
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
                    />
                </div>

                <div class="trait-selector">
                    <div>
                        <label>Traits</label>
                    </div>

                    <BFormSelect
                        multiple
                        v-model="parentRef.traits"
                        :options="availableTraits"
                    />
                </div>

                <div class="markings-selector">
                    <div>
                        <label>Markings</label>
                    </div>

                    <BFormSelect
                        multiple
                        v-model="parentRef.markings"
                        :options="availableMarkings"
                    />
                </div>

                <div class="mutations-selector">
                    <div>
                        <label>Mutations</label>
                    </div>

                    <BFormSelect
                        multiple
                        v-model="parentRef.mutations"
                        :options="availableMutations"
                    />
                </div>

                <BButton @click="showSummary = !showSummary">
                    View Summary
                </BButton>
            </div>

            <template #overlay>
                <NemeionSummary :reference="parentRef" />

                <BButton
                    @click="showSummary = !showSummary"
                    variant="light"
                >
                    Hide Summary
                </BButton>
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
const availableFurs = computed(() => FURS.allValues)
const availableCoats = computed(() => COATS.allValues)
const availableTraits = computed(() => {
    let options = []
    for (const trait in DATA.traits.available) {
        options.push({
            value: trait,
            text: DATA.traits.available[trait].display_name
        })
    }
    return options
})
const availableMarkings = computed(() => {
    let options = []
    for (const marking in DATA.markings.available) {
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

</style>
