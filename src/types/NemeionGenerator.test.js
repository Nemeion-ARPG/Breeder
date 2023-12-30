import Nemeion from "./Nemeion"
import NemeionGenerator from "./NemeionGenerator"

import { describe, expect, it, vi } from "vitest"

import { DEFAULT_SHOULD_DO_ACTION } from "./NemeionRandomGenerator"

import { GENDERS } from '@/Constants.js'

describe('NemeionRandomGenerator', () => {
    describe('initialization', () => {
        it('should use the default shouldDoAction function if none is provided', () => {
            const instance = new NemeionGenerator()
            expect(instance.shouldDoAction).toEqual(DEFAULT_SHOULD_DO_ACTION)
        })

        it('should use the provided shouldDoAction function', () => {
            const shouldDoAction = vi.fn()
            const instance = new NemeionGenerator(shouldDoAction)
            expect(instance.shouldDoAction).toEqual(shouldDoAction)
            expect(instance.shouldDoAction).not.toEqual(DEFAULT_SHOULD_DO_ACTION)
        })
    })

    describe('makeOffspring', () => {
        it('should return a Nemeion', () => {
            const instance = new NemeionGenerator()
            const result = instance.makeOffspring()
            expect(result).toBeInstanceOf(Nemeion)
        })

        it('should delegate to subclasses for each property', () => {
            const breedingGround = new NemeionGenerator()
            const genderSpy = vi.spyOn(breedingGround, '_generateGender')
            const furSpy = vi.spyOn(breedingGround, '_generateFur')
            const coatSpy = vi.spyOn(breedingGround, '_generateCoat')
            const buildSpy = vi.spyOn(breedingGround, '_generateBuild')
            const traitsSpy = vi.spyOn(breedingGround, '_generateTraits')
            const markingsSpy = vi.spyOn(breedingGround, '_generateMarkings')
            const mutationsSpy = vi.spyOn(breedingGround, '_generateMutations')

            let _ = breedingGround.makeOffspring()

            expect(genderSpy).toHaveBeenCalled()
            expect(furSpy).toHaveBeenCalled()
            expect(coatSpy).toHaveBeenCalled()
            expect(buildSpy).toHaveBeenCalled()
            expect(traitsSpy).toHaveBeenCalled()
            expect(markingsSpy).toHaveBeenCalled()
            expect(mutationsSpy).toHaveBeenCalled()
        })
    })

    describe('_generateGender', () => {
        it('returns female if the roll is successful', () => {
            const breedingGround = new NemeionGenerator(() => true)
            const result = breedingGround._generateGender()
            expect(result).toBe(GENDERS.Female)
        })

        it('returns male if the roll is unsuccessful', () => {
            const breedingGround = new NemeionGenerator(() => false)
            const result = breedingGround._generateGender()
            expect(result).toBe(GENDERS.Male)
        })
    })
})
