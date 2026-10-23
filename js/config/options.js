/**
 * The named choices of the scene ("enums"): the camera positions, the dog parts
 * moved with the wheel and the dog actions. The values are the ones used in the
 * radio buttons, so every part of the code uses the same names.
 *
 * @author marou
 */

import { deepFreeze } from "../utils/freeze.js";

/**
 * The 8 camera positions of Step 3C, in display order (two columns: Left | Right).
 * signs: the sign of x, y, z, multiplied by cameraDistance.
 * Left/Right = x, Bottom/Top = y, Back/Front = z.
 */
export const CAMERA_PRESETS = deepFreeze([
    { name: "Left-Bottom-Back",   signs: [-1, -1, -1] },
    { name: "Right-Bottom-Back",  signs: [ 1, -1, -1] },
    { name: "Left-Bottom-Front",  signs: [-1, -1,  1] },
    { name: "Right-Bottom-Front", signs: [ 1, -1,  1] },
    { name: "Left-Top-Back",      signs: [-1,  1, -1] },
    { name: "Right-Top-Back",     signs: [ 1,  1, -1] },
    { name: "Left-Top-Front",     signs: [-1,  1,  1] },
    { name: "Right-Top-Front",    signs: [ 1,  1,  1] }
]);

/** The camera position selected at start in Steps 1-4 (it matches the Step 2 camera). */
export const DEFAULT_PRESET = "Right-Top-Front";

/** The extra camera position (from Step 5 on): looking at the dog from the front, upright. */
export const FRONT_VIEW = "Front-View";

/** The dog parts moved with the mouse wheel (Step 10), in display order. */
export const DogPart = deepFreeze({
    HEAD: "head",
    TAIL: "tail",
    FRONT_LEFT: "frontLeft",
    FRONT_RIGHT: "frontRight"
});

/** The dog actions (Step 11), in display order. */
export const DogAction = deepFreeze({
    PLAY_DEAD: "playDead",
    STATIC_WALK: "staticWalk",
    NORMAL_WALK: "normalWalk",
    DACHSHUND: "dachshund",
    CARTOON: "cartoon"
});
