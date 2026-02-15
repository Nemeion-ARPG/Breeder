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
                <div class="name-input">
                    <div>
                        <label>Name</label>
                    </div>
                    <div class="name-url-inputs">
                        <BFormInput
                            v-model="parentRef.name"
                            placeholder="Enter parent name"
                            class="name-field"
                        />
                        <BFormInput
                            v-model="parentRef.url"
                            placeholder="Enter URL"
                            class="url-field"
                        />
                    </div>

                    <div class="markings-bulk-input">
                        <div>
                            <label>Markings (paste list)</label>
                        </div>
                        <BFormTextarea
                            v-model="markingsBulkInput"
                            rows="2"
                            max-rows="6"
                            placeholder="Type or paste marking names (comma/newline separated). Recognized markings will be checked automatically."
                            class="markings-bulk-field"
                        />
                    </div>

                    <div class="traits-bulk-input">
                        <div>
                            <label>Traits (paste list)</label>
                        </div>
                        <BFormTextarea
                            v-model="traitsBulkInput"
                            rows="2"
                            max-rows="6"
                            placeholder="Type or paste trait and titan trait names (comma/newline separated). Recognized ones will be checked automatically."
                            class="traits-bulk-field"
                        />
                    </div>
                </div>

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

                <div class="random-selector">
                    <BButton
                        @click="randomizeParent"
                        variant="success"
                        class="random-button"
                    >
                        Stone Idol
                    </BButton>
                    
                    <BButton
                        @click="loadStarter"
                        variant="info"
                        class="starter-button"
                    >
                        Starter
                    </BButton>
                    
                    <div v-if="showNotification" class="notification-popup">
                        {{ notificationMessage }}
                    </div>
                </div>

                <div class="trait-selector">
                    <button
                        type="button"
                        class="collapsible-header"
                        :aria-expanded="traitsOpen ? 'true' : 'false'"
                        :aria-controls="`${idPrefix}-traits`"
                        @click="traitsOpen = !traitsOpen"
                    >
                        <span class="collapsible-title">Traits</span>
                        <span class="collapsible-chevron">{{ traitsOpen ? '▾' : '▸' }}</span>
                    </button>

                    <div :id="`${idPrefix}-traits`" v-show="traitsOpen">
                        <BFormCheckboxGroup
                            class="form-checkbox-group"
                            v-model="parentRef.traits"
                            :options="availableTraits"
                        />
                    </div>
                </div>

                <div class="markings-selector">
                    <button
                        type="button"
                        class="collapsible-header"
                        :aria-expanded="markingsOpen ? 'true' : 'false'"
                        :aria-controls="`${idPrefix}-markings`"
                        @click="markingsOpen = !markingsOpen"
                    >
                        <span class="collapsible-title">Markings</span>
                        <span class="collapsible-chevron">{{ markingsOpen ? '▾' : '▸' }}</span>
                    </button>

                    <div :id="`${idPrefix}-markings`" v-show="markingsOpen">
                        <BFormCheckboxGroup
                            class="form-checkbox-group"
                            v-model="parentRef.markings"
                            :options="availableMarkings"
                        />
                    </div>
                </div>

                <div class="mutations-selector">
                    <button
                        type="button"
                        class="collapsible-header"
                        :aria-expanded="mutationsOpen ? 'true' : 'false'"
                        :aria-controls="`${idPrefix}-mutations`"
                        @click="mutationsOpen = !mutationsOpen"
                    >
                        <span class="collapsible-title">Mutations</span>
                        <span class="collapsible-chevron">{{ mutationsOpen ? '▾' : '▸' }}</span>
                    </button>

                    <div :id="`${idPrefix}-mutations`" v-show="mutationsOpen">
                        <BFormCheckboxGroup
                            class="form-checkbox-group"
                            v-model="parentRef.mutations"
                            :options="availableMutations"
                        />
                    </div>
                </div>

                <div class="fur-selector">
                    <button
                        type="button"
                        class="collapsible-header"
                        :aria-expanded="giftsOpen ? 'true' : 'false'"
                        :aria-controls="`${idPrefix}-gifts`"
                        @click="giftsOpen = !giftsOpen"
                    >
                        <span class="collapsible-title">Gifts</span>
                        <span class="collapsible-chevron">{{ giftsOpen ? '▾' : '▸' }}</span>
                    </button>
                    
                    <div :id="`${idPrefix}-gifts`" v-show="giftsOpen">
                        <BFormCheckboxGroup
                            class="form-checkbox-group"
                            v-model="parentRef.furs"
                            :options="availableFurs"
                        />
                    </div>
                </div>

                <div class="titan-traits-selector">
                    <button
                        type="button"
                        class="collapsible-header"
                        :aria-expanded="titanTraitsOpen ? 'true' : 'false'"
                        :aria-controls="`${idPrefix}-titan-traits`"
                        @click="titanTraitsOpen = !titanTraitsOpen"
                    >
                        <span class="collapsible-title">Titan Traits</span>
                        <span class="collapsible-chevron">{{ titanTraitsOpen ? '▾' : '▸' }}</span>
                    </button>

                    <div :id="`${idPrefix}-titan-traits`" v-show="titanTraitsOpen">
                        <BFormCheckboxGroup
                            class="form-checkbox-group"
                            v-model="parentRef.titan_traits"
                            :options="availableTitanTraits"
                        />
                    </div>
                </div>

                <footer class="button-container">

                    <BButton
                        class="summary-button"
                        variant="info"
                        @click="showSummary = !showSummary"
                    >
                        View Summary
                    </BButton>
                    
                    <BButton
                        @click="resetParent"
                        variant="danger"
                        class="reset-button"
                    >
                        Parent Reset
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

