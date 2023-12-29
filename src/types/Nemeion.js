export default class Nemeion {
    constructor(initialValues = {}) {
        this.gender = initialValues.gender || null
        this.fur = initialValues.fur || null
        this.coat = initialValues.coat || null
        this.build = initialValues.build || null
        this.traits = initialValues.traits || []
        this.markings = initialValues.markings || []
        this.mutations = initialValues.mutations || []
    }

    get hasTraits() { return this.traits.length > 0 }
    get hasMarkings() { return this.markings.length > 0 }
    get hasMutations() { return this.mutations.length > 0 }
}
