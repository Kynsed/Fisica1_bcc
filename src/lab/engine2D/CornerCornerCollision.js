import { RigidBodyCollision } from './RigidBody.js';
import { Util } from '../util/Util.js';
export class CornerCornerCollision extends RigidBodyCollision {
    constructor(vertex, normalVertex) {
        const v_edge = vertex.getEdge1();
        const nv_edge = normalVertex.getEdge1();
        if (v_edge == null || nv_edge == null) {
            throw "CornerCornerCollision: null edge; vertex=" + vertex
                + "; normalVertex=" + normalVertex;
        }
        super(v_edge.getBody(), nv_edge.getBody(), false);
        this.vertex = vertex;
        this.normalVertex = normalVertex;
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', vertex-ID: ' + this.vertex.getID()
            + ', normalVertex-ID: ' + this.normalVertex.getID()
            + '}';
    }
    ;
    getClassName() {
        return 'CornerCornerCollision';
    }
    ;
    checkConsistent() {
        super.checkConsistent();
        Util.assert(this.normalVertex != null);
    }
    ;
    hasEdge(_edge) {
        return false;
    }
    ;
    hasVertex(v) {
        return v == this.vertex || v == this.normalVertex;
    }
    ;
    similarTo(c) {
        if (!c.hasBody(this.primaryBody) || !c.hasBody(this.normalBody)) {
            return false;
        }
        if (c.hasVertex(this.vertex) || c.hasVertex(this.normalVertex)) {
            return true;
        }
        return false;
    }
    ;
    updateCollision(time) {
        Util.assert(this.normalVertex != null);
        const pbw = this.primaryBody.bodyToWorld(this.vertex.locBody());
        const pnb = this.normalBody.worldToBody(pbw);
        this.impact1 = this.normalBody.bodyToWorld(this.normalVertex.locBody());
        this.distance = this.normalVertex.locBody().distanceTo(pnb);
        if (!isFinite(this.distance)) {
            throw '';
        }
        const nv = pnb.subtract(this.normalVertex.locBody()).normalize();
        if (nv == null) {
            throw '';
        }
        this.normal = this.normalBody.rotateBodyToWorld(nv);
        super.updateCollision(time);
    }
    ;
}
Util.defineGlobal('lab$engine2D$CornerCornerCollision', CornerCornerCollision);
