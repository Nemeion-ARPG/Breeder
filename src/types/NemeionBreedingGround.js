import Nemeion from '@/types/Nemeion'
import NemeionGenerator from './NemeionGenerator'

import _sample from 'lodash/sample'
import { rollForThreshold } from '@/utils'

import DATA from '@/data.yaml'
import { GENDERS, MUTATIONS, ADDONS, TRAIT_QUALITIES, BUILDS } from '@/Constants.js'

export const DEFAULT_RANDOM_SAMPLE = _sample
export const DEFAULT_SHOULD_DO_ACTION = rollForThreshold

const ASPECT_KEYS = { traits: 'traits', markings: 'markings' }

/// Always use the mother as the tie-breaker for inherited traits
/// Always use the father as the first parent for generating offspring

export default class NemeionBreedingGround extends NemeionGenerator {
    constructor(father, mother, overrides = { shouldDoAction: DEFAULT_SHOULD_DO_ACTION, randomSample: DEFAULT_RANDOM_SAMPLE }) {
        if (!father || !mother) {
            throw new Error('Cannot breed asexually')
        }

        if (father instanceof Nemeion && mother instanceof Nemeion) {
            if (father.gender !== GENDERS.Male || mother.gender !== GENDERS.Female) {
                throw new Error('Parent genders do not match reality for breeding')
            }
            super(overrides.shouldDoAction)
            this.father = father
            this.mother = mother
            this.randomSample = overrides.randomSample
        } else {
            throw new Error('Only Nemeions can be bred here')
        }
    }

