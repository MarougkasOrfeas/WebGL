/**
 * Translations (English / Greek). All page texts live in assets/i18n/translations.json
 * as "key": { "en": "...", "el": "..." }. In HTML an element gets its text with
 * data-i18n="key" (or data-i18n-html="key" when the text contains markup, data-i18n-label="key"
 * for a screen reader label); in code use t("key").
 * The chosen language is remembered on every page.
 *
 * @author marou
 */

/** Address of the translation file (found relative to this file, so it works from any page). */
const TRANSLATIONS_URL = new URL("../../assets/i18n/translations.json", import.meta.url);

/** The available languages. */
const LANGUAGES = ["en", "el"];

/** What the language switch shows for each language. */
const LANGUAGE_LABELS = { en: "EN", el: "ΕΛ" };

/** Language used the first time and when a text is missing in the chosen language. */
const DEFAULT_LANGUAGE = "en";

/** Name under which the chosen language is saved in the browser (localStorage). */
const STORAGE_KEY = "language";

/** All texts loaded from the translation file: key -> { en, el }. */
let translations = {};

/** The language currently shown. */
let language = DEFAULT_LANGUAGE;

/**
 * The language saved from a previous visit.
 *
 * @returns {string} "en" or "el" (the default if nothing valid is saved)
 */
function savedLanguage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return LANGUAGES.includes(saved) ? saved : DEFAULT_LANGUAGE;
    } catch (e) {
        return DEFAULT_LANGUAGE;   // the browser blocks storage (e.g. private mode)
    }
}

/**
 * Loads the translation file and translates the page.
 * If the file cannot be loaded, the English text written in the HTML stays.
 *
 * @returns {Promise<void>} resolves when the page is translated
 */
export async function initI18n() {
    language = savedLanguage();
    try {
        const response = await fetch(TRANSLATIONS_URL);
        if (!response.ok) throw new Error("HTTP " + response.status);   // e.g. 404: file missing
        translations = await response.json();
    } catch (e) {
        console.error("Could not load " + TRANSLATIONS_URL + ": " + e);
    }
    applyTranslations();
}

/**
 * The language currently shown.
 *
 * @returns {string} "en" or "el"
 */
export function getLanguage() {
    return language;
}

/**
 * The text of a key in the current language.
 * Falls back to English, and then to the key itself if the key is missing.
 *
 * @param {string} key - translation key, e.g. "scene.redraw"
 * @returns {string} the translated text
 */
export function t(key) {
    const entry = translations[key];
    if (!entry) {
        console.warn("Missing translation key: " + key);
        return key;
    }
    return entry[language] || entry[DEFAULT_LANGUAGE] || key;
}

/**
 * Fills in the text of every element marked with data-i18n / data-i18n-html / data-i18n-label,
 * and updates the language switch.
 *
 * @param {Document|HTMLElement} [root=document] - only elements inside this are translated
 */
export function applyTranslations(root = document) {
    // file not loaded: keep the HTML text
    if (Object.keys(translations).length === 0) return;

    root.querySelectorAll("[data-i18n]").forEach(function (el) {
        el.textContent = t(el.dataset.i18n);
    });
    root.querySelectorAll("[data-i18n-html]").forEach(function (el) {
        el.innerHTML = t(el.dataset.i18nHtml);
    });
    // screen reader label (e.g. of the canvas)
    root.querySelectorAll("[data-i18n-label]").forEach(function (el) {
        el.setAttribute("aria-label", t(el.dataset.i18nLabel));
    });
    document.documentElement.lang = language;
    document.querySelectorAll(".lang-toggle").forEach(updateToggle);
}

/**
 * Switches the language and remembers it. Only texts change:
 * typed values, selected options and a running animation are kept.
 *
 * @param {string} lang - "en" or "el"
 */
export function setLanguage(lang) {
    if (!LANGUAGES.includes(lang)) return;
    language = lang;
    try {
        localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
        // cannot be remembered, but the page still switches
    }
    applyTranslations();
}

/** Swaps between English and Greek. */
export function toggleLanguage() {
    setLanguage(language === "en" ? "el" : "en");
}

/**
 * Updates a language switch: highlights the current language and sets its tooltip.
 *
 * @param {HTMLElement} button - the switch button
 */
function updateToggle(button) {
    button.setAttribute("aria-label", t("common.language"));
    button.title = t("common.language");
    button.querySelectorAll("[data-lang]").forEach(function (span) {
        span.classList.toggle("active", span.dataset.lang === language);
    });
}

/**
 * Adds the "EN | ΕΛ" language switch to the page. Clicking it swaps the language.
 *
 * @param {HTMLElement} container - where to put the switch
 */
export function mountLanguageToggle(container) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lang-toggle";
    button.innerHTML = LANGUAGES
        .map(lang => `<span data-lang="${lang}">${LANGUAGE_LABELS[lang]}</span>`)
        .join("");
    button.addEventListener("click", toggleLanguage);
    container.appendChild(button);
    updateToggle(button);
}
