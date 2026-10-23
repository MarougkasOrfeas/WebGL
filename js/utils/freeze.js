/**
 * Helper for constant objects: makes an object and everything
 * inside it read-only, so a constant cannot be changed by mistake.
 *
 * @author marou
 */

/**
 * Freezes an object and all objects / arrays inside it.
 *
 * @param {Object|Array} value - the object to protect
 * @returns {Object|Array} the same object, now read-only
 */
export function deepFreeze(value) {
    Object.values(value).forEach(function (inner) {
        if (inner && typeof inner === "object") deepFreeze(inner);
    });
    return Object.freeze(value);
}
