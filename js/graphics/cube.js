/**
 * The cube: the only shape in the project. It has edge 2 (from -1 to 1 on every axis)
 * and is centered at (0,0,0). Every object (dog parts, sky, floor) is this cube,
 * stretched, turned and moved into place by a model matrix.
 *
 * @author marou
 */

import { createBuffer } from "../utils/webgl.js";

/**
 * Corner positions (x, y, z): 4 corners for each of the 6 faces = 24 corners.
 * Faces do not share corners, so each face can have its own shade and texture position.
 */
const CUBE_POSITIONS = [
    // Front (+z)
    -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1,
    // Back (-z)
     1, -1, -1,  -1, -1, -1,  -1,  1, -1,   1,  1, -1,
    // Top (+y)
    -1,  1,  1,   1,  1,  1,   1,  1, -1,  -1,  1, -1,
    // Bottom (-y)
    -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,
    // Right (+x)
     1, -1,  1,   1, -1, -1,   1,  1, -1,   1,  1,  1,
    // Left (-x)
    -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1
];

/** The direction each face points to, in the same order as the faces above. */
const CUBE_FACE_NORMALS = [
    [0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]
];

/** Brightness of each face (1 = full color), so the faces look different from each other. */
const CUBE_FACE_SHADES = [1.0, 0.45, 0.85, 0.3, 0.7, 0.55];

/** Corner numbers of the triangles: each square face is cut into 2 triangles, (0,1,2) and (0,2,3). */
const CUBE_INDICES = [];
for (let f = 0; f < 6; f++) {
    const o = f * 4;
    CUBE_INDICES.push(o, o + 1, o + 2, o, o + 2, o + 3);
}

/**
 * Texture position (u, v from 0 to 1) of a corner, so that an image fills each face
 * the right way up. On the side faces v follows +z, so images stand upright when z is "up";
 * u goes to the right of someone looking at the face from outside.
 *
 * @param {number[]} n - direction of the face
 * @param {number} x - corner x (-1 or 1)
 * @param {number} y - corner y (-1 or 1)
 * @param {number} z - corner z (-1 or 1)
 * @returns {number[]} [u, v]
 */
function faceUV(n, x, y, z) {
    if (n[0] === 1)  return [(y + 1) / 2, (z + 1) / 2];
    if (n[0] === -1) return [(1 - y) / 2, (z + 1) / 2];
    if (n[1] === 1)  return [(1 - x) / 2, (z + 1) / 2];
    if (n[1] === -1) return [(x + 1) / 2, (z + 1) / 2];
    if (n[2] === 1)  return [(x + 1) / 2, (y + 1) / 2];
    return [(x + 1) / 2, (1 - y) / 2];
}

/**
 * Small gap kept around each tile of the head image (dog_head.png),
 * so colors of the neighboring tile do not bleed in at the edges.
 */
const ATLAS_MARGIN = 0.01;

/**
 * Squeezes a [u, v] position (0..1) into one quarter (tile) of the head image.
 *
 * @param {number[]} uv - position on the whole face
 * @param {number} u0 - left edge of the tile (0 or 0.5)
 * @param {number} v0 - bottom edge of the tile (0 or 0.5)
 * @returns {number[]} [u, v] inside that tile
 */
function atlasTile(uv, u0, v0) {
    const s = 0.5 - 2 * ATLAS_MARGIN;
    return [u0 + ATLAS_MARGIN + uv[0] * s, v0 + ATLAS_MARGIN + uv[1] * s];
}

/**
 * Texture position of a corner of the dog's head. The head image has 4 tiles:
 * top-left = eyes (used on the top face, the image's "up" pointing to the dog's front),
 * top-right = muzzle (front face), bottom = plain fur (all other faces).
 *
 * @param {number[]} n - direction of the face
 * @param {number} x - corner x (-1 or 1)
 * @param {number} y - corner y (-1 or 1)
 * @param {number} z - corner z (-1 or 1)
 * @returns {number[]} [u, v] inside the head image
 */
function headUV(n, x, y, z) {
    if (n[2] === 1) return atlasTile([(1 - y) / 2, (x + 1) / 2], 0, 0.5); // eyes
    if (n[0] === 1) return atlasTile(faceUV(n, x, y, z), 0.5, 0.5);       // muzzle
    return atlasTile(faceUV(n, x, y, z), 0, 0);                           // fur
}

/**
 * Creates the cube's buffers on the graphics card: corner positions, face shades,
 * texture positions (normal and for the head image) and the triangle list.
 *
 * @param {WebGLRenderingContext} gl - WebGL context
 * @returns {Object} "cube": the buffers and the number of triangle corners to draw
 */
export function createCube(gl) {
    const shades = [];
    const uvs = [];
    const headUvs = [];

    for (let f = 0; f < 6; f++) {
        const n = CUBE_FACE_NORMALS[f];
        for (let v = 0; v < 4; v++) {
            const i = (f * 4 + v) * 3;
            const x = CUBE_POSITIONS[i], y = CUBE_POSITIONS[i + 1], z = CUBE_POSITIONS[i + 2];
            shades.push(CUBE_FACE_SHADES[f]);
            uvs.push(...faceUV(n, x, y, z));
            headUvs.push(...headUV(n, x, y, z));
        }
    }

    return {
        positionBuffer: createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(CUBE_POSITIONS)),
        shadeBuffer: createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(shades)),
        uvBuffer: createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(uvs)),
        headUvBuffer: createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(headUvs)),
        indexBuffer: createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(CUBE_INDICES)),
        indexCount: CUBE_INDICES.length
    };
}

/**
 * Draws the cube once, placed by a model matrix, with a color or a texture.
 *
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {Object} prog - the shader program and its locations (from createSceneProgram)
 * @param {Object} cube - the cube buffers (from createCube)
 * @param {Float32Array} modelMatrix - where / how big / how turned the cube is
 * @param {Object} opts - look of the cube: { color: [r, g, b] } or { texture, uvBuffer },
 *                        plus shading from 0 (no face shade) to 1 (full face shade, the default)
 */
export function drawCube(gl, prog, cube, modelMatrix, opts) {
    // tell the shader where to read each kind of corner data from
    gl.bindBuffer(gl.ARRAY_BUFFER, cube.positionBuffer);
    gl.vertexAttribPointer(prog.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(prog.aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, cube.shadeBuffer);
    gl.vertexAttribPointer(prog.aShade, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(prog.aShade);

    gl.bindBuffer(gl.ARRAY_BUFFER, opts.uvBuffer || cube.uvBuffer);
    gl.vertexAttribPointer(prog.aTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(prog.aTexCoord);

    gl.uniformMatrix4fv(prog.uModel, false, modelMatrix);
    gl.uniform1f(prog.uShading, opts.shading === undefined ? 1.0 : opts.shading);

    if (opts.texture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, opts.texture);
        gl.uniform1i(prog.uSampler, 0);
        gl.uniform1i(prog.uUseTexture, 1);
    } else {
        gl.uniform1i(prog.uUseTexture, 0);
        gl.uniform3fv(prog.uColor, opts.color);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.indexBuffer);
    gl.drawElements(gl.TRIANGLES, cube.indexCount, gl.UNSIGNED_SHORT, 0);
}
