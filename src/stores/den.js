import Nemeion from '@/types/Nemeion'
import NemeionBreedingGround from '@/types/NemeionBreedingGround'
import NemeionRandomGenerator from '@/types/NemeionRandomGenerator'

import { ref } from 'vue'
import { defineStore } from 'pinia'

import _random from 'lodash/random'

import DATA from '@/data.yaml'
import { GENDERS } from '@/Constants'

const DEFAULT_CHANCE_ROLL = () => _random(0, 1, true)

export default defineStore('den', () => {
    const father = ref(new Nemeion({ gender: GENDERS.Male }))
    const mother = ref(new Nemeion({ gender: GENDERS.Female }))
    const offspring = ref([])

    function _generateLitter(chanceRoll, implementation) {
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

    function makeRandom(
        randomGenerator = new NemeionRandomGenerator(),
        chanceRoll = DEFAULT_CHANCE_ROLL
    ) {
        if (!randomGenerator) {
            throw new Error('Cannot make Nemeions without a random generator')
        }
        if (!(randomGenerator instanceof NemeionRandomGenerator)) {
            throw new Error('Can only make Nemeions with a NemeionRandomGenerator')
        }
        offspring.value = _generateLitter(chanceRoll, () => {
            return randomGenerator.makeOffspring()
        })
    }

    function makeOffspring(
        breedingGround = new NemeionBreedingGround(father.value, mother.value),
        chanceRoll = DEFAULT_CHANCE_ROLL
    ) {
        if (!breedingGround) {
            throw new Error('Cannot breed just anywhere')
        }
        if (!(breedingGround instanceof NemeionBreedingGround)) {
            throw new Error('Can only breed in a NemeionBreedingGround')
        }
        offspring.value = _generateLitter(chanceRoll, () => {
            return breedingGround.makeOffspring()
        })
    }

    return {
        father,
        mother,
        offspring,

        makeOffspring,
        makeRandom
    }
})
