/**
 * The dog (Steps 5, 7, 10, 11), built only from the cube. Its sizes and joints are in
 * config/dimensions.js. Parts are attached to each other: paw → leg → body, and
 * head/ears → neck → body, so when a part moves, everything attached to it moves too.
 *
 * @author marou
 */

import { mat4, toRad } from "../utils/math.js";
import { drawCube } from "../graphics/cube.js";
import { DOG_PARTS, DOG_LEGS, DOG_JOINTS } from "../config/dimensions.js";
import { neutralPose } from "./pose.js";

/** Yellow color of Step 5 (body, neck, head). */
const YELLOW = [1.0, 0.85, 0.1];

/** Red color of Step 5 (legs, paws, tail, ears). */
const RED = [0.85, 0.1, 0.1];

/** How much face shading the textured dog keeps (0..1), so its shape stays easy to see. */
const TEXTURED_SHADING = 0.6;

/**
 * Looks of each part for Step 5: yellow body, neck and head; red legs, paws, tail and ears.
 *
 * @returns {Object} one drawCube look ({ color }) per part name
 */
export function colorMaterials() {
    const yellow = { color: YELLOW };
    const red = { color: RED };
    return { body: yellow, neck: yellow, head: yellow, leg: red, paw: red, tail: red, ear: red };
}

/**
 * Looks of each part from Step 7 on: spotted fur everywhere, and the face image on the head.
 *
 * @param {Object} textures - the loaded textures (from loadAllTextures)
 * @param {Object} cube - the cube buffers (gives the head's texture positions)
 * @returns {Object} one drawCube look ({ texture, ... }) per part name
 */
export function textureMaterials(textures, cube) {
    const fur = { texture: textures.fur, shading: TEXTURED_SHADING };
    const head = { texture: textures.head, uvBuffer: cube.headUvBuffer, shading: TEXTURED_SHADING };
    return { body: fur, neck: fur, head: head, leg: fur, paw: fur, tail: fur, ear: fur };
}

/**
 * Draws one part: the cube is stretched to the part's size and moved to its center,
 * on top of the parent's movement (matrix = parent × move(center) × stretch(size / 2)).
 * The cube is 2 wide, so stretching by size / 2 gives exactly the part size.
 *
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {Object} prog - the shader program and its locations
 * @param {Object} cube - the cube buffers
 * @param {Float32Array} parent - movement of what the part is attached to
 * @param {number[]} center - center of the part [x, y, z] when the dog stands still
 * @param {number[]} size - size of the part [x, y, z]
 * @param {Object} opts - look of the part (color or texture)
 */
function drawPart(gl, prog, cube, parent, center, size, opts) {
    const model = mat4.clone(parent);
    mat4.translate(model, model, center);
    mat4.scale(model, model, [size[0] / 2, size[1] / 2, size[2] / 2]);
    drawCube(gl, prog, cube, model, opts);
}

/**
 * Adds a rotation around a given point instead of around (0,0,0):
 * move the point to the origin, rotate, move it back
 * (matrix = parent × move(pivot) × rotate(angle) × move(-pivot)).
 *
 * @param {Float32Array} parent - movement so far
 * @param {number[]} pivot - the point to turn around [x, y, z]
 * @param {Function} rotate - mat4.rotateX, mat4.rotateY or mat4.rotateZ (the axis)
 * @param {number} angleDeg - angle in degrees
 * @returns {Float32Array} the new matrix
 */
function pivotRotate(parent, pivot, rotate, angleDeg) {
    const m = mat4.clone(parent);
    mat4.translate(m, m, pivot);
    rotate(m, m, toRad(angleDeg));
    mat4.translate(m, m, [-pivot[0], -pivot[1], -pivot[2]]);
    return m;
}

/**
 * Adds a move (translation) to a matrix, without changing the original.
 *
 * @param {Float32Array} parent - movement so far
 * @param {number[]} offset - how far to move [x, y, z]
 * @returns {Float32Array} the new matrix
 */
