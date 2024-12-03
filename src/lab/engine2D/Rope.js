import { AbstractSimObject } from '../model/SimObject.js';
import { ConnectorCollision } from './ConnectorCollision.js';
import { DoubleRect } from '../util/DoubleRect.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class Rope extends AbstractSimObject {
    constructor(body1, attach1_body, body2, attach2, length, ropeType) {
        super('rope' + (Rope.ropeNum++));
        if (!isFinite(body2.getMass())) {
            throw 'body2 must have finite mass';
        }
        this.body1_ = body1;
        this.attach1_body_ = attach1_body;
        this.body2_ = body2;
        this.attach2_body_ = attach2;
        this.restLength_ = length;
        this.rod_ = ropeType == Rope.ROD;
        this.distTol_ = Math.max(this.body1_.getDistanceTol(), this.body2_.getDistanceTol());
        this.veloTol_ = Math.max(this.body1_.getVelocityTol(), this.body2_.getVelocityTol());
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', body1_:"' + this.body1_.getName() + '"'
            + ', attach1_body: ' + this.attach1_body_
            + ', body2:"' + this.body2_.getName() + '"'
            + ', attach2_body: ' + this.attach2_body_
            + ', restLength_: ' + Util.NF(this.restLength_)
            + ', rod: ' + this.rod_
            + '}';
    }
    ;
    getClassName() {
        return 'Rope';
    }
    ;
    addCollision(collisions, time, _accuracy) {
        const c = new ConnectorCollision(this.body1_, this.body2_, this, this.rod_);
        this.updateCollision(c);
        c.setDetectedTime(time);
        if (this.rod_) {
            collisions.unshift(c);
        }
        else if (c.distance < this.distTol_) {
            collisions.unshift(c);
        }
    }
    ;
    align() {
        let angle = -Math.PI / 2;
        const p1 = this.body1_.bodyToWorld(this.attach1_body_);
        const p2 = this.body2_.bodyToWorld(this.attach2_body_);
        const d = p2.subtract(p1);
        const len = d.length();
        const len2 = this.rod_ ? this.restLength_ : this.restLength_ - this.distTol_ / 2;
        if (!this.rod_ && len < len2) {
            return;
        }
        if (len > 0.01) {
            angle = Math.atan2(d.getY(), d.getX());
        }
        const d2 = p1.add(new Vector(len2 * Math.cos(angle), len2 * Math.sin(angle)));
        this.body2_.alignTo(this.attach2_body_, d2);
        this.setChanged();
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
        return DoubleRect.make(this.getPosition1(), this.getPosition2());
    }
    ;
    getEndPoint() {
        return this.body2_.bodyToWorld(this.attach2_body_);
    }
    ;
    getLength() {
        return this.getEndPoint().distanceTo(this.getStartPoint());
    }
    ;
    getNormalDistance() {
        return this.getLength();
    }
    ;
    getPosition1() {
        return this.body1_.bodyToWorld(this.attach1_body_);
    }
    ;
    getPosition2() {
        return this.body2_.bodyToWorld(this.attach2_body_);
    }
    ;
    getRestLength() {
        return this.restLength_;
    }
    ;
    getStartPoint() {
        return this.body1_.bodyToWorld(this.attach1_body_);
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
    isTight() {
        return this.rod_ ||
            this.getLength() > this.restLength_ - this.distTol_;
    }
    ;
    updateCollision(c) {
        if (c.primaryBody != this.body1_ || c.normalBody != this.body2_)
            throw '';
        if (c.getConnector() != this)
            throw '';
        c.distance = -this.getStretch();
        const normal = this.getVector().normalize();
        if (normal != null) {
            c.normal = normal;
        }
        else {
            throw '';
        }
        c.impact1 = this.body1_.bodyToWorld(this.attach1_body_);
        c.impact2 = this.body2_.bodyToWorld(this.attach2_body_);
        c.creator = Util.DEBUG ? 'Rope' : '';
        c.ballObject = true;
        c.radius1 = 0;
        c.ballNormal = true;
        if (this.rod_) {
            c.radius2 = -this.restLength_;
        }
        else {
            c.radius2 = -c.impact1.subtract(c.impact2).length();
        }
    }
    ;
}
Rope.ropeNum = 0;
Rope.ROPE = 1;
Rope.ROD = 2;
Util.defineGlobal('lab$engine2D$Rope', Rope);
