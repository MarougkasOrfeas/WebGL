/**
 * Small math helpers used across the project: angle conversion,
 * limiting a value to a range, and back-and-forth waves for animations.
 *
 * @author marou
 */

/**
 * Where the glMatrix library lives. It is loaded with a normal <script> tag before
 * our modules: version 2.x puts mat4 directly on the page, version 3.x puts it under glMatrix.
 */
const glMatrixSource = (typeof glMatrix !== "undefined" && glMatrix.mat4) ? glMatrix : window;

/** glMatrix 4x4 matrix functions (create, translate, rotate, scale, lookAt, perspective...). */
export const mat4 = glMatrixSource.mat4;

/**
 * Converts degrees to radians.
 *
 * @param {number} deg - angle in degrees
 * @returns {number} the same angle in radians
 */
export function toRad(deg) {
    return deg * Math.PI / 180;
}

/**
 * Keeps a number inside a range.
 *
 * @param {number} value - the number to limit
 * @param {number} min - lowest allowed value
 * @param {number} max - highest allowed value
 * @returns {number} value, or min / max if it was outside the range
 */
export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

/**
 * Triangle wave: as p grows, the result goes 0 → 1 → 0 → 1 ... (one round trip every 2 units).
 * Used to make a movement go forward and come back.
 *
 * @param {number} p - progress (grows over time)
 * @returns {number} value between 0 and 1
 */
export function tri(p) {
    const q = p % 2;
    return q < 1 ? q : 2 - q;
}

/**
 * Swing wave: as p grows, the result goes 0 → 1 → 0 → -1 → 0 ... (one full swing every 4 units).
 * Used for legs that swing forward and backward.
 *
 * @param {number} p - progress (grows over time)
 * @returns {number} value between -1 and 1
 */
export function swing(p) {
    const q = p % 4;
    if (q < 1) return q;
    if (q < 3) return 2 - q;
    return q - 4;
}
