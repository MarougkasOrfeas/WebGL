/**
 * The camera: its start position, the 8 preset positions and the front view (Step 3),
 * the circling movement around the scene (Steps 6, 9), and the two matrices
 * that turn the 3D scene into the 2D picture on screen.
 *
 * @author marou
 */

import { mat4, toRad } from "../utils/math.js";
import { CAMERA_PRESETS, FRONT_VIEW } from "../config/options.js";
import { DOG_MID_HEIGHT } from "../config/dimensions.js";

/** Far limit of what the camera can see from Step 6 on, as the assignment asks (10 x distance would cut the 5000-wide sky box). */
export const SCENE_FAR = 10000;

/** Near limit of what the camera can see from Step 4 on. */
export const SCENE_NEAR = 0.001;

/**
 * Creates the camera with the Step 2 settings: at (5,5,5), looking at the center,
 * "up" along +y, 90° view angle, seeing from 0.01 to 20.
 *
 * @param {number} aspect - width / height of the canvas
 * @returns {Object} camera state: eye, target, up, fov (degrees), aspect, near, far
 */
export function createCamera(aspect) {
    return {
        eye: [5, 5, 5],
        target: [0, 0, 0],
        up: [0, 1, 0],
        fov: 90,
        aspect: aspect,
        near: 0.01,
        far: 20
    };
}

/**
 * Where the camera is, what it looks at and which way is up, for a camera position option.
 *
 * @param {string} presetName - one of the 8 CAMERA_PRESETS names or FRONT_VIEW
 * @param {number} distance - cameraDistance from the text box
 * @returns {{eye: number[], target: number[], up: number[]}} the camera placement
 */
export function cameraSetup(presetName, distance) {
    if (presetName === FRONT_VIEW) {
        return {
            eye: [distance, 0, DOG_MID_HEIGHT],
            target: [0, 0, DOG_MID_HEIGHT],
            up: [0, 0, 1]
        };
    }
    // presets: look at the center of the scene with "up" along +y
    const s = CAMERA_PRESETS.find(preset => preset.name === presetName).signs;
    return {
        eye: [s[0] * distance, s[1] * distance, s[2] * distance],
        target: [0, 0, 0],
        up: [0, 1, 0]
    };
}

/** How much the circling camera turns each frame (radians). */
const ORBIT_ANGLE_STEP = 0.01;

/** How much the circling camera goes up or down each frame. */
const ORBIT_HEIGHT_STEP = 0.05;

/**
 * State of the circling camera (Step 6): it goes around the z axis at distance "radius"
 * (= cameraDistance) while its height goes up and down, always looking at the center.
 * Shared by the animation and the mouse.
 */
export const orbit = {
    angle: 0,
    height: 0,
    heightDir: 1,   // +1 going up, -1 going down
    radius: 25
};

/**
 * Moves the circling camera one frame forward: it turns a little and goes up or down,
 * changing direction at the bottom (0) and at the top (radius).
 */
export function advanceOrbit() {
    orbit.angle = (orbit.angle + ORBIT_ANGLE_STEP) % (2 * Math.PI);
    orbit.height += orbit.heightDir * ORBIT_HEIGHT_STEP;
    if (orbit.height >= orbit.radius) {
        orbit.height = orbit.radius;
        orbit.heightDir = -1;   // reached the top: go down
    } else if (orbit.height <= 0) {
        orbit.height = 0;
        orbit.heightDir = 1;    // reached the floor: go up
    }
}

/**
 * Position of the circling camera: a point on a circle around the z axis, at the current height.
 *
 * @returns {number[]} [x, y, z]
 */
export function orbitEye() {
    return [
        orbit.radius * Math.cos(orbit.angle),
        orbit.radius * Math.sin(orbit.angle),
        orbit.height
    ];
}

/**
 * Switches the camera to circling mode (Steps 6, 9): it looks at the center with +z up,
 * cameraDistance becomes the circle's radius, and it sees up to SCENE_FAR.
 *
 * @param {Object} camera - camera state (changed in place)
 * @param {{fov: number, distance: number}} input - values from the text boxes
 */
export function useOrbitCamera(camera, input) {
    orbit.radius = input.distance;
    if (orbit.height > orbit.radius) orbit.height = orbit.radius;

    camera.fov = input.fov;
    camera.target = [0, 0, 0];
    camera.up = [0, 0, 1];
    camera.near = SCENE_NEAR;
    camera.far = SCENE_FAR;
    camera.eye = orbitEye();
}

/**
 * Builds the view matrix: moves the whole scene so that it is seen from the camera's eye.
 *
 * @param {Object} camera - camera state (eye, target, up)
 * @returns {Float32Array} 4x4 view matrix
 */
export function createViewMatrix(camera) {
    const view = mat4.create();
    mat4.lookAt(view, camera.eye, camera.target, camera.up);
    return view;
}

/**
 * Builds the projection matrix: adds perspective (far things look smaller)
 * and cuts away what is nearer than "near" or further than "far".
 *
 * @param {Object} camera - camera state (fov in degrees, aspect, near, far)
 * @returns {Float32Array} 4x4 projection matrix
 */
export function createProjectionMatrix(camera) {
    const proj = mat4.create();
    mat4.perspective(proj, toRad(camera.fov), camera.aspect, camera.near, camera.far);
    return proj;
}
