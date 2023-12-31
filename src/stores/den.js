import Nemeion from '@/types/Nemeion'
import NemeionBreedingGround from '@/types/NemeionBreedingGround'
import NemeionRandomGenerator from '@/types/NemeionRandomGenerator'

import '@/extensions/Array'

import { ref } from 'vue'
import { defineStore } from 'pinia'

import _random from 'lodash/random'
import _sample from 'lodash/sample'

import { rollForThreshold } from '@/utils'

import DATA from '@/data.yaml'
import { GENDERS, BUILDS, ADDONS, MUTATIONS } from '@/Constants'

const DEFAULT_CHANCE_ROLL = () => _random(0, 1, true)
const DEFAULT_SHOULD_DO_ACTION = rollForThreshold
const DEFAULT_RANDOM_SAMPLE = _sample

export default defineStore('den', () => {
    const father = ref(new Nemeion({ gender: GENDERS.Male }))
    const mother = ref(new Nemeion({ gender: GENDERS.Female }))
    const offspring = ref([])
    const selectedAddons = ref([])

    function _rollLitterSize(chanceRoll) {
        // litter size is based off weights in the data table
        // so we roll and then lookup in the table to deterime the size
        let chanceResult = chanceRoll()

        let dataset = DATA.litters.weights
        let sortedLitterSizes = dataset.toSorted((a, b) => { return a < b ? -1 : 1 })

        for (const sizeChance of sortedLitterSizes) {
            if (chanceResult <= sizeChance) {
                return dataset.indexOf(sizeChance) + 1 // convert to a count
            }
        }
    }

    function _generateLitter(litterSize, implementation) {
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
        const litterSize = _rollLitterSize(chanceRoll)
        offspring.value = _generateLitter(litterSize, () => {
            return randomGenerator.makeOffspring(selectedAddons.value)
        })
    }

    function makeOffspring(
        breedingGround = new NemeionBreedingGround(father.value, mother.value),
        chanceRoll = DEFAULT_CHANCE_ROLL,
        fertilityTreatmentOverrides = {
            rollLitterSize: (min, max) => _random(min, max),
            shouldDoAction: DEFAULT_SHOULD_DO_ACTION
        },
        randomSample = DEFAULT_RANDOM_SAMPLE
    ) {
        if (!breedingGround) {
            throw new Error('Cannot breed just anywhere')
        }
        if (!(breedingGround instanceof NemeionBreedingGround)) {
            throw new Error('Can only breed in a NemeionBreedingGround')
        }

        let litterSize = _rollLitterSize(chanceRoll)

        if (selectedAddons.value.includes(ADDONS.AO_BLOSSOM_CHLORIS)) {
            litterSize += DATA.add_ons.AO_BLOSSOM_CHLORIS.options.additional
        }
        if (selectedAddons.value.includes(ADDONS.AO_FERTILITY_TREATMENT)) {
            const options = DATA.add_ons.AO_FERTILITY_TREATMENT.options
            if (fertilityTreatmentOverrides.shouldDoAction(options.chance)) {
                litterSize += fertilityTreatmentOverrides.rollLitterSize(options.min_additional, options.max_additional)
            }
        }

        let remainingItems = selectedAddons.value
        const newLitter = _generateLitter(litterSize, () => {
            const newChild = breedingGround.makeOffspring(remainingItems)

            if (remainingItems.includes(ADDONS.AO_TINCTURE_TRANSFORMATION)) {
                remainingItems.remove(ADDONS.AO_TINCTURE_TRANSFORMATION)
                newChild.build = BUILDS.Dwarf
            }
            if (remainingItems.includes(ADDONS.AO_BRUTE_POTION)) {
                remainingItems.remove(ADDONS.AO_BRUTE_POTION)
                newChild.build = BUILDS.Brute
            }
            if (remainingItems.includes(ADDONS.AO_REGAL_POTION)) {
                remainingItems.remove(ADDONS.AO_REGAL_POTION)
                newChild.build = BUILDS.Regal
            }
            if (remainingItems.includes(ADDONS.AO_DOMESTIC_POTION)) {
                remainingItems.remove(ADDONS.AO_DOMESTIC_POTION)
                newChild.build = BUILDS.Domestic
            }

            return newChild
        })

        if (selectedAddons.value.includes(ADDONS.AO_MUTATION_STONE)) {
            const litterWithZeroMutations = newLitter.every((child) => !child.hasMutations)
            if (litterWithZeroMutations) {
                newLitter[0].mutations = [randomSample(MUTATIONS.allValues)]
            }
        }

        offspring.value = newLitter
    }

    return {
        father,
        mother,
        offspring,
        selectedAddons,

        makeOffspring,
        makeRandom
    }
})
