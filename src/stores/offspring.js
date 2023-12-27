import { ref } from 'vue'
import { defineStore } from 'pinia'

import _random from 'lodash/random'
import _sample from 'lodash/sample'

import DATA from '@/data.yaml'
import { FURS, GENDERS } from '@/Constants.js'

const rollRandom = _random(0, 1, true)

/// Always use the mother as the tie-breaker for inherited traits

export default defineStore('offspring', () => {
    const representation = ref({
        gender: null,
        fur: null,
        coat: null,
        mutations: [],
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
  
    return { representation, generateFur, generateCoat, generateGender, generateMutations }
  })
  