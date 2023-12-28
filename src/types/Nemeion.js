export default class Nemeion {
    constructor() {
        this.gender = null
        this.fur = null
        this.coat = null
        this.build = null
        this.traits = []
        this.markings = []
        this.mutations = []
    }

    get hasTraits() { return this.traits.length > 0 }
    get hasMarkings() { return this.markings.length > 0 }
    get hasMutations() { return this.mutations.length > 0 }
}
