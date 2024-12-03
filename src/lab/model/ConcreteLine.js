import { AbstractSimObject } from './SimObject.js';
import { DoubleRect } from '../util/DoubleRect.js';
import { Vector } from '../util/Vector.js';
export class ConcreteLine extends AbstractSimObject {
    constructor(name, startPt, endPt) {
        super(name);
        this.startPt_ = startPt ? startPt : Vector.ORIGIN;
        this.endPt_ = endPt ? endPt : Vector.ORIGIN;
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', startPoint: ' + this.getStartPoint()
            + ', endPoint: ' + this.getEndPoint()
            + '}';
    }
    ;
    getClassName() {
        return 'ConcreteLine';
    }
    ;
    getBoundsWorld() {
        return DoubleRect.make(this.getStartPoint(), this.getEndPoint());
    }
    ;
    getEndPoint() {
        return this.endPt_;
    }
    ;
    getStartPoint() {
        return this.startPt_;
    }
    ;
    getVector() {
        return this.getEndPoint().subtract(this.getStartPoint());
    }
    ;
    setEndPoint(loc) {
        this.endPt_ = loc;
        this.setChanged();
    }
    ;
    setStartPoint(loc) {
        this.startPt_ = loc;
        this.setChanged();
    }
    ;
    similar(obj, opt_tolerance) {
        if (!(obj instanceof ConcreteLine)) {
            return false;
        }
        if (!obj.getStartPoint().nearEqual(this.getStartPoint(), opt_tolerance)) {
            return false;
        }
        return obj.getEndPoint().nearEqual(this.getEndPoint(), opt_tolerance);
    }
    ;
}
