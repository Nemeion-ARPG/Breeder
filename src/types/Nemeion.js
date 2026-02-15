import DATA from '@/data.yaml'
import { LIMITED_MARKINGS } from '@/Constants.js'

const MARKING_COLLATOR = new Intl.Collator(undefined, { sensitivity: 'base' })
const TRAIT_COLLATOR = new Intl.Collator(undefined, { sensitivity: 'base' })

const MAX_MUTATIONS_PER_NEMEION = 3

function sortMarkingsInPlace(markings) {
    if (!Array.isArray(markings)) return markings
    markings.sort((a, b) => MARKING_COLLATOR.compare(a, b))
    return markings
}

function sortTraitsInPlace(traits) {
    if (!Array.isArray(traits)) return traits
    traits.sort((a, b) => {
        const aName = DATA?.traits?.available?.[a]?.display_name ?? a
        const bName = DATA?.traits?.available?.[b]?.display_name ?? b
        return TRAIT_COLLATOR.compare(aName, bName)
    })
    return traits
}

function sortTitanTraitsInPlace(traits) {
    if (!Array.isArray(traits)) return traits
    traits.sort((a, b) => {
        const aName = DATA?.titan_traits?.available?.[a]?.display_name ?? a
        const bName = DATA?.titan_traits?.available?.[b]?.display_name ?? b
        return TRAIT_COLLATOR.compare(aName, bName)
    })
    return traits
}

const MUTATION_EXCLUSIVE_GROUP_BY_KEY = (() => {
    const map = new Map()
    const groups = DATA?.mutations?.exclusive_groups

    if (!groups) return map

    for (const [groupName, keys] of Object.entries(groups)) {
        if (!Array.isArray(keys)) continue
        for (const key of keys) {
            map.set(key, groupName)
        }
    }

    return map
})()

function normalizeMutationsInPlace(mutations) {
    if (!Array.isArray(mutations)) return mutations

    const seenMutation = new Set()
    const seenExclusiveGroup = new Set()
    const normalized = []

    for (const mutation of mutations) {
        if (!mutation || seenMutation.has(mutation)) continue

        const exclusiveGroup = MUTATION_EXCLUSIVE_GROUP_BY_KEY.get(mutation)
        if (exclusiveGroup) {
            if (seenExclusiveGroup.has(exclusiveGroup)) continue
            seenExclusiveGroup.add(exclusiveGroup)
        }

        seenMutation.add(mutation)
        normalized.push(mutation)
    }

    mutations.length = 0
    mutations.push(...normalized.slice(0, MAX_MUTATIONS_PER_NEMEION))
    return mutations
}

export default class Nemeion {
    constructor(initialValues = {}) {
        this.name = initialValues.name || ''
        this.url = initialValues.url || ''
        this.gender = initialValues.gender || null
        this.fur = initialValues.fur || DATA.furs.default
        this.coat = initialValues.coat || DATA.coats.default
        this.build = initialValues.build || DATA.builds.default
        this._traits = []
        this.traits = initialValues.traits || DATA.traits.default
        this._titan_traits = []
        this.titan_traits = initialValues.titan_traits || DATA.titan_traits.default
        this._markings = []
        this.markings = initialValues.markings || DATA.markings.default
        this._mutations = []
        this.mutations = initialValues.mutations || DATA.mutations.default

        // Optional addon-driven output (only set when used)
        if ('health' in initialValues) {
            this.health = initialValues.health
        }
    }

    get traits() { return this._traits }
    set traits(value) {
        const traits = Array.isArray(value) ? [...value] : []
        sortTraitsInPlace(traits)
        this._traits = traits
    }

    addTrait(trait) {
        if (!trait) return
        if (!this._traits.includes(trait)) {
            this._traits.push(trait)
            sortTraitsInPlace(this._traits)
        }
    }

    get titan_traits() { return this._titan_traits }
    set titan_traits(value) {
        const traits = Array.isArray(value) ? [...value] : []
        sortTitanTraitsInPlace(traits)
        this._titan_traits = traits
    }

    addTitanTrait(trait) {
        if (!trait) return
        if (!this._titan_traits.includes(trait)) {
            this._titan_traits.push(trait)
            sortTitanTraitsInPlace(this._titan_traits)
        }
    }

    get markings() { return this._markings }
    set markings(value) {
        const markings = Array.isArray(value) ? [...value] : []
        sortMarkingsInPlace(markings)
        this._markings = markings
    }

    addMarking(marking) {
        if (!marking) return
        if (!this._markings.includes(marking)) {
            this._markings.push(marking)
            sortMarkingsInPlace(this._markings)
        }
    }

    get mutations() { return this._mutations }
    set mutations(value) {
        const mutations = Array.isArray(value) ? [...value] : []
        normalizeMutationsInPlace(mutations)
        this._mutations = mutations
    }

    addMutation(mutation) {
        if (!mutation) return

        const exclusiveGroup = MUTATION_EXCLUSIVE_GROUP_BY_KEY.get(mutation)
        if (exclusiveGroup) {
            for (let i = this._mutations.length - 1; i >= 0; i--) {
                const existing = this._mutations[i]
                if (MUTATION_EXCLUSIVE_GROUP_BY_KEY.get(existing) === exclusiveGroup) {
                    this._mutations.splice(i, 1)
                }
            }
        }

        if (!this._mutations.includes(mutation)) {
            if (this._mutations.length >= MAX_MUTATIONS_PER_NEMEION) {
                return
            }
            this._mutations.push(mutation)
        }
    }

    get hasRareFur() { return DATA.furs.rare_options.includes(this.fur) }
    get hasTraits() { return this.traits.length > 0 }
    get hasTitanTraits() { return this.titan_traits.length > 0 }
    get hasMarkings() { return this.markings.length > 0 }
    get hasLimitedMarkings() {
        return this.markings.some(marking => LIMITED_MARKINGS.allValues.includes(marking))
    }
    get hasMutations() { return this.mutations.length > 0 }

    get limitedMarkings() {
        return this.markings.filter(marking => LIMITED_MARKINGS.allValues.includes(marking))
    }
}
