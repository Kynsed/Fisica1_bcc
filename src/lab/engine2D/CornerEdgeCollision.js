import { RigidBodyCollision } from './RigidBody.js';
import { UtilEngine } from './UtilEngine.js';
import { Util } from '../util/Util.js';
export class CornerEdgeCollision extends RigidBodyCollision {
    constructor(vertex, normalEdge) {
        const v_edge = vertex.getEdge1();
        if (v_edge == null) {
            throw 'CornerEdgeCollision: null edge; vertex=' + vertex;
        }
        super(v_edge.getBody(), normalEdge.getBody(), false);
        this.u2_ = null;
        this.vertex = vertex;
        this.normalEdge = normalEdge;
        this.primaryEdge = v_edge;
        this.primaryEdge2 = vertex.isEndPoint() ? vertex.getEdge2() : null;
        this.radius1 = vertex.getCurvature();
        this.ballObject = false;
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', vertex-id: ' + this.vertex.getID()
            + ', primaryEdge-idx: ' + this.primaryEdge.getIndex()
            + ', primaryEdge2-idx: ' + (this.primaryEdge2 != null ?
            this.primaryEdge2.getIndex() : 'null')
            + ', normalEdge-idx: ' + this.normalEdge.getIndex()
            + '}';
    }
    ;
    getClassName() {
        return 'CornerEdgeCollision';
    }
    ;
    checkConsistent() {
        super.checkConsistent();
        Util.assert(this.primaryEdge != null);
        Util.assert(this.primaryEdge == this.vertex.getEdge1());
        if (this.vertex.isEndPoint()) {
            Util.assert(this.primaryEdge2 != null);
            Util.assert(this.primaryEdge2 == this.vertex.getEdge2());
        }
        else {
            Util.assert(this.primaryEdge2 == null);
        }
        Util.assert(this.ballObject == false);
        Util.assert(this.normalEdge.isStraight() == !this.ballNormal);
    }
    ;
    getU2() {
        if (this.u2_ != null) {
            return this.u2_;
        }
        if (this.ballNormal) {
            const impact = this.impact2 ? this.impact2 : this.impact1;
            const impact_body = this.normalBody.worldToBody(impact);
            const ne = this.normalEdge;
            const center2_body = ne.getCenterBody(impact_body);
            const center2_world = this.normalBody.bodyToWorld(center2_body);
            this.u2_ = center2_world.subtract(this.normalBody.getPosition());
            return this.u2_;
        }
        return this.getR2();
    }
    ;
    hasEdge(edge) {
        if (edge == null) {
            return false;
        }
        return edge == this.normalEdge || edge == this.primaryEdge ||
            this.primaryEdge2 == edge;
    }
    ;
    hasVertex(v) {
        return v == this.vertex;
    }
    ;
    similarTo(c) {
        if (!c.hasBody(this.primaryBody) || !c.hasBody(this.normalBody)) {
            return false;
        }
        if (c.hasVertex(this.vertex)) {
            return true;
        }
        if (!c.hasEdge(this.normalEdge)) {
            return false;
        }
        let e1 = null;
        if (c.hasEdge(this.primaryEdge)) {
            e1 = this.primaryEdge;
        }
        else if (c.hasEdge(this.primaryEdge2)) {
            e1 = this.primaryEdge2;
        }
        else {
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
        this.u2_ = null;
        const pbw = this.primaryBody.bodyToWorld(this.vertex.locBody());
        const pnb = this.normalBody.worldToBody(pbw);
        const pn = this.normalEdge.getPointOnEdge(pnb);
        if (pn == null) {
            return;
        }
        this.impact1 = this.normalBody.bodyToWorld(pn[0]);
        this.normal = this.normalBody.rotateBodyToWorld(pn[1]);
        this.distance = this.normalEdge.distanceToLine(pnb);
        super.updateCollision(time);
    }
    ;
}
Util.defineGlobal('lab$engine2D$CornerEdgeCollision', CornerEdgeCollision);
