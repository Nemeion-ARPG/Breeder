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
import { GENDERS, BUILDS, ADDONS, MUTATIONS, MARKINGS } from '@/Constants'

const DEFAULT_CHANCE_ROLL = () => _random(0, 1, true)
const DEFAULT_SHOULD_DO_ACTION = rollForThreshold
const DEFAULT_RANDOM_SAMPLE = _sample

export default defineStore('den', () => {
    const father = ref(new Nemeion({ gender: GENDERS.Male }))
    const mother = ref(new Nemeion({ gender: GENDERS.Female }))
    const offspring = ref([])
    const selectedAddons = ref([])
    const apolloFeatherEnabled = ref(false)
    const selectedApolloMarking = ref(null)
    const heritageEnabled = ref(false)
    const selectedHeritageTrait = ref(null)
    const rank1Enabled = ref(false)

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

    function _applySpecialFeatures(newLitter, randomSample) {
        // Apollo's Feather - force selected marking to appear on at least one cub
        if (apolloFeatherEnabled.value && selectedApolloMarking.value) {
            const litterHasMarking = newLitter.some(cub => cub.markings.includes(selectedApolloMarking.value))
            if (!litterHasMarking && newLitter.length > 0) {
                // Add the marking to a random cub if no cub has it
                const randomCub = randomSample(newLitter)
                if (!randomCub.markings.includes(selectedApolloMarking.value)) {
                    randomCub.markings.push(selectedApolloMarking.value)
                }
            }
        }

        // Heritage - force selected trait onto one random cub
        if (heritageEnabled.value && selectedHeritageTrait.value && newLitter.length > 0) {
            const randomCub = randomSample(newLitter)
            const [traitType, traitValue] = selectedHeritageTrait.value.split(':')
            
            if (traitType === 'marking' && !randomCub.markings.includes(traitValue)) {
                randomCub.markings.push(traitValue)
            } else if (traitType === 'mutation' && !randomCub.mutations.includes(traitValue)) {
                randomCub.mutations.push(traitValue)
            } else if (traitType === 'coat') {
                randomCub.coat = traitValue
            }
        }
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

    function makeRandom5(
        randomGenerator = new NemeionRandomGenerator()
    ) {
        if (!randomGenerator) {
            throw new Error('Cannot make Nemeions without a random generator')
        }
        if (!(randomGenerator instanceof NemeionRandomGenerator)) {
            throw new Error('Can only make Nemeions with a NemeionRandomGenerator')
        }
        // Force litter size to be exactly 5
        offspring.value = _generateLitter(5, () => {
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

        // Apply minimum guarantees first, then add bonuses on top
        if (selectedAddons.value.includes(ADDONS.AO_BREEDER_I)) {
            const minimumCubs = DATA.add_ons.AO_BREEDER_I.options.minimum_cubs
            litterSize = Math.max(litterSize, minimumCubs)
        }
        if (selectedAddons.value.includes(ADDONS.AO_BREEDER_II)) {
            const minimumCubs = DATA.add_ons.AO_BREEDER_II.options.minimum_cubs
            litterSize = Math.max(litterSize, minimumCubs)
        }

        // Apply additional cubs from other addons
        if (selectedAddons.value.includes(ADDONS.AO_BLOSSOM_CHLORIS)) {
            litterSize += DATA.add_ons.AO_BLOSSOM_CHLORIS.options.additional
        }
        if (selectedAddons.value.includes(ADDONS.AO_FERTILITY_TREATMENT)) {
            const options = DATA.add_ons.AO_FERTILITY_TREATMENT.options
            if (fertilityTreatmentOverrides.shouldDoAction(options.chance)) {
                litterSize += fertilityTreatmentOverrides.rollLitterSize(options.min_additional, options.max_additional)
            }
        }
        if (selectedAddons.value.includes(ADDONS.AO_CONSUL_SINGLE)) {
            const options = DATA.add_ons.AO_CONSUL_SINGLE.options
            if (fertilityTreatmentOverrides.shouldDoAction(options.chance)) {
                litterSize += options.additional_cubs
            }
        }
        if (selectedAddons.value.includes(ADDONS.AO_CONSUL_DOUBLE)) {
            const options = DATA.add_ons.AO_CONSUL_DOUBLE.options
            if (fertilityTreatmentOverrides.shouldDoAction(options.chance)) {
                litterSize += options.additional_cubs
            }
        }

        let remainingItems = [...selectedAddons.value]
        const newLitter = _generateLitter(litterSize, () => {
            const newChild = breedingGround.makeOffspring(remainingItems)

            return newChild
        })

        if (selectedAddons.value.includes(ADDONS.AO_MUTATION_STONE)) {
            const litterWithZeroMutations = newLitter.every((child) => !child.hasMutations)
            if (litterWithZeroMutations) {
                newLitter[0].mutations = [randomSample(MUTATIONS.allValues)]
            }
        }

        if (selectedAddons.value.includes(ADDONS.AO_LEGATUS_SINGLE)) {
            const mutationChance = DATA.add_ons.AO_LEGATUS_SINGLE.options.mutation_chance
            newLitter.forEach(cub => {
                if (fertilityTreatmentOverrides.shouldDoAction(mutationChance)) {
                    const randomMutation = randomSample(MUTATIONS.allValues)
                    if (!cub.mutations.includes(randomMutation)) {
                        cub.mutations.push(randomMutation)
                    }
                }
            })
        }

        if (selectedAddons.value.includes(ADDONS.AO_LEGATUS_DOUBLE)) {
            const mutationChance = DATA.add_ons.AO_LEGATUS_DOUBLE.options.mutation_chance
            newLitter.forEach(cub => {
                if (fertilityTreatmentOverrides.shouldDoAction(mutationChance)) {
                    const randomMutation = randomSample(MUTATIONS.allValues)
                    if (!cub.mutations.includes(randomMutation)) {
                        cub.mutations.push(randomMutation)
                    }
                }
            })
        }

        if (selectedAddons.value.includes(ADDONS.AO_SHORT_STATURE)) {
            const options = DATA.add_ons.AO_SHORT_STATURE.options
            if (fertilityTreatmentOverrides.shouldDoAction(options.chance)) {
                // Find a cub that's not already a Dwarf and make them Dwarf
                const nonDwarfCub = newLitter.find(cub => cub.build !== BUILDS.Dwarf)
                if (nonDwarfCub) {
                    nonDwarfCub.build = BUILDS.Dwarf
                }
            }
        }

        if (selectedAddons.value.includes(ADDONS.AO_POSEIDONS_PROMISE)) {
            // Get all non-limited markings
            const nonLimitedMarkings = Object.entries(DATA.markings.available)
                .filter(([key, value]) => value.quality !== 'Limited')
                .map(([key, value]) => key)
            
            // Get markings from both parents
            const parentMarkings = [...father.value.markings, ...mother.value.markings]
            
            // Find markings not present in either parent
            const availableMarkings = nonLimitedMarkings.filter(marking => !parentMarkings.includes(marking))
            
            if (availableMarkings.length > 0) {
                // Add a random marking to the first cub
                const randomMarking = randomSample(availableMarkings)
                if (!newLitter[0].markings.includes(randomMarking)) {
                    newLitter[0].markings.push(randomMarking)
                }
            }
        }

        // Apply build-specific potions to 1-2 cubs
        if (selectedAddons.value.includes(ADDONS.AO_DOMESTIC_POTION)) {
            const options = DATA.add_ons.AO_DOMESTIC_POTION.options
            const cubCount = fertilityTreatmentOverrides.rollLitterSize(options.min_cubs, options.max_cubs)
            const targetCubs = newLitter.slice(0, Math.min(cubCount, newLitter.length))
            targetCubs.forEach(cub => {
                cub.build = BUILDS.Domestic
            })
        }

        if (selectedAddons.value.includes(ADDONS.AO_PHARAOH_POTION)) {
            const options = DATA.add_ons.AO_PHARAOH_POTION.options
            const cubCount = fertilityTreatmentOverrides.rollLitterSize(options.min_cubs, options.max_cubs)
            const targetCubs = newLitter.slice(0, Math.min(cubCount, newLitter.length))
            targetCubs.forEach(cub => {
                cub.build = BUILDS.Pharaoh
            })
        }

        if (selectedAddons.value.includes(ADDONS.AO_DWARF_POTION)) {
            const options = DATA.add_ons.AO_DWARF_POTION.options
            const cubCount = fertilityTreatmentOverrides.rollLitterSize(options.min_cubs, options.max_cubs)
            const targetCubs = newLitter.slice(0, Math.min(cubCount, newLitter.length))
            targetCubs.forEach(cub => {
                cub.build = BUILDS.Dwarf
            })
        }

        _applySpecialFeatures(newLitter, randomSample)
        offspring.value = newLitter
    }

    return {
        father,
        mother,
        offspring,
        selectedAddons,
        apolloFeatherEnabled,
        selectedApolloMarking,
        heritageEnabled,
        selectedHeritageTrait,
        rank1Enabled,

        makeOffspring,
        makeRandom,
        makeRandom5
    }
})
