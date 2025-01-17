export default class Enum {
    /**
    Creates a new type that is represented as a closed set of enumerated options from the values provided.
    * @param {String[]|Object} source - The source to be used as the options for the new type.
    */
    constructor(source) {
        if (source.constructor.name !== 'Array' && source.constructor.name !== 'Object') {
            throw new Error('Enum source must be an Array or Object.')
        }
        const values = source.constructor.name === 'Array' ? source : Object.keys(source)
        for (const key of values) {
            this[key] = key
        }
        Object.freeze(this)
    }

    /**
     * Randomly picks a value from the enumeration set.
     * @returns {String} A random value from the enum that can be used as a key.
     */
    randomValue(exclude = []) {
        let options = exclude.length > 0
            ? Object
                .keys(this)
                .filter(key => !exclude.includes(key))
            : Object.keys(this)
        return options[(options.length * Math.random()) << 0]
    }

    /**
     * An array of all possible values.
     * @returns {String[]} An array of all the values in the enum.
     */
    get allValues() { return Object.keys(this).sort() }

    get firstValue() { return this.allValues[0] }
}
