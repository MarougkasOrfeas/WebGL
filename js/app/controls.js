/**
 * Builds the title and the control panel(s) of the shared step page (html/scene.html)
 * from the settings of the selected group of steps. Texts are written as translation
 * keys (data-i18n) and filled in by utils/i18n.js.
 *
 * @author marou
 */

import { byId } from "../utils/dom.js";
import { CAMERA_PRESETS, DEFAULT_PRESET, FRONT_VIEW, DogPart, DogAction } from "../config/options.js";

/**
 * Translation key of a camera position, e.g. "Left-Bottom-Back" → "scene.position.leftBottomBack".
 *
 * @param {string} preset - the camera position name
 * @returns {string} its translation key
 */
function presetKey(preset) {
    const words = preset.split("-");
    return "scene.position." + words[0].toLowerCase() + words.slice(1).join("");
}

/**
 * HTML of an empty element whose text is filled in from a translation key.
 *
 * @param {string} key - translation key
 * @param {string} [tag="span"] - HTML tag to use
 * @returns {string} the HTML
 */
function text(key, tag = "span") {
    return `<${tag} data-i18n="${key}"></${tag}>`;
}

/**
 * HTML of one radio button with its label.
 *
 * @param {string} name - radio group name
 * @param {string} value - value of this option
 * @param {string} labelKey - translation key of the label
 * @param {boolean} checked - true if selected at start
 * @param {string} [extraClass] - optional CSS class for the label
 * @returns {string} the HTML
 */
function radio(name, value, labelKey, checked, extraClass) {
    const cls = extraClass ? ' class="' + extraClass + '"' : "";
    return `<label${cls}><input type="radio" name="${name}" value="${value}"${checked ? " checked" : ""}> ${text(labelKey)}</label>`;
}

/**
 * HTML of the cameraView and cameraDistance text boxes (Steps 3A, 3B).
 *
 * @param {number} distance - start value of cameraDistance
 * @returns {string} the HTML
 */
function cameraFieldset(distance) {
    return `
        <fieldset>
            ${text("scene.camera.legend", "legend")}
            <label class="field">${text("scene.camera.view")}
                <input type="text" inputmode="decimal" id="cameraView" value="90">
            </label>
            <label class="field">${text("scene.camera.distance")}
                <input type="text" inputmode="decimal" id="cameraDistance" value="${distance}">
            </label>
        </fieldset>`;
}

/**
 * HTML of the camera position radio buttons (Step 3C). From Step 5 on there is an
 * extra "Front view" option, selected at start; otherwise Right-Top-Front is selected.
 *
 * @param {boolean} frontView - true to add the front view option
 * @returns {string} the HTML
 */
function positionFieldset(frontView) {
    const front = frontView ? radio("cameraPos", FRONT_VIEW, "scene.position.frontView", true, "full") : "";
    const presets = CAMERA_PRESETS
        .map(p => radio("cameraPos", p.name, presetKey(p.name), !frontView && p.name === DEFAULT_PRESET))
        .join("");
    return `
        <fieldset>
            ${text("scene.position.legend", "legend")}
            <div class="radio-grid">${front}${presets}</div>
        </fieldset>`;
}

/** HTML of the Redraw button (Step 4). */
const REDRAW_BUTTON = `<button type="button" id="redrawBtn" class="btn-primary" data-i18n="scene.redraw"></button>`;

/** HTML of the Animation section: Start / Pause buttons and the mouse hint (Steps 6, 9). */
const ANIMATION_FIELDSET = `
        <fieldset class="section-gap">
            ${text("scene.animation.legend", "legend")}
            <div class="btn-row">
                <button type="button" id="startBtn" class="btn-secondary" data-i18n="scene.animation.start"></button>
                <button type="button" id="pauseBtn" class="btn-secondary" data-i18n="scene.animation.pause"></button>
            </div>
            <p class="hint" data-i18n="scene.animation.hint"></p>
        </fieldset>`;

/** HTML of the dog panel: parts, actions, Reset pose button and hint (Steps 10-11). */
const DOG_FIELDSET = `
        <fieldset>
            ${text("scene.dog.legend", "legend")}
            <p class="sub-legend" data-i18n="scene.dog.parts"></p>
            <div class="radio-grid">${Object.values(DogPart).map((v, i) => radio("dogPart", v, "scene.dog.part." + v, i === 0)).join("")}</div>
            <p class="sub-legend" data-i18n="scene.dog.actions"></p>
            <div class="radio-grid">${Object.values(DogAction).map(v => radio("dogPart", v, "scene.dog.action." + v, false)).join("")}</div>
            <button type="button" id="resetPoseBtn" class="btn-secondary btn-block" data-i18n="scene.dog.reset"></button>
            <p class="hint" data-i18n="scene.dog.hint"></p>
        </fieldset>`;

/**
 * Fills in the page title, the header and the control panel(s) for a group of steps.
 * With dog controls, the page gets two panels side by side (camera | dog).
 *
 * @param {Object} page - settings of the group of steps:
 *   i18nKey, cameraDistance, frontView, animation, mouse, dogControls (see pages/step-pages.js)
 */
export function renderPage(page) {
    document.querySelector("title").dataset.i18n = page.i18nKey + ".title";
    byId("pageTitle").innerHTML =
        `${text(page.i18nKey + ".heading")} <span class="sub">· ${text(page.i18nKey + ".subtitle")}</span>`;

    const cameraControls = cameraFieldset(page.cameraDistance) + positionFieldset(page.frontView) +
        REDRAW_BUTTON + (page.animation ? ANIMATION_FIELDSET : "");

    const form = byId("controls");
    if (page.dogControls) {
        byId("layout").classList.add("layout--two-panels");
        form.className = "panels";
        form.innerHTML = `<div class="panel">${cameraControls}</div><div class="panel">${DOG_FIELDSET}</div>`;
    } else {
        form.className = "panel";
        form.innerHTML = cameraControls;
    }

    // when the camera can be dragged with the mouse, show a "grab" cursor
    if (page.mouse) byId("glCanvas").classList.add("canvas--draggable");
}
