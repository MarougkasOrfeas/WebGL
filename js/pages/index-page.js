/**
 * Start page (index.html): loads the translations and adds the language switch.
 *
 * @author marou
 */

import { byId } from "../utils/dom.js";
import { initI18n, mountLanguageToggle } from "../utils/i18n.js";

await initI18n();
mountLanguageToggle(byId("langToggle"));
