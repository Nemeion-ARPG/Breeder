import Nemeion from "./Nemeion"

import { rollForThreshold } from '@/utils'

import DATA from '@/data.yaml'
import { GENDERS } from '@/Constants.js'

export const DEFAULT_SHOULD_DO_ACTION = rollForThreshold

export default class NemeionGenerator {
    constructor(shouldDoAction = DEFAULT_SHOULD_DO_ACTION) {
        this.shouldDoAction = shouldDoAction
    }

    makeOffspring(addons = []) {
        return new Nemeion({
            gender: this._generateGender(addons),
            fur: this._generateFur(addons),
            coat: this._generateCoat(addons),
            build: this._generateBuild(addons),
            traits: this._generateTraits(addons),
            markings: this._generateMarkings(addons),
            mutations: this._generateMutations(addons)
        })
    }

    _generateGender(addons) {
        return this.shouldDoAction(DATA.genders.Female.base_chance) ? GENDERS.Female : GENDERS.Male
    }
    _generateFur(addons) { }
    _generateCoat(addons) { }
    _generateBuild(addons) { }
    _generateTraits(addons) { }
    _generateMarkings(addons) { }
    _generateMutations(addons) { }
}