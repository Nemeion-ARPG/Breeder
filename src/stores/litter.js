import { ref } from 'vue'
import { defineStore } from 'pinia'

import _random from 'lodash/random'

import DATA from '@/data.yaml'

import useOffspringStore from './offspring'

const defaultChanceRoll = () => _random(0, 1, true)

export default defineStore('litter', () => {
    const offspring = ref([])

    function generateOffspring(father, mother, chanceRoll = defaultChanceRoll, offspringStore = useOffspringStore()) {
        offspring.value = _generateLitter(chanceRoll, () => {
            offspringStore.generateFromParents(father, mother, chanceRoll)
        })
    }

    function _generateLitter(chanceRoll = rollRandom, implementation) {
        // litter size is based off weights in the data table
        // so we roll and then lookup in the table to deterime the size
        const litterSize = (() => {
            let chanceResult = chanceRoll()
    
            let dataset = DATA.litters.weights
            let sortedLitterSizes = dataset.toSorted((a, b) => { return a < b ? -1 : 1 })
    
            for (const sizeChance of sortedLitterSizes) {
                if (chanceResult <= sizeChance) {
                    return dataset.indexOf(sizeChance) + 1 // convert to a count
                }
            }
        })()

        // now we loop through and create a litter of the appropriate size
        let litter = []
        for (let i = 0; i < litterSize; i++) {
            litter.push(implementation())
        }

        return litter
    }

    return {
        offspring,
        generateOffspring
    }
})
