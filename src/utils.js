export function rollRandom(threshold, tolerance = 0.1) {
    return Math.random() <= threshold - tolerance
}
