import { PointMass } from '../model/PointMass.js';
import { Spring } from '../model/Spring.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class RigidBodyEventHandler {
    constructor(sim, clock) {
        this.thrustRight_ = null;
        this.thrustLeft_ = null;
        this.dragStiffness_ = 3.0;
        this.dragSpring_ = null;
        this.dragObj_ = -1;
        this.optionKey_ = false;
        this.startDragAngle_ = 0;
        this.startBodyAngle_ = 0;
        this.shiftLeft_ = false;
        this.shiftRight_ = false;
        this.shiftS_ = false;
        this.shiftF_ = false;
        this.sim_ = sim;
        this.clock_ = clock;
        this.mousePoint_ = PointMass.makeCircle(1, 'mouse position');
        this.mousePoint_.setMass(Infinity);
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', clock_: ' + this.clock_.toStringShort()
            + ', thrustRight_: ' + this.thrustRight_
            + ', thrustLeft_: ' + this.thrustLeft_
            + ', dragStiffness_: ' + Util.NF(this.dragStiffness_)
            + '}';
    }
    ;
    toStringShort() {
        return 'RigidBodyEventHandler{sim: ' + this.sim_.toStringShort() + '}';
    }
    ;
    setThrusters(thrusters, side) {
        if (side == 'right') {
            this.thrustRight_ = thrusters;
        }
        else if (side == 'left') {
            this.thrustLeft_ = thrusters;
        }
        else {
            throw 'unknown side ' + side;
        }
    }
    ;
    startDrag(simObject, location, offset, dragBody, modifiers) {
        this.optionKey_ = modifiers.alt || modifiers.meta || modifiers.control || false;
        this.resetDrag();
        const numBods = this.sim_.getBodies().length;
        for (let i = 0; i < numBods; i++) {
            if (simObject === this.sim_.getBody(i))
                this.dragObj_ = i;
        }
        if (this.dragObj_ > -1) {
            const body = this.sim_.getBody(this.dragObj_);
            if (!this.clock_.isRunning()) {
                if (this.optionKey_) {
                    this.startBodyAngle_ = body.getAngle();
                    this.startDragAngle_ = Math.atan2(offset.getY(), offset.getX());
                }
            }
            else if (dragBody != null) {
                this.dragSpring_ = new Spring(RigidBodyEventHandler.en.DRAG, body, dragBody, this.mousePoint_, Vector.ORIGIN, 0, this.dragStiffness_);
                this.mouseDrag(simObject, location, offset);
                this.sim_.addForceLaw(this.dragSpring_);
                this.sim_.getSimList().add(this.dragSpring_);
            }
        }
        return this.dragObj_ > -1;
    }
    ;
    mouseDrag(_simObject, location, offset) {
        if (!this.clock_.isRunning() && this.dragObj_ > -1) {
            const body = this.sim_.getBody(this.dragObj_);
            if (this.optionKey_) {
                const angle = Math.atan2(location.getY() - body.getPosition().getY(), location.getX() - body.getPosition().getX());
                body.setAngle(this.startBodyAngle_ + angle - this.startDragAngle_);
            }
            else {
                body.setPosition(location.subtract(offset));
            }
        }
        else {
            this.mousePoint_.setPosition(location);
        }
    }
    ;
    finishDrag(_simObject, _location, _offset) {
        this.resetDrag();
    }
    ;
    resetDrag() {
        const spring = this.dragSpring_;
        if (spring != null) {
            this.sim_.removeForceLaw(spring);
            this.sim_.getSimList().remove(spring);
            this.dragSpring_ = null;
        }
        this.dragObj_ = -1;
    }
    ;
    handleKeyEvent(evt, pressed, modifiers) {
        const thrustRight = this.thrustRight_;
        const thrustLeft = this.thrustLeft_;
        if (modifiers.alt || modifiers.meta || modifiers.control) {
            return;
        }
        switch (evt.key) {
            case "ArrowLeft":
            case "J":
            case "j":
                if (thrustRight != null) {
                    if (pressed)
                        this.shiftLeft_ = modifiers.shift || false;
                    thrustRight.setActive(1, pressed);
                    thrustRight.setActive(this.shiftLeft_ ? 4 : 5, pressed);
                    thrustRight.setActive(this.shiftLeft_ ? 5 : 4, false);
                    evt.preventDefault();
                }
                break;
            case "ArrowRight":
            case "L":
            case "l":
                if (thrustRight != null) {
                    if (pressed)
                        this.shiftRight_ = modifiers.shift || false;
                    thrustRight.setActive(0, pressed);
                    thrustRight.setActive(this.shiftRight_ ? 5 : 4, pressed);
                    thrustRight.setActive(this.shiftRight_ ? 4 : 5, false);
                    evt.preventDefault();
                }
                break;
            case "ArrowUp":
            case "I":
            case "i":
                if (thrustRight != null) {
                    thrustRight.setActive(3, pressed);
                    evt.preventDefault();
                }
                break;
            case "ArrowDown":
            case "K":
            case "k":
                if (thrustRight != null) {
                    thrustRight.setActive(2, pressed);
                    evt.preventDefault();
                }
                break;
            case "S":
            case "s":
                if (thrustLeft != null) {
                    if (pressed)
                        this.shiftS_ = modifiers.shift || false;
                    thrustLeft.setActive(1, pressed);
                    thrustLeft.setActive(this.shiftS_ ? 4 : 5, pressed);
                    thrustLeft.setActive(this.shiftS_ ? 5 : 4, false);
                    evt.preventDefault();
                }
                break;
            case "F":
            case "f":
                if (thrustLeft != null) {
                    if (pressed)
                        this.shiftF_ = modifiers.shift || false;
                    thrustLeft.setActive(0, pressed);
                    thrustLeft.setActive(this.shiftF_ ? 5 : 4, pressed);
                    thrustLeft.setActive(this.shiftF_ ? 4 : 5, false);
                    evt.preventDefault();
                }
                break;
            case "E":
            case "e":
                if (thrustLeft != null) {
                    thrustLeft.setActive(3, pressed);
                    evt.preventDefault();
                }
                break;
            case "D":
            case "d":
            case "C":
            case "c":
                if (thrustLeft != null) {
                    thrustLeft.setActive(2, pressed);
                    evt.preventDefault();
                }
                break;
            default:
                break;
        }
    }
    ;
    getDragStiffness() {
        return this.dragStiffness_;
    }
    ;
    setDragStiffness(stiffness) {
        this.dragStiffness_ = stiffness;
    }
    ;
}
RigidBodyEventHandler.en = {
    CLICK: 'click',
    DRAG: 'drag'
};
RigidBodyEventHandler.de_strings = {
    CLICK: 'klicken',
    DRAG: 'ziehen'
};
RigidBodyEventHandler.i18n = Util.LOCALE === 'de' ? RigidBodyEventHandler.de_strings :
    RigidBodyEventHandler.en;
Util.defineGlobal('lab$app$RigidBodyEventHandler', RigidBodyEventHandler);
