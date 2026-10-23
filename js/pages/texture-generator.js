/**
 * Texture generator page: draws the 4 scene images (fur, dog face, sky, floor)
 * with the browser's 2D drawing tools and downloads them as PNG files,
 * to be saved into assets/textures/.
 *
 * @author marou
 */

import { initI18n, mountLanguageToggle } from "../utils/i18n.js";

await initI18n();
mountLanguageToggle(document.getElementById("langToggle"));

/** Width and height of every image in pixels (a power of 2, as WebGL 1 prefers). */
const SIZE = 512;

/**
 * Creates a random number generator that always gives the same numbers for the
 * same seed, so the images look identical every time the page is opened.
 *
 * @param {number} seed - start number
 * @returns {Function} a function that returns the next number between 0 and 1
 */
function makeRandom(seed) {
    return function () {
        // "mulberry32": a small, well-known way to scramble the bits of the seed
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/**
 * Draws something 9 times: in place and shifted one image-width in every direction.
 * Shapes that cross an edge then continue on the opposite edge, so the image
 * can repeat side by side without visible seams.
 *
 * @param {CanvasRenderingContext2D} ctx - 2D drawing context
 * @param {number} size - image size in pixels
 * @param {Function} fn - draws the shape
 */
function drawWrapped(ctx, size, fn) {
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            ctx.save();
            ctx.translate(dx * size, dy * size);
            fn();
            ctx.restore();
        }
    }
}

/**
 * Draws an irregular spot made of a few overlapping ellipses.
 *
 * @param {CanvasRenderingContext2D} ctx - 2D drawing context
 * @param {Function} rnd - random number generator
 * @param {number} x - center x
 * @param {number} y - center y
 * @param {number} r - rough radius
 */
function blob(ctx, rnd, x, y, r) {
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(x + (rnd() - 0.5) * r, y + (rnd() - 0.5) * r,
            r * (0.5 + rnd() * 0.5), r * (0.4 + rnd() * 0.4), rnd() * Math.PI, 0, 2 * Math.PI);
        ctx.fill();
    }
}

/** Draws fur.png: cream fur with fine hair strokes and dark brown spots. */
function drawFur() {
    const ctx = document.getElementById("fur").getContext("2d");
    const rnd = makeRandom(7);
    ctx.fillStyle = "#f6edd9";
    ctx.fillRect(0, 0, SIZE, SIZE);

    // fine hair strokes
    ctx.strokeStyle = "rgba(150, 120, 80, 0.12)";
    for (let i = 0; i < 1500; i++) {
        const x = rnd() * SIZE, y = rnd() * SIZE;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (rnd() - 0.5) * 6, y + 6 + rnd() * 6);
        ctx.stroke();
    }

    // spots (drawn wrapped so the fur repeats without seams)
    ctx.fillStyle = "#3b2a1e";
    for (let i = 0; i < 22; i++) {
        const x = rnd() * SIZE, y = rnd() * SIZE, r = 14 + rnd() * 26;
        const seed = Math.floor(rnd() * 100000);
        drawWrapped(ctx, SIZE, function () { blob(ctx, makeRandom(seed), x, y, r); });
    }
}

/**
 * Fills a rectangle with yellow fur (used for the dog's head).
 *
 * @param {CanvasRenderingContext2D} ctx - 2D drawing context
 * @param {number} x - left edge
 * @param {number} y - top edge
 * @param {number} w - width
 * @param {number} h - height
 * @param {number} seed - random seed (different areas look a bit different)
 */
function headFur(ctx, x, y, w, h, seed) {
    const rnd = makeRandom(seed);
    ctx.fillStyle = "#f2c94c";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(160, 110, 20, 0.18)";
    for (let i = 0; i < 400; i++) {
        const px = x + rnd() * w, py = y + rnd() * h;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + (rnd() - 0.5) * 5, py + 5 + rnd() * 5);
        ctx.stroke();
    }
}

/**
 * Draws one cartoon eye: white, brown iris, black pupil and a small shine.
 *
 * @param {CanvasRenderingContext2D} ctx - 2D drawing context
 * @param {number} x - center x
 * @param {number} y - center y
 */