    _generateGender(addons) {
        if (addons.includes(ADDONS.AO_APHRO_PASSION)) {
            return GENDERS.Female
        } else if (addons.includes(ADDONS.AO_HEPHAESTUS_FERVOR)) {
            return GENDERS.Male
        } else {
            return super._generateGender(addons)
        }
    }
    _generateFur() {
        const DEFAULT_FUR = DATA.furs.default
        const rollRandomFur = () => {
            if (this.shouldDoAction(DATA.furs.rare_chance)) {
                return this.randomSample(DATA.furs.rare_options)
            } else {
                return DEFAULT_FUR
            }
        }

        const bothParentsHaveRareFur = this.father.hasRareFur && this.mother.hasRareFur
        if (bothParentsHaveRareFur && this.father.fur === this.mother.fur) {
            // just roll once, with the double rate
            if (this.shouldDoAction(DATA.furs.inherit_chance.double)) {
                return this.mother.fur
            } else {
                return rollRandomFur()
            }
        } else if (bothParentsHaveRareFur) {
            // both parents have rare fur, but they're different
            // roll for each parent individually, using the single rate
            const inheritChance = DATA.furs.inherit_chance.single
            const useMotherFur = this.shouldDoAction(inheritChance)
            const useFatherFur = this.shouldDoAction(inheritChance)
            switch (`${useMotherFur} ${useFatherFur}`) {
            case 'true true':
            case 'true false':
                return this.mother.fur
            case 'false true':
                return this.father.fur
            case 'false false':
                return rollRandomFur()
            }
        } else if (this.father.hasRareFur || this.mother.hasRareFur) {
            // only one parent has rare fur, check to see if it's inherited
            let parent = this.father.hasRareFur ? this.father : this.mother
            if (this.shouldDoAction(DATA.furs.inherit_chance.single)) {
                return parent.fur
            } else {
                return rollRandomFur()
            }
        } else {
            // neither parent has rare fur, so just roll a random one
            return rollRandomFur()
        }
    }
    _generateCoat() {
        if (this.father.coat === this.mother.coat) {
            // both are the same, just use one of them as the reference
            return this.father.coat
        } else {
            // find the mother's chance of passing on the trait by looking up the coat of the father
            const inheritChance = DATA.coats.available[this.father.coat].inherit_chance[this.mother.coat]
            if (this.shouldDoAction(inheritChance)) {
                return this.mother.coat
            } else {
                return this.father.coat
            }
        }
    }
    _generateBuild(addons = []) {
        if (this.father.build === this.mother.build) {
            return this.father.build
        }

        let fatherBuild = DATA.builds.available[this.father.build]
        let inheritChance = fatherBuild.inherit_chance[this.mother.build]

        if (addons.includes(ADDONS.AO_BIG_BONED)) {
            let optionalChance = DATA.add_ons.AO_BIG_BONED.options[this.mother.build]
            inheritChance = optionalChance ? optionalChance : inheritChance
        } else if (addons.includes(ADDONS.AO_DELICATE)) {
            let optionalChance = DATA.add_ons.AO_DELICATE.options[this.mother.build]
            inheritChance = optionalChance ? optionalChance : inheritChance
        }

        if (inheritChance) { // this may be null explicitly in the dataset
            return this.shouldDoAction(inheritChance) ? this.mother.build : this.father.build
        } else {
            throw new Error('incompatible builds')
        }
    }
    _generateTraits(addons = []) {
        if (!this.father.hasTraits && !this.mother.hasTraits) {
            return []
        }

        return this.#_generateInheritedAspects(ASPECT_KEYS.traits, DATA.traits, addons)
    }
    _generateMarkings(addons = []) {
        if (!this.father.hasMarkings && !this.mother.hasMarkings) {
            return []
        }

        return this.#_generateInheritedAspects(ASPECT_KEYS.markings, DATA.markings, addons)
    }
    _generateMutations(addons = []) {
        let result = []

        if (this.father.hasMutations || this.mother.hasMutations) {
            // build a super-set list of mutations to inherit from both parents
            const mutations = [...this.father.mutations, ...this.mother.mutations]
            for (const mutation of mutations) {
                let mutationChance = DATA.mutations.inherit_chance.single

                if (addons.includes(ADDONS.AO_WEREWORM)) {
                    mutationChance += DATA.add_ons.AO_WEREWORM.options.increased_chance
                }
                if (addons.includes(ADDONS.AO_RARE_BLOOD)) {
                    mutationChance += DATA.add_ons.AO_RARE_BLOOD.options.increased_chance
                }

                if (this.shouldDoAction(mutationChance)) {
                    result.push(mutation)
                }
            }
        }

        // always roll for a potentially random mutation
        let mutationChance = DATA.mutations.base_chance
        if (addons.includes(ADDONS.AO_WEREWORM)) {
            mutationChance += DATA.add_ons.AO_WEREWORM.options.increased_chance
        }

        if (this.shouldDoAction(mutationChance)) {
            result.push(this.randomSample(MUTATIONS.allValues))
        }

        return [...new Set(result)]
    }

    #_generateInheritedAspects(aspectKey, dataset, addons) {
        // protect against missing aspect properties on the provided objects
        // and guarantee that we're working with unique lists
        let fatherAspects = [... new Set(this.father[aspectKey])] || []
        let motherAspects = [... new Set(this.mother[aspectKey])] || []

        // join the aspects of both parents together into a single inheritance list with its associated chance of being inherited
        // we get this by creating an empty list, and just looping through the superset of both parents
        // if the given aspect already exists in the result list, we update the rate to its double version
        let aspectMap = [...fatherAspects, ...motherAspects]
            .reduce ((result, aspect) => {
                let aspectData = dataset.available[aspect]
                let qualityData = dataset.qualities[aspectData.quality]

                result[aspect] = result[aspect] ? qualityData.inherit_chance.double : qualityData.inherit_chance.single

                if (aspectKey === ASPECT_KEYS.traits && addons.includes(ADDONS.AO_BIRTHRIGHT)) {
                    const increasedChance = DATA.add_ons.AO_BIRTHRIGHT.options[aspectData.quality]
                    if (increasedChance) {
                        result[aspect] += increasedChance
                    }
                }
                
                return result
            }, {})

        // no we iterate through the map to roll for each individual aspect
        let result = []
        for (const aspect in aspectMap) {
            if (this.shouldDoAction(aspectMap[aspect])) {
                result.push(aspect)
            }
        }

        return [...new Set(result)]
    }
}
  