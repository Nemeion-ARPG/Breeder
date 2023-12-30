import './Array'

import { describe, expect, it } from 'vitest'

describe('Array extensions', () => {
    describe('remove', () => {
        it('removes the given element from the array', () => {
            const array = [1, 2, 3]
            array.remove(2)
            expect(array).toEqual([1, 3])
        })
    })
})
