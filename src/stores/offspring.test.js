import { setActivePinia, createPinia } from 'pinia'
import { describe, expect, it, beforeEach, vi } from "vitest"

import offspringStore from "./offspring"

import DATA from '@/data.yaml'
import { GENDERS, FURS, COATS, BUILDS, MUTATIONS, TRAITS, TRAIT_QUALITIES } from '@/Constants.js'

describe('offspringStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('generateFur', () => {
        describe('when no parent has rare fur', () => {
            const nonRareFurParent = { hasRareFur: false }

            it('returns a sleek fur when the random roll is unsuccessful', () => {
                const offspring = offspringStore()
                offspring.generateFur(nonRareFurParent, nonRareFurParent, () => false)

                expect(offspring.representation.fur).toBe(FURS.Sleek)
            })

            it('returns a rare fur when the random roll is successful', () => {
                const offspring = offspringStore()
                offspring.generateFur(nonRareFurParent, nonRareFurParent, () => true)

                const result = offspring.representation.fur

                expect(result).not.toBe(FURS.Sleek)
                expect(DATA.furs.rare_options).toContain(result)
            })
        })

        describe('when both parents have rare fur', () => {
            describe('when parents have the same fur', () => {
                const expectedFur = FURS.Silky
                const parent = { hasRareFur: true, fur: expectedFur }

                it('returns a sleek fur when the inherit roll AND the random roll are unsuccessful', () => {
                    const offspring = offspringStore()
    
                    const mockMethod = vi.fn().mockImplementation(() => false)
                    offspring.generateFur(parent, parent, mockMethod)
    
                    expect(mockMethod.mock.calls.length).toBe(2)
                    expect(offspring.representation.fur).toBe(FURS.Sleek)
                })

                it('returns the same fur as the parents when the inherit roll is successful', () => {
                    const offspring = offspringStore()
                    offspring.generateFur(parent, parent, () => true)
    
                    expect(offspring.representation.fur).toBe(expectedFur)
                })

                it('returns a random rare fur when the inherit roll is unsuccessful but the random roll is successful', () => {
                    const offspring = offspringStore()
                    const parent = { hasRareFur: true, fur: FURS.Silky }
    
                    const mockMethod = vi.fn()
                        .mockImplementationOnce(() => false)
                        .mockImplementationOnce(() => true)
                    offspring.generateFur(parent, parent, mockMethod)
    
                    const result = offspring.representation.fur
                    expect(mockMethod.mock.calls.length).toBe(2)
                    expect(result).not.toBe(FURS.Sleek)
                    expect(DATA.furs.rare_options).toContain(result)
                })
            })

            describe("when parents DON'T have the same fur", () => {
                const mother = { hasRareFur: true, fur: FURS.Silky }

                it('always rolls an inherit chance for each parent', () => {
                    const offspring = offspringStore()
    
                    const mockMethod = vi.fn().mockImplementation(() => false)
                    offspring.generateFur(
                        { hasRareFur: true, fur: FURS.Polar },
                        mother,
                        mockMethod
                    )
    
                    // 1 per parent + 1 for the random roll
                    expect(mockMethod.mock.calls.length).toBe(3)
                })

                it("returns the mother's fur when both inherit rolls are successful", () => {
                    const offspring = offspringStore()
    
                    const mockMethod = vi.fn().mock
                    offspring.generateFur(
                        { hasRareFur: true, fur: FURS.Polar },
                        mother,
                        () => true
                    )
    
                    expect(offspring.representation.fur).toBe(FURS.Silky)
                })

                it("returns the appropriate parent's fur when only one inherit roll is successful", () => {
                    const offspring = offspringStore()
                    const father = { hasRareFur: true, fur: FURS.Polar }
    
                    const fatherResultMethod = vi.fn()
                        .mockImplementationOnce(() => false)
                        .mockImplementationOnce(() => true)
                    offspring.generateFur(father, mother, fatherResultMethod)
                    expect(offspring.representation.fur).toBe(father.fur)

                    const motherResultMethod = vi.fn()
                        .mockImplementationOnce(() => true)
                        .mockImplementationOnce(() => false)
                    offspring.generateFur(father, mother, motherResultMethod)
                    expect(offspring.representation.fur).toBe(mother.fur)
                })
            })
        })

        describe('when one parent has rare fur', () => {
            it("returns the appropriate parent's fur when the inherit roll is successful", () => {
                const offspring = offspringStore()

                const father = { hasRareFur: true, fur: FURS.Silky }
                offspring.generateFur(father, { hasRareFur: false }, () => true)
                expect(offspring.representation.fur).toBe(father.fur)

                const mother = { hasRareFur: true, fur: FURS.Polar }
                offspring.generateFur({ hasRareFur: false }, mother, () => true)
                expect(offspring.representation.fur).toBe(mother.fur)
            })

            it('returns a sleek fur when the inherit roll is unsuccessful AND random roll is unsuccessful', () => {
                const offspring = offspringStore()
                const parent = { hasRareFur: true, fur: FURS.Silky }
                offspring.generateFur(parent, { hasRareFur: false }, () => false)

                expect(offspring.representation.fur).toBe(FURS.Sleek)
            })

            it('returns a random rare fur when the inherit roll is unsuccessful but the random roll is successful', () => {
                const offspring = offspringStore()
                const parent = { hasRareFur: true, fur: FURS.Silky }

                const mockMethod = vi.fn()
                    .mockImplementationOnce(() => false)
                    .mockImplementationOnce(() => true)
                offspring.generateFur(parent, { hasRareFur: false }, mockMethod)

                const result = offspring.representation.fur
                expect(result).not.toBe(FURS.Sleek)
                expect(DATA.furs.rare_options).toContain(result)
            })
        })
    })

    describe('generateCoat', () => {
        describe('when both parents have the same coat', () => {
            it('always returns the same coat as the parents', () => {
                const expectedCoat = COATS.Cream
                const offspring = offspringStore()
                const parent = { coat: expectedCoat}

                const mockMethod = vi.fn().mockImplementation(() => false)
                offspring.generateCoat(parent, parent, mockMethod)
    
                expect(mockMethod.mock.calls.length).toBe(0)
                expect(offspring.representation.coat).toBe(expectedCoat)
            })
        })

        describe('when parents have different coats', () => {
            it("returns the father's coat when the inherit roll is unsuccessful", () => {
                const offspring = offspringStore()
                const father = { coat: COATS.Cream }
                const mother = { coat: COATS.Tan }

                offspring.generateCoat(father, mother, () => false)

                expect(offspring.representation.coat).toBe(father.coat)
            })

            it("returns the mother's coat when the inherit roll is successful", () => {
                const offspring = offspringStore()
                const father = { coat: COATS.Cream }
                const mother = { coat: COATS.Tan }

                offspring.generateCoat(father, mother, () => true)

                expect(offspring.representation.coat).toBe(mother.coat)
            })
        })
    })

    describe('generateGender', () => {
        it('returns female if the roll is successful', () => {
            const offspring = offspringStore()
            offspring.generateGender(() => true)
            expect(offspring.representation.gender).toBe(GENDERS.Female)
        })

        it('returns male if the roll is unsuccessful', () => {
            const offspring = offspringStore()
            offspring.generateGender(() => false)
            expect(offspring.representation.gender).toBe(GENDERS.Male)
        })
    })

    describe('generateMutations', () => {
        it('returns a unique list of mutations in the final result set', () => {
            const parent = { hasMutations: true, mutations: [MUTATIONS.test_one] }
            const offspring = offspringStore()

            offspring.generateMutations(parent, parent, () => true, () => MUTATIONS.test_one)

            expect(offspring.representation.mutations.length).toBe(1)
        })

        describe('when neither parents have mutations', () => {
            const parent = { hasMutations: false }

            it('returns no mutations if the chance roll is unsuccessful', () => {
                const offspring = offspringStore()

                offspring.generateMutations(parent, parent, () => false)

                expect(offspring.representation.mutations).toEqual([])
            })

            it('returns a random mutation if the chance roll is successful', () => {            
                const offspring = offspringStore()

                offspring.generateMutations(parent, parent, () => true)

                expect(offspring.representation.mutations.length).toBe(1)
                expect(DATA.mutations.available).toContain(offspring.representation.mutations[0])
            })
        })

        describe('when either parent has mutations', () => {
            it('rolls for each mutation for inheritance individually', () => {
                const father = { hasMutations: true, mutations: [MUTATIONS.test_one] }
                const mother = { hasMutations: true, mutations: [MUTATIONS.test_one, MUTATIONS.test_two] }

                const offspring = offspringStore()

                const mockMethod = vi.fn().mockImplementation(() => true)
                offspring.generateMutations(father, mother, mockMethod)

                expect(mockMethod.mock.calls.length).toBe(4) // 1 per mutation + 1 for the random roll
            })

            it('rolls an inherit chance for each parent with a mutation', () => {
                const parent = { hasMutations: true, mutations: [MUTATIONS.test_one] }
                const offspring = offspringStore()

                const mockMethod = vi.fn().mockImplementation(() => true)
                offspring.generateMutations(parent, parent, mockMethod)

                expect(mockMethod.mock.calls.length).toBe(3)
            })

            it('always rolls for a random mutation', () => {
                const parent = { hasMutations: true, mutations: [MUTATIONS.test_one] }
                const offspring = offspringStore()

                const chanceRoll = vi.fn().mockImplementation(() => true)
                offspring.generateMutations({}, {}, chanceRoll)

                expect(chanceRoll.mock.calls.length).toBe(1)
            })

            it('only rolls for a random mutation once', () => {
                const parent = { hasMutations: true, mutations: [MUTATIONS.test_one] }
                const offspring = offspringStore()

                const randomMutation = vi.fn().mockImplementation(() => parent.mutations[0])

                offspring.generateMutations(parent, parent, () => true, randomMutation)
                expect(randomMutation.mock.calls.length).toBe(1)

                randomMutation.mockReset()

                offspring.generateMutations({}, {}, () => true, randomMutation)
                expect(randomMutation.mock.calls.length).toBe(1)
            })

            it('returns the parent mutations if the inherit roll is successful', () => {
                const parent = { hasMutations: true, mutations: [MUTATIONS.test_one] }
                const offspring = offspringStore()

                offspring.generateMutations(parent, parent, () => true)

                expect(offspring.representation.mutations).toContain(MUTATIONS.test_one)
            })
        })
    })

    describe('generateTraits', () => {
        it('returns a unique list of traits in the final result set', () => {
            const offspring = offspringStore()
            const parent = { hasTraits: true, traits: [TRAITS.Common_1] }

            offspring.generateTraits(parent, parent, () => true)

            expect(offspring.representation.traits.length).toBe(1)
        })

        describe('when both parents have no traits', () => {
            it('returns no traits for the offspring', () => {
                const offspring = offspringStore()
                const parent = { hasTraits: false }
                offspring.generateTraits(parent, parent)

                expect(offspring.representation.traits).toEqual([])
            })

            it('does not roll for inheritance', () => {
                const offspring = offspringStore()

                const mockMethod = vi.fn().mockImplementation(() => true)
                offspring.generateTraits({}, {}, mockMethod)

                expect(mockMethod.mock.calls.length).toBe(0)
            })
        })

        describe('when both parents have traits', () => {
            it('rolls to inherit all traits from both parents', () => {
                const offspring = offspringStore()
                const father = { hasTraits: true, traits: [TRAITS.Common_1] }
                const mother = { hasTraits: true, traits: [TRAITS.Uncommon_1] }

                const mockMethod = vi.fn().mockImplementation(() => true)
                offspring.generateTraits(father, mother, mockMethod)

                expect(mockMethod.mock.calls.length).toBe(2)
            })

            describe('and the traits are the exact same', () => {
                it('rolls to inherit exactly once', () => {
                    const offspring = offspringStore()
                    const parent = { hasTraits: true, traits: [TRAITS.Common_1, TRAITS.Uncommon_1] }
        
                    const mockMethod = vi.fn().mockImplementation(() => true)
                    offspring.generateTraits(parent, parent, mockMethod)
        
                    expect(mockMethod.mock.calls.length).toBe(2)
                    expect(mockMethod.mock.calls[0][0]).not.toBe(mockMethod.mock.calls[1][0])
                })

                it('rolls to inherit with the double rate', () => {
                    const offspring = offspringStore()
                    const parent = { hasTraits: true, traits: [TRAITS.Common_1] }
        
                    const mockMethod = vi.fn().mockImplementation(() => true)
                    offspring.generateTraits(parent, parent, mockMethod)
        
                    expect(mockMethod.mock.calls.length).toBe(1)
                    expect(mockMethod.mock.calls[0][0]).toBe(DATA.traits.qualities[TRAIT_QUALITIES.Common].inherit_chance.double)
                })
            })
        })

        describe('when at least one parent has traits', () => {
            it('rolls to inherit the trait from the parent with the single rate', () => {
                const offspring = offspringStore()
                const father = { hasTraits: true, traits: [TRAITS.Common_1] }
    
                const mockMethod = vi.fn().mockImplementation(() => true)
                offspring.generateTraits(father, {}, mockMethod)
    
                expect(mockMethod.mock.calls.length).toBe(1)
                expect(mockMethod.mock.calls[0][0]).toBe(DATA.traits.qualities[TRAIT_QUALITIES.Common].inherit_chance.single)
            })

            it('rolls to inherit the trait with the single rate even if the trait is accidentally duplicated', () => {
                const offspring = offspringStore()
                const father = { hasTraits: true, traits: [TRAITS.Common_1, TRAITS.Common_1] }
    
                const mockMethod = vi.fn().mockImplementation(() => true)
                offspring.generateTraits(father, {}, mockMethod)
    
                expect(mockMethod.mock.calls.length).toBe(1)
                expect(mockMethod.mock.calls[0][0]).toBe(DATA.traits.qualities[TRAIT_QUALITIES.Common].inherit_chance.single)
            })

            it('inherits the trait from the parent if the inherit roll is successful', () => {
                const offspring = offspringStore()
                const parent = { hasTraits: true, traits: [TRAITS.Common_1] }
    
                offspring.generateTraits(parent, {}, () => true)
    
                expect(offspring.representation.traits).toContain(TRAITS.Common_1)
            })

            it('does not have any inherited traits if the inherit roll is unsuccessful', () => {
                const offspring = offspringStore()
                const parent = { hasTraits: true, traits: [TRAITS.Common_1] }
    
                offspring.generateTraits(parent, {}, () => false)
    
                expect(offspring.representation.traits).toEqual([])
            })
        })
    })

    describe('generateBuild', () => {
        describe('when both parents have the same build', () => {
            it('uses the same build as the parents', () => {
                const offspring = offspringStore()
                const parent = { build: BUILDS.Brute }

                offspring.generateBuild(parent, parent)

                expect(offspring.representation.build).toBe(parent.build)
            })
        })

        describe('when both parents have different builds', () => {
            describe('and the builds are incompatible', () => {
                it('throws an error', () => {
                    const offspring = offspringStore()
                    const father = { build: BUILDS.Brute }
                    const mother = { build: BUILDS.Domestic }

                    expect(() => offspring.generateBuild(father, mother)).toThrowError()
                })
            })

            describe('and the builds are compatible', () => {
                it("uses the mother's rate to roll for build inheritance", () => {
                    const offspring = offspringStore()
                    const father = { build: BUILDS.Brute }
                    const mother = { build: BUILDS.Dwarf }

                    const expectedChanceRate = DATA.builds.available[father.build].inherit_chance[mother.build]

                    const mockMethod = vi.fn().mockImplementation(() => true)
                    offspring.generateBuild(father, mother, mockMethod)

                    expect(mockMethod.mock.calls.length).toBe(1)
                    expect(mockMethod.mock.calls[0][0]).toBe(expectedChanceRate)
                })

                it("uses the father's build if the inherit roll is unsuccessful", () => {
                    const offspring = offspringStore()
                    const father = { build: BUILDS.Brute }
                    const mother = { build: BUILDS.Dwarf }

                    offspring.generateBuild(father, mother, () => false)

                    expect(offspring.representation.build).toBe(father.build)
                })

                it("uses the mother's build if the inherit roll is successful", () => {
                    const offspring = offspringStore()
                    const father = { build: BUILDS.Brute }
                    const mother = { build: BUILDS.Dwarf }

                    offspring.generateBuild(father, mother, () => true)

                    expect(offspring.representation.build).toBe(mother.build)
                })
            })
        })
    })
})