import { ref, computed, watch } from 'vue'

import DATA from '@/data.yaml'
import STARTERS from '@/starters.yaml'
import { BUILDS, FURS, COATS, TRAITS, MARKINGS, MUTATIONS, TITAN_TRAITS } from '@/Constants';
import { sortData } from '@/utils'
import _sample from 'lodash/sample'

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
    },
    resetNonce: {
        type: Number,
        required: false,
        default: 0
    }
})

defineEmits(['update:parentRef'])

const showSummary = ref(false)
const showNotification = ref(false)
const notificationMessage = ref('')

const idPrefix = computed(() => props.title.toLowerCase().replace(/\s+/g, '-'))

const traitsOpen = ref(false)
const markingsOpen = ref(false)
const mutationsOpen = ref(false)
const giftsOpen = ref(false)
const titanTraitsOpen = ref(false)

const markingsBulkInput = ref('')
const traitsBulkInput = ref('')

watch(() => props.resetNonce, () => {
    markingsBulkInput.value = ''
    traitsBulkInput.value = ''

    traitsOpen.value = false
    markingsOpen.value = false
    mutationsOpen.value = false
    giftsOpen.value = false
    titanTraitsOpen.value = false

    showSummary.value = false
})

const normalizeForMatch = (value) => {
    return String(value ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ')
}

const includesWholeNormalizedPhrase = (haystackNormalized, needleNormalized) => {
    if (!haystackNormalized || !needleNormalized) return false
    const haystack = ` ${haystackNormalized} `
    const needle = ` ${needleNormalized} `
    return haystack.includes(needle)
}

const markingMatchers = computed(() => {
    return Object.entries(DATA.markings.available).map(([id, data]) => ({
        id,
        idNormalized: normalizeForMatch(id),
        nameNormalized: normalizeForMatch(data.display_name)
    }))
})

const traitMatchers = computed(() => {
    return Object.entries(DATA.traits.available).map(([id, data]) => ({
        id,
        idNormalized: normalizeForMatch(id),
        nameNormalized: normalizeForMatch(data.display_name)
    }))
})

const titanTraitMatchers = computed(() => {
    return Object.entries(DATA.titan_traits.available).map(([id, data]) => ({
        id,
        idNormalized: normalizeForMatch(id),
        nameNormalized: normalizeForMatch(data.display_name)
    }))
})

const findRecognizedMarkings = (input) => {
    const inputNormalized = normalizeForMatch(input)
    if (!inputNormalized) return []

    const tokens = String(input)
        .split(/[\n,;]+/)
        .map(token => normalizeForMatch(token))
        .filter(Boolean)
    const tokenSet = new Set(tokens)

    const found = new Set()
    for (const matcher of markingMatchers.value) {
        if (
            tokenSet.has(matcher.idNormalized) ||
            tokenSet.has(matcher.nameNormalized) ||
            includesWholeNormalizedPhrase(inputNormalized, matcher.nameNormalized) ||
            includesWholeNormalizedPhrase(inputNormalized, matcher.idNormalized)
        ) {
            found.add(matcher.id)
        }
    }
    return [...found]
}

const findRecognizedByMatchers = (input, matchers) => {
    const inputNormalized = normalizeForMatch(input)
    if (!inputNormalized) return []

    const tokens = String(input)
        .split(/[\n,;]+/)
        .map(token => normalizeForMatch(token))
        .filter(Boolean)
    const tokenSet = new Set(tokens)

    const found = new Set()
    for (const matcher of matchers) {
        if (
            tokenSet.has(matcher.idNormalized) ||
            tokenSet.has(matcher.nameNormalized) ||
            includesWholeNormalizedPhrase(inputNormalized, matcher.nameNormalized) ||
            includesWholeNormalizedPhrase(inputNormalized, matcher.idNormalized)
        ) {
            found.add(matcher.id)
        }
    }

    return [...found]
}

const inferCoatFromMarkingsInput = (input) => {
    const lower = String(input ?? '').toLowerCase()

    const candidates = [
        { coat: 'Tan', keyword: 'tan' },
        { coat: 'Cream', keyword: 'cream' },
        { coat: 'Agouti', keyword: 'agouti' },
    ]
        .map(({ coat, keyword }) => ({
            coat,
            index: lower.indexOf(keyword)
        }))
        .filter(({ index }) => index !== -1)
        .sort((a, b) => a.index - b.index)

    return candidates.length > 0 ? candidates[0].coat : null
}

watch(markingsBulkInput, (newValue) => {
    const inferredCoat = inferCoatFromMarkingsInput(newValue)
    if (inferredCoat && COATS.allValues.includes(inferredCoat)) {
        props.parentRef.coat = inferredCoat
    }

    const recognized = findRecognizedMarkings(newValue)
    if (recognized.length === 0) return

    const existing = Array.isArray(props.parentRef.markings) ? props.parentRef.markings : []
    props.parentRef.markings = [...new Set([...existing, ...recognized])]

    // UX: if they’re pasting markings, auto-open the markings section.
    markingsOpen.value = true
})

watch(traitsBulkInput, (newValue) => {
    const recognizedTraits = findRecognizedByMatchers(newValue, traitMatchers.value)
    const recognizedTitanTraits = findRecognizedByMatchers(newValue, titanTraitMatchers.value)

    if (recognizedTraits.length > 0) {
        const existingTraits = Array.isArray(props.parentRef.traits) ? props.parentRef.traits : []
        props.parentRef.traits = [...new Set([...existingTraits, ...recognizedTraits])]
        traitsOpen.value = true
    }

    if (recognizedTitanTraits.length > 0) {
        const existingTitanTraits = Array.isArray(props.parentRef.titan_traits)
            ? props.parentRef.titan_traits
            : []
        props.parentRef.titan_traits = [...new Set([...existingTitanTraits, ...recognizedTitanTraits])]
        titanTraitsOpen.value = true
    }
})

const showNotificationWithMessage = (message) => {
    notificationMessage.value = message
    showNotification.value = true
    setTimeout(() => {
        showNotification.value = false
    }, 2000)
}

const availableFurs = computed(() => {
    return FURS.allValues
        .filter(fur => fur !== null && fur !== undefined && fur !== '' && fur !== 'null')
        .map(fur => ({
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
const availableTitanTraits = computed(() => {
    return Object.entries(DATA.titan_traits.available)
        .map(([titanTrait, titanTraitData]) => ({
            value: titanTrait,
            text: titanTraitData.display_name
        }))
        .sort((a, b) => a.text.localeCompare(b.text, undefined, { sensitivity: 'base' }))
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
    return Object.entries(DATA.mutations.available)
        .map(([mutation, mutationData]) => ({
            value: mutation,
            text: mutationData.display_name
        }))
        .sort((a, b) => a.text.localeCompare(b.text, undefined, { sensitivity: 'base' }))
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

const randomizeParent = () => {
    const pickDifferentRandom = (options, current) => {
        if (!Array.isArray(options) || options.length === 0) return current
        if (options.length === 1) return options[0]

        let next = current
        // Try a few times to avoid returning the same value
        for (let i = 0; i < 10; i++) {
            const candidate = options[Math.floor(Math.random() * options.length)]
            if (candidate !== current) {
                next = candidate
                break
            }
        }
        return next === current ? options.find(v => v !== current) ?? options[0] : next
    }

    // Random build and coat
    props.parentRef.build = pickDifferentRandom(BUILDS.allValues, props.parentRef.build)
    props.parentRef.coat = pickDifferentRandom(COATS.allValues, props.parentRef.coat)

    // Random markings (1-8)
    const markingCount = Math.floor(Math.random() * 8) + 1
    const allMarkings = MARKINGS.allValues
    const selectedMarkings = []
    
    for (let i = 0; i < markingCount; i++) {
        const randomMarking = allMarkings[Math.floor(Math.random() * allMarkings.length)]
        if (!selectedMarkings.includes(randomMarking)) {
            selectedMarkings.push(randomMarking)
        }
    }
    props.parentRef.markings = selectedMarkings
    
    // Random traits (1-2)
    const traitCount = Math.floor(Math.random() * 2) + 1
    const allTraits = TRAITS.allValues
    const selectedTraits = []
    
    for (let i = 0; i < traitCount; i++) {
        const randomTrait = allTraits[Math.floor(Math.random() * allTraits.length)]
        if (!selectedTraits.includes(randomTrait)) {
            selectedTraits.push(randomTrait)
        }
    }
    props.parentRef.traits = selectedTraits
    
    // Random mutations (0-1)
    const mutationCount = Math.floor(Math.random() * 2) // 0 or 1
    if (mutationCount === 1) {
        const allMutations = MUTATIONS.allValues
        const randomMutation = allMutations[Math.floor(Math.random() * allMutations.length)]
        props.parentRef.mutations = [randomMutation]
    } else {
        props.parentRef.mutations = []
    }
    
    // Random titan traits (0-1, rare)
    const titanTraitChance = Math.random()
    if (titanTraitChance < 0.05) { // 5% chance for Stone Idol
        const allTitanTraits = TITAN_TRAITS.allValues
        const randomTitanTrait = allTitanTraits[Math.floor(Math.random() * allTitanTraits.length)]
        props.parentRef.titan_traits = [randomTitanTrait]
    } else {
        props.parentRef.titan_traits = []
    }
    
    // Set parent name to "Unknown"
    props.parentRef.name = "Unknown"
    
    // Clear the URL field
    props.parentRef.url = ""
    
    // Show notification
    showNotificationWithMessage(`Stone Idol applied to ${props.title}!`)
}

const loadStarter = () => {
    if (!STARTERS.starters || STARTERS.starters.length === 0) {
        showNotificationWithMessage('No starters available in starters.yaml!')
        return
    }
    
    // Filter starters by gender compatibility
    const parentGender = props.title === "Father" ? "Male" : "Female"
    const compatibleStarters = STARTERS.starters.filter(starter => {
        const starterGender = starter.gender
        return starterGender === "Any" || starterGender === parentGender
    })
    
    if (compatibleStarters.length === 0) {
        showNotificationWithMessage(`No ${props.title} starters available in starters.yaml!`)
        return
    }
    
    // Randomly select a compatible starter
    const randomIndex = Math.floor(Math.random() * compatibleStarters.length)
    const randomStarter = compatibleStarters[randomIndex]
    
    // Apply starter data to parent
    props.parentRef.name = randomStarter.name || "Starter"
    props.parentRef.url = randomStarter.url || ""
    props.parentRef.build = randomStarter.build || props.parentRef.build
    props.parentRef.coat = randomStarter.coat || props.parentRef.coat
    props.parentRef.traits = randomStarter.traits || []
    props.parentRef.markings = randomStarter.markings || []
    props.parentRef.mutations = randomStarter.mutations || []
    props.parentRef.furs = randomStarter.furs || []
    props.parentRef.titan_traits = randomStarter.titan_traits || []
    
    // Show notification
    showNotificationWithMessage(`Starter "${randomStarter.name}" applied to ${props.title}!`)
}

const resetParent = () => {
    // Clear all parent properties
    props.parentRef.name = ""
    props.parentRef.url = ""
    props.parentRef.build = DATA.builds.default
    props.parentRef.coat = DATA.coats.default
    props.parentRef.traits = []
    props.parentRef.markings = []
    props.parentRef.mutations = []
    props.parentRef.fur = DATA.furs.default
    props.parentRef.furs = []
    props.parentRef.titan_traits = []

    markingsBulkInput.value = ''
    traitsBulkInput.value = ''

    traitsOpen.value = false
    markingsOpen.value = false
    mutationsOpen.value = false
    giftsOpen.value = false
    titanTraitsOpen.value = false
    
    // Show notification
    showNotificationWithMessage(`${props.title} reset!`)
}
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

.name-url-inputs {
    display: flex;
    gap: 0.5rem;
}

.name-field {
    flex: 1;
}

.name-field :deep(input) {
    background-color: #d3d3d3;
    color: var(--color-text);
}

.url-field {
    flex: 1;
}

.url-field :deep(input) {
    background-color: #d3d3d3;
    color: var(--color-text);
}

.markings-bulk-input {
    margin-top: 0.5rem;
}

.markings-bulk-field :deep(textarea) {
    background-color: #d3d3d3;
    color: var(--color-text);
}

.traits-bulk-input {
    margin-top: 0.5rem;
}

.traits-bulk-field :deep(textarea) {
    background-color: #d3d3d3;
    color: var(--color-text);
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
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid var(--color-border);
    border-radius: 0.25rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.25rem;
}

.collapsible-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: transparent;
    border: 0;
    padding: 0;
    color: var(--color-text);
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 0.1rem;
    cursor: pointer;
}

.collapsible-header:focus-visible {
    outline: 2px solid var(--color-border-hover);
    outline-offset: 2px;
}

.collapsible-chevron {
    color: var(--color-text);
    font-weight: normal;
    opacity: 0.9;
}

.random-selector {
    margin-bottom: 1rem;
    text-align: center;
    position: relative;
}

.random-button {
    width: 100%;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.starter-button {
    width: 100%;
    font-weight: bold;
}

.notification-popup {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--vt-c-green);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-size: 0.9rem;
    font-weight: bold;
    white-space: nowrap;
    z-index: 1000;
    margin-top: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

:deep(.form-check) {
    margin-bottom: 0;
    white-space: nowrap;
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
