import { setActivePinia, createPinia } from 'pinia'
import { describe, expect, it, beforeEach, vi } from "vitest"

import NemeionBreedingGround, { DEFAULT_RANDOM_SAMPLE } from './breeding-ground'
import { DEFAULT_SHOULD_DO_ACTION, DEFAULT_RANDOM_SAMPLE } from './breeding-ground'

import DATA from '@/data.yaml'
import {
    GENDERS,
    FURS,
    COATS,
    BUILDS,
    MUTATIONS,
    TRAITS, TRAIT_QUALITIES,
    MARKINGS, MARKING_QUALITIES
} from '@/Constants.js'
import Nemeion from '@/types/Nemeion'

describe('nemeion breeding ground', () => {
    const prototypeFather = new Nemeion({ gender: GENDERS.Male })
    const prototypeMother = new Nemeion({ gender: GENDERS.Female })

    describe('constructor', () => {
        describe('when passed no or only 1 parent', () => {
            it('throws an error', () => {
                expect(() => { new NemeionBreedingGround() }).toThrow()
                expect(() => { new NemeionBreedingGround(new Nemeion()) }).toThrow()
            })
        })

        describe('when passed non-Nemeion objects', () => {
            it('throws an error', () => {
                expect(() => { new NemeionBreedingGround({}, {}) }).toThrow()
                expect(() => { new NemeionBreedingGround(new Nemeion(), {}) }).toThrow()
                expect(() => { new NemeionBreedingGround({}, new Nemeion()) }).toThrow()
            })
        })

        describe("and the parent genders don't match expectations", () => {
            it('throws an error', () => {
                const confusedFather = new Nemeion({ gender: GENDERS.Female })
                const confusedMother = new Nemeion({ gender: GENDERS.Male })

                expect(() => { new NemeionBreedingGround(confusedFather, confusedMother) }).toThrow()
            })
        })

        describe("and the parents are homosexual", () => {
            it('throws an error', () => {
                expect(() => { new NemeionBreedingGround(prototypeFather, prototypeFather) }).toThrow()
                expect(() => { new NemeionBreedingGround(prototypeMother, prototypeMother) }).toThrow()
            })
        })

        describe('and the parents are as expected', () => {
            it('does not throw', () => {
                expect(() => new NemeionBreedingGround(prototypeFather, prototypeMother)).not.toThrow()
            })

            it('stores the parents as instance properties', () => {
                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother)
                expect(breedingGround.father).toEqual(prototypeFather)
                expect(breedingGround.mother).toEqual(prototypeMother)
            })
        })

        describe('logic dependency injection', () => {
            it('should store defaults if no overrides are provided', () => {
                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother)
                
                expect(breedingGround.shouldDoAction).toBe(DEFAULT_SHOULD_DO_ACTION)
                expect(breedingGround.randomSample).toBe(DEFAULT_RANDOM_SAMPLE)
            })

            it('should store overrides if provided', () => {
                const mockShouldDoAction = vi.fn()
                const mockRandomSample = vi.fn()
                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, {
                    shouldDoAction: mockShouldDoAction,
                    randomSample: mockRandomSample
                })

                expect(breedingGround.shouldDoAction).toBe(mockShouldDoAction)
                expect(breedingGround.shouldDoAction).not.toBe(DEFAULT_SHOULD_DO_ACTION)
                
                expect(breedingGround.randomSample).toBe(mockRandomSample)
                expect(breedingGround.randomSample).not.toBe(DEFAULT_RANDOM_SAMPLE)
            })
        })
    })

    describe('makeOffspring', () => {
        it('generates an offspring based on the parents', () => {
            const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother)
            const genderSpy = vi.spyOn(breedingGround, '_generateGender')
            const furSpy = vi.spyOn(breedingGround, '_generateFur')
            const coatSpy = vi.spyOn(breedingGround, '_generateCoat')
            const buildSpy = vi.spyOn(breedingGround, '_generateBuild')
            const traitsSpy = vi.spyOn(breedingGround, '_generateTraits')
            const markingsSpy = vi.spyOn(breedingGround, '_generateMarkings')
            const mutationsSpy = vi.spyOn(breedingGround, '_generateMutations')

            const offspring = breedingGround.makeOffspring()

            expect(offspring).toBeInstanceOf(Nemeion)
            expect(genderSpy).toBeCalledTimes(1)
            expect(furSpy).toBeCalledTimes(1)
            expect(coatSpy).toBeCalledTimes(1)
            expect(buildSpy).toBeCalledTimes(1)
            expect(traitsSpy).toBeCalledTimes(1)
            expect(markingsSpy).toBeCalledTimes(1)
            expect(mutationsSpy).toBeCalledTimes(1)
        })

        describe('generateGender', () => {
            it('returns female if the roll is successful', () => {
                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, { shouldDoAction: () => true })
                const result = breedingGround._generateGender()
                expect(result).toBe(GENDERS.Female)
            })

            it('returns male if the roll is unsuccessful', () => {
                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, { shouldDoAction: () => false })
                const result = breedingGround._generateGender()
                expect(result).toBe(GENDERS.Male)
            })
        })

        describe('generateFur', () => {
            describe('when no parent has rare fur', () => {
                it('returns a sleek fur when the random roll is unsuccessful', () => {
                    const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, { shouldDoAction: () => false })
                    const result = breedingGround._generateFur()

                    expect(result).toBe(FURS.Sleek)
                })

                it('returns a rare fur when the random roll is successful', () => {
                    const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, {
                        shouldDoAction: () => true,
                        randomSample: () => FURS.Silky
                    })
                    const result = breedingGround._generateFur()

                    expect(result).toEqual(FURS.Silky)
                })
            })

            describe('when both parents have rare fur', () => {
                describe('when parents have the same fur', () => {
                    const expectedFur = FURS.Silky
                    const father = new Nemeion({ ...prototypeFather, fur: expectedFur })
                    const mother = new Nemeion({ ...prototypeMother, fur: expectedFur })

                    it('returns a sleek fur when the inherit roll AND the random roll are unsuccessful', () => {
                        const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: () => false })
                        
                        const result = breedingGround._generateFur()
                        expect(result).toBe(FURS.Sleek)
                    })

                    it('returns the same fur as the parents when the inherit roll is successful', () => {
                        const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: () => true })
                        
                        const result = breedingGround._generateFur()
                        expect(result).toBe(expectedFur)
                    })

                    it('returns a random rare fur when the inherit roll is unsuccessful but the random roll is successful', () => {
                        const mockChanceRoll = vi.fn()
                            .mockImplementationOnce(() => false)
                            .mockImplementationOnce(() => true)
                        const mockSampleRoll = vi.fn().mockImplementation(() => FURS.Polar)
                        const breedingGround = new NemeionBreedingGround(father, mother, {
                            shouldDoAction: mockChanceRoll,
                            randomSample: mockSampleRoll
                        })
                        
                        const result = breedingGround._generateFur()
                        expect(result).toBe(FURS.Polar)
                    })
                })

                describe("when parents DON'T have the same fur", () => {
                    const mother = new Nemeion({ ...prototypeMother, fur: FURS.Silky })

                    it('always rolls an inherit chance for each parent', () => {
                        const father = new Nemeion({ ...prototypeFather, fur: FURS.Polar })

                        const mockMethod = vi.fn().mockImplementation(() => false)

                        const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })
                        const result = breedingGround._generateFur()

                        // 1 per parent + 1 for the random roll
                        expect(mockMethod.mock.calls.length).toBe(3)
                    })

                    it("returns the mother's fur when both inherit rolls are successful", () => {
                        const father = new Nemeion({ ...prototypeFather, fur: FURS.Polar })
                        const mockMethod = vi.fn().mockImplementation(() => true)

                        const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })
                        const result = breedingGround._generateFur()

                        expect(result).toBe(FURS.Silky)
                    })

                    it("returns the appropriate parent's fur when only one inherit roll is successful", () => {
                        const father = new Nemeion({ ...prototypeFather, fur: FURS.Polar })

                        const fatherResultMethod = vi.fn()
                            .mockImplementationOnce(() => false)
                            .mockImplementationOnce(() => true)
                        const fatherBreedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: fatherResultMethod })
                        const fatherResult = fatherBreedingGround._generateFur()
                        expect(fatherResult).toBe(father.fur)

                        const motherResultMethod = vi.fn()
                            .mockImplementationOnce(() => true)
                            .mockImplementationOnce(() => false)
                        const motherBreedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: motherResultMethod })
                        const motherResult = motherBreedingGround._generateFur()
                        expect(motherResult).toBe(mother.fur)
                    })
                })
            })

            describe('when one parent has rare fur', () => {
                it("returns the appropriate parent's fur when the inherit roll is successful", () => {
                    const father = new Nemeion({ ...prototypeFather, fur: FURS.Silky })
                    const fatherBreedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: () => true })
                    const fatherResult = fatherBreedingGround._generateFur()
                    expect(fatherResult).toBe(father.fur)

                    const mother = new Nemeion({ ...prototypeMother, fur: FURS.Polar })
                    const motherBreedingGround = new NemeionBreedingGround(prototypeFather, mother, { shouldDoAction: () => true })
                    const motherResult = motherBreedingGround._generateFur()
                    expect(motherResult).toBe(mother.fur)
                })

                it('returns a sleek fur when the inherit roll is unsuccessful AND random roll is unsuccessful', () => {
                    const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, { shouldDoAction: () => false })
                    const result = breedingGround._generateFur()
                    expect(result).toBe(FURS.Sleek)
                })

                it('returns a random rare fur when the inherit roll is unsuccessful but the random roll is successful', () => {
                    const father = new Nemeion({ ...prototypeFather, fur: FURS.Silky })

                    const mockInheritRoll = vi.fn()
                        .mockImplementationOnce(() => false)
                        .mockImplementationOnce(() => true)
                    const mockSampleRoll = vi.fn().mockImplementation(() => FURS.Polar)
                    const breedingGround = new NemeionBreedingGround(father, prototypeMother, {
                        shouldDoAction: mockInheritRoll,
                        randomSample: mockSampleRoll
                    })
                    const result = breedingGround._generateFur()

                    expect(result).toBe(FURS.Polar)
                    expect(mockSampleRoll).toHaveBeenCalled()
                })
            })
        })

        describe('generateCoat', () => {
            describe('when both parents have the same coat', () => {
                it('always returns the same coat as the parents', () => {
                    const expectedCoat = COATS.Cream
                    const father = new Nemeion({ ...prototypeFather, coat: expectedCoat })
                    const mother = new Nemeion({ ...prototypeMother, coat: expectedCoat })

                    const mockMethod = vi.fn().mockImplementation(() => false)
                    const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })
                    
                    const result = breedingGround._generateCoat()
        
                    expect(mockMethod).not.toHaveBeenCalled()
                    expect(result).toBe(expectedCoat)
                })
            })

            describe('when parents have different coats', () => {
                it("returns the father's coat when the inherit roll is unsuccessful", () => {
                    const father = new Nemeion({ ...prototypeFather, coat: COATS.Cream })
                    const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: () => false })
                    
                    const result = breedingGround._generateCoat()

                    expect(result).toBe(father.coat)
                })

                it("returns the mother's coat when the inherit roll is successful", () => {
                    const father = new Nemeion({ ...prototypeFather, coat: COATS.Cream })
                    const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: () => true })
                    
                    const result = breedingGround._generateCoat()

                    expect(result).toBe(prototypeMother.coat)
                })
            })
        })

        describe('generateBuild', () => {
            describe('when both parents have the same build', () => {
                it('uses the same build as the parents', () => {
                    const mockMethod = vi.fn()
                    const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, { shouldDoAction: mockMethod })

                    expect(prototypeFather.build).toBe(prototypeMother.build)
                    const result = breedingGround._generateBuild()
                    expect(mockMethod).not.toBeCalled()
                    expect(result).toBe(prototypeFather.build)
                })
            })

            describe('when both parents have different builds', () => {
                describe('and the builds are incompatible', () => {
                    it('throws an error', () => {
                        const father = new Nemeion({ ...prototypeFather, build: BUILDS.Brute })
                        const mother = new Nemeion({ ...prototypeMother, build: BUILDS.Domestic })
                        const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: () => true })

                        expect(() => offspring._generateBuild).toThrowError()
                    })
                })

                describe('and the builds are compatible', () => {
                    const father = prototypeFather
                    const mother = new Nemeion({ ...prototypeMother, build: BUILDS.Dwarf })

                    it("uses the mother's rate to roll for build inheritance", () => {
                        const mockMethod = vi.fn().mockImplementation(() => true)
                        const expectedChanceRate = DATA.builds.available[father.build].inherit_chance[mother.build]
                        const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })

                        let _ = breedingGround._generateBuild()

                        expect(mockMethod).toBeCalledTimes(1)
                        expect(mockMethod).toBeCalledWith(expectedChanceRate)
                    })

                    it("uses the father's build if the inherit roll is unsuccessful", () => {
                        const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: () => false })

                        const result = breedingGround._generateBuild()
                        expect(result).toBe(father.build)
                    })

                    it("uses the mother's build if the inherit roll is successful", () => {
                        const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: () => true})

                        const result = breedingGround._generateBuild()
                        expect(result).toBe(mother.build)
                    })
                })
            })
        })

        describe('generateTraits', () => {
            it('returns a unique list of traits in the final result set', () => {
                const father = new Nemeion({ ...prototypeFather, traits: [TRAITS.Common_1] })
                const mother = new Nemeion({ ...prototypeMother, traits: [TRAITS.Common_1] })
                const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: () => true})
                
                const result = breedingGround._generateTraits()
                expect(result.length).toBe(1)
            })

            describe('when both parents have no traits', () => {
                it('returns no traits for the offspring', () => {
                    const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, { shouldDoAction: () => true })

                    const result = breedingGround._generateTraits()
                    expect(result).toEqual([])
                })

                it('does not roll for inheritance', () => {
                    const mockMethod = vi.fn().mockImplementation(() => true)
                    const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, { shouldDoAction: mockMethod })

                    const result = breedingGround._generateTraits()
                    expect(mockMethod).not.toBeCalled()
                })
            })

            describe('when both parents have traits', () => {
                it('rolls to inherit all traits from both parents', () => {
                    const father = new Nemeion({ ...prototypeFather, traits: [TRAITS.Common_1] })
                    const mother = new Nemeion({ ...prototypeMother, traits: [TRAITS.Uncommon_1] })

                    const mockMethod = vi.fn().mockImplementation(() => true)
                    const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })

                    let _ = breedingGround._generateTraits()
                    expect(mockMethod).toBeCalledTimes(2)
                })

                describe('and the traits are the exact same', () => {
                    it('rolls to inherit exactly once', () => {
                        const traits = [TRAITS.Common_1, TRAITS.Uncommon_1]
                        const father = new Nemeion({ ...prototypeFather, traits })
                        const mother = new Nemeion({ ...prototypeMother, traits })
    
                        const mockMethod = vi.fn().mockImplementation(() => true)
                        const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })
    
                        let _ = breedingGround._generateTraits()

                        expect(mockMethod).toBeCalledTimes(2)
                        expect(mockMethod).not.toHaveBeenLastCalledWith(mockMethod.mock.calls[0][0])
                    })

                    it('rolls to inherit with the double rate', () => {
                        const traits = [TRAITS.Common_1]
                        const father = new Nemeion({ ...prototypeFather, traits })
                        const mother = new Nemeion({ ...prototypeMother, traits })
    
                        const mockMethod = vi.fn().mockImplementation(() => true)
                        const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })
    
                        let _ = breedingGround._generateTraits()

                        expect(mockMethod).toBeCalledTimes(1)
                        expect(mockMethod).toHaveBeenCalledWith(DATA.traits.qualities[TRAIT_QUALITIES.Common].inherit_chance.double)
                    })
                })
            })

            describe('when at least one parent has traits', () => {
                it('rolls to inherit the trait from the parent with the single rate', () => {
                    const father = new Nemeion({ ...prototypeFather, traits: [TRAITS.Common_1] })
    
                    const mockMethod = vi.fn().mockImplementation(() => true)
                    const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: mockMethod })

                    let _ = breedingGround._generateTraits()

                    expect(mockMethod).toBeCalledTimes(1)
                    expect(mockMethod).toHaveBeenCalledWith(DATA.traits.qualities[TRAIT_QUALITIES.Common].inherit_chance.single)
                })

                it('rolls to inherit the trait with the single rate even if the trait is accidentally duplicated', () => {
                    const father = new Nemeion({ ...prototypeFather, traits: [TRAITS.Common_1, TRAITS.Common_1] })

                    const mockMethod = vi.fn().mockImplementation(() => true)
                    const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: mockMethod })

                    let _ = breedingGround._generateTraits()

                    expect(mockMethod).toBeCalledTimes(1)
                    expect(mockMethod).toHaveBeenCalledWith(DATA.traits.qualities[TRAIT_QUALITIES.Common].inherit_chance.single)
                })

                it('inherits the trait from the parent if the inherit roll is successful', () => {
                    const father = new Nemeion({ ...prototypeFather, traits: [TRAITS.Common_1] })
                    const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: () => true })

                    let result = breedingGround._generateTraits()

                    expect(result).toEqual([TRAITS.Common_1])
                })

                it('does not have any inherited traits if the inherit roll is unsuccessful', () => {
                    const father = new Nemeion({ ...prototypeFather, traits: [TRAITS.Common_1] })
                    const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: () => false })

                    let result = breedingGround._generateTraits()

                    expect(result).toEqual([])
                })
            })
        })

        describe('generateMarkings', () => {
            it('returns a unique list of markings in the final result set', () => {
                const father = new Nemeion({ ...prototypeFather, markings: [MARKINGS.Common_1] })
                const mother = new Nemeion({ ...prototypeMother, markings: [MARKINGS.Common_1] })
                const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: () => true })
                
                const result = breedingGround._generateMarkings()
                expect(result.length).toBe(1)
            })

            describe('when both parents have no markings', () => {
                it('returns no markings for the offspring', () => {
                    const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, () => true, () => true)

                    const result = breedingGround._generateMarkings()
                    expect(result).toEqual([])
                })

                it('does not roll for inheritance', () => {
                    const mockMethod = vi.fn().mockImplementation(() => true)
                    const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, () => true, mockMethod)

                    const result = breedingGround._generateMarkings()
                    expect(mockMethod).not.toBeCalled()
                })
            })

            describe('when both parents have markings', () => {
                it('rolls to inherit all markings from both parents', () => {
                    const father = new Nemeion({ ...prototypeFather, markings: [TRAITS.Common_1] })
                    const mother = new Nemeion({ ...prototypeMother, markings: [TRAITS.Uncommon_1] })

                    const mockMethod = vi.fn().mockImplementation(() => true)
                    const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })

                    let _ = breedingGround._generateMarkings()
                    expect(mockMethod).toBeCalledTimes(2)
                })

                describe('and the markings are the exact same', () => {
                    it('rolls to inherit exactly once', () => {
                        const markings = [MARKINGS.Common_1, MARKINGS.Uncommon_1]
                        const father = new Nemeion({ ...prototypeFather, markings })
                        const mother = new Nemeion({ ...prototypeMother, markings })
    
                        const mockMethod = vi.fn().mockImplementation(() => true)
                        const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })
    
                        let _ = breedingGround._generateMarkings()

                        expect(mockMethod).toBeCalledTimes(2)
                        expect(mockMethod).not.toHaveBeenLastCalledWith(mockMethod.mock.calls[0][0])
                    })

                    it('rolls to inherit with the double rate', () => {
                        const markings = [MARKINGS.Common_1]
                        const father = new Nemeion({ ...prototypeFather, markings })
                        const mother = new Nemeion({ ...prototypeMother, markings })
    
                        const mockMethod = vi.fn().mockImplementation(() => true)
                        const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })
    
                        let _ = breedingGround._generateMarkings()

                        expect(mockMethod).toBeCalledTimes(1)
                        expect(mockMethod).toHaveBeenCalledWith(DATA.markings.qualities[MARKING_QUALITIES.Common].inherit_chance.double)
                    })
                })
            })

            describe('when at least one parent has markings', () => {
                it('rolls to inherit the marking from the parent with the single rate', () => {
                    const father = new Nemeion({ ...prototypeFather, markings: [MARKINGS.Common_1] })
    
                    const mockMethod = vi.fn().mockImplementation(() => true)
                    const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: mockMethod })

                    let _ = breedingGround._generateMarkings()

                    expect(mockMethod).toBeCalledTimes(1)
                    expect(mockMethod).toHaveBeenCalledWith(DATA.markings.qualities[MARKING_QUALITIES.Common].inherit_chance.single)
                })

                it('rolls to inherit the marking with the single rate even if the marking is accidentally duplicated', () => {
                    const father = new Nemeion({ ...prototypeFather, markings: [MARKINGS.Common_1, MARKINGS.Common_1] })

                    const mockMethod = vi.fn().mockImplementation(() => true)
                    const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: mockMethod})

                    let _ = breedingGround._generateMarkings()

                    expect(mockMethod).toBeCalledTimes(1)
                    expect(mockMethod).toHaveBeenCalledWith(DATA.markings.qualities[MARKING_QUALITIES.Common].inherit_chance.single)
                })

                it('inherits the marking from the parent if the inherit roll is successful', () => {
                    const father = new Nemeion({ ...prototypeFather, markings: [MARKINGS.Common_1] })
                    const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: () => true })

                    let result = breedingGround._generateMarkings()

                    expect(result).toEqual([MARKINGS.Common_1])
                })

                it('does not have any inherited markings if the inherit roll is unsuccessful', () => {
                    const father = new Nemeion({ ...prototypeFather, markings: [MARKINGS.Common_1] })
                    const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: () => false })

                    let result = breedingGround._generateMarkings()

                    expect(result).toEqual([])
                })
            })
        })

    })

    describe('generateMutations', () => {
        it('returns a unique list of mutations in the final result set', () => {
            const father = new Nemeion({ ...prototypeFather, mutations: [MUTATIONS.Test_One] })
            const mother = new Nemeion({ ...prototypeMother, mutations: [MUTATIONS.Test_One] })
            const breedingGround = new NemeionBreedingGround(father, mother, {
                shouldDoAction: () => true,
                randomSample: () => MUTATIONS.Test_One
            })

            const result = breedingGround._generateMutations()
            expect(result.length).toBe(1)
        })

        describe('when neither parents have mutations', () => {
            const parent = { hasMutations: false }

            it('returns no mutations if the chance roll is unsuccessful', () => {
                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, { shouldDoAction: () => false })

                const result = breedingGround._generateMutations()
                expect(result).toEqual([])
            })

            it('returns a random mutation if the chance roll is successful', () => {
                const expectedResult = MUTATIONS.Test_One

                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, {
                    shouldDoAction: () => true,
                    randomSample: () => expectedResult
                })

                const result = breedingGround._generateMutations()
                expect(result).toEqual([expectedResult])
            })
        })

        describe('when either parent has mutations', () => {
            it('rolls for each mutation for inheritance individually', () => {
                const father = new Nemeion({ ...prototypeFather, mutations: [MUTATIONS.Test_One] })
                const mother = new Nemeion({ ...prototypeMother, mutations: [MUTATIONS.Test_One, MUTATIONS.Test_Two] })

                const mockMethod = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, mother, {
                    shouldDoAction: mockMethod,
                    randomSample: DEFAULT_RANDOM_SAMPLE
                })

                let _ = breedingGround._generateMutations()

                expect(mockMethod).toHaveBeenCalledTimes(4) // 1 per mutation + 1 for the random roll
            })

            it('rolls an inherit chance for each parent with a mutation', () => {
                const father = new Nemeion({ ...prototypeFather, mutations: [MUTATIONS.Test_One] })
                const mother = new Nemeion({ ...prototypeMother, mutations: [MUTATIONS.Test_One] })

                const mockMethod = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, mother, {
                    shouldDoAction: mockMethod,
                    randomSample: DEFAULT_RANDOM_SAMPLE
                })
                
                let _ = breedingGround._generateMutations()

                expect(mockMethod).toHaveBeenCalledTimes(3)
            })

            it('always rolls for a random mutation', () => {
                const mockMethod = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, {
                    shouldDoAction: mockMethod,
                    randomSample: DEFAULT_RANDOM_SAMPLE
                })

                let _ = breedingGround._generateMutations()

                expect(mockMethod).toHaveBeenCalledTimes(1)
            })

            it('only rolls for a random mutation once', () => {
                const father = new Nemeion({ ...prototypeFather, mutations: [MUTATIONS.Test_One] })
                const mother = new Nemeion({ ...prototypeMother, mutations: [MUTATIONS.Test_One] })

                const randomMutation = vi.fn().mockImplementation(() => MUTATIONS.Test_Two)
                const parentMutationsBreedingGround = new NemeionBreedingGround(father, mother, {
                    shouldDoAction: () => true,
                    randomSample: randomMutation
                })

                let _ = parentMutationsBreedingGround._generateMutations()
                expect(randomMutation).toBeCalledTimes(1)

                randomMutation.mockReset()

                const noParentMutationsBreedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, {
                    shouldDoAction: () => true,
                    randomSample: randomMutation
                })
                _ = noParentMutationsBreedingGround._generateMutations()
                expect(randomMutation).toBeCalledTimes(1)
            })

            it('returns the parent mutations if the inherit roll is successful', () => {
                const father = new Nemeion({ ...prototypeFather, mutations: [MUTATIONS.Test_One] })
                const mother = new Nemeion({ ...prototypeMother, mutations: [MUTATIONS.Test_One] })

                const mockInheritRoll = vi.fn()
                    .mockImplementationOnce(() => true)
                    .mockImplementationOnce(() => false)
                const breedingGround = new NemeionBreedingGround(father, mother, {
                    shouldDoAction: mockInheritRoll,
                    randomSample: DEFAULT_RANDOM_SAMPLE
                })
                
                const result = breedingGround._generateMutations()
                expect(result).toEqual([MUTATIONS.Test_One])
            })
        })
    })
})
