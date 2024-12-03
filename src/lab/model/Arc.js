import { AbstractSimObject } from './SimObject.js';
import { DoubleRect } from '../util/DoubleRect.js';
import { Util } from '../util/Util.js';
export class Arc extends AbstractSimObject {
    constructor(name, startAngle, radius, center) {
        super(name);
        this.angle_ = 0;
        this.startAngle_ = startAngle;
        this.radius_ = radius;
        this.center_ = center;
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', startAngle_: ' + Util.NF(this.startAngle_)
            + ', angle_: ' + Util.NF(this.angle_)
            + ', radius_: ' + Util.NF(this.radius_)
            + ', center_: ' + this.center_
            + '}';
    }
    ;
    getClassName() {
        return 'Arc';
    }
    ;
    getAngle() {
        return this.angle_;
    }
    ;
    getBoundsWorld() {
        return DoubleRect.makeCentered(this.center_, this.radius_, this.radius_);
    }
    ;
    getCenter() {
        return this.center_;
    }
    ;
    getRadius() {
        return this.radius_;
    }
    ;
    getStartAngle() {
        return this.startAngle_;
    }
    ;
    setAngle(angle) {
        this.angle_ = angle;
        this.setChanged();
    }
    ;
    setCenter(center) {
        this.center_ = center;
        this.setChanged();
    }
    ;
    setRadius(radius) {
        this.radius_ = radius;
        this.setChanged();
    }
    ;
    setStartAngle(angle) {
        this.startAngle_ = angle;
        this.setChanged();
    }
    ;
    similar(obj, opt_tolerance) {
        if (!(obj instanceof Arc)) {
            return false;
        }
        if (Util.veryDifferent(obj.startAngle_, this.startAngle_, opt_tolerance)) {
            return false;
        }
        if (Util.veryDifferent(obj.angle_, this.angle_, opt_tolerance)) {
            return false;
        }
        if (Util.veryDifferent(obj.radius_, this.radius_, opt_tolerance)) {
            return false;
        }
        return obj.getCenter().nearEqual(this.center_, opt_tolerance);
    }
    ;
}
