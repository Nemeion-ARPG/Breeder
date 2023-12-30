import Nemeion from '@/types/Nemeion'
import NemeionBreedingGround from '@/types/NemeionBreedingGround'
import NemeionRandomGenerator from '@/types/NemeionRandomGenerator'

import { setActivePinia, createPinia } from 'pinia'
import { describe, expect, it, beforeEach, vi } from "vitest"

import denStore from "./den"

import DATA from '@/data.yaml'
import { GENDERS, ADDONS, BUILDS } from '@/Constants'

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
                    den.makeOffspring({})
                }).toThrowError()
            })

            it('throws if the value is null', () => {
                const den = denStore()

                expect(() => {
                    den.makeOffspring(null)
                }).toThrowError()
            })
        })

        describe('with the tincture addon', () => {
            class MockBreedingGround extends NemeionBreedingGround {
                constructor(father, mother) {
                    super(father, mother)
                }

                _generateBuild() {
                    return BUILDS.Domestic
                }
            }

            it('should only be used once', () => {
                const den = denStore()
                den.selectedAddons = [ADDONS.AO_TINCTURE_TRANSFORMATION]
                
                den.makeOffspring(new MockBreedingGround(den.father, den.mother), () => DATA.litters.weights[1]) // make 2
                expect(den.offspring.length).toBe(2)
                expect(den.offspring[1].build).toBe(BUILDS.Domestic)
            })

            it('should force at least one child to be a dwarf', () => {
                const den = denStore()
                den.selectedAddons = [ADDONS.AO_TINCTURE_TRANSFORMATION]

                den.makeOffspring(new MockBreedingGround(den.father, den.mother))
                expect(den.offspring[0].build).toBe(BUILDS.Dwarf)
            })
        })

        describe('with brute potion addon', () => {
            class MockBreedingGround extends NemeionBreedingGround {
                constructor(father, mother) {
                    super(father, mother)
                }

                _generateBuild() {
                    return BUILDS.Domestic
                }
            }

            it('should only be use once', () => {
                const den = denStore()
                den.selectedAddons = [ADDONS.AO_BRUTE_POTION]
                
                den.makeOffspring(new MockBreedingGround(den.father, den.mother), () => DATA.litters.weights[1]) // make 2
                expect(den.offspring.length).toBe(2)
                expect(den.offspring[1].build).toBe(BUILDS.Domestic)
            })

            it('should force at least once child to be a brute', () => {
                const den = denStore()
                den.selectedAddons = [ADDONS.AO_BRUTE_POTION]

                den.makeOffspring(new MockBreedingGround(den.father, den.mother))
                expect(den.offspring[0].build).toBe(BUILDS.Brute)
            })
        })

        describe('with regal potion addon', () => {
            class MockBreedingGround extends NemeionBreedingGround {
                constructor(father, mother) {
                    super(father, mother)
                }

                _generateBuild() {
                    return BUILDS.Domestic
                }
            }

            it('should only be use once', () => {
                const den = denStore()
                den.selectedAddons = [ADDONS.AO_REGAL_POTION]
                
                den.makeOffspring(new MockBreedingGround(den.father, den.mother), () => DATA.litters.weights[1]) // make 2
                expect(den.offspring.length).toBe(2)
                expect(den.offspring[1].build).toBe(BUILDS.Domestic)
            })

            it('should force at least once child to be a brute', () => {
                const den = denStore()
                den.selectedAddons = [ADDONS.AO_REGAL_POTION]

                den.makeOffspring(new MockBreedingGround(den.father, den.mother))
                expect(den.offspring[0].build).toBe(BUILDS.Regal)
            })
        })

        describe('with domestic potion addon', () => {
            class MockBreedingGround extends NemeionBreedingGround {
                constructor(father, mother) {
                    super(father, mother)
                }

                _generateBuild() {
                    return BUILDS.Brute
                }
            }

            it('should only be use once', () => {
                const den = denStore()
                den.selectedAddons = [ADDONS.AO_DOMESTIC_POTION]
                
                den.makeOffspring(new MockBreedingGround(den.father, den.mother), () => DATA.litters.weights[1]) // make 2
                expect(den.offspring.length).toBe(2)
                expect(den.offspring[1].build).toBe(BUILDS.Brute)
            })

            it('should force at least once child to be a brute', () => {
                const den = denStore()
                den.selectedAddons = [ADDONS.AO_DOMESTIC_POTION]

                den.makeOffspring(new MockBreedingGround(den.father, den.mother))
                expect(den.offspring[0].build).toBe(BUILDS.Domestic)
            })
        })

        describe('with blossom of cloris addon', () => {
            const ADDITIONAL_COUNT = DATA.add_ons.AO_BLOSSOM_CHLORIS.options.additional

            it(`should increase the litter size by ${ADDITIONAL_COUNT}`, () => {
                const den = denStore()
                den.selectedAddons = [ADDONS.AO_BLOSSOM_CHLORIS]

                const breedingGround = new NemeionBreedingGround(den.father, den.mother)
                den.makeOffspring(breedingGround, () => DATA.litters.weights[1]) // make 2
                expect(den.offspring.length).toBe(2 + ADDITIONAL_COUNT)
            })
        })

        describe('with fertility treatment addon', () => {
            it('should increase the total litter size by a set amount', () => {
                const den = denStore()
                den.selectedAddons = [ADDONS.AO_FERTILITY_TREATMENT]

                const breedingGround = new NemeionBreedingGround(den.father, den.mother)
                const mockFertilityTreatmentLitterSize = vi.fn().mockImplementation(() => 2)
                den.makeOffspring(
                    breedingGround,
                    () => DATA.litters.weights[1], // make 2 by default
                    {
                        rollLitterSize:  mockFertilityTreatmentLitterSize,
                        shouldDoAction: () => true
                    }
                )
                expect(den.offspring.length).toBe(4) // + 2 from the mock result
                expect(mockFertilityTreatmentLitterSize).toHaveBeenCalled()
            })

            it('should roll for the min and max additional litter size based on the data config', () => {
                const den = denStore()
                den.selectedAddons = [ADDONS.AO_FERTILITY_TREATMENT]

                const breedingGround = new NemeionBreedingGround(den.father, den.mother)
                const mockFertilityTreatmentLitterSize = vi.fn().mockImplementation(() => 2)
                den.makeOffspring(breedingGround, () => 1, {
                    rollLitterSize: mockFertilityTreatmentLitterSize,
                    shouldDoAction: () => true
                })

                const OPTIONS = DATA.add_ons.AO_FERTILITY_TREATMENT.options
                expect(mockFertilityTreatmentLitterSize).toHaveBeenCalledWith(OPTIONS.min_additional, OPTIONS.max_additional)
            })

            it('should pass in the data config chance to roll if the treatment is used', () => {
                const den = denStore()
                den.selectedAddons = [ADDONS.AO_FERTILITY_TREATMENT]

                const breedingGround = new NemeionBreedingGround(den.father, den.mother)
                const mockShouldDoAction = vi.fn().mockImplementation(() => true)
                den.makeOffspring(breedingGround, () => 1, {
                    rollLitterSize: () => 1,
                    shouldDoAction: mockShouldDoAction
                })

                expect(mockShouldDoAction).toHaveBeenCalledWith(DATA.add_ons.AO_FERTILITY_TREATMENT.options.chance)
            })
        })
    })

    describe('makeRandom', () => {
        it('should generate a litter of Nemeions based off the weights in the data table', () => {
            const den = denStore()

            for (const litterChance of DATA.litters.weights) {
                const randomGenerator = new NemeionRandomGenerator()
                den.makeRandom(randomGenerator, () => litterChance)

                const index = DATA.litters.weights.indexOf(litterChance)
                expect(den.offspring.length).toBe(index + 1)
            }
        })

        it('should call the random generator to make random offspring', () => {
            const mockMakeRandom = vi.fn().mockImplementation(() => new Nemeion())
            class MockRandomGenerator extends NemeionRandomGenerator {
                constructor() {
                    super()
                    this.makeOffspring = mockMakeRandom
                }
            }
            const den = denStore()
            const randomGenerator = new MockRandomGenerator()
            
            den.makeRandom(randomGenerator)
            expect(randomGenerator.makeOffspring).toHaveBeenCalled()
        })

        describe('when given a random generator', () => {
            it('throws an error if it is not a NemeionRandomGenerator', () => {
                const den = denStore()

                expect(() => {
                    den.makeRandom({})
                }).toThrowError()
            })

            it('throws if the value is null', () => {
                const den = denStore()

                expect(() => {
                    den.makeRandom(null)
                }).toThrowError()
            })
        })
    })

    describe('selectedAddons', () => {
        it('should be passed for making offspring', () => {
            const mockMakeOffspring = vi.fn().mockImplementation(() => new Nemeion())
            class MockBreedingGround extends NemeionBreedingGround {
                constructor(father, mother) {
                    super(father, mother)
                    this.makeOffspring = mockMakeOffspring
                }
            }
            const den = denStore()
            const breedingGround = new MockBreedingGround(den.father, den.mother)

            den.makeOffspring(breedingGround)
            expect(mockMakeOffspring).toHaveBeenCalledWith([])

            den.selectedAddons = [ADDONS.AO_APHRO_PASSION]
            den.makeOffspring(breedingGround)
            expect(mockMakeOffspring).toHaveBeenCalledWith(den.selectedAddons)
        })

        it('should be passed for making a random offspring', () => {
            const mockMakeOffspring = vi.fn().mockImplementation(() => new Nemeion())
            class MockBreedingGround extends NemeionRandomGenerator {
                constructor() {
                    super()
                    this.makeOffspring = mockMakeOffspring
                }
            }
            const den = denStore()
            const breedingGround = new MockBreedingGround()

            den.makeRandom(breedingGround)
            expect(mockMakeOffspring).toHaveBeenCalledWith([])

            den.selectedAddons = [ADDONS.AO_APHRO_PASSION]
            den.makeRandom(breedingGround)
            expect(mockMakeOffspring).toHaveBeenCalledWith(den.selectedAddons)
        })
    })
})
