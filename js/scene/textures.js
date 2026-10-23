/**
 * The images used on the scene (Steps 7-8): fur, dog face, sky and floor.
 *
 * @author marou
 */

import { loadTexture } from "../utils/webgl.js";

/** Name of each texture and its image file. */
const TEXTURE_FILES = {
    fur: "fur.png",
    head: "dog_head.png",
    sky: "sky.png",
    floor: "floor.png"
};

/** Folder of the images (found relative to this file, so it works from any page). */
const TEXTURE_DIR = new URL("../../assets/textures/", import.meta.url);

/**
 * Starts loading every image as a texture.
 *
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {Function} onLoad - called each time one image is ready (e.g. to redraw)
 * @param {Function} [onError] - called for each image that cannot be loaded
 * @returns {Object} the textures by name: fur, head, sky, floor
 */
export function loadAllTextures(gl, onLoad, onError) {
    const textures = {};
    for (const name in TEXTURE_FILES) {
        textures[name] = loadTexture(gl, new URL(TEXTURE_FILES[name], TEXTURE_DIR).href, onLoad, onError);
    }
    return textures;
}
