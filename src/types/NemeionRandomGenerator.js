import Nemeion from '@/types/Nemeion'
import NemeionGenerator from './NemeionGenerator'

import _sample from 'lodash/sample'
import _random from 'lodash/random'

import { rollForThreshold } from '@/utils'

import DATA from '@/data.yaml'
import { TRAITS, MARKINGS, MUTATIONS } from '@/Constants.js'

export const DEFAULT_RANDOM_SAMPLE = _sample
export const DEFAULT_SHOULD_DO_ACTION = rollForThreshold
export const DEFAULT_RANDOM_INT = (max) => _random(0, max)
export const DEFAULT_RANDOM_CHANCE = () => _random(0, 1, true)

export default class NemeionRandomGenerator extends NemeionGenerator {
    constructor(
        shouldDoAction = DEFAULT_SHOULD_DO_ACTION,
        randomSample = DEFAULT_RANDOM_SAMPLE,
        randomInt = DEFAULT_RANDOM_INT,
        randomChance = DEFAULT_RANDOM_CHANCE
    ) {
        super(shouldDoAction)
        this.randomSample = randomSample
        this.randomInt = randomInt
        this.randomChance = randomChance
    }

    _generateFur() {
        // Random generation does not include gifts/furs
        return DATA.furs.default
    }
    _generateCoat() {
        return this.#_generateWeightedRandom(DATA.coats.random_chance)
    }
    _generateBuild() {
        return this.#_generateWeightedRandom(DATA.builds.random_chance)
    }
    _generateTraits() {
        return this.#_generateRandomAspects(DATA.traits.random_cap, TRAITS.allValues)
    }
    _generateMarkings() {
        const markings = this.#_generateWeightedMarkings(DATA.markings.random_cap)
        return this.#_filterExclusiveMarkings(markings)
    }
    _generateMutations() {
        return this.#_generateRandomAspects(DATA.mutations.random_cap, MUTATIONS.allValues, () => this.shouldDoAction(DATA.mutations.base_chance))
    }

    #_generateWeightedRandom(weights) {
        const chanceRoll = this.randomChance()

        let dataset = Object.entries(weights)
        let sortedWeights = dataset.toSorted((a, b) => a[1] < b[1] ? -1 : 1)
        
        for (const [value, weight] of sortedWeights) {
            if (chanceRoll <= weight) {
                return value
            }
        }
    }

    #_generateRandomAspects(maxCount, dataset, shouldDoAction = () => true) {
        const totalCount = this.randomInt(maxCount)
        const result = []

        for (let i = 0; i < totalCount; i++) {
            if (shouldDoAction()) {
                result.push(this.randomSample(dataset))
            }
        }

        return [...new Set(result)]
    }

    #_generateWeightedMarkings(maxCount) {
        const totalCount = this.randomInt(maxCount)
        const result = []

        // Define weights for each quality (higher = more likely)
        const qualityWeights = {
            'Limited': 0,      // Will Never Appear
            'Common': 100,     // Very common
            'Uncommon': 60,    // Moderately common  
            'Rare': 15,        // Less common
            'Epic': 5,         // Rare
            'Legendary': 1,    // Very rare
            'Dupes': 5        // Uncommon-ish
        }

        // Create weighted pool once (optimization)
        const weightedMarkings = []
        
        for (const markingKey of MARKINGS.allValues) {
            const markingData = DATA.markings.available[markingKey]
            const quality = markingData?.quality || 'Common'
            const weight = qualityWeights[quality] !== undefined ? qualityWeights[quality] : 60
            
            // Add multiple copies based on weight (no minimum, allowing 0 copies)
            for (let j = 0; j < weight; j++) {
                weightedMarkings.push(markingKey)
            }
        }

        // Debug logging (temporary)
        const qualityCount = {}
        for (const markingKey of weightedMarkings) {
            const quality = DATA.markings.available[markingKey]?.quality || 'Common'
            qualityCount[quality] = (qualityCount[quality] || 0) + 1
        }
        console.log('Weighted pool distribution:', qualityCount)
        console.log('Total pool size:', weightedMarkings.length)

        // Select markings from the weighted pool
        for (let i = 0; i < totalCount; i++) {
            if (weightedMarkings.length > 0) {
                const selectedMarking = this.randomSample(weightedMarkings)
                result.push(selectedMarking)
            }
        }

        return [...new Set(result)]
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
}
