export function rollForThreshold(threshold, tolerance = 0.1) {
    return Math.random() <= threshold - tolerance
}
