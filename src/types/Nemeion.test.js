import { setActivePinia, createPinia } from 'pinia'
import { describe, expect, it, test, beforeEach, vi } from "vitest"

import Nemeion from './Nemeion'

describe('Nemeion', () => {
    const instance = new Nemeion()

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