import { AbstractSimObject } from '../model/SimObject.js';
import { ConnectorCollision } from './ConnectorCollision.js';
import { DoubleRect } from '../util/DoubleRect.js';
import { PathPoint } from '../model/PathPoint.js';
import { Scrim } from './Scrim.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class PathJoint extends AbstractSimObject {
    constructor(path, body, attach_body) {
        super('PathJoint' + (PathJoint.nextJointNum++));
        this.body_ = body;
        this.path_ = path;
        this.attach_body_ = attach_body;
        this.ppt_ = new PathPoint();
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', body_:=' + this.body_.toStringShort()
            + ', path_: ' + this.path_.toStringShort()
            + ', attach_body_: ' + this.attach_body_
            + ', ppt_: ' + this.ppt_
            + '}';
    }
    ;
    getClassName() {
        return 'PathJoint';
    }
    ;
    addCollision(collisions, time, _accuracy) {
        const c = new ConnectorCollision(this.body_, Scrim.getScrim(), this, true);
        this.updateCollision(c);
        c.setDetectedTime(time);
        collisions.unshift(c);
    }
    ;
    align() {
        const attach_world = this.body_.bodyToWorld(this.attach_body_);
        this.ppt_ = this.path_.findNearestGlobal(attach_world);
        this.path_.map_p_to_slope(this.ppt_);
        this.body_.alignTo(this.attach_body_, this.ppt_);
    }
    ;
    align2(b2) {
        const b1 = this.attach_body_;
        const x = b1.distanceTo(b2);
        const beta = b1.subtract(b2).getAngle();
        this.align();
        const p1 = this.body_.bodyToWorld(this.attach_body_);
        let p2 = this.body_.bodyToWorld(b2);
        const ppt = this.path_.findNearestGlobal(p2);
        p2 = new Vector(ppt.x, ppt.y);
        p2 = this.path_.findPointByDistance(p1, p2, x);
        const alpha = p1.subtract(p2).getAngle();
        const theta = alpha - beta;
        this.body_.alignTo(b1, p1, theta);
    }
    ;
    getAttach1() {
        return this.attach_body_;
    }
    ;
    getBody1() {
        return this.body_;
    }
    ;
    getBody2() {
        return Scrim.getScrim();
    }
    ;
    getBoundsWorld() {
        return DoubleRect.make(this.getPosition1(), this.getPosition2());
    }
    ;
    getNormalDistance() {
        const collisions = [];
        this.addCollision(collisions, NaN, NaN);
        return collisions[0].getDistance();
    }
    ;
    getPath() {
        return this.path_;
    }
    ;
    getPathPoint() {
        return this.ppt_;
    }
    ;
    getPosition1() {
        return this.body_.bodyToWorld(this.attach_body_);
    }
    ;
    getPosition2() {
        return this.getPosition1();
    }
    ;
    updateCollision(c) {
        if (c.primaryBody != this.body_ || c.normalBody != Scrim.getScrim()) {
            throw '';
        }
        if (c.getConnector() != this) {
            throw '';
        }
        const impact_world = this.body_.bodyToWorld(this.attach_body_);
        c.impact1 = impact_world;
        this.path_.findNearestLocal(impact_world, this.ppt_);
        this.path_.map_p_to_slope(this.ppt_);
        Util.assert(!isNaN(this.ppt_.slope));
        if (!this.path_.isClosedLoop()) {
            const d = this.ppt_.distanceToNormalLine(impact_world);
            if (d > 1E-4) {
                this.ppt_.normalXdp = 0;
                this.ppt_.normalYdp = 0;
            }
        }
        const normal_world = this.ppt_.getNormal();
        const attachVelocity = this.body_.getVelocity(this.attach_body_);
        const slopeVector = new Vector(this.ppt_.slopeX, this.ppt_.slopeY);
        Util.assert(Math.abs(slopeVector.lengthSquared() - 1.0) < 1E-10);
        const pathVelocity = attachVelocity.dotProduct(slopeVector);
        c.normal_dt = new Vector(this.ppt_.normalXdp * pathVelocity, this.ppt_.normalYdp * pathVelocity);
        c.normalFixed = false;
        c.radius2 = NaN;
        c.ballNormal = true;
        c.impact2 = this.ppt_.getPosition();
        c.normal = normal_world;
        const offset = c.impact1.subtract(c.impact2);
        c.distance = normal_world.dotProduct(offset);
        c.creator = 'PathJoint';
    }
    ;
}
PathJoint.nextJointNum = 0;
Util.defineGlobal('lab$engine2D$PathJoint', PathJoint);