function eye(ctx, x, y) {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#1f1f1f";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(x, y, 34, 40, 0, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#3a2410";
    ctx.beginPath(); ctx.arc(x, y - 6, 20, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(x, y - 6, 11, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(x + 6, y - 13, 5, 0, 2 * Math.PI); ctx.fill();
}

/**
 * Draws dog_head.png, split in 4 tiles: top-left = eyes (head's top face),
 * top-right = muzzle (head's front face), bottom half = plain fur (the other faces).
 */
function drawHead() {
    const ctx = document.getElementById("head").getContext("2d");
    const T = SIZE / 2;   // tile size

    // top-left tile: top of the head. The image's "up" is the front of the dog,
    // so the eyes sit near the upper edge, close to the muzzle
    headFur(ctx, 0, 0, T, T, 11);
    eye(ctx, T * 0.30, T * 0.32);
    eye(ctx, T * 0.70, T * 0.32);
    // eyebrows
    ctx.strokeStyle = "#5a3a12"; ctx.lineWidth = 6; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(T * 0.18, T * 0.10); ctx.lineTo(T * 0.40, T * 0.08); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(T * 0.60, T * 0.08); ctx.lineTo(T * 0.82, T * 0.10); ctx.stroke();

    // top-right tile: front of the head (muzzle, nose, mouth, tongue)
    headFur(ctx, T, 0, T, T, 12);
    ctx.fillStyle = "#fbe7b2";
    ctx.beginPath(); ctx.ellipse(T * 1.5, T * 0.58, T * 0.36, T * 0.30, 0, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath(); ctx.ellipse(T * 1.5, T * 0.44, 30, 20, 0, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath(); ctx.ellipse(T * 1.5 - 8, T * 0.44 - 7, 8, 4, 0, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(T * 1.5, T * 0.52); ctx.lineTo(T * 1.5, T * 0.64); ctx.stroke();
    ctx.beginPath(); ctx.arc(T * 1.5 - 22, T * 0.64, 22, 0, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(T * 1.5 + 22, T * 0.64, 22, 0, Math.PI); ctx.stroke();
    ctx.fillStyle = "#e5737a";
    ctx.beginPath(); ctx.ellipse(T * 1.5, T * 0.80, 16, 20, 0, 0, Math.PI); ctx.fill();

    // bottom half: plain fur for the other faces
    headFur(ctx, 0, T, SIZE, T, 13);
}

/**
 * Draws one soft white cloud made of overlapping ellipses.
 *
 * @param {CanvasRenderingContext2D} ctx - 2D drawing context
 * @param {Function} rnd - random number generator
 * @param {number} x - center x
 * @param {number} y - center y
 * @param {number} s - rough size
 */
function cloud(ctx, rnd, x, y, s) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.ellipse(x + (rnd() - 0.5) * s * 2.2, y + (rnd() - 0.5) * s * 0.5,
            s * (0.5 + rnd() * 0.5), s * (0.35 + rnd() * 0.3), 0, 0, 2 * Math.PI);
        ctx.fill();
    }
}

/** Draws sky.png: blue gradient (darker at the top) with clouds. */
function drawSky() {
    const ctx = document.getElementById("sky").getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 0, SIZE);
    g.addColorStop(0, "#3f86d8");
    g.addColorStop(1, "#bfe0ff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);

    const rnd = makeRandom(21);
    for (let i = 0; i < 9; i++) {
        const x = rnd() * SIZE, y = 40 + rnd() * (SIZE - 80), s = 18 + rnd() * 26;
        const seed = Math.floor(rnd() * 100000);
        // repeated left and right only, so neighboring sky box faces line up better
        for (let dx = -1; dx <= 1; dx++) cloud(ctx, makeRandom(seed), x + dx * SIZE, y, s);
    }
}

/** Draws floor.png: gray stone tiles with a white panel showing the two text lines (name, ΑΜ). */
function drawFloor() {
    const ctx = document.getElementById("floor").getContext("2d");
    const rnd = makeRandom(31);
    const N = 8, cell = SIZE / N;   // 8 x 8 tiles

    // stone tiles, each a slightly different gray
    ctx.fillStyle = "#4b4f57";
    ctx.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const v = 120 + Math.floor(rnd() * 40);
            ctx.fillStyle = "rgb(" + v + "," + (v + 4) + "," + (v + 10) + ")";
            ctx.fillRect(i * cell + 3, j * cell + 3, cell - 6, cell - 6);
        }
    }

    // white text panel
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.beginPath();
    ctx.roundRect(40, SIZE / 2 - 90, SIZE - 80, 180, 18);
    ctx.fill();

    const line1 = document.getElementById("nameText").value;
    const line2 = document.getElementById("amText").value;
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    fitText(ctx, line1, SIZE / 2, SIZE / 2 - 35, 48, SIZE - 120);
    fitText(ctx, line2, SIZE / 2, SIZE / 2 + 40, 44, SIZE - 120);
}

/**
 * Writes bold, centered text, making the font smaller until the text fits.
 *
 * @param {CanvasRenderingContext2D} ctx - 2D drawing context
 * @param {string} text - the text
 * @param {number} x - center x
 * @param {number} y - center y
 * @param {number} fontSize - largest font size in pixels
 * @param {number} maxWidth - widest the text may be
 */
function fitText(ctx, text, x, y, fontSize, maxWidth) {
    let size = fontSize;
    do {
        ctx.font = "bold " + size + "px system-ui, 'Segoe UI', sans-serif";
        size -= 2;
    } while (ctx.measureText(text).width > maxWidth && size > 10);
    ctx.fillText(text, x, y);
}

/**
 * Saves one of the drawn images as a PNG file through the browser's download.
 *
 * @param {string} canvasId - id of the canvas holding the image
 * @param {string} fileName - name of the downloaded file
 */
function download(canvasId, fileName) {
    document.getElementById(canvasId).toBlob(function (blob) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
        // free the temporary link a moment later (after the download has started)
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    }, "image/png");
}

drawFur();
drawHead();
drawSky();
drawFloor();

// redraw the floor while typing the name / ΑΜ; download buttons save their image
document.getElementById("nameText").addEventListener("input", drawFloor);
document.getElementById("amText").addEventListener("input", drawFloor);
document.querySelectorAll("button[data-canvas]").forEach(function (btn) {
    btn.addEventListener("click", function () { download(btn.dataset.canvas, btn.dataset.file); });
});
