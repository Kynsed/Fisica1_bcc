import { RigidBodyCollision } from './RigidBody.js';
import { UtilEngine } from './UtilEngine.js';
import { Util } from '../util/Util.js';
export class EdgeEdgeCollision extends RigidBodyCollision {
    constructor(primaryEdge, normalEdge) {
        super(primaryEdge.getBody(), normalEdge.getBody(), false);
        this.u1_ = null;
        this.u2_ = null;
        this.primaryEdge = primaryEdge;
        this.normalEdge = normalEdge;
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', primaryEdge: ' + this.primaryEdge.getIndex()
            + ', normalEdge: ' + this.normalEdge.getIndex()
            + '}';
    }
    ;
    getClassName() {
        return 'EdgeEdgeCollision';
    }
    ;
    checkConsistent() {
        super.checkConsistent();
        Util.assert(this.primaryEdge != null);
        Util.assert(this.primaryEdge.isStraight() == !this.ballObject);
        Util.assert(this.normalEdge != null);
        Util.assert(this.normalEdge.isStraight() == !this.ballNormal);
    }
    ;
    getU1() {
        if (this.u1_ != null) {
            return this.u1_;
        }
        if (this.ballObject) {
            const primaryCircle = this.primaryEdge;
            Util.assert(this.primaryBody == primaryCircle.getBody());
            const cw = this.primaryBody.bodyToWorld(primaryCircle.getCenterBody());
            this.u1_ = cw.subtract(this.primaryBody.getPosition());
            return this.u1_;
        }
        return this.getR1();
    }
    ;
    getU2() {
        if (this.u2_ != null) {
            return this.u2_;
        }
        if (this.ballNormal) {
            const normalCircle = this.normalEdge;
            Util.assert(this.normalBody == normalCircle.getBody());
            const cnw = this.normalBody.bodyToWorld(normalCircle.getCenterBody());
            this.u2_ = cnw.subtract(this.normalBody.getPosition());
            return this.u2_;
        }
        return this.getR2();
    }
    ;
    hasEdge(edge) {
        if (edge == null) {
            return false;
        }
        return edge == this.normalEdge || edge == this.primaryEdge;
    }
    ;
    hasVertex(_v) {
        return false;
    }
    ;
    similarTo(c) {
        if (!c.hasBody(this.primaryBody) || !c.hasBody(this.normalBody)) {
            return false;
        }
        if (!c.hasEdge(this.normalEdge)) {
            return false;
        }
        if (!c.hasEdge(this.primaryEdge)) {
            return false;
        }
        const nearness = UtilEngine.nearness(this.radius1, this.radius2, this.distanceTol_);
        const d = this.impact1.subtract(c.impact1);
        const distSqr = d.lengthSquared();
        if (distSqr > nearness * nearness) {
            return false;
        }
        const normality = Math.abs(this.normal.dotProduct(c.normal));
        if (normality < 0.9) {
            return false;
        }
        return true;
    }
    ;
    updateCollision(time) {
        this.u1_ = null;
        this.u2_ = null;
        this.primaryEdge.improveAccuracyEdge(this, this.normalEdge);
        super.updateCollision(time);
    }
    ;
}
Util.defineGlobal('lab$engine2D$EdgeEdgeCollision', EdgeEdgeCollision);
