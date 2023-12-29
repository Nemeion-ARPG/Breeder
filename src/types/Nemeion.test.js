import Nemeion from './Nemeion'

import { describe, expect, it, test } from "vitest"

import DATA from '@/data.yaml'
import { GENDERS, TRAITS, MARKINGS, MUTATIONS } from '@/Constants'

describe('Nemeion', () => {
    const instance = new Nemeion()

    describe('initialization', () => {
        describe('when passed no arguments', () => {
            it('has a gender', () => {
                expect(instance.gender).toBeDefined()
            })

            it('has a fur style', () => {
                expect(instance.fur).toBeDefined()
            })

            it('has a coat coloring', () => {
                expect(instance.coat).toBeDefined()
            })

            it('has a build defined', () => {
                expect(instance.build).toBeDefined()
            })

            it('has storage for traits', () => {
                expect(instance.traits).toBeDefined()
            })

            it('has storage for markings', () => {
                expect(instance.markings).toBeDefined()
            })

            it('has storage for mutations', () => {
                expect(instance.mutations).toBeDefined()
            })
        })

        describe('when passed an object', () => {
            it('uses the properties of the source object as initial values', () => {
                const initialValues = {
                    gender: GENDERS.Male,
                    build: DATA.builds.default,
                    fur: DATA.furs.default,
                    coat: DATA.coats.default,
                    traits: [TRAITS.Common_1],
                    markings: [MARKINGS.Limited_1],
                    mutations: [MUTATIONS.Test_One],
                }
                const instance = new Nemeion(initialValues)
                expect(instance).toEqual(initialValues)
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
    })
})