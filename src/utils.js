export function rollForThreshold(threshold, tolerance = 0.01) {
    return Math.random() <= threshold + tolerance
}
