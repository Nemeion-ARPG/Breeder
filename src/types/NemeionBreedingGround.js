import Nemeion from '@/types/Nemeion'
import NemeionGenerator from './NemeionGenerator'

import _sample from 'lodash/sample'
import { rollForThreshold } from '@/utils'

import DATA from '@/data.yaml'
import { GENDERS, MUTATIONS, ADDONS, TRAIT_QUALITIES, BUILDS } from '@/Constants.js'

export const DEFAULT_RANDOM_SAMPLE = _sample
export const DEFAULT_SHOULD_DO_ACTION = rollForThreshold

const MAX_TITAN_TRAITS_PER_CUB = 4
const MAX_MUTATIONS_PER_CUB = 3

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
            const shouldDoAction = overrides?.shouldDoAction ?? DEFAULT_SHOULD_DO_ACTION
            const randomSample = overrides?.randomSample ?? DEFAULT_RANDOM_SAMPLE

            super(shouldDoAction)
            this.father = father
            this.mother = mother
            this.randomSample = randomSample
        } else {
            throw new Error('Only Nemeions can be bred here')
        }
    }

    _generateGender(addons) {
        if (addons.includes(ADDONS.AO_APHRO_PASSION) || addons.includes(ADDONS.AO_BLESSING_OF_THE_QUEEN)) {
            return GENDERS.Female
        } else if (addons.includes(ADDONS.AO_HEPHAESTUS_FERVOR) || addons.includes(ADDONS.AO_BLESSING_OF_THE_KING)) {
            return GENDERS.Male
        } else {
            return super._generateGender(addons)
        }
    }
    _generateFur(addons = []) {
        const DEFAULT_FUR = DATA.furs.default
        const rollRandomFur = () => {
            if (this.shouldDoAction(DATA.furs.rare_chance)) {
                return this.randomSample(DATA.furs.rare_options)
            } else {
                return DEFAULT_FUR
            }
        }

        const bothParentsHaveRareFur = this.father.hasRareFur && this.mother.hasRareFur
        
        // Apply Cursed Blood boost to inheritance chances
        let singleInheritChance = DATA.furs.inherit_chance.single
        let doubleInheritChance = DATA.furs.inherit_chance.double
        
        if (addons.includes(ADDONS.AO_CURSED_BLOOD) && (this.father.hasRareFur || this.mother.hasRareFur)) {
            const boost = DATA.add_ons.AO_CURSED_BLOOD.options.fur_boost
            singleInheritChance += boost
            doubleInheritChance += boost
        }
        
        if (bothParentsHaveRareFur && this.father.fur === this.mother.fur) {
            // just roll once, with the double rate
            if (this.shouldDoAction(doubleInheritChance)) {
                return this.mother.fur
            } else {
                return rollRandomFur()
            }
        } else if (bothParentsHaveRareFur) {
            // both parents have rare fur, but they're different
            // roll for each parent individually, using the single rate
            const useMotherFur = this.shouldDoAction(singleInheritChance)
            const useFatherFur = this.shouldDoAction(singleInheritChance)
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
            if (this.shouldDoAction(singleInheritChance)) {
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

        const boostChanceToInheritBuild = (targetBuild, boost) => {
            if (!boost) return

            // inheritChance is the chance to inherit the mother's build
            // If the mother is target, increase inheritChance.
            // If the father is target, decrease inheritChance (increasing the chance to inherit the father).
            if (this.mother.build === targetBuild && this.father.build !== targetBuild) {
                inheritChance = Math.min(1, inheritChance + boost)
            } else if (this.father.build === targetBuild && this.mother.build !== targetBuild) {
                const baseFatherChance = 1 - inheritChance
                const boostedFatherChance = Math.min(1, baseFatherChance + boost)
                inheritChance = 1 - boostedFatherChance
            }
        }

        if (addons.includes(ADDONS.AO_BIG_BONED)) {
            let optionalChance = DATA.add_ons.AO_BIG_BONED.options[this.mother.build]
            inheritChance = optionalChance ? optionalChance : inheritChance
        } else {
            if (addons.includes(ADDONS.AO_BURLY)) {
                const boost = DATA.add_ons.AO_BURLY.options.increased_chance ?? 0
                boostChanceToInheritBuild(BUILDS.Brute, boost)
            }

            if (addons.includes(ADDONS.AO_DELICATE)) {
                const boost = DATA.add_ons.AO_DELICATE.options.increased_chance ?? 0
                boostChanceToInheritBuild(BUILDS.Regal, boost)
            }

            if (addons.includes(ADDONS.AO_LEAN)) {
                const boost = DATA.add_ons.AO_LEAN.options.increased_chance ?? 0
                boostChanceToInheritBuild(BUILDS.Pharaoh, boost)
            }

            if (addons.includes(ADDONS.AO_PETITE)) {
                const boost = DATA.add_ons.AO_PETITE.options.increased_chance ?? 0
                boostChanceToInheritBuild(BUILDS.Domestic, boost)
            }
        }

        if (inheritChance !== null && inheritChance !== undefined) { // this may be null explicitly in the dataset
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

        const markings = this.#_generateInheritedAspects(ASPECT_KEYS.markings, DATA.markings, addons)
        return this.#_filterExclusiveMarkings(markings)
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

        // Protean Blood: guarantees an additional randomly rolled mutation on every cub.
        if (addons.includes(ADDONS.AO_PROTEAN_BLOOD)) {
            result.push(this.randomSample(MUTATIONS.allValues))
        }

        // Remove duplicates and apply exclusive group filtering
        const uniqueMutations = [...new Set(result)]
        const filtered = this.#_filterExclusiveMutations(uniqueMutations)

        if (filtered.length <= MAX_MUTATIONS_PER_CUB) {
            return filtered
        }

        // If more than the cap successfully rolled, keep a random subset.
        const remaining = [...filtered]
        const selected = []
        while (selected.length < MAX_MUTATIONS_PER_CUB && remaining.length > 0) {
            const pick = this.randomSample(remaining)
            if (!pick) break
            selected.push(pick)
            const index = remaining.indexOf(pick)
            if (index >= 0) {
                remaining.splice(index, 1)
            }
        }

        return selected
    }

    _generateTitanTraits(addons = []) {
        if (!this.father.hasTitanTraits && !this.mother.hasTitanTraits) {
            return []
        }

        let result = []

        // Inherit from parents with proper single/double chance logic
        const parentTitanTraits = [...this.father.titan_traits, ...this.mother.titan_traits]
        for (const titanTrait of parentTitanTraits) {
            const titanTraitData = DATA.titan_traits.available[titanTrait]
            if (!titanTraitData) continue
            const quality = titanTraitData.quality
            
            // Determine inherit chance based on whether both parents have the same trait
            const fatherHasTrait = this.father.titan_traits.includes(titanTrait)
            const motherHasTrait = this.mother.titan_traits.includes(titanTrait)
            const bothParentsHaveTrait = fatherHasTrait && motherHasTrait
            
            let inheritChance = bothParentsHaveTrait 
                ? DATA.titan_traits.qualities[quality].inherit_chance.double
                : DATA.titan_traits.qualities[quality].inherit_chance.single
            
            // Apply Savory Ribs boost if present
            if (addons.includes(ADDONS.AO_SAVORY_RIBS)) {
                inheritChance += DATA.add_ons.AO_SAVORY_RIBS.options.titan_trait_boost
            }
            
            if (this.shouldDoAction(inheritChance)) {
                result.push(titanTrait)
            }
        }

        const uniqueResult = [...new Set(result)]
        if (uniqueResult.length <= MAX_TITAN_TRAITS_PER_CUB) {
            return uniqueResult
        }

        // If more than the cap successfully rolled, keep a random subset.
        // This preserves the original per-trait roll chances while enforcing a hard maximum.
        const remaining = [...uniqueResult]
        const selected = []
        while (selected.length < MAX_TITAN_TRAITS_PER_CUB && remaining.length > 0) {
            const pick = this.randomSample(remaining)
            if (!pick) break
            selected.push(pick)
            const index = remaining.indexOf(pick)
            if (index >= 0) {
                remaining.splice(index, 1)
            }
        }

        return selected
    }

    #_filterExclusiveMarkings(markings) {
        if (!DATA.markings.exclusive_groups) {
            return markings
        }

        const result = [...markings]
        const exclusiveGroups = DATA.markings.exclusive_groups

        for (const groupName in exclusiveGroups) {
            const groupMarkings = exclusiveGroups[groupName]
            const foundMarkings = result.filter(marking => groupMarkings.includes(marking))
            
            if (foundMarkings.length > 1) {
                // Keep only one marking from this group (randomly selected)
                const keepMarking = this.randomSample(foundMarkings)
                // Remove all others from the result
                for (const marking of foundMarkings) {
                    if (marking !== keepMarking) {
                        const index = result.indexOf(marking)
                        if (index > -1) {
                            result.splice(index, 1)
                        }
                    }
                }
            }
        }

        return result
    }

    #_filterExclusiveMutations(mutations) {
        if (!DATA.mutations.exclusive_groups) {
            return mutations
        }

        const result = [...mutations]
        const exclusiveGroups = DATA.mutations.exclusive_groups

        for (const groupName in exclusiveGroups) {
            const groupMutations = exclusiveGroups[groupName]
            const foundMutations = result.filter(mutation => groupMutations.includes(mutation))
            
            if (foundMutations.length > 1) {
                // Keep only one mutation from this group (randomly selected)
                const keepMutation = this.randomSample(foundMutations)
                // Remove all others from the result
                for (const mutation of foundMutations) {
                    if (mutation !== keepMutation) {
                        const index = result.indexOf(mutation)
                        if (index > -1) {
                            result.splice(index, 1)
                        }
                    }
                }
            }
        }

        return result
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
                
                if (aspectKey === ASPECT_KEYS.traits && addons.includes(ADDONS.AO_SAVORY_RIBS)) {
                    result[aspect] += DATA.add_ons.AO_SAVORY_RIBS.options.trait_boost
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
  