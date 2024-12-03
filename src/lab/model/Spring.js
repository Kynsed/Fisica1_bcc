import { AbstractSimObject } from "./SimObject.js";
import { DoubleRect } from "../util/DoubleRect.js";
import { Force } from "./Force.js";
import { Util } from "../util/Util.js";
import { Vector } from "../util/Vector.js";
export class Spring extends AbstractSimObject {
    constructor(name, body1, attach1_body, body2, attach2_body, restLength, stiffness, compressOnly) {
        super(name);
        this.damping_ = 0;
        this.body1_ = body1;
        this.attach1_ = Vector.clone(attach1_body);
        this.body2_ = body2;
        this.attach2_ = Vector.clone(attach2_body);
        this.restLength_ = restLength;
        this.stiffness_ = stiffness ?? 0;
        this.compressOnly_ = compressOnly ?? false;
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', body1_:"' + this.body1_.getName() + '"'
            + ', attach1_: ' + this.attach1_
            + ', body2_:"' + this.body2_.getName() + '"'
            + ', attach2_: ' + this.attach2_
            + ', restLength_: ' + Util.NF(this.restLength_)
            + ', stiffness_: ' + Util.NF(this.stiffness_)
            + ', damping_: ' + Util.NF(this.damping_)
            + ', compressOnly_: ' + this.compressOnly_
            + '}';
    }
    ;
    getClassName() {
        return 'Spring';
    }
    ;
    calculateForces() {
        const point1 = this.getStartPoint();
        const point2 = this.getEndPoint();
        const v = point2.subtract(point1);
        const len = v.length();
        if (len < Vector.TINY_POSITIVE) {
            throw "zero spring length";
        }
        ;
        const sf = -this.stiffness_ * (len - this.restLength_);
        const fx = -sf * (v.getX() / len);
        const fy = -sf * (v.getY() / len);
        let f = new Vector(fx, fy, 0);
        if (this.damping_ != 0) {
            if (!this.compressOnly_ || len < this.restLength_ - 1E-10) {
                const v1 = this.body1_.getVelocity(this.attach1_);
                const v2 = this.body2_.getVelocity(this.attach2_);
                const df = v1.subtract(v2).multiply(-this.damping_);
                f = f.add(df);
            }
        }
        return [new Force('spring', this.body1_, point1, 1, f, 1),
            new Force('spring', this.body2_, point2, 1, f.multiply(-1), 1)];
    }
    ;
    disconnect() {
    }
    ;
    getAttach1() {
        return this.attach1_;
    }
    ;
    getAttach2() {
        return this.attach2_;
    }
    ;
    getBodies() {
        return [this.body1_, this.body2_];
    }
    ;
    getBody1() {
        return this.body1_;
    }
    ;
    getBody2() {
        return this.body2_;
    }
    ;
    getBoundsWorld() {
        return DoubleRect.make(this.getStartPoint(), this.getEndPoint());
    }
    ;
    getDamping() {
        return this.damping_;
    }
    ;
    getEndPoint() {
        if (this.attach2_ == null || this.body2_ == null) {
            throw '';
        }
        const p2 = this.body2_.bodyToWorld(this.attach2_);
        if (this.compressOnly_) {
            const p1 = this.getStartPoint();
            const dist = p1.distanceTo(p2);
            const rlen = this.restLength_;
            if (dist <= rlen) {
                return p2;
            }
            else {
                const n = p2.subtract(p1).normalize();
                return p1.add(n.multiply(rlen));
            }
        }
        else {
            return p2;
        }
    }
    ;
    getLength() {
        return this.getEndPoint().distanceTo(this.getStartPoint());
    }
    ;
    getPotentialEnergy() {
        const stretch = this.getStretch();
        return 0.5 * this.stiffness_ * stretch * stretch;
    }
    ;
    getRestLength() {
        return this.restLength_;
    }
    ;
    getStartPoint() {
        if (this.attach1_ == null || this.body1_ == null)
            throw '';
        return this.body1_.bodyToWorld(this.attach1_);
    }
    ;
    getStiffness() {
        return this.stiffness_;
    }
    ;
    getStretch() {
        return this.getLength() - this.restLength_;
    }
    ;
    getVector() {
        return this.getEndPoint().subtract(this.getStartPoint());
    }
    ;
    setDamping(damping) {
        this.damping_ = damping;
        this.setChanged();
        return this;
    }
    ;
    setRestLength(value) {
        this.restLength_ = value;
        this.setChanged();
    }
    ;
    setStiffness(stiffness) {
        this.stiffness_ = stiffness;
        this.setChanged();
    }
    ;
}
Spring.LOADME = 'loadme';
Util.defineGlobal('lab$model$Spring', Spring);
