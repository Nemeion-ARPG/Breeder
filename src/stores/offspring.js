import { ref } from 'vue'
import { defineStore } from 'pinia'

import { rollRandom } from '@/utils'

import DATA from '@/data.yaml'
import { FURS } from '@/Constants.js'

/// Always use the mother as the tie-breaker for inherited traits

export default defineStore('offspring', () => {
    const representation = ref({
        fur: null,
        coat: null,
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
  
    return { representation, generateFur, generateCoat }
  })
  