function shifted(parent, offset) {
    const m = mat4.clone(parent);
    mat4.translate(m, m, offset);
    return m;
}

/**
 * Draws one leg with its paw. The leg swings forward around the middle of its top face,
 * and the paw is attached to the leg so it follows it.
 *
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {Object} prog - the shader program and its locations
 * @param {Object} cube - the cube buffers
 * @param {Float32Array} parent - movement of the body end the leg belongs to
 * @param {number} x - leg center x (front legs +5.5, back legs -5.5)
 * @param {number} y - leg center y (left legs +4.5, right legs -4.5)
 * @param {number} forwardAngle - swing in degrees (0 = straight down, 90 = straight forward)
 * @param {number} pawScale - paw size factor in length and width (1 = normal)
 * @param {Object} materials - looks of the parts
 */
function drawLeg(gl, prog, cube, parent, x, y, forwardAngle, pawScale, materials) {
    const legSize = DOG_PARTS.leg.size;
    const pawSize = DOG_PARTS.paw.size;
    // turning around +y by a negative angle swings the leg towards +x (forward)
    const leg = pivotRotate(parent, [x, y, DOG_JOINTS.legZ], mat4.rotateY, -forwardAngle);
    drawPart(gl, prog, cube, leg, [x, y, DOG_PARTS.leg.centerZ], legSize, materials.leg);
    drawPart(gl, prog, cube, leg, [x, y, DOG_PARTS.paw.centerZ],
        [pawSize[0] * pawScale, pawSize[1] * pawScale, pawSize[2]], materials.paw);
}

/**
 * Draws the whole dog in a given pose.
 *
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {Object} prog - the shader program and its locations
 * @param {Object} cube - the cube buffers
 * @param {Object} materials - looks of the parts (colorMaterials or textureMaterials)
 * @param {Object} [pose] - angles and moves of the parts (from computePose); standing still by default
 */
export function drawDog(gl, prog, cube, materials, pose = neutralPose()) {
    const parts = DOG_PARTS;

    // the whole dog: walk forward, then the "play dead" fall
    let root = mat4.create();
    mat4.translate(root, root, [pose.offsetX, 0, 0]);
    root = pivotRotate(root, DOG_JOINTS.playDead, mat4.rotateX, pose.roll);

    // dachshund: the body gets longer on both sides, so the front parts move
    // forward and the back parts move backward by half the extra length
    const ends = {
        front: shifted(root, [pose.stretch / 2, 0, 0]),
        rear: shifted(root, [-pose.stretch / 2, 0, 0])
    };

    drawPart(gl, prog, cube, root, parts.body.center,
        [parts.body.size[0] + pose.stretch, parts.body.size[1], parts.body.size[2]], materials.body);

    // the 4 legs with their paws, each attached to its end of the body
    for (const leg of DOG_LEGS) {
        drawLeg(gl, prog, cube, ends[leg.end], leg.x, leg.y, pose.legs[leg.key], pose.pawScale, materials);
    }

    // tail behind the body, wags / spins around its base
    const tail = pivotRotate(ends.rear, DOG_JOINTS.tail, mat4.rotateX, pose.tailAngle);
    drawPart(gl, prog, cube, tail, parts.tail.center, parts.tail.size, materials.tail);

    // neck on top of the body, turns together with the head
    const neck = pivotRotate(ends.front, DOG_JOINTS.neck, mat4.rotateZ, pose.headAngle);
    drawPart(gl, prog, cube, neck, parts.neck.center, parts.neck.size, materials.neck);

    // head and ears follow the neck, and lift off it in the "cartoon" action
    const head = shifted(neck, [0, 0, pose.headLift]);
    drawPart(gl, prog, cube, head, parts.head.center, parts.head.size, materials.head);
    for (const earCenter of parts.ear.centers) {
        drawPart(gl, prog, cube, head, earCenter, parts.ear.size, materials.ear);
    }
}
