/**
 * Starts the scene of any group of steps from its settings (pages/step-pages.js):
 * what to draw, which far limit Redraw uses, which features to turn on and how to draw
 * the first picture. It only connects the existing pieces; it adds no new behavior.
 *
 * @author marou
 */

import { mat4 } from "../utils/math.js";
import { drawCube } from "../graphics/cube.js";
import { SCENE_FAR } from "../graphics/camera.js";
import { drawDog, colorMaterials, textureMaterials } from "../scene/dog.js";
import { drawEnvironment } from "../scene/environment.js";
import { FRAME_ACTION_STEP, isAction, advanceAction, computePose } from "../scene/pose.js";
import { createSceneApp } from "./scene-app.js";
import { enableAnimation } from "./animation.js";
import { enableMouseOrbit } from "./mouse.js";
import { enableDogControls, selectedDogOption } from "./wheel.js";

/** What a page draws. */
export const SceneContent = Object.freeze({
    CUBE: "cube",                  // Steps 1-4: the green cube
    COLOR_DOG: "colorDog",         // Step 5: the yellow / red dog
    TEXTURED_DOG: "texturedDog"    // Steps 6+: sky box, floor and the textured dog
});

/** Far limit used by the Redraw button. */
export const RedrawFar = Object.freeze({
    TEN_TIMES_DISTANCE: "tenTimesDistance",   // Steps 4-5: 10 x cameraDistance
    SCENE_FAR: "sceneFar"                     // Steps 6+: SCENE_FAR (10000)
});

/** How the first picture is drawn when the page opens. */
export const FirstDraw = Object.freeze({
    INITIAL_CAMERA: "initialCamera",   // Step 2 camera: (5,5,5), near 0.01, far 20
    REDRAW: "redraw"                   // like pressing Redraw with the default text box values
});

/** Base color of the Steps 1-4 cube (each face gets a different shade of it). */
const CUBE_GREEN = [0.1, 0.9, 0.2];

/**
 * The function that draws the objects of a page.
 *
 * @param {Object} page - settings of the group of steps
 * @returns {Function} draw(app)
 */
function contentDrawer(page) {
    switch (page.content) {
        case SceneContent.CUBE:
            // Step 1: the cube at the center of the scene
            return ({ gl, prog, cube }) => drawCube(gl, prog, cube, mat4.create(), { color: CUBE_GREEN });
        case SceneContent.COLOR_DOG:
            return ({ gl, prog, cube }) => drawDog(gl, prog, cube, colorMaterials());
        default:
            return ({ gl, prog, cube, textures }) => {
                drawEnvironment(gl, prog, cube, textures);
                // with the dog controls the dog takes its pose, otherwise it stands still
                const pose = page.dogControls ? computePose(selectedDogOption()) : undefined;
                drawDog(gl, prog, cube, textureMaterials(textures, cube), pose);
            };
    }
}

/**
 * Creates and starts the scene of a group of steps.
 *
 * @param {Object} page - settings of the group of steps (see pages/step-pages.js)
 */
export function startScene(page) {
    const app = createSceneApp({
        textures: page.content === SceneContent.TEXTURED_DOG,
        redrawFar: page.redrawFar === RedrawFar.SCENE_FAR ? () => SCENE_FAR : (distance) => 10 * distance,
        draw: contentDrawer(page)
    });
    if (!app) return;

    if (page.animation) {
        // with the dog controls, the selected action also plays by itself while animating (Step 11)
        const onFrame = page.dogControls
            ? () => { if (isAction(selectedDogOption())) advanceAction(FRAME_ACTION_STEP); }
            : undefined;
        enableAnimation(app, onFrame);
    }
    if (page.mouse) enableMouseOrbit(app);
    if (page.dogControls) enableDogControls(app);

    if (page.firstDraw === FirstDraw.INITIAL_CAMERA) {
        app.drawScene();
    } else {
        app.redraw();
    }
}
