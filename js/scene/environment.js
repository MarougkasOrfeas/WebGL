/**
 * The surroundings of the dog (Step 8): a big sky box around the whole scene
 * and a 25 x 25 floor showing the name and student number (ΑΜ).
 *
 * @author marou
 */

import { mat4 } from "../utils/math.js";
import { drawCube } from "../graphics/cube.js";
import { SKYBOX_EDGE, FLOOR_EDGE, FLOOR_THICKNESS } from "../config/dimensions.js";

/**
 * Draws the sky box and the floor.
 *
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {Object} prog - the shader program and its locations
 * @param {Object} cube - the cube buffers
 * @param {Object} textures - the loaded textures (sky and floor are used)
 */
export function drawEnvironment(gl, prog, cube, textures) {
    // sky box: a huge cube centered at (0,0,0), seen from inside, without face shading
    const sky = mat4.create();
    mat4.scale(sky, sky, [SKYBOX_EDGE / 2, SKYBOX_EDGE / 2, SKYBOX_EDGE / 2]);
    drawCube(gl, prog, cube, sky, { texture: textures.sky, shading: 0 });

    // floor: a box 1 unit thick with its top exactly at z = 0, turned 90° around z
    // so the text reads the right way when looking from the front of the dog (+x).
    // The thickness keeps its bottom clearly away from the top, so seen from below
    // the two surfaces do not flicker into each other (very small near limit, see camera.js)
    const floor = mat4.create();
    mat4.translate(floor, floor, [0, 0, -FLOOR_THICKNESS / 2]);
    mat4.rotateZ(floor, floor, Math.PI / 2);
    mat4.scale(floor, floor, [FLOOR_EDGE / 2, FLOOR_EDGE / 2, FLOOR_THICKNESS / 2]);
    drawCube(gl, prog, cube, floor, { texture: textures.floor, shading: 0 });
}
