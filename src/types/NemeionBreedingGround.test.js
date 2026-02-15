import NemeionGenerator from './NemeionGenerator'
import NemeionBreedingGround from './NemeionBreedingGround'

import { describe, expect, it, vi } from "vitest"

import { DEFAULT_SHOULD_DO_ACTION, DEFAULT_RANDOM_SAMPLE } from './NemeionBreedingGround'

import DATA from '@/data.yaml'
import {
    GENDERS,
    FURS,
    COATS,
    BUILDS,
    MUTATIONS,
    TRAITS, TRAIT_QUALITIES,
    MARKINGS, MARKING_QUALITIES,
    ADDONS,
    TITAN_TRAITS
} from '@/Constants.js'
import Nemeion from '@/types/Nemeion'

describe('NemeionBreedingGround', () => {
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

    describe('_generateGender', () => {
        describe('when given the aphro passion addon', () => {
            it('always returns female', () => {
                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother)

                const result = breedingGround._generateGender([ADDONS.AO_APHRO_PASSION])
                expect(result).toBe(GENDERS.Female)
            })
        })

        describe('when given the hephaestus fervor addon', () => {
            it('always returns male', () => {
                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother)

                const result = breedingGround._generateGender([ADDONS.AO_HEPHAESTUS_FERVOR])
                expect(result).toBe(GENDERS.Male)
            })
        })

        describe('when not given any addons', () => {
            it('delegates to the superclass implementation', () => {
                const mockMethod = vi.spyOn(NemeionGenerator.prototype, '_generateGender')
                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother)

                let _ = breedingGround._generateGender([])
                expect(mockMethod).toHaveBeenCalled()
            })
        })
    })

    describe('_generateFur', () => {
        describe('when no parent has rare fur', () => {
            it('returns a sleek fur when the random roll is unsuccessful', () => {
                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, { shouldDoAction: () => false })
                const result = breedingGround._generateFur()

                expect(result).toBe(DATA.furs.default)
            })

            it('returns a rare fur when the random roll is successful', () => {
                const expectedRareFur = DATA.furs.rare_options[0]
                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, {
                    shouldDoAction: () => true,
                    randomSample: () => expectedRareFur
                })
                const result = breedingGround._generateFur()

                expect(result).toEqual(expectedRareFur)
            })
        })

        describe('when both parents have rare fur', () => {
            describe('when parents have the same fur', () => {
                const expectedFur = DATA.furs.rare_options[0]
                const father = new Nemeion({ ...prototypeFather, fur: expectedFur })
                const mother = new Nemeion({ ...prototypeMother, fur: expectedFur })

                it('returns a sleek fur when the inherit roll AND the random roll are unsuccessful', () => {
                    const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: () => false })

                    const result = breedingGround._generateFur()
                    expect(result).toBe(DATA.furs.default)
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
                    const expectedRareFur = DATA.furs.rare_options[1]
                    const mockSampleRoll = vi.fn().mockImplementation(() => expectedRareFur)
                    const breedingGround = new NemeionBreedingGround(father, mother, {
                        shouldDoAction: mockChanceRoll,
                        randomSample: mockSampleRoll
                    })

                    const result = breedingGround._generateFur()
                    expect(result).toBe(expectedRareFur)
                })
            })

            describe("when parents DON'T have the same fur", () => {
                const mother = new Nemeion({ ...prototypeMother, fur: DATA.furs.rare_options[0] })

                it('always rolls an inherit chance for each parent', () => {
                    const father = new Nemeion({ ...prototypeFather, fur: DATA.furs.rare_options[1] })

                    const mockMethod = vi.fn().mockImplementation(() => false)

                    const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })
                    const result = breedingGround._generateFur()

                    // 1 per parent + 1 for the random roll
                    expect(mockMethod.mock.calls.length).toBe(3)
                })

                it("returns the mother's fur when both inherit rolls are successful", () => {
                    const father = new Nemeion({ ...prototypeFather, fur: DATA.furs.rare_options[1] })
                    const mockMethod = vi.fn().mockImplementation(() => true)

                    const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })
                    const result = breedingGround._generateFur()

                    expect(result).toBe(mother.fur)
                })

                it("returns the appropriate parent's fur when only one inherit roll is successful", () => {
                    const father = new Nemeion({ ...prototypeFather, fur: DATA.furs.rare_options[1] })

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
                const father = new Nemeion({ ...prototypeFather, fur: DATA.furs.rare_options[0] })
                const fatherBreedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: () => true })
                const fatherResult = fatherBreedingGround._generateFur()
                expect(fatherResult).toBe(father.fur)

                const mother = new Nemeion({ ...prototypeMother, fur: DATA.furs.rare_options[1] })
                const motherBreedingGround = new NemeionBreedingGround(prototypeFather, mother, { shouldDoAction: () => true })
                const motherResult = motherBreedingGround._generateFur()
                expect(motherResult).toBe(mother.fur)
            })

            it('returns a sleek fur when the inherit roll is unsuccessful AND random roll is unsuccessful', () => {
                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, { shouldDoAction: () => false })
                const result = breedingGround._generateFur()
                expect(result).toBe(DATA.furs.default)
            })

            it('returns a random rare fur when the inherit roll is unsuccessful but the random roll is successful', () => {
                const father = new Nemeion({ ...prototypeFather, fur: DATA.furs.rare_options[0] })

                const mockInheritRoll = vi.fn()
                    .mockImplementationOnce(() => false)
                    .mockImplementationOnce(() => true)
                const expectedRareFur = DATA.furs.rare_options[1]
                const mockSampleRoll = vi.fn().mockImplementation(() => expectedRareFur)
                const breedingGround = new NemeionBreedingGround(father, prototypeMother, {
                    shouldDoAction: mockInheritRoll,
                    randomSample: mockSampleRoll
                })
                const result = breedingGround._generateFur()

                expect(result).toBe(expectedRareFur)
                expect(mockSampleRoll).toHaveBeenCalled()
            })
        })
    })

    describe('_generateCoat', () => {
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

    describe('_generateBuild', () => {
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
                    const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: () => true })

                    const result = breedingGround._generateBuild()
                    expect(result).toBe(mother.build)
                })
            })
        })

        describe('with the big boned addon', () => {
            const BRUTE_RATE = DATA.add_ons.AO_BIG_BONED.options.Brute
            const REGAL_RATE = DATA.add_ons.AO_BIG_BONED.options.Regal

            it(`rolls with an ${BRUTE_RATE * 100}% chance if the mother is a brute build`, () => {
                const father = new Nemeion({ ...prototypeFather, build: BUILDS.Domestic })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: mockShouldDoAction })

                let _ = breedingGround._generateBuild([ADDONS.AO_BIG_BONED])
                expect(mockShouldDoAction).toHaveBeenCalledWith(BRUTE_RATE)
            })

            it(`rolls with a ${REGAL_RATE * 100}% chance if the mother is a regal build`, () => {
                const mother = new Nemeion({ ...prototypeMother, build: BUILDS.Regal })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(prototypeFather, mother, { shouldDoAction: mockShouldDoAction })

                let _ = breedingGround._generateBuild([ADDONS.AO_BIG_BONED])
                expect(mockShouldDoAction).toHaveBeenCalledWith(REGAL_RATE)
            })
        })

        describe('with the delicate addon', () => {
            const BOOST = DATA.add_ons.AO_DELICATE.options.increased_chance

            it('does not override the inherit chance if the mother is a brute build', () => {
                const father = new Nemeion({ ...prototypeFather, build: BUILDS.Domestic })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: mockShouldDoAction })

                let _ = breedingGround._generateBuild([ADDONS.AO_DELICATE])
                const baseChance = DATA.builds.available[father.build].inherit_chance[prototypeMother.build]
                expect(mockShouldDoAction).toHaveBeenCalledWith(baseChance)
            })

            it(`adds a ${BOOST * 100}% boost towards the father if the father is regal`, () => {
                const father = new Nemeion({ ...prototypeFather, build: BUILDS.Regal })
                const mother = new Nemeion({ ...prototypeMother, build: BUILDS.Brute })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockShouldDoAction })

                let _ = breedingGround._generateBuild([ADDONS.AO_DELICATE])
                const baseChanceMother = DATA.builds.available[father.build].inherit_chance[mother.build]
                const baseChanceFather = 1 - baseChanceMother
                const boostedChanceFather = Math.min(1, baseChanceFather + BOOST)
                const expectedChanceMother = 1 - boostedChanceFather
                expect(mockShouldDoAction).toHaveBeenCalledWith(expectedChanceMother)
            })

            it(`adds a ${BOOST * 100}% boost if the mother is a regal build`, () => {
                const mother = new Nemeion({ ...prototypeMother, build: BUILDS.Regal })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(prototypeFather, mother, { shouldDoAction: mockShouldDoAction })

                let _ = breedingGround._generateBuild([ADDONS.AO_DELICATE])
                const baseChance = DATA.builds.available[prototypeFather.build].inherit_chance[mother.build]
                const expectedChance = Math.min(1, baseChance + BOOST)
                expect(mockShouldDoAction).toHaveBeenCalledWith(expectedChance)
            })
        })

        describe('with the lean addon', () => {
            const BOOST = DATA.add_ons.AO_LEAN.options.increased_chance

            it('does not override the inherit chance if neither parent is a pharaoh build', () => {
                const father = new Nemeion({ ...prototypeFather, build: BUILDS.Domestic })
                const mother = new Nemeion({ ...prototypeMother, build: BUILDS.Brute })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockShouldDoAction })

                let _ = breedingGround._generateBuild([ADDONS.AO_LEAN])
                const baseChance = DATA.builds.available[father.build].inherit_chance[mother.build]
                expect(mockShouldDoAction).toHaveBeenCalledWith(baseChance)
            })

            it(`adds a ${BOOST * 100}% boost if the mother is a pharaoh build`, () => {
                const mother = new Nemeion({ ...prototypeMother, build: BUILDS.Pharaoh })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(prototypeFather, mother, { shouldDoAction: mockShouldDoAction })

                let _ = breedingGround._generateBuild([ADDONS.AO_LEAN])
                const baseChance = DATA.builds.available[prototypeFather.build].inherit_chance[mother.build]
                const expectedChance = Math.min(1, baseChance + BOOST)
                expect(mockShouldDoAction).toHaveBeenCalledWith(expectedChance)
            })

            it(`adds a ${BOOST * 100}% boost towards the father if the father is pharaoh`, () => {
                const father = new Nemeion({ ...prototypeFather, build: BUILDS.Pharaoh })
                const mother = new Nemeion({ ...prototypeMother, build: BUILDS.Regal })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockShouldDoAction })

                let _ = breedingGround._generateBuild([ADDONS.AO_LEAN])
                const baseChanceMother = DATA.builds.available[father.build].inherit_chance[mother.build]
                const baseChanceFather = 1 - baseChanceMother
                const boostedChanceFather = Math.min(1, baseChanceFather + BOOST)
                const expectedChanceMother = 1 - boostedChanceFather
                expect(mockShouldDoAction).toHaveBeenCalledWith(expectedChanceMother)
            })
        })

        describe('with the burly addon', () => {
            const BOOST = DATA.add_ons.AO_BURLY.options.increased_chance

            it('does not override the inherit chance if neither parent is a brute build', () => {
                const father = new Nemeion({ ...prototypeFather, build: BUILDS.Domestic })
                const mother = new Nemeion({ ...prototypeMother, build: BUILDS.Regal })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockShouldDoAction })

                let _ = breedingGround._generateBuild([ADDONS.AO_BURLY])
                const baseChance = DATA.builds.available[father.build].inherit_chance[mother.build]
                expect(mockShouldDoAction).toHaveBeenCalledWith(baseChance)
            })

            it(`adds a ${BOOST * 100}% boost if the mother is a brute build`, () => {
                const father = new Nemeion({ ...prototypeFather, build: BUILDS.Regal })
                const mother = new Nemeion({ ...prototypeMother, build: BUILDS.Brute })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockShouldDoAction })

                let _ = breedingGround._generateBuild([ADDONS.AO_BURLY])
                const baseChance = DATA.builds.available[father.build].inherit_chance[mother.build]
                const expectedChance = Math.min(1, baseChance + BOOST)
                expect(mockShouldDoAction).toHaveBeenCalledWith(expectedChance)
            })

            it(`adds a ${BOOST * 100}% boost towards the father if the father is brute`, () => {
                const father = new Nemeion({ ...prototypeFather, build: BUILDS.Brute })
                const mother = new Nemeion({ ...prototypeMother, build: BUILDS.Regal })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockShouldDoAction })

                let _ = breedingGround._generateBuild([ADDONS.AO_BURLY])
                const baseChanceMother = DATA.builds.available[father.build].inherit_chance[mother.build]
                const baseChanceFather = 1 - baseChanceMother
                const boostedChanceFather = Math.min(1, baseChanceFather + BOOST)
                const expectedChanceMother = 1 - boostedChanceFather
                expect(mockShouldDoAction).toHaveBeenCalledWith(expectedChanceMother)
            })
        })

        describe('with the petite addon', () => {
            const BOOST = DATA.add_ons.AO_PETITE.options.increased_chance

            it('does not override the inherit chance if neither parent is a domestic build', () => {
                const father = new Nemeion({ ...prototypeFather, build: BUILDS.Brute })
                const mother = new Nemeion({ ...prototypeMother, build: BUILDS.Regal })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockShouldDoAction })

                let _ = breedingGround._generateBuild([ADDONS.AO_PETITE])
                const baseChance = DATA.builds.available[father.build].inherit_chance[mother.build]
                expect(mockShouldDoAction).toHaveBeenCalledWith(baseChance)
            })

            it(`adds a ${BOOST * 100}% boost if the mother is domestic`, () => {
                const father = new Nemeion({ ...prototypeFather, build: BUILDS.Brute })
                const mother = new Nemeion({ ...prototypeMother, build: BUILDS.Domestic })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockShouldDoAction })

                let _ = breedingGround._generateBuild([ADDONS.AO_PETITE])
                const baseChance = DATA.builds.available[father.build].inherit_chance[mother.build]
                const expectedChance = Math.min(1, baseChance + BOOST)
                expect(mockShouldDoAction).toHaveBeenCalledWith(expectedChance)
            })

            it(`adds a ${BOOST * 100}% boost towards the father if the father is domestic`, () => {
                const father = new Nemeion({ ...prototypeFather, build: BUILDS.Domestic })
                const mother = new Nemeion({ ...prototypeMother, build: BUILDS.Regal })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockShouldDoAction })

                let _ = breedingGround._generateBuild([ADDONS.AO_PETITE])
                const baseChanceMother = DATA.builds.available[father.build].inherit_chance[mother.build]
                const baseChanceFather = 1 - baseChanceMother
                const boostedChanceFather = Math.min(1, baseChanceFather + BOOST)
                const expectedChanceMother = 1 - boostedChanceFather
                expect(mockShouldDoAction).toHaveBeenCalledWith(expectedChanceMother)
            })
        })
    })

    describe('_generateTraits', () => {
        it('returns a unique list of traits in the final result set', () => {
            const father = new Nemeion({ ...prototypeFather, traits: [TRAITS.Birthright] })
            const mother = new Nemeion({ ...prototypeMother, traits: [TRAITS.Birthright] })
            const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: () => true })

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
                const father = new Nemeion({ ...prototypeFather, traits: [TRAITS.Birthright] })
                const mother = new Nemeion({ ...prototypeMother, traits: [TRAITS.Big_Boned] })

                const mockMethod = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })

                let _ = breedingGround._generateTraits()
                expect(mockMethod).toBeCalledTimes(2)
            })

            describe('and the traits are the exact same', () => {
                it('rolls to inherit exactly once', () => {
                    const traits = [TRAITS.Birthright, TRAITS.Big_Boned]
                    const father = new Nemeion({ ...prototypeFather, traits })
                    const mother = new Nemeion({ ...prototypeMother, traits })

                    const mockMethod = vi.fn().mockImplementation(() => true)
                    const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })

                    let _ = breedingGround._generateTraits()

                    expect(mockMethod).toBeCalledTimes(2)
                    expect(mockMethod).not.toHaveBeenLastCalledWith(mockMethod.mock.calls[0][0])
                })

                it('rolls to inherit with the double rate', () => {
                    const traits = [TRAITS.Birthright]
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
                const father = new Nemeion({ ...prototypeFather, traits: [TRAITS.Birthright] })

                const mockMethod = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: mockMethod })

                let _ = breedingGround._generateTraits()

                expect(mockMethod).toBeCalledTimes(1)
                expect(mockMethod).toHaveBeenCalledWith(DATA.traits.qualities[TRAIT_QUALITIES.Common].inherit_chance.single)
            })

            it('rolls to inherit the trait with the single rate even if the trait is accidentally duplicated', () => {
                const father = new Nemeion({ ...prototypeFather, traits: [TRAITS.Birthright, TRAITS.Birthright] })

                const mockMethod = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: mockMethod })

                let _ = breedingGround._generateTraits()

                expect(mockMethod).toBeCalledTimes(1)
                expect(mockMethod).toHaveBeenCalledWith(DATA.traits.qualities[TRAIT_QUALITIES.Common].inherit_chance.single)
            })

            it('inherits the trait from the parent if the inherit roll is successful', () => {
                const father = new Nemeion({ ...prototypeFather, traits: [TRAITS.Birthright] })
                const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: () => true })

                let result = breedingGround._generateTraits()

                expect(result).toEqual([TRAITS.Birthright])
            })

            it('does not have any inherited traits if the inherit roll is unsuccessful', () => {
                const father = new Nemeion({ ...prototypeFather, traits: [TRAITS.Birthright] })
                const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: () => false })

                let result = breedingGround._generateTraits()

                expect(result).toEqual([])
            })
        })

        describe('when using the birthright addon', () => {
            it('increases the chance of receiving certain quality traits by a set amount in the data config', () => {
                const father = new Nemeion({ ...prototypeFather, traits: [TRAITS.Birthright, TRAITS.Big_Boned, TRAITS.Clever] })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: mockShouldDoAction })

                const combineRates = (traitQuality) => {
                    return DATA.traits.qualities[traitQuality].inherit_chance.single + DATA.add_ons.AO_BIRTHRIGHT.options[traitQuality]
                }
                const expectedRates = [
                    combineRates(TRAIT_QUALITIES.Common),
                    combineRates(TRAIT_QUALITIES.Uncommon),
                    combineRates(TRAIT_QUALITIES.Rare)
                ]
                
                let _ = breedingGround._generateTraits([ADDONS.AO_BIRTHRIGHT])

                const calledRates = mockShouldDoAction.mock.calls.map(([rate]) => rate)
                expect(calledRates).toHaveLength(expectedRates.length)

                const sortedCalled = [...calledRates].sort((a, b) => a - b)
                const sortedExpected = [...expectedRates].sort((a, b) => a - b)
                sortedExpected.forEach((rate, i) => {
                    expect(sortedCalled[i]).toBeCloseTo(rate, 10)
                })
            })
        })
    })

    describe('_generateMarkings', () => {
        it('returns a unique list of markings in the final result set', () => {
            const father = new Nemeion({ ...prototypeFather, markings: [MARKINGS.Auribus] })
            const mother = new Nemeion({ ...prototypeMother, markings: [MARKINGS.Auribus] })
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
                const father = new Nemeion({ ...prototypeFather, markings: [MARKINGS.Auribus] })
                const mother = new Nemeion({ ...prototypeMother, markings: [MARKINGS.Alium] })

                const mockMethod = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })

                let _ = breedingGround._generateMarkings()
                expect(mockMethod).toBeCalledTimes(2)
            })

            describe('and the markings are the exact same', () => {
                it('rolls to inherit exactly once', () => {
                    const markings = [MARKINGS.Auribus, MARKINGS.Alium]
                    const father = new Nemeion({ ...prototypeFather, markings })
                    const mother = new Nemeion({ ...prototypeMother, markings })

                    const mockMethod = vi.fn().mockImplementation(() => true)
                    const breedingGround = new NemeionBreedingGround(father, mother, { shouldDoAction: mockMethod })

                    let _ = breedingGround._generateMarkings()

                    expect(mockMethod).toBeCalledTimes(2)
                    expect(mockMethod).not.toHaveBeenLastCalledWith(mockMethod.mock.calls[0][0])
                })

                it('rolls to inherit with the double rate', () => {
                    const markings = [MARKINGS.Auribus]
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
                const father = new Nemeion({ ...prototypeFather, markings: [MARKINGS.Auribus] })

                const mockMethod = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: mockMethod })

                let _ = breedingGround._generateMarkings()

                expect(mockMethod).toBeCalledTimes(1)
                expect(mockMethod).toHaveBeenCalledWith(DATA.markings.qualities[MARKING_QUALITIES.Common].inherit_chance.single)
            })

            it('rolls to inherit the marking with the single rate even if the marking is accidentally duplicated', () => {
                const father = new Nemeion({ ...prototypeFather, markings: [MARKINGS.Auribus, MARKINGS.Auribus] })

                const mockMethod = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: mockMethod })

                let _ = breedingGround._generateMarkings()

                expect(mockMethod).toBeCalledTimes(1)
                expect(mockMethod).toHaveBeenCalledWith(DATA.markings.qualities[MARKING_QUALITIES.Common].inherit_chance.single)
            })

            it('inherits the marking from the parent if the inherit roll is successful', () => {
                const father = new Nemeion({ ...prototypeFather, markings: [MARKINGS.Auribus] })
                const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: () => true })

                let result = breedingGround._generateMarkings()

                expect(result).toEqual([MARKINGS.Auribus])
            })

            it('does not have any inherited markings if the inherit roll is unsuccessful', () => {
                const father = new Nemeion({ ...prototypeFather, markings: [MARKINGS.Auribus] })
                const breedingGround = new NemeionBreedingGround(father, prototypeMother, { shouldDoAction: () => false })

                let result = breedingGround._generateMarkings()

                expect(result).toEqual([])
            })
        })

        describe('exclusive groups', () => {
            it('only allows one marking from an exclusive group to be inherited', () => {
                const father = new Nemeion({ ...prototypeFather, markings: [MARKINGS.Manicae1, MARKINGS.Manicae2] })
                const mother = new Nemeion({ ...prototypeMother, markings: [MARKINGS.Manicae3] })
                
                const mockRandomSample = vi.fn().mockImplementation(() => MARKINGS.Manicae1)
                const breedingGround = new NemeionBreedingGround(father, mother, { 
                    shouldDoAction: () => true,
                    randomSample: mockRandomSample
                })

                const result = breedingGround._generateMarkings()
                
                // Should have exactly one Manicae marking
                const manicaeMarkings = result.filter(m => m.startsWith('Manicae'))
                expect(manicaeMarkings.length).toBe(1)
            })

            it('allows non-exclusive markings to be inherited alongside exclusive ones', () => {
                const father = new Nemeion({ ...prototypeFather, markings: [MARKINGS.Manicae1, MARKINGS.Auribus] })
                const mother = new Nemeion({ ...prototypeMother, markings: [MARKINGS.Manicae2, MARKINGS.Alium] })
                
                const mockRandomSample = vi.fn().mockImplementation(() => MARKINGS.Manicae1)
                const breedingGround = new NemeionBreedingGround(father, mother, { 
                    shouldDoAction: () => true,
                    randomSample: mockRandomSample
                })

                const result = breedingGround._generateMarkings()
                
                // Should have exactly one Manicae marking but both other markings
                const manicaeMarkings = result.filter(m => m.startsWith('Manicae'))
                expect(manicaeMarkings.length).toBe(1)
                expect(result).toContain(MARKINGS.Auribus)
                expect(result).toContain(MARKINGS.Alium)
            })
        })
    })

    describe('_generateMutations', () => {
        it('returns a unique list of mutations in the final result set', () => {
            const father = new Nemeion({ ...prototypeFather, mutations: [MUTATIONS.Albinism] })
            const mother = new Nemeion({ ...prototypeMother, mutations: [MUTATIONS.Albinism] })
            const breedingGround = new NemeionBreedingGround(father, mother, {
                shouldDoAction: () => true,
                randomSample: () => MUTATIONS.Albinism
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
                const expectedResult = MUTATIONS.Albinism

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
                const father = new Nemeion({ ...prototypeFather, mutations: [MUTATIONS.Albinism] })
                const mother = new Nemeion({ ...prototypeMother, mutations: [MUTATIONS.Albinism, MUTATIONS.Auric] })

                const mockMethod = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, mother, {
                    shouldDoAction: mockMethod,
                    randomSample: DEFAULT_RANDOM_SAMPLE
                })

                let _ = breedingGround._generateMutations()

                expect(mockMethod).toHaveBeenCalledTimes(4) // 1 per mutation + 1 for the random roll
            })

            it('rolls an inherit chance for each parent with a mutation', () => {
                const father = new Nemeion({ ...prototypeFather, mutations: [MUTATIONS.Albinism] })
                const mother = new Nemeion({ ...prototypeMother, mutations: [MUTATIONS.Albinism] })

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
                const father = new Nemeion({ ...prototypeFather, mutations: [MUTATIONS.Albinism] })
                const mother = new Nemeion({ ...prototypeMother, mutations: [MUTATIONS.Albinism] })

                const randomMutation = vi.fn().mockImplementation(() => MUTATIONS.Auric)
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
                const father = new Nemeion({ ...prototypeFather, mutations: [MUTATIONS.Albinism] })
                const mother = new Nemeion({ ...prototypeMother, mutations: [MUTATIONS.Albinism] })

                const mockInheritRoll = vi.fn()
                    .mockImplementationOnce(() => true)
                    .mockImplementationOnce(() => false)
                const breedingGround = new NemeionBreedingGround(father, mother, {
                    shouldDoAction: mockInheritRoll,
                    randomSample: DEFAULT_RANDOM_SAMPLE
                })

                const result = breedingGround._generateMutations()
                expect(result).toEqual([MUTATIONS.Albinism])
            })
        })

        describe('when using the wereworm addon', () => {
            const INCREASED_RATE = DATA.add_ons.AO_WEREWORM.options.increased_chance

            it(`increases the chance of a random mutation roll by ${INCREASED_RATE * 100}%`, () => {
                const expectedChance = DATA.mutations.base_chance + INCREASED_RATE
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, {
                    shouldDoAction: mockShouldDoAction,
                    randomSample: DEFAULT_RANDOM_SAMPLE
                })

                let _ = breedingGround._generateMutations([ADDONS.AO_WEREWORM])
                expect(mockShouldDoAction).toHaveBeenCalledWith(expectedChance)
            })

            it(`increases the chance of an inherit mutation roll by ${INCREASED_RATE * 100}%`, () => {
                const expectedChance = DATA.mutations.inherit_chance.single + INCREASED_RATE
                const father = new Nemeion({ ...prototypeFather, mutations: [MUTATIONS.Albinism] })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, prototypeMother, {
                    shouldDoAction: mockShouldDoAction,
                    randomSample: DEFAULT_RANDOM_SAMPLE
                })

                let _ = breedingGround._generateMutations([ADDONS.AO_WEREWORM])
                expect(mockShouldDoAction).toHaveBeenCalledWith(expectedChance)
            })

            it('works with the Rare Blood addon for inherit mutation rolls', () => {
                const expectedChance = DATA.mutations.inherit_chance.single + INCREASED_RATE + DATA.add_ons.AO_RARE_BLOOD.options.increased_chance
                const father = new Nemeion({ ...prototypeFather, mutations: [MUTATIONS.Albinism] })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, prototypeMother, {
                    shouldDoAction: mockShouldDoAction,
                    randomSample: DEFAULT_RANDOM_SAMPLE
                })

                let _ = breedingGround._generateMutations([ADDONS.AO_WEREWORM, ADDONS.AO_RARE_BLOOD])
                expect(mockShouldDoAction).toHaveBeenCalledWith(expectedChance)
            })
        })

        describe('when using the rare blood addon', () => {
            const INCREASED_RATE = DATA.add_ons.AO_RARE_BLOOD.options.increased_chance

            it(`increase the chance of an inherit mutation roll by ${INCREASED_RATE * 100}%`, () => {
                const expectedChance = DATA.mutations.inherit_chance.single + INCREASED_RATE
                const father = new Nemeion({ ...prototypeFather, mutations: [MUTATIONS.Albinism] })
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const breedingGround = new NemeionBreedingGround(father, prototypeMother, {
                    shouldDoAction: mockShouldDoAction,
                    randomSample: DEFAULT_RANDOM_SAMPLE
                })

                let _ = breedingGround._generateMutations([ADDONS.AO_RARE_BLOOD])
                expect(mockShouldDoAction).toHaveBeenCalledWith(expectedChance)
            })
        })

        describe('mutation stacking and caps', () => {
            it('adds a guaranteed additional random mutation with Protean Blood', () => {
                const mockShouldDoAction = vi.fn().mockImplementation(() => false)
                const mockRandomSample = vi.fn().mockImplementation(() => MUTATIONS.Albinism)
                const breedingGround = new NemeionBreedingGround(prototypeFather, prototypeMother, {
                    shouldDoAction: mockShouldDoAction,
                    randomSample: mockRandomSample
                })

                const result = breedingGround._generateMutations([ADDONS.AO_PROTEAN_BLOOD])

                // No base mutation roll passes, but Protean still guarantees one.
                expect(result).toEqual([MUTATIONS.Albinism])
                expect(mockRandomSample).toHaveBeenCalledWith(MUTATIONS.allValues)
            })

            it('caps mutations to a maximum of 3 when more would roll', () => {
                const many = MUTATIONS.allValues
                expect(many.length).toBeGreaterThanOrEqual(5)

                const father = new Nemeion({ ...prototypeFather, mutations: many.slice(0, 3) })
                const mother = new Nemeion({ ...prototypeMother, mutations: many.slice(3, 5) })

                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                const mockRandomSample = vi.fn().mockImplementation((arr) => arr[0])
                const breedingGround = new NemeionBreedingGround(father, mother, {
                    shouldDoAction: mockShouldDoAction,
                    randomSample: mockRandomSample
                })

                const result = breedingGround._generateMutations([ADDONS.AO_PROTEAN_BLOOD])
                expect(result.length).toBe(3)

                // All results must come from the unique rolled set.
                const rolledSet = [...new Set([...father.mutations, ...mother.mutations, ...MUTATIONS.allValues.slice(0, 1)])]
                result.forEach(m => {
                    expect(rolledSet).toContain(m)
                })
            })
        })
    })

    describe('_generateTitanTraits', () => {
        it('caps titan traits to a maximum of 4', () => {
            const all = TITAN_TRAITS.allValues
            expect(all.length).toBeGreaterThanOrEqual(6)

            const father = new Nemeion({ ...prototypeFather, titan_traits: all.slice(0, 3) })
            const mother = new Nemeion({ ...prototypeMother, titan_traits: all.slice(3, 6) })

            // Force all inheritance rolls to succeed
            const mockShouldDoAction = vi.fn().mockImplementation(() => true)

            // Deterministic sample: always pick the first remaining
            const mockRandomSample = vi.fn().mockImplementation((arr) => arr[0])
            const breedingGround = new NemeionBreedingGround(father, mother, {
                shouldDoAction: mockShouldDoAction,
                randomSample: mockRandomSample
            })

            const result = breedingGround._generateTitanTraits([])
            expect(result.length).toBe(4)

            const rolledSet = [...new Set([...father.titan_traits, ...mother.titan_traits])]
            result.forEach(trait => {
                expect(rolledSet).toContain(trait)
            })
        })
    })
})
