import DATA from '@/data.yaml'

export default class Nemeion {
    constructor(initialValues = {}) {
        this.gender = initialValues.gender || null
        this.fur = initialValues.fur || DATA.furs.default
        this.coat = initialValues.coat || DATA.coats.default
        this.build = initialValues.build || DATA.builds.default
        this.traits = initialValues.traits || DATA.traits.default
        this.markings = initialValues.markings || DATA.markings.default
        this.mutations = initialValues.mutations || DATA.mutations.default
    }

    get hasTraits() { return this.traits.length > 0 }
    get hasMarkings() { return this.markings.length > 0 }
    get hasMutations() { return this.mutations.length > 0 }
}
