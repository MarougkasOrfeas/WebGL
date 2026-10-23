/**
 * The core of every scene page: sets up WebGL and the camera, draws the scene,
 * and handles the Redraw button (Step 4). Pages turn on more features
 * (animation, mouse, wheel) with the other files in this folder.
 *
 * @author marou
 */

import { byId, checkedValue, onClick, readCameraInputs } from "../utils/dom.js";
import { createContext } from "../utils/webgl.js";
import { createSceneProgram } from "../graphics/shaders.js";
import { createCube } from "../graphics/cube.js";
import {
    SCENE_NEAR, createCamera, cameraSetup, createViewMatrix, createProjectionMatrix
} from "../graphics/camera.js";
import { loadAllTextures } from "../scene/textures.js";
import { t } from "../utils/i18n.js";

/** Background color (red, green, blue, opacity): dark blue, as asked in Step 1. */
const BACKGROUND = [0.0, 0.0, 0.3, 1.0];

/** Translation key of the message shown when scene images are missing. */
const MISSING_TEXTURES_KEY = "scene.textures.missing";

/**
 * Shows a message at the top of the control panel when a scene image could not be loaded
 * (the dog and sky are then gray). It links to the texture generator. Shown only once.
 */
function showMissingTexturesNotice() {
    if (document.querySelector(".notice")) return;

    const notice = document.createElement("p");
    notice.className = "notice";
    notice.setAttribute("role", "alert");
    notice.dataset.i18nHtml = MISSING_TEXTURES_KEY;   // keeps it translated when the language changes
    notice.innerHTML = t(MISSING_TEXTURES_KEY);

    // with two panels the form only holds the panels: put the message in the first one
    const form = byId("controls");
    const panel = form.querySelector(".panel") || form;
    panel.prepend(notice);
}

/**
 * Creates the scene of a page.
 *
 * @param {Object} options - what the page needs:
 *   draw(app) draws the page's objects (the camera is already set),
 *   redrawFar(distance) gives the far limit used by the Redraw button,
 *   textures (true/false) loads the scene images (Steps 7-8)
 * @returns {Object|null} "app": the WebGL context, program, cube, camera, textures and the
 *   drawScene / requestDraw / redraw functions; null if WebGL is not available
 */
export function createSceneApp(options) {
    const canvas = byId("glCanvas");
    const gl = createContext(canvas);
    if (!gl) return null;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(...BACKGROUND);
    gl.enable(gl.DEPTH_TEST);   // nearer surfaces hide the ones behind them

    const prog = createSceneProgram(gl);
    gl.useProgram(prog.program);

    const app = {
        canvas: canvas,
        gl: gl,
        prog: prog,
        cube: createCube(gl),
        camera: createCamera(canvas.width / canvas.height),
        textures: null,
        animating: false,
        beforeRedraw: [],   // functions to run when Redraw is pressed (e.g. stop the animation)

        /** Clears the canvas and draws the page's objects from the current camera. */
        drawScene: function () {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.uniformMatrix4fv(prog.uView, false, createViewMatrix(app.camera));
            gl.uniformMatrix4fv(prog.uProj, false, createProjectionMatrix(app.camera));
            options.draw(app);
        },

        /** Draws now, unless the animation is running (it already draws every frame). */
        requestDraw: function () {
            if (!app.animating) app.drawScene();
        },

        /**
         * Redraw button (Step 4): reads the text boxes and the camera position option,
         * places the camera and draws. Does nothing if a value is invalid.
         */
        redraw: function () {
            const input = readCameraInputs(false);
            if (!input) return;

            app.beforeRedraw.forEach(function (hook) { hook(); });

            const setup = cameraSetup(checkedValue("cameraPos"), input.distance);
            app.camera.fov = input.fov;
            app.camera.eye = setup.eye;
            app.camera.target = setup.target;
            app.camera.up = setup.up;
            app.camera.near = SCENE_NEAR;
            app.camera.far = options.redrawFar(input.distance);

            app.drawScene();
        }
    };

    // Steps 7-8: draw again every time an image finishes loading;
    // if one is missing, tell the user how to create it
    if (options.textures) {
        app.textures = loadAllTextures(gl, app.requestDraw, showMissingTexturesNotice);
    }

    // Firefox keeps typed values after a refresh: put the default values back
    byId("controls").reset();
    onClick("redrawBtn", app.redraw);

    return app;
}
