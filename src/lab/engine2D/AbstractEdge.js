import { UtilEngine } from './UtilEngine.js';
import { Util } from '../util/Util.js';
export class AbstractEdge {
    constructor(body, vertex1, vertex2) {
        this.centroid_world_ = null;
        this.centroidRadius_ = NaN;
        this.index_ = -1;
        this.v1_ = vertex1;
        this.v2_ = vertex2;
        this.centroid_body_ = this.v1_.locBody().add(this.v2_.locBody()).multiply(0.5);
        this.body_ = body;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', v1_: ' + this.v1_.toStringShort()
            + ', v2_: ' + this.v2_.toStringShort()
            + ', centroid_body_: ' + this.centroid_body_
            + ', centroidRadius_: ' + Util.NF5(this.centroidRadius_);
    }
    ;
    toStringShort() {
        return this.getClassName()
            + '{body_.name: "' + this.body_.getName()
            + '", index_: ' + this.getIndex() + '}';
    }
    ;
    forgetPosition() {
        this.centroid_world_ = null;
    }
    ;
    getBody() {
        return this.body_;
    }
    ;
    getCentroidBody() {
        return this.centroid_body_;
    }
    ;
    getCentroidRadius() {
        if (isNaN(this.centroidRadius_)) {
            this.centroidRadius_ = 1.25 * this.maxDistanceTo(this.centroid_body_);
        }
        return this.centroidRadius_;
    }
    ;
    getCentroidWorld() {
        if (this.centroid_world_ == null) {
            this.centroid_world_ = this.body_.bodyToWorld(this.centroid_body_);
        }
        return this.centroid_world_;
    }
    ;
    getDecoratedVertexes() {
        return [];
    }
    ;
    getIndex() {
        if (this.index_ == -1) {
            this.index_ = this.body_.getEdges().indexOf(this);
            if (this.index_ == -1) {
                throw '';
            }
        }
        return this.index_;
    }
    ;
    getVertex1() {
        return this.v1_;
    }
    ;
    getVertex2() {
        return this.v2_;
    }
    ;
    intersectionPossible(edge, swellage) {
        const c1 = this.getCentroidWorld();
        const c2 = edge.getCentroidWorld();
        const dist = c1.subtract(c2).lengthSquared();
        const dist2 = UtilEngine.square(edge.getCentroidRadius() + this.getCentroidRadius() + swellage);
        return dist < dist2;
    }
    ;
    pointOffset(p_body, length) {
        const n = this.getNormalBody(p_body);
        return p_body.add(n.multiply(length));
    }
    ;
    setCentroidRadius(value) {
        this.centroidRadius_ = value;
    }
    ;
    setVertex2(vertex) {
        this.v2_ = vertex;
    }
    ;
}
AbstractEdge.TINY_POSITIVE = 1E-10;
Util.defineGlobal('lab$engine2D$AbstractEdge', AbstractEdge);
