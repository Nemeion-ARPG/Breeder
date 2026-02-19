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
const DEFAULT_ROLL_D100 = () => _random(1, 100)
const DEFAULT_SHOULD_DO_ACTION = rollForThreshold
const DEFAULT_RANDOM_SAMPLE = _sample

export default defineStore('den', () => {
    const father = ref(new Nemeion({ gender: GENDERS.Male, mutationCap: null }))
    const mother = ref(new Nemeion({ gender: GENDERS.Female, mutationCap: null }))
    const offspring = ref([])
    const selectedAddons = ref([])
    const apolloFeatherEnabled = ref(false)
    const selectedApolloMarking = ref(null)
    const heritageEnabled = ref(false)
    const selectedHeritageTrait = ref(null)
    const heritageDoubleEnabled = ref(false)
    const selectedHeritageDoubleTrait = ref(null)
    const rank1Enabled = ref(false)
    const inbreedingEnabled = ref(false)

    function _rollInbreedingHealth(roll, randomSample) {
        if (roll >= 1 && roll <= 20) return 'Inbred - Healthy'
        if (roll >= 21 && roll <= 35) return 'Inbred - Blindness'
        if (roll >= 36 && roll <= 50) return 'Inbred - Deafness'
        if (roll >= 51 && roll <= 75) return 'Inbred - Frail'
        if (roll >= 76 && roll <= 90) return 'Inbred - Infertile'
        if (roll >= 91 && roll <= 99) return 'Inbred - Dead'
        if (roll === 100) {
            const options = ['Inbred - Blindness', 'Inbred - Deafness', 'Inbred - Frail', 'Inbred - Infertile']
            const first = randomSample(options)
            const remaining = options.filter(v => v !== first)
            const second = randomSample(remaining)
            return `${first}, ${second}`
        }

        throw new Error(`Invalid d100 roll: ${roll}`)
    }

    function _applyInbreedingHealth(litter, rollD100, randomSample) {
        if (!inbreedingEnabled.value) return

        litter.forEach(cub => {
            const roll = rollD100()
            cub.health = _rollInbreedingHealth(roll, randomSample)
        })
    }

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
                    randomCub.addMarking(selectedApolloMarking.value)
                }
            }
        }

        // Heritage - force selected trait onto one random cub
        if (heritageEnabled.value && selectedHeritageTrait.value && newLitter.length > 0) {
            const randomCub = randomSample(newLitter)
            const [traitType, traitValue] = selectedHeritageTrait.value.split(':')
            
            if (traitType === 'marking' && !randomCub.markings.includes(traitValue)) {
                randomCub.addMarking(traitValue)
            } else if (traitType === 'mutation') {
                randomCub.addMutation(traitValue)
            } else if (traitType === 'coat') {
                randomCub.coat = traitValue
            }
        }

        // Heritage Double - same as Heritage, allowing an additional forced trait
        if (heritageDoubleEnabled.value && selectedHeritageDoubleTrait.value && newLitter.length > 0) {
            const randomCub = randomSample(newLitter)
            const [traitType, traitValue] = selectedHeritageDoubleTrait.value.split(':')

            if (traitType === 'marking' && !randomCub.markings.includes(traitValue)) {
                randomCub.addMarking(traitValue)
            } else if (traitType === 'mutation') {
                randomCub.addMutation(traitValue)
            } else if (traitType === 'coat') {
                randomCub.coat = traitValue
            }
        }
    }

    function _applyGuaranteedBuilds(newLitter) {
        if (newLitter.length === 0) return

        // These potions guarantee at least one cub, not the whole litter
        if (selectedAddons.value.includes(ADDONS.AO_BRUTE_POTION)) {
            newLitter[0].build = BUILDS.Brute
        }
        if (selectedAddons.value.includes(ADDONS.AO_REGAL_POTION)) {
            newLitter[0].build = BUILDS.Regal
        }
    }

    function _applyVolatilePotionBuild(newLitter, randomSample) {
        if (!selectedAddons.value.includes(ADDONS.AO_VOLATILE_POTION)) return
        if (!Array.isArray(newLitter) || newLitter.length === 0) return

        const excludedBuilds = new Set([father.value.build, mother.value.build].filter(Boolean))
        const availableBuilds = BUILDS.allValues.filter(build => !excludedBuilds.has(build))
        if (availableBuilds.length === 0) return

        // If we already have a cub with a non-parent build, nothing to do.
        const alreadySatisfied = newLitter.some(cub => cub?.build && !excludedBuilds.has(cub.build))
        if (alreadySatisfied) return

        // Prefer not to overwrite the "guaranteed" build potions which target the first cub.
        const targetPool = newLitter.length > 1 ? newLitter.slice(1) : newLitter
        const targetCub = randomSample(targetPool) ?? newLitter[0]

        targetCub.build = randomSample(availableBuilds)
    }

    function _applyMutagenicPhysicalMutation(newLitter, randomSample, shouldDoAction) {
        if (!selectedAddons.value.includes(ADDONS.AO_MUTAGENIC)) return
        if (!Array.isArray(newLitter) || newLitter.length === 0) return

        const physicalMutations = Object.entries(DATA.mutations.available)
            .filter(([, value]) => value?.category === 'physical')
            .map(([key]) => key)

        if (physicalMutations.length === 0) return

        const doAction = typeof shouldDoAction === 'function' ? shouldDoAction : DEFAULT_SHOULD_DO_ACTION

        const hasPhysical = (cub) =>
            Array.isArray(cub?.mutations) && cub.mutations.some(m => DATA.mutations.available?.[m]?.category === 'physical')

        const canReceiveMoreMutations = (cub) => (Array.isArray(cub?.mutations) ? cub.mutations.length < 3 : true)

        const tryAddPhysical = (cub) => {
            if (!cub) return false
            if (hasPhysical(cub)) return false
            if (!canReceiveMoreMutations(cub)) return false

            const availableForCub = physicalMutations.filter(m => !cub.mutations.includes(m))
            if (availableForCub.length === 0) return false

            cub.addMutation(randomSample(availableForCub))
            return hasPhysical(cub)
        }

        const options = DATA.add_ons.AO_MUTAGENIC?.options ?? {}
        const secondCubChance = options.second_cub_chance ?? 0.5
        const remainingCubChance = options.remaining_cub_chance ?? 0.25

        // 1) Guarantee at least one cub has a physical mutation (if possible).
        if (!newLitter.some(hasPhysical)) {
            const candidates = newLitter.filter(cub => !hasPhysical(cub) && canReceiveMoreMutations(cub))
            const target = randomSample(candidates) ?? candidates[0]
            if (target) {
                tryAddPhysical(target)
            }
        }

        // 2) 50% chance to force a second cub.
        if (newLitter.length > 1 && doAction(secondCubChance)) {
            const candidates = newLitter.filter(cub => !hasPhysical(cub) && canReceiveMoreMutations(cub))
            const target = randomSample(candidates) ?? candidates[0]
            if (target) {
                tryAddPhysical(target)
            }
        }

        // 3) 25% chance for each remaining cub.
        newLitter.forEach(cub => {
            if (hasPhysical(cub)) return
            if (!canReceiveMoreMutations(cub)) return
            if (doAction(remainingCubChance)) {
                tryAddPhysical(cub)
            }
        })
    }

    function _forceMutationOnNoMarkings(newLitter, randomSample) {
        if (!Array.isArray(newLitter) || newLitter.length === 0) return
        const allMutations = MUTATIONS.allValues
        if (!Array.isArray(allMutations) || allMutations.length === 0) return

        newLitter.forEach(cub => {
            if (!cub) return
            if (cub.markings?.length > 0) return
            if (cub.mutations?.length > 0) return

            const randomMutation = randomSample(allMutations)
            cub.addMutation(randomMutation)
        })
    }

    function _enforceSingleTitanTraitPerLitter(newLitter, randomSample) {
        if (!Array.isArray(newLitter) || newLitter.length === 0) return

        const cubsWithTitanTraits = newLitter.filter(cub => Array.isArray(cub?.titan_traits) && cub.titan_traits.length > 0)
        if (cubsWithTitanTraits.length === 0) return

        const rolledTraits = [...new Set(cubsWithTitanTraits.flatMap(cub => cub.titan_traits))]
        if (rolledTraits.length === 0) return

        const sample = typeof randomSample === 'function' ? randomSample : DEFAULT_RANDOM_SAMPLE
        const traitToKeep = sample(rolledTraits) ?? rolledTraits[0]
        if (!traitToKeep) return

        const eligibleCubs = cubsWithTitanTraits.filter(cub => cub.titan_traits.includes(traitToKeep))
        const cubToKeep = sample(eligibleCubs) ?? eligibleCubs[0] ?? cubsWithTitanTraits[0]
        if (!cubToKeep) return

        newLitter.forEach(cub => {
            if (!cub) return
            cub.titan_traits = []
        })
        cubToKeep.titan_traits = [traitToKeep]
    }

    function makeRandom(
        randomGenerator = new NemeionRandomGenerator(),
        chanceRoll = DEFAULT_CHANCE_ROLL,
        rollD100 = DEFAULT_ROLL_D100,
        randomSample = DEFAULT_RANDOM_SAMPLE
    ) {
        if (!randomGenerator) {
            throw new Error('Cannot make Nemeions without a random generator')
        }
        if (!(randomGenerator instanceof NemeionRandomGenerator)) {
            throw new Error('Can only make Nemeions with a NemeionRandomGenerator')
        }
        const litterSize = _rollLitterSize(chanceRoll)
        const newLitter = _generateLitter(litterSize, () => {
            return randomGenerator.makeOffspring(selectedAddons.value)
        })

        _applyGuaranteedBuilds(newLitter)
        _applyInbreedingHealth(newLitter, rollD100, randomSample)
        _forceMutationOnNoMarkings(newLitter, randomSample)
        offspring.value = newLitter
    }

    function makeRandom5(
        randomGenerator = new NemeionRandomGenerator(),
        rollD100 = DEFAULT_ROLL_D100,
        randomSample = DEFAULT_RANDOM_SAMPLE
    ) {
        if (!randomGenerator) {
            throw new Error('Cannot make Nemeions without a random generator')
        }
        if (!(randomGenerator instanceof NemeionRandomGenerator)) {
            throw new Error('Can only make Nemeions with a NemeionRandomGenerator')
        }
        // Force litter size to be exactly 5
        const newLitter = _generateLitter(5, () => {
            return randomGenerator.makeOffspring(selectedAddons.value)
        })

        _applyGuaranteedBuilds(newLitter)
        _applyInbreedingHealth(newLitter, rollD100, randomSample)
        _forceMutationOnNoMarkings(newLitter, randomSample)
        offspring.value = newLitter
    }

    function makeRandom1(
        randomGenerator = new NemeionRandomGenerator(),
        rollD100 = DEFAULT_ROLL_D100,
        randomSample = DEFAULT_RANDOM_SAMPLE
    ) {
        if (!randomGenerator) {
            throw new Error('Cannot make Nemeions without a random generator')
        }
        if (!(randomGenerator instanceof NemeionRandomGenerator)) {
            throw new Error('Can only make Nemeions with a NemeionRandomGenerator')
        }

        const newLitter = _generateLitter(1, () => {
            return randomGenerator.makeOffspring(selectedAddons.value)
        })

        _applyGuaranteedBuilds(newLitter)
        _applyInbreedingHealth(newLitter, rollD100, randomSample)
        _forceMutationOnNoMarkings(newLitter, randomSample)
        offspring.value = newLitter
    }

    function makeOffspring(
        breedingGround = new NemeionBreedingGround(father.value, mother.value),
        chanceRoll = DEFAULT_CHANCE_ROLL,
        fertilityTreatmentOverrides = {
            rollLitterSize: (min, max) => _random(min, max),
            shouldDoAction: DEFAULT_SHOULD_DO_ACTION
        },
        randomSample = DEFAULT_RANDOM_SAMPLE,
        rollD100 = DEFAULT_ROLL_D100
    ) {
        if (!breedingGround) {
            throw new Error('Cannot breed just anywhere')
        }
        if (!(breedingGround instanceof NemeionBreedingGround)) {
            throw new Error('Can only breed in a NemeionBreedingGround')
        }

        let litterSize = _rollLitterSize(chanceRoll)

        // Apply minimum guarantees first, then add bonuses on top
        if (selectedAddons.value.includes(ADDONS.AO_POMEGRANATE_ELEUSIS)) {
            const minimumCubs = DATA.add_ons.AO_POMEGRANATE_ELEUSIS.options.minimum_cubs
            litterSize = Math.max(litterSize, minimumCubs)
        }
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
            const cubWithSpace = newLitter.find(cub => Array.isArray(cub.mutations) ? cub.mutations.length < 3 : true)
            if (cubWithSpace) {
                cubWithSpace.addMutation(randomSample(MUTATIONS.allValues))
            }
        }

        if (selectedAddons.value.includes(ADDONS.AO_LEGATUS_SINGLE)) {
            let mutationChance = DATA.add_ons.AO_LEGATUS_SINGLE.options.mutation_chance

            if (selectedAddons.value.includes(ADDONS.AO_WEREWORM)) {
                mutationChance += DATA.add_ons.AO_WEREWORM.options.increased_chance
            }
            if (selectedAddons.value.includes(ADDONS.AO_RARE_BLOOD)) {
                mutationChance += DATA.add_ons.AO_RARE_BLOOD.options.increased_chance
            }

            mutationChance = Math.min(1, mutationChance)
            newLitter.forEach(cub => {
                if (fertilityTreatmentOverrides.shouldDoAction(mutationChance)) {
                    const randomMutation = randomSample(MUTATIONS.allValues)
                    if (!cub.mutations.includes(randomMutation)) {
                        cub.addMutation(randomMutation)
                    }
                }
            })
        }

        if (selectedAddons.value.includes(ADDONS.AO_LEGATUS_DOUBLE)) {
            let mutationChance = DATA.add_ons.AO_LEGATUS_DOUBLE.options.mutation_chance

            if (selectedAddons.value.includes(ADDONS.AO_WEREWORM)) {
                mutationChance += DATA.add_ons.AO_WEREWORM.options.increased_chance
            }
            if (selectedAddons.value.includes(ADDONS.AO_RARE_BLOOD)) {
                mutationChance += DATA.add_ons.AO_RARE_BLOOD.options.increased_chance
            }

            mutationChance = Math.min(1, mutationChance)
            newLitter.forEach(cub => {
                if (fertilityTreatmentOverrides.shouldDoAction(mutationChance)) {
                    const randomMutation = randomSample(MUTATIONS.allValues)
                    if (!cub.mutations.includes(randomMutation)) {
                        cub.addMutation(randomMutation)
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
                    newLitter[0].addMarking(randomMarking)
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

        _applyGuaranteedBuilds(newLitter)
        _applyVolatilePotionBuild(newLitter, randomSample)
        _applySpecialFeatures(newLitter, randomSample)

        // Apply after other mutation-affecting addons so we only force it if needed.
        _applyMutagenicPhysicalMutation(newLitter, randomSample, fertilityTreatmentOverrides.shouldDoAction)

        _applyInbreedingHealth(newLitter, rollD100, randomSample)

        // Global litter rule: only one Titan Trait may pass, and only to one cub.
        _enforceSingleTitanTraitPerLitter(newLitter, randomSample)
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
        heritageDoubleEnabled,
        selectedHeritageDoubleTrait,
        rank1Enabled,
        inbreedingEnabled,

        makeOffspring,
        makeRandom,
        makeRandom1,
        makeRandom5
    }
})
