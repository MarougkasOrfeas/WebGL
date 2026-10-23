/**
 * Dog controls (Steps 10-11): the part / action radio buttons, the mouse wheel
 * that moves the selected part or action, and the Reset pose button.
 *
 * @author marou
 */

import { checkedValue, onClick } from "../utils/dom.js";
import {
    WHEEL_JOINT_STEP, WHEEL_ACTION_STEP, isAction, stepJoint, advanceAction, restartAction, resetPose
} from "../scene/pose.js";

/**
 * Wheel distance in pixels that counts as one step. A mouse wheel notch is one step;
 * a touchpad sends many small scrolls, which are added up so a swipe is not too fast.
 */
const WHEEL_PIXELS_PER_STEP = 40;

/**
 * The selected dog option.
 *
 * @returns {string} a part ("head", "tail", "frontLeft", "frontRight") or an action ("playDead", ...)
 */
export function selectedDogOption() {
    return checkedValue("dogPart");
}

/**
 * Connects the mouse wheel, the dog radio buttons and the Reset pose button.
 *
 * @param {Object} app - the scene app (from createSceneApp)
 */
export function enableDogControls(app) {
    let scrolled = 0;   // touchpad scroll added up since the last step (pixels)

    /**
     * Mouse wheel over the canvas: one step per wheel notch, in whichever direction
     * it is turned (the movement itself turns back at its limits).
     */
    app.canvas.addEventListener("wheel", function (event) {
        event.preventDefault();   // do not scroll the page

        // wheels that report lines or pages (deltaMode 1 / 2, e.g. a Firefox mouse) give one step
        // per event; pixel scrolls (touchpads) are added up until they make one step
        if (event.deltaMode === 0) {
            scrolled += Math.abs(event.deltaY);
            if (scrolled < WHEEL_PIXELS_PER_STEP) return;
            scrolled = 0;
        }

        const selected = selectedDogOption();

        if (isAction(selected)) {
            // while the animation runs, actions play by themselves: ignore the wheel
            if (app.animating) return;
            advanceAction(WHEEL_ACTION_STEP);
        } else {
            stepJoint(selected, WHEEL_JOINT_STEP);
        }
        app.requestDraw();
    }, { passive: false });

    /** A newly selected option starts its action from the beginning. */
    document.querySelectorAll('input[name="dogPart"]').forEach(function (radio) {
        radio.addEventListener("change", function () {
            restartAction();
            app.requestDraw();
        });
    });

    /** Reset pose button: the dog stands still again. */
    onClick("resetPoseBtn", function () {
        resetPose();
        app.requestDraw();
    });
}
