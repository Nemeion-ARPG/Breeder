import { ref } from 'vue'
import { defineStore } from 'pinia'

import _random from 'lodash/random'
import _sample from 'lodash/sample'

import DATA from '@/data.yaml'
import { FURS, GENDERS } from '@/Constants.js'

const rollRandom = () => _random(0, 1, true)

/// Always use the mother as the tie-breaker for inherited traits
/// Always use the father as the first parent for generating offspring

export default defineStore('offspring', () => {
    const representation = ref({
        gender: null,
        fur: null,
        coat: null,
        build: null,
        mutations: [],
        traits: [],
        markings: []
    })
  
    function generateFur(father, mother, rareChanceRoll = rollRandom) {
        function rollRandomFur() {
            if (rareChanceRoll(DATA.furs.rare_chance)) {
                return FURS.randomValue([FURS.Sleek])
            } else {
                return FURS.Sleek
            }
        }

        const bothParentsHaveRareFur = father.hasRareFur && mother.hasRareFur
        if (bothParentsHaveRareFur && father.fur === mother.fur) {
            // just roll once, with the double rate
            if (rareChanceRoll(DATA.furs.inherit_chance.double)) {
                representation.value.fur = mother.fur
            } else {
                representation.value.fur = rollRandomFur()
            }
        } else if (bothParentsHaveRareFur) {
            // both parents have rare fur, but they're different
            // roll for each parent individually, using the single rate
            const inheritChance = DATA.furs.inherit_chance.single
            const useMotherFur = rareChanceRoll(inheritChance)
            const useFatherFur = rareChanceRoll(inheritChance)
            switch (`${useMotherFur} ${useFatherFur}`) {
            case 'true true':
            case 'true false':
                representation.value.fur = mother.fur
                break
            case 'false true':
                representation.value.fur = father.fur
                break
            case 'false false':
                representation.value.fur = rollRandomFur()
                break
            }
        } else if (father.hasRareFur || mother.hasRareFur) {
            // only one parent has rare fur, check to see if it's inherited
            let parent = father.hasRareFur ? father : mother
            if (rareChanceRoll(DATA.furs.inherit_chance.single)) {
                representation.value.fur = parent.fur
            } else {
                representation.value.fur = rollRandomFur()
            }
        } else {
            // neither parent has rare fur, so just roll a random one
            representation.value.fur = rollRandomFur()
        }
    }

    function generateCoat(father, mother, inheritChanceRoll = rollRandom) {
        if (father.coat === mother.coat) {
            // both are the same, just use one of them as the reference
            representation.value.coat = father.coat
        } else {
            // find the mother's chance of passing on the trait by looking up the coat of the father
            const inheritChance = DATA.coats[father.coat].inherit_chance[mother.coat]
            if (inheritChanceRoll(inheritChance)) {
                representation.value.coat = mother.coat
            } else {
                representation.value.coat = father.coat
            }
        }
    }

    function generateGender(chanceRoll = rollRandom) {
        representation.value.gender = chanceRoll(DATA.genders.Female.base_chance) ? GENDERS.Female : GENDERS.Male
    }

    function generateMutations(father, mother, chanceRoll = rollRandom, randomMutation = _sample) {
        let result = []

        if (father.hasMutations || mother.hasMutations) {
            // build a super-set list of mutations to inherit from both parents
            const mutations = [...father.mutations, ...mother.mutations]
            for (const mutation of mutations) {
                if (chanceRoll(DATA.mutations.inherit_chance)) {
                    result.push(mutation)
                }
            }
        }

        // always roll for a potentially random mutation
        if (chanceRoll(DATA.mutations.base_chance)) {
            result.push(randomMutation(DATA.mutations.available))
        }

        representation.value.mutations = [...new Set(result)]
    }

    function generateTraits(father, mother, chanceRoll = rollRandom) {
        if (!father.hasTraits && !mother.hasTraits) {
            return
        }

        representation.value.traits = _generateInheritedAspects(father, mother, 'traits', DATA.traits, chanceRoll)
    }

    function generateMarkings(father, mother, chanceRoll = rollRandom) {
        if (!father.hasMarkings && !mother.hasMarkings) {
            return
        }

        representation.value.markings = _generateInheritedAspects(father, mother, 'markings', DATA.markings, chanceRoll)
    }

    function generateBuild(father, mother, chanceRoll = rollRandom) {
        let fatherBuild = DATA.builds.available[father.build]
        let inheritChance = fatherBuild.inherit_chance[mother.build]

        if (inheritChance) { // this may be null explicitly in the dataset
            representation.value.build = chanceRoll(inheritChance) ? mother.build : father.build
        } else {
            throw new Error('incompatible builds')
        }
    }

    function _generateInheritedAspects(father, mother, aspectKey, dataset, chanceRoll = rollRandom) {
        // protect against missing aspect properties on the provided objects
        // and guarantee that we're working with unique lists
        let fatherAspects = [... new Set(father[aspectKey])] || []
        let motherAspects = [... new Set(mother[aspectKey])] || []

        // join the aspects of both parents together into a single inheritance list with its associated chance of being inherited
        // we get this by creating an empty list, and just looping through the superset of both parents
        // if the given aspect already exists in the result list, we update the rate to its double version
        let aspectMap = [...fatherAspects, ...motherAspects]
            .reduce ((result, aspect) => {
                let aspectData = dataset.available[aspect]
                let qualityData = dataset.qualities[aspectData.quality]

                result[aspect] = result[aspect] ? qualityData.inherit_chance.double : qualityData.inherit_chance.single
                
                return result
            }, {})

        // no we iterate through the map to roll for each individual aspect
        let result = []
        for (const aspect in aspectMap) {
            if (chanceRoll(aspectMap[aspect])) {
                result.push(aspect)
            }
        }

        return [...new Set(result)]
    }
  
    return {
        representation,
        generateFur,
        generateCoat,
        generateGender,
        generateBuild,
        generateMutations,
        generateTraits,
        generateMarkings
    }
  })
  