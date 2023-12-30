import Nemeion from "./Nemeion"

import { rollForThreshold } from '@/utils'

import DATA from '@/data.yaml'
import { GENDERS } from '@/Constants.js'

export const DEFAULT_SHOULD_DO_ACTION = rollForThreshold

export default class NemeionGenerator {
    constructor(shouldDoAction = DEFAULT_SHOULD_DO_ACTION) {
        this.shouldDoAction = shouldDoAction
    }

    makeOffspring() {
        return new Nemeion({
            gender: this._generateGender(),
            fur: this._generateFur(),
            coat: this._generateCoat(),
            build: this._generateBuild(),
            traits: this._generateTraits(),
            markings: this._generateMarkings(),
            mutations: this._generateMutations()
        })
    }

    _generateGender() {
        return this.shouldDoAction(DATA.genders.Female.base_chance) ? GENDERS.Female : GENDERS.Male
    }
    _generateFur() { }
    _generateCoat() { }
    _generateBuild() { }
    _generateTraits() { }
    _generateMarkings() { }
    _generateMutations() { }
}