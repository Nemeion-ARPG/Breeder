import Nemeion from './Nemeion'

import { describe, expect, it, test } from "vitest"

import DATA from '@/data.yaml'
import { GENDERS, TRAITS, MARKINGS, MUTATIONS } from '@/Constants'

describe('Nemeion', () => {
    const instance = new Nemeion()

    describe('initialization', () => {
        describe('when passed no arguments', () => {
            it('has a gender property defined', () => {
                expect(instance.gender).toBeDefined()
            })

            it('has the default fur style', () => {
                expect(instance.fur).toBe(DATA.furs.default)
            })

            it('has the default coat coloring', () => {
                expect(instance.coat).toBe(DATA.coats.default)
            })

            it('has the default build', () => {
                expect(instance.build).toBe(DATA.builds.default)
            })

            it('has the default traits', () => {
                expect(instance.traits).toBe(DATA.traits.default)
            })

            it('has the default markings', () => {
                expect(instance.markings).toBe(DATA.markings.default)
            })

            it('has the default mutations', () => {
                expect(instance.mutations).toBe(DATA.mutations.default)
            })
        })

        describe('when passed an object', () => {
            it('uses the properties of the source object as initial values', () => {
                const initialValues = {
                    gender: GENDERS.Male,
                    build: DATA.builds.default,
                    fur: DATA.furs.default,
                    coat: DATA.coats.default,
                    traits: [TRAITS.Birthright],
                    markings: [MARKINGS.Auribus],
                    mutations: [MUTATIONS.Albinism],
                }
                const instance = new Nemeion(initialValues)
                expect(instance).toMatchObject(initialValues)
            })
        })
    })

    describe('convienence computed properties', () => {
        test('hasTraits is based on the traits array', () => {
            expect(instance.hasTraits).toBe(false)
            instance.traits = ['some trait']
            expect(instance.hasTraits).toBe(true)
        })

        test('hasMarkings is based on the markings array', () => {
            expect(instance.hasMarkings).toBe(false)
            instance.markings = ['some marking']
            expect(instance.hasMarkings).toBe(true)
        })

        test('hasMutations is based on the mutations array', () => {
            expect(instance.hasMutations).toBe(false)
            instance.mutations = ['some mutation']
            expect(instance.hasMutations).toBe(true)
        })

        test('hasRareFur is based on the fur property', () => {
            expect(instance.hasRareFur).toBe(false)
            instance.fur = DATA.furs.rare_options[0]
            expect(instance.hasRareFur).toBe(true)
        })

        test('hasLimitedMarkings is based on the markings array', () => {
            expect(instance.hasLimitedMarkings).toBe(false)
            instance.markings = [MARKINGS.Tear]
            expect(instance.hasLimitedMarkings).toBe(true)
        })

        test('limitedMarkings returns only markings that are limited', () => {
            instance.markings = [MARKINGS.Tear, MARKINGS.Auribus]
            expect(instance.limitedMarkings).toEqual([MARKINGS.Tear])
        })
    })
})