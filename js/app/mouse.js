/**
 * Mouse control of the camera (Step 9): dragging left/right turns the camera around
 * the scene, dragging up/down changes its height. Works with the animation running or paused.
 *
 * @author marou
 */

import { clamp } from "../utils/math.js";
import { readCameraInputs } from "../utils/dom.js";
import { orbit, orbitEye, useOrbitCamera } from "../graphics/camera.js";

/** How much the camera turns per pixel dragged left/right (radians). */
const MOUSE_ANGLE_SPEED = 0.01;

/** How much the camera rises or drops per pixel dragged up/down. */
const MOUSE_HEIGHT_SPEED = 0.1;

/**
 * Lets the user drag the camera with the mouse.
 *
 * @param {Object} app - the scene app (from createSceneApp)
 */
export function enableMouseOrbit(app) {
    let dragging = false;   // true while the mouse button is held down
    let lastX = 0;          // last mouse position, to measure how far it moved
    let lastY = 0;

    /** Left mouse button pressed on the canvas: start dragging (the camera switches to circling mode). */
    app.canvas.addEventListener("mousedown", function (event) {
        if (event.button !== 0) return;   // only the left button drags (right-click keeps its menu)
        const input = readCameraInputs(true);
        if (!input) return;

        if (!app.animating) useOrbitCamera(app.camera, input);
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        event.preventDefault();
    });

    /** Mouse moved: turn / raise the camera by how far the mouse moved. */
    window.addEventListener("mousemove", function (event) {
        if (!dragging) return;
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;

        orbit.angle -= dx * MOUSE_ANGLE_SPEED;
        // dragging up (dy < 0) raises the camera; it stays between the floor and the radius
        orbit.height = clamp(orbit.height - dy * MOUSE_HEIGHT_SPEED, 0, orbit.radius);

        if (!app.animating) {
            app.camera.eye = orbitEye();
            app.drawScene();
        }
    });

    /** Mouse released (anywhere on the page): stop dragging. */
    window.addEventListener("mouseup", function () {
        dragging = false;
    });
}
