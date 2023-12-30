import Nemeion from '@/types/Nemeion'
import NemeionBreedingGround from '@/types/NemeionBreedingGround'

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

    describe('makeOffspring', () => {
        it('should generate a litter of offspring based off the weights in the data table', () => {
            const den = denStore()

            for (const litterChance of DATA.litters.weights) {
                const breedingGround = new NemeionBreedingGround(den.father, den.mother)
                den.makeOffspring(breedingGround, () => litterChance)

                const index = DATA.litters.weights.indexOf(litterChance)
                expect(den.offspring.length).toBe(index + 1)
            }
        })

        it('should call the breeding ground to generate offspring', () => {
            class MockBreedingGround extends NemeionBreedingGround {
                constructor(father, mother) {
                    super(father, mother)
                    this.makeOffspring = vi.fn().mockImplementation(() => new Nemeion())
                }
            }
            const den = denStore()
            const breedingGround = new MockBreedingGround(den.father, den.mother)
            
            den.makeOffspring(breedingGround)
            expect(breedingGround.makeOffspring).toHaveBeenCalled()
        })

        describe('when given a breeding ground', () => {
            it('throws an error if it is not a NemeionBreedingGround', () => {
                const den = denStore()

                expect(() => {
                    den.makeOffspring(null)
                }).toThrowError()
            })

            it('throws if the value is null', () => {
                const den = denStore()

                expect(() => {
                    den.makeOffspring(null)
                }).toThrowError()
            })
        })
    })
})
