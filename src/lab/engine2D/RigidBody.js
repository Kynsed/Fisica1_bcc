import { Vector } from '../util/Vector.js';
import { Util } from '../util/Util.js';
;
;
;
export class RigidBodyCollision {
    constructor(body, normalBody, joint) {
        this.mustHandle_ = false;
        this.ballObject = false;
        this.ballNormal = false;
        this.impact1 = Vector.ORIGIN;
        this.impact2 = null;
        this.distance = NaN;
        this.detectedDistance_ = NaN;
        this.normal = Vector.NORTH;
        this.normal_dt = null;
        this.radius1 = NaN;
        this.radius2 = NaN;
        this.normalVelocity_ = NaN;
        this.detectedVelocity_ = NaN;
        this.creator = '';
        this.detectedTime_ = NaN;
        this.estimate_ = NaN;
        this.updateTime_ = NaN;
        this.impulse = NaN;
        this.force = NaN;
        this.primaryBody = body;
        this.normalBody = normalBody;
        this.joint = joint;
        this.distanceTol_ = Math.max(body.getDistanceTol(), normalBody.getDistanceTol());
        this.targetGap_ = joint ? 0 : this.distanceTol_ / 2;
        const acc = Math.max(body.getAccuracy(), normalBody.getAccuracy());
        if (acc <= 0 || acc > 1) {
            throw 'accuracy must be between 0 and 1, is ' + acc;
        }
        this.accuracy_ = acc * this.distanceTol_ / 2;
        this.velocityTol_ = Math.max(body.getVelocityTol(), normalBody.getVelocityTol());
        this.elasticity_ = Math.min(body.getElasticity(), normalBody.getElasticity());
        this.normalFixed = false;
    }
    ;
    toString() {
        return this.getClassName() + '{distance: ' + Util.NF5E(this.distance)
            + ', normalVelocity_: ' + Util.NF5E(this.normalVelocity_)
            + ', body: "' + this.primaryBody.getName() + '"'
            + ', normalBody: "' + this.normalBody.getName() + '"'
            + ', impact1: ' + this.impact1
            + ', contact: ' + this.contact()
            + ', joint: ' + this.joint
            + ', elasticity_: ' + Util.nf5(this.elasticity_)
            + ', targetGap_: ' + Util.NF5E(this.targetGap_)
            + ', accuracy_: ' + Util.NF7(this.accuracy_)
            + ', mustHandle_: ' + this.mustHandle_
            + ', impact2: ' + (this.impact2 != null ? this.impact2 : 'null')
            + ', normal: ' + this.normal
            + ', ballObject: ' + this.ballObject
            + ', ballNormal: ' + this.ballNormal
            + ', estimate_: ' + Util.NF7(this.estimate_)
            + ', detectedTime_: ' + Util.NF7(this.detectedTime_)
            + ', detectedDistance_: ' + Util.NF5E(this.detectedDistance_)
            + ', detectedVelocity_: ' + Util.NF5E(this.detectedVelocity_)
            + ', impulse: ' + Util.NF5E(this.impulse)
            + ', force: ' + Util.NF5E(this.force)
            + ', updateTime_: ' + Util.NF7(this.updateTime_)
            + ', creator: ' + this.creator
            + '}';
    }
    ;
    bilateral() {
        return this.joint;
    }
    ;
    checkConsistent() {
        Util.assert(isFinite(this.accuracy_));
        Util.assert(isFinite(this.detectedTime_));
        Util.assert(isFinite(this.detectedDistance_));
        Util.assert(isFinite(this.detectedVelocity_));
        Util.assert(isFinite(this.distance));
        Util.assert(isFinite(this.getNormalVelocity()));
        Util.assert(this.primaryBody != null);
        Util.assert(this.normalBody != null);
        Util.assert(isFinite(this.normal.getX()));
        Util.assert(isFinite(this.normal.getY()));
        Util.assert(isFinite(this.impact1.getX()));
        Util.assert(isFinite(this.impact1.getY()));
        Util.assert(Math.abs(this.normal.length() - 1) < 1e-12);
        if (this.ballNormal) {
            Util.assert(!isNaN(this.radius2) || (this.normal_dt != null));
        }
    }
    ;
    closeEnough(allowTiny) {
        if (this.contact())
            return true;
        if (allowTiny) {
            if (Util.DEBUG && this.distance > 0
                && this.distance < this.targetGap_ - this.accuracy_) {
                console.log('%cTINY DISTANCE%c ' + this, 'background:#f9c', 'color:black', 'background:#fc6', 'color:black');
            }
            return this.distance > 0
                && this.distance < this.targetGap_ + this.accuracy_;
        }
        else {
            return this.distance > this.targetGap_ - this.accuracy_
                && this.distance < this.targetGap_ + this.accuracy_;
        }
    }
    ;
    contact() {
        return this.joint || Math.abs(this.getNormalVelocity()) < this.velocityTol_ &&
            this.distance > 0 && this.distance < this.distanceTol_;
    }
    ;
    distanceToHalfGap() {
        return this.distance - this.targetGap_;
    }
    ;
    getConnector() {
        return null;
    }
    ;
    getDetectedTime() {
        return this.detectedTime_;
    }
    ;
    getDistance() {
        return this.distance;
    }
    ;
    getElasticity() {
        return this.elasticity_;
    }
    ;
    getEstimatedTime() {
        return this.estimate_;
    }
    ;
    getImpact1() {
        return this.impact1;
    }
    ;
    getImpact2() {
        return this.impact2;
    }
    ;
    getImpulse() {
        return this.impulse;
    }
    ;
    getLateralVelocity() {
        return this.getPerpNormal().dotProduct(this.getRelativeVelocity());
    }
    ;
    getNormalBody() {
        return this.normalBody;
    }
    ;
    getNormalVelocity() {
        if (isNaN(this.normalVelocity_)) {
            this.normalVelocity_ = this.normal.dotProduct(this.getRelativeVelocity());
            Util.assert(!isNaN(this.normalVelocity_));
        }
        return this.normalVelocity_;
    }
    ;
    getPerpNormal() {
        return new Vector(-this.normal.getY(), this.normal.getX());
    }
    ;
    getR1() {
        return this.impact1.subtract(this.primaryBody.getPosition());
    }
    ;
    getR2() {
        const impact = this.impact2 ? this.impact2 : this.impact1;
        return impact.subtract(this.normalBody.getPosition());
    }
    ;
    getPrimaryBody() {
        return this.primaryBody;
    }
    ;
    getAcceleration(change) {
        const fixedObj = !isFinite(this.primaryBody.getMass());
        const fixedNBody = !isFinite(this.normalBody.getMass());
        const w1 = fixedObj ? 0 : this.primaryBody.getAngularVelocity();
        const w2 = fixedNBody ? 0 : this.normalBody.getAngularVelocity();
        const r1 = this.getU1();
        const r2 = this.getU2();
        const Rx = r1.getX();
        const Ry = r1.getY();
        let R2x = NaN;
        let R2y = NaN;
        if (!fixedNBody) {
            R2x = r2.getX();
            R2y = r2.getY();
        }
        const obj = fixedObj ? -1 : this.primaryBody.getVarsIndex();
        const nobj = fixedNBody ? -1 : this.normalBody.getVarsIndex();
        let accx = 0;
        let accy = 0;
        if (!fixedObj) {
            accx = (change[obj + 1]
                - change[obj + 5] * Ry - w1 * w1 * Rx);
            accy = (change[obj + 3]
                + change[obj + 5] * Rx - w1 * w1 * Ry);
        }
        if (!fixedNBody) {
            accx -= (change[nobj + 1]
                - change[nobj + 5] * R2y - w2 * w2 * R2x);
            accy -= (change[nobj + 3]
                + change[nobj + 5] * R2x - w2 * w2 * R2y);
        }
        return new Vector(accx, accy);
    }
    ;
    getRelativeVelocity() {
        let vax = 0;
        let vay = 0;
        let vbx = 0;
        let vby = 0;
        if (isFinite(this.primaryBody.getMass())) {
            const r1 = this.getU1();
            const rax = r1.getX();
            const ray = r1.getY();
            Util.assert(isFinite(rax) && isFinite(ray), 'not a number: rax, ray');
            const va = this.primaryBody.getVelocity();
            const wa = this.primaryBody.getAngularVelocity();
            vax = va.getX() - wa * ray;
            vay = va.getY() + wa * rax;
        }
        if (isFinite(this.normalBody.getMass())) {
            const r2 = this.getU2();
            const rbx = r2.getX();
            const rby = r2.getY();
            Util.assert(isFinite(rbx) && isFinite(rby), 'not a number: rbx, rby');
            const vb = this.normalBody.getVelocity();
            const wb = this.normalBody.getAngularVelocity();
            vbx = vb.getX() - wb * rby;
            vby = vb.getY() + wb * rbx;
        }
        return new Vector(vax - vbx, vay - vby);
    }
    ;
    getU1() {
        return this.getR1();
    }
    ;
    getU2() {
        return this.getR2();
    }
    ;
    getVelocity() {
        return this.getNormalVelocity();
    }
    ;
    hasBody(body) {
        return this.primaryBody == body || this.normalBody == body;
    }
    ;
    illegalState() {
        if (this.joint) {
            return false;
        }
        return this.distance < 0;
    }
    ;
    isColliding() {
        if (this.joint) {
            return false;
        }
        if (this.distance < 0) {
            return true;
        }
        if (this.getNormalVelocity() < -this.velocityTol_
            && this.distance < this.targetGap_ - this.accuracy_) {
            return true;
        }
        return false;
    }
    ;
    isTouching() {
        return this.joint || this.distance < this.distanceTol_;
    }
    ;
    needsHandling() {
        return this.mustHandle_;
    }
    ;
    setDetectedTime(time) {
        if (isFinite(this.detectedTime_)) {
            throw 'detectedTime_ already set ' + this;
        }
        this.detectedTime_ = time;
        this.detectedDistance_ = this.distance;
        const nv = this.getNormalVelocity();
        this.detectedVelocity_ = nv;
        this.estimate_ = NaN;
        if (!this.joint) {
            Util.assert(isFinite(this.distance));
            Util.assert(isFinite(nv));
            if (nv < -0.001) {
                this.estimate_ = time + (this.targetGap_ - this.distance) / nv;
            }
        }
    }
    ;
    setNeedsHandling(needsHandling) {
        this.mustHandle_ = needsHandling;
    }
    ;
    updateCollision(time) {
        if (!isFinite(this.distance))
            throw 'distance is NaN ' + this;
        this.normalVelocity_ = NaN;
        this.checkConsistent();
        this.updateTime_ = time;
        if ((this.needsHandling() || !this.contact()) && this.getNormalVelocity() < 0) {
            this.updateEstimatedTime(time, true);
        }
        else {
            this.estimate_ = NaN;
        }
    }
    ;
    updateEstimatedTime(time, doUpdate) {
        const t1 = time;
        const t2 = this.detectedTime_;
        const d1 = this.distance;
        const v1 = this.getNormalVelocity();
        const v2 = this.detectedVelocity_;
        const h = t2 - t1;
        if (h <= 1E-12) {
            return;
        }
        const a = (v2 - v1) / h;
        if (Math.abs(a) < 1E-12) {
            return;
        }
        const det = Math.sqrt(v1 * v1 - 2 * a * (d1 - this.targetGap_));
        const e1 = t1 + (-v1 + det) / a;
        const e2 = t1 + (-v1 - det) / a;
        if (doUpdate) {
            let didUpdate = false;
            const oldEstimate = this.estimate_;
            if (e1 > t1 && e1 < t2) {
                this.estimate_ = e1;
                didUpdate = true;
            }
            if (e2 > t1 && e2 < t2) {
                if (!didUpdate || e2 < e1) {
                    this.estimate_ = e2;
                    didUpdate = true;
                }
            }
        }
    }
    ;
}
Util.defineGlobal('lab$engine2D$RigidBodyCollision', RigidBodyCollision);
