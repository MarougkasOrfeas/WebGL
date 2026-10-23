/**
 * General WebGL helpers: getting the drawing context, building shader programs,
 * creating GPU buffers and loading images as textures.
 *
 * @author marou
 */

import { t } from "./i18n.js";

/**
 * Gets the WebGL 1 drawing context of a canvas. If webgl-debug.js is loaded,
 * the context is wrapped so that WebGL errors show up in the console.
 *
 * @param {HTMLCanvasElement} canvas - the canvas to draw on
 * @returns {WebGLRenderingContext|null} the context, or null if WebGL is not supported
 */
export function createContext(canvas) {
    const gl = canvas.getContext("webgl");
    if (!gl) {
        alert(t("common.webglUnsupported"));
        return null;
    }
    if (typeof WebGLDebugUtils !== "undefined") {
        return WebGLDebugUtils.makeDebugContext(gl);
    }
    return gl;
}

/**
 * Compiles one shader (a small program that runs on the graphics card).
 *
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param {string} source - GLSL source code
 * @returns {WebGLShader} the compiled shader
 * @throws {Error} if the code does not compile
 */
export function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error("Shader compile error: " + log);
    }
    return shader;
}

/**
 * Builds a shader program from a vertex shader (places the points)
 * and a fragment shader (colors the pixels).
 *
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {string} vertexSource - GLSL code of the vertex shader
 * @param {string} fragmentSource - GLSL code of the fragment shader
 * @returns {WebGLProgram} the linked program
 * @throws {Error} if the two shaders cannot be linked together
 */
export function createProgram(gl, vertexSource, fragmentSource) {
    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("Program link error: " + gl.getProgramInfoLog(program));
    }
    return program;
}

/**
 * Copies data (positions, colors, indices...) into a buffer on the graphics card.
 *
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {number} target - gl.ARRAY_BUFFER (vertex data) or gl.ELEMENT_ARRAY_BUFFER (indices)
 * @param {ArrayBufferView} data - the numbers to store (e.g. Float32Array)
 * @returns {WebGLBuffer} the new buffer
 */
export function createBuffer(gl, target, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    return buffer;
}

/**
 * Checks if a number is a power of 2 (1, 2, 4, 8 ... 512, 1024).
 * WebGL 1 only allows repeating textures and mipmaps for such image sizes.
 *
 * @param {number} value - image width or height
 * @returns {boolean} true if it is a power of 2
 */
function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

/**
 * Loads an image as a texture. Until the image arrives, the texture is a single gray
 * pixel, so drawing never fails. The page must be opened through a web server:
 * Firefox does not let WebGL use images opened from file://.
 *
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {string} url - address of the image
 * @param {Function} [onLoad] - called when the image is ready (e.g. to redraw)
 * @param {Function} [onError] - called when the image cannot be loaded (e.g. file missing)
 * @returns {WebGLTexture} the texture (filled in later)
 */
export function loadTexture(gl, url, onLoad, onError) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([128, 128, 128, 255]));

    const image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // images start at the top, WebGL textures at the bottom: flip it
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // smaller copies (mipmaps) for far away surfaces, texture can repeat
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        } else {
            // other sizes: no mipmaps and no repeat (WebGL 1 rule)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        if (onLoad) onLoad();
    };
    image.onerror = function () {
        console.error("Could not load texture: " + url +
            " (is the file in assets/textures/ and is the page served through a web server?)");
        if (onError) onError();
    };
    image.src = url;

    return texture;
}
