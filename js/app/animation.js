/**
 * The camera animation (Step 6): the camera circles around the dog in a spiral,
 * controlled by the Start and Pause buttons.
 *
 * @author marou
 */

import { onClick, readCameraInputs } from "../utils/dom.js";
import { advanceOrbit, orbitEye, useOrbitCamera } from "../graphics/camera.js";

/**
 * Connects the Start / Pause buttons. The Redraw button also stops the animation.
 *
 * @param {Object} app - the scene app (from createSceneApp)
 * @param {Function} [onFrame] - extra work to do every frame, before drawing
 */
export function enableAnimation(app, onFrame) {
    let animationId = null;   // id of the next requested frame, used to cancel it

    /** One animation frame: move the camera, run onFrame, draw, ask for the next frame. */
    function frame() {
        advanceOrbit();
        if (onFrame) onFrame();
        app.camera.eye = orbitEye();
        app.drawScene();
        if (app.animating) {
            animationId = requestAnimationFrame(frame);
        }
    }

    /** Start button: puts the camera on its circle and starts the frames. */
    function start() {
        if (app.animating) return;
        const input = readCameraInputs(false);
        if (!input) return;

        useOrbitCamera(app.camera, input);
        app.animating = true;
        animationId = requestAnimationFrame(frame);
    }

    /** Pause button: stops the frames; the camera stays where it is. */
    function pause() {
        app.animating = false;
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    onClick("startBtn", start);
    onClick("pauseBtn", pause);
    app.beforeRedraw.push(pause);
}
