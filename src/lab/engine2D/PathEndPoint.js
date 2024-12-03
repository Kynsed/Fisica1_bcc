import { AbstractSimObject } from '../model/SimObject.js';
import { ConnectorCollision } from './ConnectorCollision.js';
import { DoubleRect } from '../util/DoubleRect.js';
import { PathPoint } from '../model/PathPoint.js';
import { Scrim } from './Scrim.js';
import { Util } from '../util/Util.js';
export class PathEndPoint extends AbstractSimObject {
    constructor(name, path, body, attach_body, limit, upperLimit) {
        super(name);
        this.body_ = body;
        this.path_ = path;
        this.attach_body_ = attach_body;
        this.limit_ = limit;
        this.upperLimit_ = upperLimit;
        this.location_ = path.map_p_to_vector(limit);
        const point = this.body_.bodyToWorld(this.attach_body_);
        this.ppt_ = this.path_.findNearestGlobal(point);
        this.ppt_old_ = new PathPoint(this.ppt_.p);
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', body_:=' + this.body_.toStringShort()
            + ', path_: ' + this.path_.toStringShort()
            + ', attach_body_: ' + this.attach_body_
            + ', limit_: ' + Util.NF(this.limit_)
            + ', upperLimit_: ' + this.upperLimit_
            + '}';
    }
    ;
    getClassName() {
        return 'PathEndPoint';
    }
    ;
    addCollision(collisions, time, _accuracy) {
        const c = new ConnectorCollision(this.body_, Scrim.getScrim(), this, false);
        this.updateCollision(c);
        c.setDetectedTime(time);
        if (c.distance < 0) {
            const body_old = this.body_.getOldCoords();
            if (body_old == null) {
                return;
            }
            const point_old = body_old.bodyToWorld(this.attach_body_);
            this.path_.findNearestLocal(point_old, this.ppt_old_);
            this.path_.map_p_to_slope(this.ppt_old_);
            const distance_old = this.upperLimit_ ? this.limit_ - this.ppt_old_.p :
                this.ppt_old_.p - this.limit_;
            if (distance_old < 0) {
                return;
            }
        }
        if (c.distance < this.body_.getDistanceTol()) {
            collisions.unshift(c);
        }
    }
    ;
    align() {
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
        return DoubleRect.make(this.location_, this.location_);
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
    getPosition1() {
        return this.location_;
    }
    ;
    getPosition2() {
        return this.location_;
    }
    ;
    updateCollision(c) {
        if (c.primaryBody != this.body_ || c.normalBody != Scrim.getScrim()) {
            throw '';
        }
        if (c.getConnector() != this) {
            throw '';
        }
        const point = this.body_.bodyToWorld(this.attach_body_);
        c.impact1 = point;
        this.path_.findNearestLocal(point, this.ppt_);
        this.path_.map_p_to_slope(this.ppt_);
        c.distance = this.upperLimit_ ? this.limit_ - this.ppt_.p :
            this.ppt_.p - this.limit_;
        c.normal = this.ppt_.getSlope().multiply(this.upperLimit_ ? -1 : 1);
        c.ballNormal = false;
        c.impact2 = this.ppt_.getPosition();
        c.creator = Util.DEBUG ? 'PathEndPoint' : '';
    }
    ;
}
Util.defineGlobal('lab$engine2D$PathEndPoint', PathEndPoint);
