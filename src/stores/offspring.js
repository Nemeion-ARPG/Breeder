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

        // protect against missing trait properties on the provided objects
        // and guarantee that we're working with unique lists
        let fatherTraits = [... new Set(father.traits)] || []
        let motherTraits = [... new Set(mother.traits)] || []

        // join the traits of both parents together into a single inheritance list with its associated chance of being inherited
        // we get this by creating an empty list, and just looping through the superset of both parents
        // if the given trait already exists in the result list, we update the rate to its double version
        let traitMap = [...fatherTraits, ...motherTraits]
            .reduce ((result, trait) => {
                let traitData = DATA.traits.available[trait]
                let qualityData = DATA.traits.qualities[traitData.quality]

                result[trait] = result[trait] ? qualityData.inherit_chance.double : qualityData.inherit_chance.single
                
                return result
            }, {})

        // no we iterate through the map to roll for each individual trait
        let result = []
        for (const trait in traitMap) {
            if (chanceRoll(traitMap[trait])) {
                result.push(trait)
            }
        }

        representation.value.traits = [...new Set(result)]
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
  
    return {
        representation,
        generateFur,
        generateCoat,
        generateGender,
        generateBuild,
        generateMutations,
        generateTraits
    }
  })
  