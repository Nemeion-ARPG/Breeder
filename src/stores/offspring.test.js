import { setActivePinia, createPinia } from 'pinia'
import { describe, expect, it, beforeEach, vi } from "vitest"

import offspringStore from "./offspring"

import DATA from '@/data.yaml'
import { FURS } from '@/Constants.js'

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
})
