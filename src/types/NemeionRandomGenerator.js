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
        if (this.shouldDoAction(DATA.furs.rare_chance)) {
            return this.randomSample(DATA.furs.rare_options)
        } else {
            return DATA.furs.default
        }
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
        return this.#_generateRandomAspects(DATA.markings.random_cap, MARKINGS.allValues)
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
}
