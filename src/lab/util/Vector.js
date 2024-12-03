import { Util } from "./Util.js";
;
export class Vector {
    constructor(x, y, opt_z) {
        const z = typeof opt_z === 'number' ? opt_z : 0;
        this.x_ = Util.testNumber(x);
        this.y_ = Util.testNumber(y);
        this.z_ = Util.testNumber(z);
        this.length_ = NaN;
        this.lengthSquared_ = NaN;
    }
    ;
    toString() {
        return 'Vector{x: ' + Util.NF5(this.x_)
            + ', y: ' + Util.NF5(this.y_)
            + (this.z_ != 0 ? ', z: ' + Util.NF5(this.z_) : '')
            + '}';
    }
    ;
    static clone(vector) {
        if (vector instanceof Vector) {
            return vector;
        }
        else {
            return new Vector(vector.getX(), vector.getY(), vector.getZ());
        }
    }
    ;
    add(vector) {
        return new Vector(this.x_ + vector.getX(), this.y_ + vector.getY(), this.z_ + vector.getZ());
    }
    ;
    angleTo(vector) {
        if (this.getZ() != 0 || vector.getZ() != 0) {
            throw '';
        }
        const at = Math.atan2(this.y_, this.x_);
        const bt = Math.atan2(vector.getY(), vector.getX());
        return Util.limitAngle(bt - at);
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
            throw 'Vector.divide by near zero factor ' + Util.NFE(factor);
        }
        else {
            return new Vector(this.x_ / factor, this.y_ / factor, this.z_ / factor);
        }
    }
    ;
    dotProduct(vector) {
        const r = this.x_ * vector.getX() + this.y_ * vector.getY() + this.z_ * vector.getZ();
        if (isNaN(r)) {
            throw Util.DEBUG ? ('dotproduct is not a number ' + this + ' ' + vector) : '';
        }
        return r;
    }
    ;
    equals(vector) {
        if (vector === null) {
            return false;
        }
        return vector.getX() === this.x_ &&
            vector.getY() === this.y_ &&
            vector.getZ() === this.z_;
    }
    ;
    getAngle() {
        return Math.atan2(this.y_, this.x_);
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
        if (isNaN(this.length_)) {
            this.length_ = Math.sqrt(this.lengthSquared());
        }
        return this.length_;
    }
    ;
    lengthCheap() {
        const r = Math.abs(this.x_) + Math.abs(this.y_);
        if (this.z_ == 0.0) {
            return r;
        }
        else {
            return r + Math.abs(this.z_);
        }
    }
    ;
    lengthSquared() {
        if (isNaN(this.lengthSquared_)) {
            if (this.z_ === 0.0) {
                this.lengthSquared_ = this.x_ * this.x_ + this.y_ * this.y_;
            }
            else {
                this.lengthSquared_ = this.x_ * this.x_ + this.y_ * this.y_ + this.z_ * this.z_;
            }
        }
        return this.lengthSquared_;
    }
    ;
    multiply(factor) {
        if (factor === 1.0) {
            return this;
        }
        else {
            return new Vector(factor * this.x_, factor * this.y_, factor * this.z_);
        }
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
        return this.divide(this.length());
    }
    ;
    rotate(angle, sineAngle) {
        let cosAngle;
        if (sineAngle !== undefined) {
            cosAngle = angle;
        }
        else {
            cosAngle = Math.cos(angle);
            sineAngle = Math.sin(angle);
        }
        if (Math.abs(cosAngle * cosAngle + sineAngle * sineAngle - 1.0) > 1E-12) {
            throw 'not cosine, sine: ' + cosAngle + ', ' + sineAngle;
        }
        return new Vector(this.x_ * cosAngle - this.y_ * sineAngle, this.x_ * sineAngle + this.y_ * cosAngle, this.z_);
    }
    ;
    subtract(vector) {
        return new Vector(this.x_ - vector.getX(), this.y_ - vector.getY(), this.z_ - vector.getZ());
    }
    ;
}
Vector.TINY_POSITIVE = 1E-10;
Vector.ORIGIN = new Vector(0, 0);
Vector.EAST = new Vector(1, 0);
Vector.NORTH = new Vector(0, 1);
Vector.SOUTH = new Vector(0, -1);
Vector.WEST = new Vector(-1, 0);
;
Util.defineGlobal('lab$util$Vector', Vector);
