import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class LocalCoords {
    constructor() {
        this.cm_body_ = Vector.ORIGIN;
        this.loc_world_ = Vector.ORIGIN;
        this.sinAngle_ = 0.0;
        this.cosAngle_ = 1.0;
    }
    ;
    toString() {
        return 'LocalCoords{'
            + 'loc_world_: ' + this.loc_world_
            + ', cm_body_: ' + this.cm_body_
            + ', sinAngle_: ' + Util.NF(this.sinAngle_)
            + ', cosAngle_: ' + Util.NF(this.cosAngle_)
            + '}';
    }
    ;
    bodyToWorld(p_body) {
        const rx = p_body.getX() - this.cm_body_.getX();
        const ry = p_body.getY() - this.cm_body_.getY();
        const vx = this.loc_world_.getX() + (rx * this.cosAngle_ - ry * this.sinAngle_);
        const vy = this.loc_world_.getY() + (rx * this.sinAngle_ + ry * this.cosAngle_);
        return new Vector(vx, vy);
    }
    ;
    set(cm_body, loc_world, sinAngle, cosAngle) {
        this.cm_body_ = cm_body;
        this.loc_world_ = loc_world;
        this.sinAngle_ = sinAngle;
        this.cosAngle_ = cosAngle;
    }
    ;
    worldToBody(p_world) {
        const rx = p_world.getX() - this.loc_world_.getX();
        const ry = p_world.getY() - this.loc_world_.getY();
        const sin = -this.sinAngle_;
        const cos = this.cosAngle_;
        const vx = this.cm_body_.getX() + (rx * cos - ry * sin);
        const vy = this.cm_body_.getY() + (rx * sin + ry * cos);
        return new Vector(vx, vy);
    }
    ;
}
Util.defineGlobal('lab$engine2D$LocalCoords', LocalCoords);
