/**
 * Page (DOM) helpers: finding elements, reading radio buttons and button clicks,
 * and reading the camera text boxes.
 *
 * @author marou
 */

import { t } from "./i18n.js";
import { MAX_CAMERA_DISTANCE } from "../config/dimensions.js";

/**
 * Finds an element by its id.
 *
 * @param {string} id - the element id
 * @returns {HTMLElement|null} the element, or null if there is none
 */
export function byId(id) {
    return document.getElementById(id);
}

/**
 * Value of the selected radio button of a group.
 *
 * @param {string} name - the name of the radio group (e.g. "cameraPos")
 * @returns {string} the value of the checked option
 */
export function checkedValue(name) {
    return document.querySelector('input[name="' + name + '"]:checked').value;
}

/**
 * Runs a function when the element with this id is clicked.
 *
 * @param {string} id - the element id (usually a button)
 * @param {Function} handler - the function to run
 */
export function onClick(id, handler) {
    byId(id).addEventListener("click", handler);
}

/** Smallest allowed cameraView (degrees). */
const FOV_MIN = 1;

/** Largest allowed cameraView (degrees): a view angle of 180° or more is impossible. */
const FOV_MAX = 179;

/**
 * Reads a number typed in a text box. Only a whole valid number is accepted
 * ("12abc" or an empty box are not), and a comma also works as the decimal point ("5,5").
 *
 * @param {string} text - what the user typed
 * @returns {number} the number, or NaN if the text is not a valid number
 */
function parseNumber(text) {
    const cleaned = text.trim().replace(",", ".");
    if (cleaned === "") return NaN;
    const value = Number(cleaned);
    return Number.isFinite(value) ? value : NaN;
}

/**
 * Marks a text box as wrong (red border) or correct again.
 *
 * @param {HTMLInputElement} input - the text box
 * @param {boolean} invalid - true if its value is wrong
 */
function markInvalid(input, invalid) {
    if (invalid) {
        input.setAttribute("aria-invalid", "true");
    } else {
        input.removeAttribute("aria-invalid");
    }
}

/**
 * Reads and checks the cameraView and cameraDistance text boxes (Steps 3-4).
 * The view angle must be from 1 to 179 degrees, the distance above 0 and at most MAX_CAMERA_DISTANCE (2000).
 * A wrong box gets a red border until it holds a valid value.
 *
 * @param {boolean} silent - true: do not show an alert when a value is wrong
 * @returns {{fov: number, distance: number}|null} the two numbers, or null if one is invalid
 */
export function readCameraInputs(silent) {
    const fovInput = byId("cameraView");
    const distanceInput = byId("cameraDistance");
    const fov = parseNumber(fovInput.value);
    const distance = parseNumber(distanceInput.value);

    // NaN fails every comparison, so "!(... within range)" also catches invalid text
    const fovInvalid = !(fov >= FOV_MIN && fov <= FOV_MAX);
    const distanceInvalid = !(distance > 0 && distance <= MAX_CAMERA_DISTANCE);
    markInvalid(fovInput, fovInvalid);
    markInvalid(distanceInput, distanceInvalid);

    if (fovInvalid) {
        if (!silent) alert(t("scene.errors.cameraView"));
        return null;
    }
    if (distanceInvalid) {
        if (!silent) alert(t("scene.errors.cameraDistance"));
        return null;
    }
    return { fov: fov, distance: distance };
}
