/**
 * Shared step page (html/scene.html): reads which steps to show from the address
 * (?steps=1-4, 5, 6-9 or 10-11), builds the controls, translates them and starts the scene.
 *
 * @author marou
 */

import { byId } from "../utils/dom.js";
import { initI18n, applyTranslations, mountLanguageToggle } from "../utils/i18n.js";
import { renderPage } from "../app/controls.js";
import { startScene } from "../app/start-scene.js";
import { STEP_PAGES, DEFAULT_STEPS } from "./step-pages.js";

/** The ?steps= value of the address. */
const key = new URLSearchParams(location.search).get("steps");

/** The group of steps to show (the default one if the address has none or an unknown one). */
const page = STEP_PAGES[key] || STEP_PAGES[DEFAULT_STEPS];

await initI18n();
renderPage(page);
applyTranslations();
mountLanguageToggle(byId("langToggle"));
startScene(page);
