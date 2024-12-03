import { AbstractEdge } from './AbstractEdge.js';
import { CornerCornerCollision } from './CornerCornerCollision.js';
import { CornerEdgeCollision } from './CornerEdgeCollision.js';
import { Util } from '../util/Util.js';
import { UtilEngine } from './UtilEngine.js';
import { Vector } from '../util/Vector.js';
export class StraightEdge extends AbstractEdge {
    constructor(body, vertex1, vertex2, outsideIsUp) {
        super(body, vertex1, vertex2);
        this.outsideIsUp_ = outsideIsUp;
        vertex1.setEdge2(this);
        vertex2.setEdge1(this);
    }
    ;
    toString() {
        return super.toString()
            + ', outsideIsUp_: ' + this.outsideIsUp_
            + '}';
    }
    ;
    addPath(context) {
        context.lineTo(this.v2_.locBodyX(), this.v2_.locBodyY());
    }
    ;
    checkVertexVertex(v, p_body, distTol) {
        let dist = this.v1_.locBody().distanceTo(p_body);
        if (dist >= 1E-6 && dist <= 0.6 * distTol) {
            return this.makeVertexVertex(this.v1_, v, p_body, dist);
        }
        dist = this.v2_.locBody().distanceTo(p_body);
        if (dist >= 1E-6 && dist <= 0.6 * distTol) {
            return this.makeVertexVertex(this.v2_, v, p_body, dist);
        }
        return null;
    }
    ;
    chordError() {
        return 0;
    }
    ;
    distanceToEdge(edge) {
        if (edge.isStraight()) {
            throw '';
        }
        else {
            return edge.distanceToEdge(this);
        }
    }
    ;
    distanceToLine(p_body) {
        let r;
        const pbx = p_body.getX();
        const pby = p_body.getY();
        const x1 = this.v1_.locBodyX();
        const x2 = this.v2_.locBodyX();
        const y1 = this.v1_.locBodyY();
        const y2 = this.v2_.locBodyY();
        if (Math.abs(x2 - x1) < AbstractEdge.TINY_POSITIVE) {
            r = this.outsideIsUp_ ? pbx - x1 : x1 - pbx;
        }
        else if (Math.abs(y2 - y1) < AbstractEdge.TINY_POSITIVE) {
            r = this.outsideIsUp_ ? pby - y1 : y1 - pby;
        }
        else {
            const k = (y2 - y1) / (x2 - x1);
            const qx = (-y1 + pby + pbx / k + k * x1) / (1 / k + k);
            const qy = y1 + k * (qx - x1);
            const dx = pbx - qx;
            const dy = pby - qy;
            let d = Math.sqrt(dx * dx + dy * dy);
            if (pby < qy) {
                d = -d;
            }
            r = this.outsideIsUp_ ? d : -d;
        }
        if (isNaN(r)) {
            throw Util.DEBUG ? ('distanceToLine NaN ' + p_body + ' ' + this.v1_ + ' ' + this.v2_) : '';
        }
        return r;
    }
    ;
    distanceToPoint(p_body) {
        const pbx = p_body.getX();
        const pby = p_body.getY();
        const x1 = this.v1_.locBodyX();
        const x2 = this.v2_.locBodyX();
        const y1 = this.v1_.locBodyY();
        const y2 = this.v2_.locBodyY();
        if (Math.abs(x2 - x1) < AbstractEdge.TINY_POSITIVE) {
            if (y1 > y2 && (pby > y1 || pby < y2)) {
                return Infinity;
            }
            if (y2 > y1 && (pby > y2 || pby < y1)) {
                return Infinity;
            }
            return this.outsideIsUp_ ? pbx - x1 : x1 - pbx;
        }
        else if (Math.abs(y2 - y1) < AbstractEdge.TINY_POSITIVE) {
            if (x1 > x2 && (pbx > x1 || pbx < x2)) {
                return Infinity;
            }
            if (x2 > x1 && (pbx > x2 || pbx < x1)) {
                return Infinity;
            }
            return this.outsideIsUp_ ? pby - y1 : y1 - pby;
        }
        else {
            const k = (y2 - y1) / (x2 - x1);
            const qx = (-y1 + pby + pbx / k + k * x1) / (1 / k + k);
            const qy = y1 + k * (qx - x1);
            if (x1 < x2 && (qx < x1 || qx > x2)) {
                return Infinity;
            }
            if (x2 < x1 && (qx < x2 || qx > x1)) {
                return Infinity;
            }
            const dx = pbx - qx;
            const dy = pby - qy;
            let d = Math.sqrt(dx * dx + dy * dy);
            if (pby < qy) {
                d = -d;
            }
            return this.outsideIsUp_ ? d : -d;
        }
    }
    ;
    findVertexContact(v, p_body, distTol) {
        const pbx = p_body.getX();
        const pby = p_body.getY();
        const x1 = this.v1_.locBodyX();
        const x2 = this.v2_.locBodyX();
        const y1 = this.v1_.locBodyY();
        const y2 = this.v2_.locBodyY();
        if (Math.abs(x2 - x1) < AbstractEdge.TINY_POSITIVE) {
            const vx = (x1 + x2) / 2;
            if (y1 > y2 && (pby > y1 || pby < y2)) {
                return this.checkVertexVertex(v, p_body, distTol);
            }
            if (y2 > y1 && (pby > y2 || pby < y1)) {
                return this.checkVertexVertex(v, p_body, distTol);
            }
            const dist = this.outsideIsUp_ ? pbx - vx : vx - pbx;
            if (dist < 0 || dist > distTol) {
                return null;
            }
            const rbc = new CornerEdgeCollision(v, this);
            rbc.distance = dist;
            const rw = this.body_.bodyToWorld(new Vector(vx, pby));
            rbc.impact1 = rw;
            const nw = this.body_.rotateBodyToWorld(new Vector(this.outsideIsUp_ ? 1 : -1, 0));
            rbc.normal = nw;
            rbc.ballNormal = false;
            rbc.radius2 = Infinity;
            rbc.creator = Util.DEBUG ? 'StraightEdge.findVertexContactVert' : '';
            return rbc;
        }
        if (Math.abs(y2 - y1) < AbstractEdge.TINY_POSITIVE) {
            const vy = (y1 + y2) / 2;
            if (x1 > x2 && (pbx > x1 || pbx < x2)) {
                return this.checkVertexVertex(v, p_body, distTol);
            }
            if (x2 > x1 && (pbx > x2 || pbx < x1)) {
                return this.checkVertexVertex(v, p_body, distTol);
            }
            const dist = this.outsideIsUp_ ? pby - vy : vy - pby;
            if (dist < 0 || dist > distTol) {
                return null;
            }
            const rbc = new CornerEdgeCollision(v, this);
            rbc.distance = dist;
            const rw = this.body_.bodyToWorld(new Vector(pbx, vy));
            rbc.impact1 = rw;
            const nw = this.body_.rotateBodyToWorld(new Vector(0, this.outsideIsUp_ ? 1 : -1));
            rbc.normal = nw;
            rbc.ballNormal = false;
            rbc.radius2 = Infinity;
            rbc.creator = Util.DEBUG ? 'StraightEdge.findVertexContactHoriz' : '';
            return rbc;
        }
        const k = (y2 - y1) / (x2 - x1);
        const rbx = (-y1 + pby + pbx / k + k * x1) / (1 / k + k);
        const rby = y1 + k * (rbx - x1);
        if (x1 < x2 && (rbx < x1 || rbx > x2)) {
            return this.checkVertexVertex(v, p_body, distTol);
        }
        if (x2 < x1 && (rbx < x2 || rbx > x1)) {
            return this.checkVertexVertex(v, p_body, distTol);
        }
        const dx = pbx - rbx;
        const dy = pby - rby;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (pby < rby) {
            dist = -dist;
        }
        dist = this.outsideIsUp_ ? dist : -dist;
        if (dist < 0 || dist > distTol) {
            return null;
        }
        const rbc = new CornerEdgeCollision(v, this);
        rbc.distance = dist;
        const rw = this.body_.bodyToWorld(new Vector(rbx, rby));
        rbc.impact1 = rw;
        const len = Math.sqrt(1 + k * k);
        let nw = this.body_.rotateBodyToWorld(new Vector(-k / len, 1 / len));
        if (!this.outsideIsUp_) {
            nw = nw.multiply(-1);
        }
        rbc.normal = nw;
        rbc.ballNormal = false;
        rbc.radius2 = Infinity;
        rbc.creator = Util.DEBUG ? 'StraightEdge.findVertexContact' : '';
        return rbc;
    }
    ;
    getBottomBody() {
        const y1 = this.v1_.locBodyY();
        const y2 = this.v2_.locBodyY();
        return y1 < y2 ? y1 : y2;
    }
    ;
    getClassName() {
        return 'StraightEdge';
    }
    ;
    getCurvature(_p_body) {
        return Infinity;
    }
    ;
    getLeftBody() {
        const x1 = this.v1_.locBodyX();
        const x2 = this.v2_.locBodyX();
        return x1 < x2 ? x1 : x2;
    }
    ;
    getNormalBody(_p_body) {
        const x1 = this.v1_.locBodyX();
        const x2 = this.v2_.locBodyX();
        const y1 = this.v1_.locBodyY();
        const y2 = this.v2_.locBodyY();
        if (Math.abs(x2 - x1) < AbstractEdge.TINY_POSITIVE) {
            return new Vector(this.outsideIsUp_ ? 1 : -1, 0);
        }
        if (Math.abs(y2 - y1) < AbstractEdge.TINY_POSITIVE) {
            return new Vector(0, this.outsideIsUp_ ? 1 : -1);
        }
        const k = (y2 - y1) / (x2 - x1);
        const d = Math.sqrt(1 + k * k);
        let nx = -k / d;
        let ny = 1 / d;
        if (!this.outsideIsUp_) {
            nx = -nx;
            ny = -ny;
        }
        return new Vector(nx, ny);
    }
    ;
    getPointOnEdge(p_body) {
        const p = this.projectionOntoLine(p_body);
        const n = this.getNormalBody(p_body);
        return [p, n];
    }
    ;
    getRightBody() {
        const x1 = this.v1_.locBodyX();
        const x2 = this.v2_.locBodyX();
        return x1 > x2 ? x1 : x2;
    }
    ;
    getTopBody() {
        const y1 = this.v1_.locBodyY();
        const y2 = this.v2_.locBodyY();
        return y1 > y2 ? y1 : y2;
    }
    ;
    highlight() {
        if (UtilEngine.debugEngine2D != null) {
            const p1 = this.body_.bodyToWorld(this.v1_.locBody());
            const p2 = this.body_.bodyToWorld(this.v2_.locBody());
            UtilEngine.debugEngine2D.debugLine('edge', p1, p2);
        }
    }
    ;
    improveAccuracyEdge(rbc, edge) {
        if (edge.isStraight()) {
        }
        else {
            edge.improveAccuracyEdge(rbc, this);
        }
    }
    ;
    intersection(p1_body, p2_body) {
        if (p1_body == p2_body) {
            return null;
        }
        const v1 = this.v1_.locBody();
        const v2 = this.v2_.locBody();
        const q = UtilEngine.linesIntersect(v1, v2, p1_body, p2_body);
        return q == null ? null : [q];
    }
    ;
    intersectionPossible(edge, swellage) {
        if (edge.isStraight()) {
            return false;
        }
        else {
            return super.intersectionPossible(edge, swellage);
        }
    }
    ;
    isStraight() {
        return true;
    }
    ;
    makeVertexVertex(myV, otherV, p_body, dist) {
        Util.assert(myV.getEdge1() == this || myV.getEdge2() == this);
        const rbc = new CornerCornerCollision(otherV, myV);
        rbc.distance = dist;
        const rw = this.body_.bodyToWorld(myV.locBody());
        rbc.impact1 = rw;
        const nb = p_body.subtract(myV.locBody()).normalize();
        if (nb == null) {
            return null;
        }
        const nw = this.body_.rotateBodyToWorld(nb);
        rbc.normal = nw;
        Util.assert(this.body_ == rbc.normalBody);
        rbc.ballObject = false;
        rbc.radius1 = NaN;
        rbc.ballNormal = true;
        rbc.radius2 = dist;
        rbc.creator = Util.DEBUG ? "StraightEdge.makeVertexVertex" : "";
        return rbc.contact() ? rbc : null;
    }
    ;
    maxDistanceTo(p_body) {
        const dist1 = this.v1_.locBody().distanceTo(p_body);
        const dist2 = this.v2_.locBody().distanceTo(p_body);
        return dist1 > dist2 ? dist1 : dist2;
    }
    ;
    projectionOntoLine(p_body) {
        const pbx = p_body.getX();
        const pby = p_body.getY();
        const x1 = this.v1_.locBodyX();
        const x2 = this.v2_.locBodyX();
        const y1 = this.v1_.locBodyY();
        const y2 = this.v2_.locBodyY();
        if (Math.abs(x2 - x1) < AbstractEdge.TINY_POSITIVE) {
            return new Vector(x1, pby);
        }
        if (Math.abs(y2 - y1) < AbstractEdge.TINY_POSITIVE) {
            return new Vector(pbx, y1);
        }
        const k = (y2 - y1) / (x2 - x1);
        const qx = (-y1 + pby + pbx / k + k * x1) / (1 / k + k);
        const qy = y1 + k * (qx - x1);
        return new Vector(qx, qy);
    }
    ;
    testCollisionEdge(collisions, edge, time) {
        if (edge.isStraight()) {
        }
        else {
            edge.testCollisionEdge(collisions, this, time);
        }
    }
    ;
}
Util.defineGlobal('lab$engine2D$StraightEdge', StraightEdge);
