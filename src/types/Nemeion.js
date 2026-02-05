import DATA from '@/data.yaml'
import { LIMITED_MARKINGS } from '@/Constants.js'

export default class Nemeion {
    constructor(initialValues = {}) {
        this.name = initialValues.name || ''
        this.url = initialValues.url || ''
        this.gender = initialValues.gender || null
        this.fur = initialValues.fur || DATA.furs.default
        this.coat = initialValues.coat || DATA.coats.default
        this.build = initialValues.build || DATA.builds.default
        this.traits = initialValues.traits || DATA.traits.default
        this.titan_traits = initialValues.titan_traits || DATA.titan_traits.default
        this.markings = initialValues.markings || DATA.markings.default
        this.mutations = initialValues.mutations || DATA.mutations.default

        // Optional addon-driven output (only set when used)
        if ('health' in initialValues) {
            this.health = initialValues.health
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
