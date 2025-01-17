export function rollForThreshold(threshold, tolerance = 0.01) {
    return Math.random() <= threshold + tolerance
}

export function sortData(data) {
    return Object
        .keys(data)
        .sort()
        .reduce((obj, key) => {
            obj[key] = data[key]
            return obj
        }, {})
}
