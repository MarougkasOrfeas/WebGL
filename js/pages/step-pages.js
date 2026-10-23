/**
 * The settings of each group of steps, by the value of ?steps= in the address.
 * Each entry says what the page shows; app/controls.js builds the controls from it
 * and app/start-scene.js starts the scene. A new group of steps is one more entry here.
 *
 * @author marou
 */

import { SceneContent, RedrawFar, FirstDraw } from "../app/start-scene.js";

/**
 * Settings of the 4 groups of steps:
 *   i18nKey        - title / heading / subtitle in assets/i18n/translations.json
 *   cameraDistance - start value of the cameraDistance text box
 *   frontView      - add the "Front view" camera position (selected at start)
 *   content        - what is drawn (SceneContent)
 *   redrawFar      - far limit of the Redraw button (RedrawFar)
 *   animation      - Start / Pause buttons (Step 6)
 *   mouse          - drag the camera with the mouse (Step 9)
 *   dogControls    - dog parts, actions, wheel and Reset pose (Steps 10-11)
 *   firstDraw      - how the first picture is drawn (FirstDraw)
 */
export const STEP_PAGES = Object.freeze({
    "1-4": {
        i18nKey: "scene.steps1to4",
        cameraDistance: 5,
        frontView: false,
        content: SceneContent.CUBE,
        redrawFar: RedrawFar.TEN_TIMES_DISTANCE,
        animation: false,
        mouse: false,
        dogControls: false,
        firstDraw: FirstDraw.INITIAL_CAMERA
    },
    "5": {
        i18nKey: "scene.step5",
        cameraDistance: 25,
        frontView: true,
        content: SceneContent.COLOR_DOG,
        redrawFar: RedrawFar.TEN_TIMES_DISTANCE,
        animation: false,
        mouse: false,
        dogControls: false,
        firstDraw: FirstDraw.REDRAW
    },
    "6-9": {
        i18nKey: "scene.steps6to9",
        cameraDistance: 25,
        frontView: true,
        content: SceneContent.TEXTURED_DOG,
        redrawFar: RedrawFar.SCENE_FAR,
        animation: true,
        mouse: true,
        dogControls: false,
        firstDraw: FirstDraw.REDRAW
    },
    "10-11": {
        i18nKey: "scene.steps10to11",
        cameraDistance: 25,
        frontView: true,
        content: SceneContent.TEXTURED_DOG,
        redrawFar: RedrawFar.SCENE_FAR,
        animation: true,
        mouse: true,
        dogControls: true,
        firstDraw: FirstDraw.REDRAW
    }
});

/** The group shown when the address has no ?steps= value or an unknown one. */
export const DEFAULT_STEPS = "1-4";
