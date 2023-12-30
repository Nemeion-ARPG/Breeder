import NemeionRandomGenerator from "./NemeionRandomGenerator"

import { describe, expect, it, vi } from "vitest"

import { DEFAULT_SHOULD_DO_ACTION, DEFAULT_RANDOM_SAMPLE, DEFAULT_RANDOM_INT, DEFAULT_RANDOM_CHANCE } from "./NemeionRandomGenerator"

import DATA from '@/data.yaml'
import { TRAITS, MARKINGS, MUTATIONS, COATS } from "@/Constants"

describe('NemeionRandomGenerator', () => {
    describe('initialization', () => {
        it('should store defaults if no overrides are provided', () => {
            const generator = new NemeionRandomGenerator()

            expect(generator.shouldDoAction).toBe(DEFAULT_SHOULD_DO_ACTION)
            expect(generator.randomSample).toBe(DEFAULT_RANDOM_SAMPLE)
            expect(generator.randomInt).toBe(DEFAULT_RANDOM_INT)
            expect(generator.randomChance).toBe(DEFAULT_RANDOM_CHANCE)
        })

        it('should store overrides if provided', () => {
            const mockShouldDoAction = vi.fn()
            const mockRandomSample = vi.fn()
            const mockRandomInt = vi.fn()
            const mockRandomChance = vi.fn()
            const generator = new NemeionRandomGenerator(mockShouldDoAction, mockRandomSample, mockRandomInt, mockRandomChance)

            expect(generator.shouldDoAction).toBe(mockShouldDoAction)
            expect(generator.shouldDoAction).not.toBe(DEFAULT_SHOULD_DO_ACTION)

            expect(generator.randomSample).toBe(mockRandomSample)
            expect(generator.randomSample).not.toBe(DEFAULT_RANDOM_SAMPLE)

            expect(generator.randomInt).toBe(mockRandomInt)
            expect(generator.randomInt).not.toBe(DEFAULT_RANDOM_INT)

            expect(generator.randomChance).toBe(mockRandomChance)
            expect(generator.randomChance).not.toBe(DEFAULT_RANDOM_CHANCE)
        })
    })

    describe('_generateFur', () => {
        it('should return the default fur if the roll is unsuccessful', () => {
            const generator = new NemeionRandomGenerator(() => false)
            const result = generator._generateFur()
            expect(result).toEqual(DATA.furs.default)
        })

        it('should only roll once', () => {
            const mockShouldDoAction = vi.fn().mockImplementation(() => true)
            const generator = new NemeionRandomGenerator(mockShouldDoAction)

            let _ = generator._generateFur()
            expect(mockShouldDoAction).toHaveBeenCalledTimes(1)
        })

        it('should return a random rare fur if the roll is successful', () => {
            const expectedRareFur = DATA.furs.rare_options[0]
            const mockRandomSample = vi.fn().mockImplementation(() => expectedRareFur)
            const generator = new NemeionRandomGenerator(() => true, mockRandomSample)

            const result = generator._generateFur()
            expect(result).toEqual(expectedRareFur)
        })
    })

    describe('_generateCoat', () => {
        it('should roll a chance once', () => {
            const mockRandomChance = vi.fn().mockImplementation(() => 0.5)
            const generator = new NemeionRandomGenerator(() => true, () => {}, () => 1, mockRandomChance)

            let _ = generator._generateCoat()
            expect(mockRandomChance).toHaveBeenCalledTimes(1)
        })

        it('should return a coat based on the weighted chance in the data table', () => {
            for (const [coat, chance] of Object.entries(DATA.coats.random_chance)) {
                const mockRandomChance = vi.fn().mockImplementation(() => chance)
                const generator = new NemeionRandomGenerator(() => true, () => {}, () => 1, mockRandomChance)

                const result = generator._generateCoat()
                expect(result).toEqual(coat)
            }
        })
    })

    describe('_generateBuild', () => {
        it('should roll a chance once', () => {
            const mockRandomChance = vi.fn().mockImplementation(() => 0.5)
            const generator = new NemeionRandomGenerator(() => true, () => {}, () => 1, mockRandomChance)

            let _ = generator._generateBuild()
            expect(mockRandomChance).toHaveBeenCalledTimes(1)
        })

        it('should return a build based on the weighted chance in the data table', () => {
            for (const [build, chance] of Object.entries(DATA.builds.random_chance)) {
                const mockRandomChance = vi.fn().mockImplementation(() => chance)
                const generator = new NemeionRandomGenerator(() => true, () => {}, () => 1, mockRandomChance)

                const result = generator._generateBuild()
                expect(result).toEqual(build)
            }
        })
    })

    describe('_generateTraits', () => {
        it('should roll a random number up to the max defined in the dataset', () => {
            const mockRandomInt = vi.fn().mockImplementation(() => 0)
            const generator = new NemeionRandomGenerator(() => true, () => {}, mockRandomInt)

            let _ = generator._generateTraits()
            expect(mockRandomInt).toHaveBeenCalledWith(DATA.traits.random_cap)
        })

        it('should have a unique result set', () => {
            const generator = new NemeionRandomGenerator(() => true, () => TRAITS.Common_1, () => 2)

            const result = generator._generateTraits()
            expect(result).toEqual([TRAITS.Common_1])
        })

        it('should add a random trait for each count in the result set', () => {
            const mockRandomSample = vi.fn().mockImplementation(() => TRAITS.Common_1)
            const generator = new NemeionRandomGenerator(() => true, mockRandomSample, () => 2)

            let _ = generator._generateTraits()
            expect(mockRandomSample).toHaveBeenCalled(2)
        })
    })

    describe('_generateMarkings', () => {
        it('should roll a random number up to the max defined in the dataset', () => {
            const mockRandomInt = vi.fn().mockImplementation(() => 0)
            const generator = new NemeionRandomGenerator(() => true, () => {}, mockRandomInt)

            let _ = generator._generateMarkings()
            expect(mockRandomInt).toHaveBeenCalledWith(DATA.markings.random_cap)
        })

        it('should have a unique result set', () => {
            const generator = new NemeionRandomGenerator(() => true, () => MARKINGS.Common_1, () => 2)

            const result = generator._generateMarkings()
            expect(result).toEqual([MARKINGS.Common_1])
        })

        it('should add a random marking for each count in the result set', () => {
            const mockRandomSample = vi.fn().mockImplementation(() => TRAITS.Common_1)
            const generator = new NemeionRandomGenerator(() => true, mockRandomSample, () => 2)

            let _ = generator._generateMarkings()
            expect(mockRandomSample).toHaveBeenCalled(2)
        })
    })

    describe('_generateMutations', () => {
        it('should roll a random number up to the max defined in the dataset', () => {
            const mockRandomInt = vi.fn().mockImplementation(() => 0)
            const generator = new NemeionRandomGenerator(() => true, () => {}, mockRandomInt)

            let _ = generator._generateMutations()
            expect(mockRandomInt).toHaveBeenCalledWith(DATA.mutations.random_cap)
        })

        it('should have a unique result set', () => {
            const generator = new NemeionRandomGenerator(() => true, () => MUTATIONS.Test_One, () => 2)

            const result = generator._generateMutations()
            expect(result).toEqual([MUTATIONS.Test_One])
        })

        it('should add a random mutation for each count in the result set', () => {
            const mockRandomSample = vi.fn().mockImplementation(() => MUTATIONS.Test_One)
            const generator = new NemeionRandomGenerator(() => true, mockRandomSample, () => 2)

            let _ = generator._generateMutations()
            expect(mockRandomSample).toHaveBeenCalled(2)
        })
    })
})
