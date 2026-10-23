/**
 * Sizes and positions of everything in the scene: the dog's parts (from the assignment
 * table and figure), its joints, the sky box and the floor. Values that depend on these
 * sizes (walk range, camera distance limit, dog height...) are calculated here,
 * so changing one size updates everything that depends on it.
 *
 * @author marou
 */

import { deepFreeze } from "../utils/freeze.js";

/**
 * Size [length x, width y, height z] and center [x, y, z] of each dog part when the dog stands still.
 * Axes: the dog faces +x, its left side is +y, z is up; the paws cover (-8,-6,0) to (8,6,0).
 * Legs and paws have only the height of their center: their x, y come from DOG_LEGS.
 */
export const DOG_PARTS = deepFreeze({
    body: { size: [14, 6, 5], center: [0, 0, 8.5] },     // x -7..7, y -3..3, z 6..11
    leg:  { size: [3, 3, 6],  centerZ: 5 },              // beside the body, z 2..8
    paw:  { size: [5, 3, 2],  centerZ: 1 },              // z 0..2
    tail: { size: [2, 2, 5],  center: [-8, 0, 11.5] },   // behind the body, x -9..-7, z 9..14
    neck: { size: [4, 4, 3],  center: [5, 0, 12.5] },    // on top of the body, x 3..7, z 11..14
    head: { size: [8, 6, 4],  center: [7, 0, 16] },      // x 3..11, z 14..18
    ear:  { size: [2, 2, 5],  centers: [[4, 4, 15.5], [4, -4, 15.5]] }   // left, right
});

/**
 * The 4 legs: key in the pose (front/back + left/right), center x and y,
 * and the end of the body they belong to (matters for the dachshund stretch).
 */
export const DOG_LEGS = deepFreeze([
    { key: "fl", x:  5.5, y:  4.5, end: "front" },   // front left
    { key: "fr", x:  5.5, y: -4.5, end: "front" },   // front right
    { key: "bl", x: -5.5, y:  4.5, end: "rear" },    // back left
    { key: "br", x: -5.5, y: -4.5, end: "rear" }     // back right
]);

/** Points the moving parts turn around (Steps 10-11). */
export const DOG_JOINTS = deepFreeze({
    neck: [5, 0, 11],       // center of the neck base; head + neck turn around z
    tail: [-7, 0, 10],      // center of where the tail touches the body; turns around x
    legZ: 8,                // height of the middle of each leg's top face; legs turn around y
    playDead: [0, 6, 0]     // outer bottom edge of the left paws; the dog falls around x
});

/** Height of the whole dog (top of the head). */
export const DOG_HEIGHT = DOG_PARTS.head.center[2] + DOG_PARTS.head.size[2] / 2;

/** Height of the middle of the dog: the "Front view" camera looks straight at it. */
export const DOG_MID_HEIGHT = DOG_HEIGHT / 2;

/** Length of the dog's body: the dachshund stretches it by up to one more body length. */
export const BODY_LENGTH = DOG_PARTS.body.size[0];

/** Height of the head: in the cartoon action the head lifts off the neck by this much. */
export const HEAD_HEIGHT = DOG_PARTS.head.size[2];

/** Edge length of the sky box (Step 8). */
export const SKYBOX_EDGE = 5000;

/** Edge length of the square floor (Step 8). */
export const FLOOR_EDGE = 25;

/** Thickness of the floor (it goes from z = -1 up to z = 0). */
export const FLOOR_THICKNESS = 1;

/** How far the dog walks in "Normal walk" before starting again (80% of the way to the floor edge). */
export const WALK_RANGE = FLOOR_EDGE * 2 / 5;

/** Largest allowed cameraDistance (80% of the way to the sky box wall, so the camera stays inside). */
export const MAX_CAMERA_DISTANCE = SKYBOX_EDGE * 2 / 5;
