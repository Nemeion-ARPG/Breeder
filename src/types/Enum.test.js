import Enum from '@/types/Enum'
import { describe, expect, it } from "vitest"

describe('Enum', () => {
    describe('constructor', () => {
        it('throws an error if the source is not an Array or Object', () => {
            expect(() => new Enum(1)).toThrow()
        })

        describe('with an array', () => {
            it('creates an new type that is represented as a closed set of enumerated options from the values provided', () => {
                const enumInstance = new Enum(['a', 'b', 'c'])
                expect(enumInstance).toHaveProperty('a')
                expect(enumInstance).toHaveProperty('b')
                expect(enumInstance).toHaveProperty('c')
            })
        })

        describe('with an object', () => {
            it('creates an new type that is represented as a closed set of enumerated options from the values provided', () => {
                const enumInstance = new Enum({ a: 'a', b: 'b', c: 'c' })
                expect(enumInstance).toHaveProperty('a')
                expect(enumInstance).toHaveProperty('b')
                expect(enumInstance).toHaveProperty('c')
            })
        })
    })

    describe('randomValue', () => {
        describe('with no exclusions', () => {
            it('returns a random value from the enum', () => {
                const enumInstance = new Enum(['a', 'b', 'c'])
                const result = enumInstance.randomValue()

                expect(result).toMatch(/a|b|c/)
            })
        })

        describe('with exclusions', () => {
            it('returns a random value from the enum that is not in the exclusions', () => {
                const enumInstance = new Enum(['a', 'b', 'c'])
                const result = enumInstance.randomValue(['a'])

                expect(result).toMatch(/b|c/)
            })
        })
    })

    describe('all values', () => {
        it('returns an array of all the values in the enum', () => {
            const enumInstance = new Enum(['a', 'b', 'c'])
            const result = enumInstance.allValues

            expect(result).toEqual(['a', 'b', 'c'])
        })
    })

    describe('first value', () => {
        it('returns the first defined constant in the enum', () => {
            const enumInstance = new Enum(['a', 'b', 'c'])
            const result = enumInstance.firstValue

            expect(result).toEqual('a')
        })
    })
})
