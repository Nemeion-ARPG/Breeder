import * as NemeionModule from '@/types/Nemeion'
const Nemeion = NemeionModule.default

import { setActivePinia, createPinia } from 'pinia'
import { describe, expect, it, beforeEach, vi } from "vitest"

import denStore from "./den"

import DATA from '@/data.yaml'
import { GENDERS } from '@/Constants'

describe("den store", () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('initialization', () => {
        it('has a father defined', () => {
            const den = denStore()
            expect(den.father).toBeDefined()
            expect(den.father.gender).toBe(GENDERS.Male)
        })

        it('has a mother defined', () => {
            const den = denStore()
            expect(den.mother).toBeDefined()
            expect(den.mother.gender).toBe(GENDERS.Female)
        })

        it('has storage for a litter of offspring', () => {
            const den = denStore()
            expect(den.offspring).toEqual([])
        })
    })

    describe('generateOffspring', () => {
        it('should generate a litter of offspring based off the weights in the data table', () => {
            const den = denStore()

            for (const litterChance of DATA.litters.weights) {
                den.generateOffspring(() => litterChance, { generateFromParents: () => { return {} }})

                const index = DATA.litters.weights.indexOf(litterChance)
                expect(den.offspring.length).toBe(index + 1)
            }
        })

        it('should create Nemeion types', () => {
            const den = denStore()

            den.generateOffspring(() => 1)

            expect(den.offspring[0]).toBeInstanceOf(Nemeion)
        })
    })
})
