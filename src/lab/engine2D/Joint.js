import { ConnectorCollision } from './ConnectorCollision.js';
import { DoubleRect } from '../util/DoubleRect.js';
import { AbstractSimObject } from '../model/SimObject.js';
import { Util } from '../util/Util.js';
export class Joint extends AbstractSimObject {
    constructor(rigidBody1, attach1_body, rigidBody2, attach2_body, normalType, normal) {
        super('JOINT' + (Joint.nextJointNum++));
        this.body1_ = rigidBody1;
        this.body2_ = rigidBody2;
        this.attach1_body_ = attach1_body;
        this.attach2_body_ = attach2_body;
        rigidBody1.addNonCollide([rigidBody2]);
        rigidBody2.addNonCollide([rigidBody1]);
        this.normal_ = normal;
        this.normalType_ = normalType;
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', body1_: ' + this.body1_.toStringShort()
            + ', attach1_body_: ' + this.attach1_body_
            + ', body2_: ' + this.body2_.toStringShort()
            + ', attach2_body_: ' + this.attach2_body_
            + ', normalType_: ' + this.normalType_
            + ', normal_: ' + this.normal_
            + ', normalDistance: ' + Util.NF7(this.getNormalDistance())
            + '}';
    }
    ;
    getClassName() {
        return 'Joint';
    }
    ;
    addCollision(collisions, time, _accuracy) {
        const c = new ConnectorCollision(this.body1_, this.body2_, this, true);
        this.updateCollision(c);
        c.setDetectedTime(time);
        collisions.unshift(c);
    }
    ;
    align() {
        if (isFinite(this.body2_.getMass())) {
            this.body2_.alignTo(this.attach2_body_, this.body1_.bodyToWorld(this.attach1_body_));
        }
        else if (isFinite(this.body1_.getMass())) {
            this.body1_.alignTo(this.attach1_body_, this.body2_.bodyToWorld(this.attach2_body_));
        }
    }
    ;
    getAttach1() {
        return this.attach1_body_;
    }
    ;
    getAttach2() {
        return this.attach2_body_;
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
    getNormal() {
        return this.normal_;
    }
    ;
    getNormalDistance() {
        const collisions = [];
        this.addCollision(collisions, NaN, NaN);
        return collisions[0].getDistance();
    }
    ;
    getNormalType() {
        return this.normalType_;
    }
    ;
    getNormalWorld() {
        if (this.normalType_ == 1) {
            return this.normal_;
        }
        else {
            return this.body2_.rotateBodyToWorld(this.normal_);
        }
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
    updateCollision(c) {
        if (c.primaryBody != this.body1_ || c.normalBody != this.body2_)
            throw '';
        if (c.getConnector() != this)
            throw '';
        const impact_world = this.body1_.bodyToWorld(this.attach1_body_);
        c.impact1 = impact_world;
        c.normalFixed = this.normalType_ == 1;
        const normal_world = this.getNormalWorld();
        Util.assert(Math.abs(normal_world.lengthSquared() - 1.0) < 1E-10);
        c.impact2 = this.body2_.bodyToWorld(this.attach2_body_);
        c.normal = normal_world;
        Util.assert(c.impact2 != null);
        const offset = c.impact1.subtract(c.impact2);
        c.distance = normal_world.dotProduct(offset);
        c.creator = 'Joint';
    }
    ;
}
Joint.nextJointNum = 0;
Util.defineGlobal('lab$engine2D$Joint', Joint);
