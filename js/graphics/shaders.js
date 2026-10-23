/**
 * The shader program used to draw everything in the scene. It paints each surface
 * with a color or an image (texture), slightly darker or lighter per cube face.
 *
 * @author marou
 */

import { createProgram } from "../utils/webgl.js";

/**
 * Vertex shader (runs once per corner point): moves the point from object space
 * to the screen with model → view → projection, and passes its face shade and
 * texture position on to the fragment shader.
 */
const VERTEX_SHADER = `
    attribute vec3 aPosition;
    attribute float aShade;
    attribute vec2 aTexCoord;

    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProj;

    varying float vShade;
    varying vec2 vTexCoord;

    void main() {
        vShade = aShade;
        vTexCoord = aTexCoord;
        gl_Position = uProj * uView * uModel * vec4(aPosition, 1.0);
    }
`;

/**
 * Fragment shader (runs once per pixel): takes the color (uColor) or the texture,
 * then darkens it by the face shade. uShading = 0 turns the shade off (sky, floor),
 * 1 uses it fully.
 */
const FRAGMENT_SHADER = `
    precision mediump float;

    uniform vec3 uColor;
    uniform bool uUseTexture;
    uniform sampler2D uSampler;
    uniform float uShading;

    varying float vShade;
    varying vec2 vTexCoord;

    void main() {
        vec3 base = uUseTexture ? texture2D(uSampler, vTexCoord).rgb : uColor;
        float shade = mix(1.0, vShade, uShading);
        gl_FragColor = vec4(base * shade, 1.0);
    }
`;

/**
 * Builds the scene shader program and looks up where each input
 * (attribute / uniform) lives, so drawing code can set them quickly.
 *
 * @param {WebGLRenderingContext} gl - WebGL context
 * @returns {Object} "prog": the program plus the location of every attribute and uniform
 */
export function createSceneProgram(gl) {
    const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    return {
        program: program,
        aPosition: gl.getAttribLocation(program, "aPosition"),
        aShade: gl.getAttribLocation(program, "aShade"),
        aTexCoord: gl.getAttribLocation(program, "aTexCoord"),
        uModel: gl.getUniformLocation(program, "uModel"),
        uView: gl.getUniformLocation(program, "uView"),
        uProj: gl.getUniformLocation(program, "uProj"),
        uColor: gl.getUniformLocation(program, "uColor"),
        uUseTexture: gl.getUniformLocation(program, "uUseTexture"),
        uSampler: gl.getUniformLocation(program, "uSampler"),
        uShading: gl.getUniformLocation(program, "uShading")
    };
}
