import { DoubleRect } from '../util/DoubleRect.js';
import { AbstractSimObject } from './SimObject.js';
import { Util } from '../util/Util.js';
export class Impulse extends AbstractSimObject {
    constructor(name, body, magnitude, location, direction, offset) {
        super(name);
        this.body_ = body;
        this.magnitude_ = magnitude;
        this.location_ = location;
        this.direction_ = direction;
        this.offset_ = offset;
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', body: "' + this.body_.getName() + '"'
            + ', magnitude_: ' + Util.NF5E(this.magnitude_)
            + ', location_: ' + this.location_
            + ', direction_: ' + this.direction_
            + ', offset_: ' + this.offset_
            + '}';
    }
    ;
    getClassName() {
        return 'Impulse';
    }
    ;
    getBody() {
        return this.body_;
    }
    ;
    getBoundsWorld() {
        return DoubleRect.make(this.location_, this.getEndPoint());
    }
    ;
    getEndPoint() {
        return this.location_.add(this.direction_);
    }
    ;
    getStartPoint() {
        return this.location_;
    }
    ;
    getMagnitude() {
        return this.magnitude_;
    }
    ;
    getOffset() {
        return this.offset_;
    }
    ;
    getVector() {
        return this.direction_;
    }
    ;
    similar(obj, opt_tolerance) {
        if (!(obj instanceof Impulse)) {
            return false;
        }
        if (obj.getName() != this.getName()) {
            return false;
        }
        const f = obj;
        if (!this.location_.nearEqual(f.getStartPoint(), opt_tolerance)) {
            return false;
        }
        if (Util.veryDifferent(this.magnitude_, f.getMagnitude(), opt_tolerance)) {
            return false;
        }
        if (!this.direction_.nearEqual(f.getVector(), opt_tolerance)) {
            return false;
        }
        return this.offset_.nearEqual(f.getOffset(), opt_tolerance);
    }
    ;
}
Util.defineGlobal('lab$model$Impulse', Impulse);
