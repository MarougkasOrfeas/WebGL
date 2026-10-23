/**
 * The dog's pose: the parts moved with the mouse wheel (Step 10) and the
 * automatic actions (Step 11). It only calculates angles and moves; dog.js draws them.
 * Angles are in degrees: head - negative turns to the dog's right; legs - positive swings
 * forward; tail - positive swings to the dog's right; roll - "play dead" fall.
 *
 * @author marou
 */

import { tri, swing } from "../utils/math.js";
import { DogPart, DogAction } from "../config/options.js";
import { BODY_LENGTH, HEAD_HEIGHT, WALK_RANGE } from "../config/dimensions.js";

/** How many degrees a part moves per wheel notch (Step 10). */
export const WHEEL_JOINT_STEP = 5;

/** How far an action moves per wheel notch while the animation is paused (Step 11). */
export const WHEEL_ACTION_STEP = 0.05;

/** How far an action moves per animation frame (Step 11). */
export const FRAME_ACTION_STEP = 0.01;

/**
 * Start settings of the 4 wheel-controlled parts (Step 10): the allowed range in degrees
 * and the first direction. The direction flips at the limits, so the user can keep
 * turning the wheel the same way.
 */
const JOINT_DEFAULTS = {
    [DogPart.HEAD]:        { dir: -1, min: -90, max: 90 },  // starts turning right
    [DogPart.FRONT_LEFT]:  { dir:  1, min:   0, max: 90 },  // starts moving forward
    [DogPart.FRONT_RIGHT]: { dir:  1, min:   0, max: 90 },
    [DogPart.TAIL]:        { dir:  1, min: -90, max: 90 }   // starts towards the right
};

/** Current angle and direction of each wheel-controlled part. */
const joints = {};

/** Progress of the selected Step 11 action (grows over time or with the wheel). */
let actionPhase = 0;

/** Puts every part back to its start (standing dog) and restarts the action. */
export function resetPose() {
    for (const name in JOINT_DEFAULTS) {
        joints[name] = Object.assign({ value: 0 }, JOINT_DEFAULTS[name]);
    }
    actionPhase = 0;
}
resetPose();

/**
 * Tells if a radio option is a Step 11 action (and not a Step 10 part).
 *
 * @param {string} selected - the selected option, e.g. "head" or "playDead"
 * @returns {boolean} true for an action
 */
export function isAction(selected) {
    return Object.values(DogAction).includes(selected);
}

/**
 * Moves a part one wheel step (Step 10). At the end of its range it turns back.
 *
 * @param {string} name - one of the DogPart values ("head", "frontLeft", "frontRight", "tail")
 * @param {number} amount - degrees to move
 */
export function stepJoint(name, amount) {
    const joint = joints[name];
    joint.value += joint.dir * amount;
    if (joint.value >= joint.max) {
        joint.value = joint.max;
        joint.dir = -1;   // reached the upper limit: go back
    } else if (joint.value <= joint.min) {
        joint.value = joint.min;
        joint.dir = 1;    // reached the lower limit: go forward again
    }
}

/**
 * Moves the selected action forward (Step 11).
 *
 * @param {number} amount - how much progress to add
 */
export function advanceAction(amount) {
    actionPhase += amount;
}

/** Starts the action again from the beginning (used when another option is selected). */
export function restartAction() {
    actionPhase = 0;
}

/**
 * The pose of a dog standing still, with every part in its Step 5 place.
 *
 * @returns {Object} headAngle, legs {fl, fr, bl, br}, tailAngle, roll, offsetX, stretch, headLift, pawScale
 */
export function neutralPose() {
    return {
        headAngle: 0,
        legs: { fl: 0, fr: 0, bl: 0, br: 0 },
        tailAngle: 0,
        roll: 0,        // play dead
        offsetX: 0,     // normal walk
        stretch: 0,     // dachshund: extra body length
        headLift: 0,    // cartoon
        pawScale: 1     // cartoon (length and width only)
    };
}

/**
 * The current pose of the dog. The Step 10 part angles always apply;
 * the selected Step 11 action then replaces the values it controls.
 *
 * @param {string} selected - the selected radio option
 * @returns {Object} the pose (same fields as neutralPose)
 */
export function computePose(selected) {
    const pose = neutralPose();
    pose.headAngle = joints[DogPart.HEAD].value;
    pose.legs.fl = joints[DogPart.FRONT_LEFT].value;
    pose.legs.fr = joints[DogPart.FRONT_RIGHT].value;
    pose.tailAngle = joints[DogPart.TAIL].value;

    const p = actionPhase;
    switch (selected) {
        case DogAction.PLAY_DEAD:
            // fall onto the left side and get back up (0° → 90° → 0°)
            pose.roll = -90 * tri(p);
            break;

        case DogAction.NORMAL_WALK:
            // walk forward (+x); after WALK_RANGE jump back to -WALK_RANGE, so the dog stays on the floor
            pose.offsetX = ((2 * p + WALK_RANGE) % (2 * WALK_RANGE)) - WALK_RANGE;
            // no break: the legs move exactly like in the static walk below
        case DogAction.STATIC_WALK: {
            // opposite corners move together: front-left with back-right, front-right with back-left,
            // between 90° forward and 90° backward
            const a = 90 * swing(p);
            pose.legs.fl = a;
            pose.legs.br = a;
            pose.legs.fr = -a;
            pose.legs.bl = -a;
            break;
        }

        case DogAction.DACHSHUND:
            // body grows up to twice its length and back
            pose.stretch = BODY_LENGTH * tri(p);
            break;

        case DogAction.CARTOON:
            pose.headLift = HEAD_HEIGHT * tri(p);        // head lifts off the neck by one head height and comes back
            pose.tailAngle = 360 * ((p / 2) % 1);        // tail spins full circles
            pose.pawScale = 1 + 0.6 * tri(p);            // paws grow and shrink
            break;
    }
    return pose;
}
