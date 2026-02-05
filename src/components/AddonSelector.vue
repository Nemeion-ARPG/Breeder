<template>
    <section class="addons-selector container">
        <header>
            <h2>{{ title }}</h2>
        </header>

        <BFormCheckboxGroup
            v-model="selectedAddons"
            :options="sortedAddons"
            class="addon-scroll-box"
            stacked
        />
        
        <div class="apollo-feather-container">
            <BFormCheckbox
                :model-value="apolloFeatherEnabled"
                @update:model-value="$emit('update:apollo-feather-enabled', $event)"
                class="apollo-feather-checkbox"
            >
                Apollo's Feather
            </BFormCheckbox>
            
            <div v-if="apolloFeatherEnabled" class="apollo-marking-selector">
                <label>Select marking to guarantee:</label>
                <BFormSelect
                    :model-value="selectedApolloMarking"
                    @update:model-value="$emit('update:selected-apollo-marking', $event)"
                    :options="availableMarkingsForApollo"
                    class="apollo-marking-select"
                />
            </div>
            
            <BFormCheckbox
                :model-value="heritageEnabled"
                @update:model-value="$emit('update:heritage-enabled', $event)"
                class="heritage-checkbox"
            >
                Heritage
            </BFormCheckbox>
            
            <div v-if="heritageEnabled" class="heritage-selector">
                <label>Select trait to force on one cub:</label>
                <BFormSelect
                    :model-value="selectedHeritageTrait"
                    @update:model-value="$emit('update:selected-heritage-trait', $event)"
                    :options="availableTraitsForHeritage"
                    class="heritage-select"
                />
            </div>
            
            <BFormCheckbox
                :model-value="rank1Enabled"
                @update:model-value="$emit('update:rank1-enabled', $event)"
                class="rank1-checkbox"
            >
                Strong Lineage
            </BFormCheckbox>

            <BFormCheckbox
                :model-value="inbreedingEnabled"
                @update:model-value="$emit('update:inbreeding-enabled', $event)"
                class="inbreeding-checkbox"
            >
                Inbreeding
            </BFormCheckbox>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import { BFormCheckbox, BFormSelect } from 'bootstrap-vue-next'

const selectedAddons = defineModel({
    type: Array,
    required: true,
    validator(value) {
        return value.every((e) => typeof e === 'string')
    }
})

defineEmits([
    'update:apollo-feather-enabled',
    'update:selected-apollo-marking',
    'update:heritage-enabled',
    'update:selected-heritage-trait',
    'update:rank1-enabled',
    'update:inbreeding-enabled'
])

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    availableAddons: {
        type: Array,
        required: true,
        validator(value) {
            return true
            // return value.every((element) => element.display_name && element.description)
        }
    },
    apolloFeatherEnabled: {
        type: Boolean,
        default: false
    },
    selectedApolloMarking: {
        type: String,
        default: null
    },
    availableMarkingsForApollo: {
        type: Array,
        default: () => []
    },
    heritageEnabled: {
        type: Boolean,
        default: false
    },
    selectedHeritageTrait: {
        type: String,
        default: null
    },
    availableTraitsForHeritage: {
        type: Array,
        default: () => []
    },
    rank1Enabled: {
        type: Boolean,
        default: false
    },
    inbreedingEnabled: {
        type: Boolean,
        default: false
    }
})

const sortedAddons = computed(() => {
    const buildPotions = ['AO_BRUTE_POTION', 'AO_REGAL_POTION', 'AO_DWARF_POTION', 'AO_DOMESTIC_POTION', 'AO_PHARAOH_POTION']
    const breederAddons = ['AO_BREEDER_I', 'AO_BREEDER_II']
    const legatusAddons = ['AO_LEGATUS_SINGLE', 'AO_LEGATUS_DOUBLE']
    const consulAddons = ['AO_CONSUL_SINGLE', 'AO_CONSUL_DOUBLE']
    const selectedBuildPotion = selectedAddons.value.find(addon => buildPotions.includes(addon))
    const selectedBreederAddon = selectedAddons.value.find(addon => breederAddons.includes(addon))
    const selectedLegatusAddon = selectedAddons.value.find(addon => legatusAddons.includes(addon))
    const selectedConsulAddon = selectedAddons.value.find(addon => consulAddons.includes(addon))
    
    return props.availableAddons
        .map(addon => {
            let disabled = false
            
            // Check original mutual exclusivity
            if (addon.mutually_exclusive) {
                const mutuallyExclusiveAddons = Array.isArray(addon.mutually_exclusive) 
                    ? addon.mutually_exclusive 
                    : [addon.mutually_exclusive]
                
                if (mutuallyExclusiveAddons.some(excludedAddon => selectedAddons.value.includes(excludedAddon))) {
                    disabled = true
                }
            }
            
            // Check build potion exclusivity
            if (buildPotions.includes(addon.id) && selectedBuildPotion && selectedBuildPotion !== addon.id) {
                disabled = true
            }
            
            // Check breeder addon exclusivity
            if (breederAddons.includes(addon.id) && selectedBreederAddon && selectedBreederAddon !== addon.id) {
                disabled = true
            }
            
            // Check legatus addon exclusivity
            if (legatusAddons.includes(addon.id) && selectedLegatusAddon && selectedLegatusAddon !== addon.id) {
                disabled = true
            }
            
            // Check consul addon exclusivity
            if (consulAddons.includes(addon.id) && selectedConsulAddon && selectedConsulAddon !== addon.id) {
                disabled = true
            }
            
            return {
                value: addon.id,
                text: addon.display_name,
                disabled: disabled
            }
        })
        .sort((a, b) => a.text.localeCompare(b.text))
})
</script>

<style scoped>

.addon-scroll-box {
    height: 600px;
    overflow-y: auto;
    border: 1px solid var(--color-border);
    border-radius: 0.25rem;
    padding: 0.5rem;
    background-color: var(--color-background);
}

:deep(.form-check) {
    margin-bottom: 0.25rem;
}

:deep(.form-check-label) {
    color: var(--color-text);
    font-size: 0.9rem;
}

:deep(.form-check-input:checked) {
    background-color: var(--vt-c-green);
    border-color: var(--vt-c-green);
}

.apollo-feather-container {
    padding: 1rem 0;
    border-top: 1px solid var(--color-border);
    margin-top: 1rem;
}

.apollo-feather-checkbox {
    margin-bottom: 1rem;
    font-weight: bold;
}

.rank1-checkbox {
    margin-top: 1rem;
    margin-bottom: 1rem;
    font-weight: bold;
}

.apollo-marking-selector {
    margin-left: 1.5rem;
    margin-top: 1rem;
}

.apollo-marking-selector label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: normal;
}

.apollo-marking-select {
    min-width: 200px;
}
</style>
