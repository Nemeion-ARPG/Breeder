import { setActivePinia, createPinia } from 'pinia'
import { describe, expect, it, beforeEach, vi } from "vitest"

import litterStore from "./litter"

import DATA from '@/data.yaml'

describe("litter store", () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('generateOffspring', () => {
        it('should generate a litter of offspring based off the weights table', () => {
            const litter = litterStore()

            for (const litterChance of DATA.litters.weights) {
                litter.generateOffspring({}, {}, () => litterChance, { generateFromParents: () => { return {} }})

                const index = DATA.litters.weights.indexOf(litterChance)
                expect(litter.offspring.length).toBe(index + 1)
            }
        })

        it('should use the generateFromParents method of the offspring store', () => {
            const litter = litterStore()
            const father = {}
            const mother = {}

            const mockMethod = vi.fn()
            litter.generateOffspring({}, {}, () => 1, { generateFromParents: mockMethod })

            expect(mockMethod.mock.calls.length).toBe(1)
            expect(mockMethod.mock.calls[0][0]).toEqual(father)
            expect(mockMethod.mock.calls[0][1]).toEqual(mother)
        })
    })
})
