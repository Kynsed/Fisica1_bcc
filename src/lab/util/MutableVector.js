import { Vector } from "./Vector.js";
import { Util } from "./Util.js";
export class MutableVector {
    constructor(x, y, opt_z) {
        const z = typeof opt_z === 'number' ? opt_z : 0;
        this.x_ = Util.testNumber(x);
        this.y_ = Util.testNumber(y);
        this.z_ = Util.testNumber(z);
    }
    ;
    toString() {
        return 'MutableVector{x: ' + Util.NF5(this.x_)
            + ', y: ' + Util.NF5(this.y_)
            + (this.z_ != 0 ? ', z: ' + Util.NF5(this.z_) : '')
            + '}';
    }
    ;
    static clone(v) {
        return new MutableVector(v.getX(), v.getY(), v.getZ());
    }
    ;
    add(p) {
        this.x_ += p.getX();
        this.y_ += p.getY();
        this.z_ += p.getZ();
        return this;
    }
    ;
    distanceSquaredTo(point) {
        const dx = this.x_ - point.getX();
        const dy = this.y_ - point.getY();
        const dz = this.z_ - point.getZ();
        return dx * dx + dy * dy + dz * dz;
    }
    ;
    distanceTo(point) {
        return Math.sqrt(this.distanceSquaredTo(point));
    }
    ;
    divide(factor) {
        if (factor === 1.0) {
            return this;
        }
        else if (factor < Vector.TINY_POSITIVE) {
            throw 'div by zero';
        }
        else {
            this.x_ /= factor;
            this.y_ /= factor;
            this.z_ /= factor;
            return this;
        }
    }
    ;
    equals(vector) {
        if (vector === null)
            return false;
        return vector.getX() === this.x_ &&
            vector.getY() === this.y_ &&
            vector.getZ() === this.z_;
    }
    ;
    getX() {
        return this.x_;
    }
    ;
    getY() {
        return this.y_;
    }
    ;
    getZ() {
        return this.z_;
    }
    ;
    length() {
        return Math.sqrt(this.lengthSquared());
    }
    ;
    lengthCheap() {
        const r = Math.abs(this.x_) + Math.abs(this.y_);
        if (this.z_ == 0.0)
            return r;
        else
            return r + Math.abs(this.z_);
    }
    ;
    lengthSquared() {
        if (this.z_ === 0.0) {
            return this.x_ * this.x_ + this.y_ * this.y_;
        }
        else {
            return this.x_ * this.x_ + this.y_ * this.y_ + this.z_ * this.z_;
        }
    }
    ;
    multiply(factor) {
        this.x_ *= factor;
        this.y_ *= factor;
        this.z_ *= factor;
        return this;
    }
    ;
    nearEqual(vector, opt_tolerance) {
        if (Util.veryDifferent(this.x_, vector.getX(), opt_tolerance)) {
            return false;
        }
        if (Util.veryDifferent(this.y_, vector.getY(), opt_tolerance)) {
            return false;
        }
        if (Util.veryDifferent(this.z_, vector.getZ(), opt_tolerance)) {
            return false;
        }
        return true;
    }
    ;
    normalize() {
        const len = this.length();
        if (len < Vector.TINY_POSITIVE) {
            throw '';
        }
        else {
            return new Vector(this.x_ / len, this.y_ / len, this.z_ / len);
        }
    }
    ;
    setTo(x, y, z) {
        this.x_ = x;
        this.y_ = y;
        this.z_ = z || 0;
        return this;
    }
    ;
    setToVector(p) {
        this.x_ = p.getX();
        this.y_ = p.getY();
        this.z_ = p.getZ();
        return this;
    }
    ;
    subtract(p) {
        this.x_ -= p.getX();
        this.y_ -= p.getY();
        this.z_ -= p.getZ();
        return this;
    }
    ;
}
Util.defineGlobal('lab$util$MutableVector', MutableVector);
