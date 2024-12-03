import { AbstractEdge } from './AbstractEdge.js';
import { ConcreteVertex } from './ConcreteVertex.js';
import { CornerEdgeCollision } from './CornerEdgeCollision.js';
import { EdgeEdgeCollision } from './EdgeEdgeCollision.js';
import { StraightEdge } from './StraightEdge.js';
import { Util } from '../util/Util.js';
import { UtilCollision } from './UtilCollision.js';
import { Vector } from '../util/Vector.js';
export class CircularEdge extends AbstractEdge {
    constructor(body, vertex1, vertex2, center_body, clockwise, outsideIsOut, opt_spacing) {
        super(body, vertex1, vertex2);
        this.center_body_ = center_body;
        this.outsideIsOut_ = outsideIsOut;
        this.radius_ = center_body.distanceTo(vertex1.locBody());
        const r2 = vertex2.locBody().distanceTo(center_body);
        if (Math.abs(this.radius_ - r2) > CircularEdge.TINY_POSITIVE) {
            throw 'center is not equidistant from the two end points';
        }
        this.clockwise_ = clockwise;
        this.startAngle_ = vertex1.locBody().subtract(center_body).getAngle();
        this.finishAngle_ = vertex2.locBody().subtract(center_body).getAngle();
        if (Math.abs(this.startAngle_ - this.finishAngle_) < CircularEdge.TINY_POSITIVE) {
            this.finishAngle_ = this.startAngle_ + 2 * Math.PI;
        }
        const lowHigh = CircularEdge.findAngleLowHigh(this.startAngle_, this.finishAngle_, this.clockwise_);
        this.angle_low_ = lowHigh[0];
        this.angle_high_ = lowHigh[1];
        this.depth_ = CircularEdge.findDepth(this.angle_high_ - this.angle_low_, this.radius_);
        const min = Math.ceil((this.angle_high_ - this.angle_low_) / (Math.PI / 4));
        const spacing = (opt_spacing === undefined) ? 0.3 : opt_spacing;
        const n = Math.max(min, Math.ceil((this.angle_high_ - this.angle_low_) * this.radius_ / spacing));
        const delta = (this.angle_high_ - this.angle_low_) / n;
        this.decoratedAngle_ = delta;
        this.decoratedVertexes_ = [];
        for (let i = 1; i < n; i++) {
            const angle = this.clockwise_ ?
                this.angle_high_ - i * delta : this.angle_low_ + i * delta;
            const p = new Vector(this.center_body_.getX() + this.radius_ * Math.cos(angle), this.center_body_.getY() + this.radius_ * Math.sin(angle));
            const v = new ConcreteVertex(p, false, this);
            this.decoratedVertexes_.push(v);
        }
        vertex1.setEdge2(this);
        vertex2.setEdge1(this);
        if (this.angle_high_ - this.angle_low_ >= Math.PI) {
            this.centroid_body_ = this.center_body_;
            this.centroidRadius_ = this.radius_;
        }
        else {
            this.centroidRadius_ = this.centroid_body_.distanceTo(vertex1.locBody());
        }
        if (!this.outsideIsOut_) {
            this.centroidRadius_ = 1.2 * this.centroidRadius_;
        }
        this.completeCircle_ = Math.abs(2 * Math.PI - (this.angle_high_ - this.angle_low_)) <
            CircularEdge.SMALL_POSITIVE;
    }
    ;
    toString() {
        return super.toString()
            + ', outsideIsOut_: ' + this.outsideIsOut_
            + ', clockwise_: ' + this.clockwise_
            + ', center_body_: ' + this.center_body_
            + ', radius_: ' + Util.NF5(this.radius_)
            + ', startAngle_: ' + Util.NF5(this.startAngle_)
            + ', finishAngle_: ' + Util.NF5(this.finishAngle_)
            + ', angle_low_: ' + Util.NF5(this.angle_low_)
            + ', angle_high_: ' + Util.NF5(this.angle_high_)
            + '}';
    }
    ;
    static make(body, vertex1, vertex2, radius, aboveRight, clockwise, outsideIsOut) {
        let cx, cy;
        const mx = (vertex1.locBodyX() + vertex2.locBodyX()) / 2;
        const my = (vertex1.locBodyY() + vertex2.locBodyY()) / 2;
        const a = Util.hypot(vertex1.locBodyX() - mx, vertex1.locBodyY() - my);
        const d = radius * radius - a * a;
        if (d < CircularEdge.TINY_POSITIVE) {
            throw 'radius ' + radius + ' is too small, must be >= ' + a;
        }
        const b = Math.sqrt(d);
        if (Math.abs(vertex2.locBodyX() - vertex1.locBodyX()) < CircularEdge.TINY_POSITIVE) {
            if (aboveRight) {
                cx = b + mx;
                cy = my;
            }
            else {
                cx = -b + mx;
                cy = my;
            }
        }
        else {
            const k = (vertex2.locBodyY() - vertex1.locBodyY()) /
                (vertex2.locBodyX() - vertex1.locBodyX());
            const bk2 = b / Math.sqrt(1 + k * k);
            if (aboveRight) {
                cx = -k * bk2 + mx;
                cy = bk2 + my;
            }
            else {
                cx = k * bk2 + mx;
                cy = -bk2 + my;
            }
        }
        return new CircularEdge(body, vertex1, vertex2, new Vector(cx, cy), clockwise, outsideIsOut);
    }
    ;
    addPath(context) {
        context.arc(this.center_body_.getX(), this.center_body_.getY(), this.radius_, this.startAngle_, this.finishAngle_, this.clockwise_);
    }
    ;
    angleToBody(angle) {
        return this.edgeToBody(new Vector(this.radius_ * Math.cos(angle), this.radius_ * Math.sin(angle)));
    }
    ;
    bodyToEdge(p_body) {
        return p_body.subtract(this.center_body_);
    }
    ;
    chordError() {
        return this.radius_ *
            (1 - Math.sqrt(1 - this.decoratedAngle_ * this.decoratedAngle_ / 4.0));
    }
    ;
    depthOfArc() {
        return this.depth_;
    }
    ;
    distanceToEdge(edge) {
        if (edge instanceof StraightEdge) {
            const cw = this.body_.bodyToWorld(this.center_body_);
            const cb = edge.getBody().worldToBody(cw);
            let d = edge.distanceToLine(cb);
            d -= this.radius_;
            return d;
        }
        else if (edge instanceof CircularEdge) {
            const cw = edge.getBody().bodyToWorld(edge.center_body_);
            const cb = this.body_.worldToBody(cw);
            const p_edge = this.bodyToEdge(cb);
            if (!this.isWithinArc(p_edge)) {
                return NaN;
            }
            const len = p_edge.length();
            const r1 = (edge.outsideIsOut_ ? 1 : -1) * edge.radius_;
            const r2 = (this.outsideIsOut_ ? 1 : -1) * this.radius_;
            const concave = !edge.outsideIsOut_ || !this.outsideIsOut_;
            return concave ? Math.abs(r1 + r2) - len : len - (r1 + r2);
        }
        else {
            throw '';
        }
    }
    ;
    distanceToLine(p_body) {
        const p_edge = this.bodyToEdge(p_body);
        return (this.outsideIsOut_ ? 1 : -1) * (p_edge.length() - this.radius_);
    }
    ;
    distanceToPoint(p_body) {
        const p_edge = this.bodyToEdge(p_body);
        if (this.isWithinArc(p_edge)) {
            return (this.outsideIsOut_ ? 1 : -1) * (p_edge.length() - this.radius_);
        }
        else {
            return Infinity;
        }
    }
    ;
    edgeToBody(p_edge) {
        return p_edge.add(this.center_body_);
    }
    ;
    edgeToWorld(p_edge) {
        return this.body_.bodyToWorld(p_edge.add(this.center_body_));
    }
    ;
    static findAngleLowHigh(startAngle, finishAngle, clockwise) {
        let angle_low, angle_high;
        if (Math.abs(startAngle - finishAngle) < CircularEdge.TINY_POSITIVE) {
            angle_low = startAngle;
            angle_high = angle_low + 2 * Math.PI;
        }
        else if (Math.abs(Math.abs(startAngle - finishAngle) - 2 * Math.PI) <
            CircularEdge.TINY_POSITIVE) {
            angle_low = Math.min(startAngle, finishAngle);
            angle_high = angle_low + 2 * Math.PI;
        }
        else if (startAngle > finishAngle) {
            if (clockwise) {
                angle_low = finishAngle;
                angle_high = startAngle;
            }
            else {
                angle_low = startAngle;
                angle_high = finishAngle + 2 * Math.PI;
            }
        }
        else {
            if (clockwise) {
                angle_low = finishAngle;
                angle_high = startAngle + 2 * Math.PI;
            }
            else {
                angle_low = startAngle;
                angle_high = finishAngle;
            }
        }
        return [angle_low, angle_high];
    }
    ;
    static findDepth(angle, radius) {
        const d1 = Math.sin(angle / 2) - Math.sin(angle) / 2;
        const d2 = Math.cos(angle / 2) - (1 + Math.cos(angle)) / 2;
        return radius * Math.sqrt(d1 * d1 + d2 * d2);
    }
    ;
    findVertexContact(v, p_body, distTol) {
        const p_edge = this.bodyToEdge(p_body);
        if (!this.isWithinArc(p_edge))
            return null;
        const h = p_edge.length();
        const dist = (this.outsideIsOut_ ? 1 : -1) * (h - this.radius_);
        if (dist < 0 || dist > distTol)
            return null;
        const rbc = new CornerEdgeCollision(v, this);
        rbc.distance = dist;
        if (h < CircularEdge.TINY_POSITIVE)
            throw 'cannot get normal for point at center of circle';
        const ne = p_edge.multiply((this.outsideIsOut_ ? 1 : -1) * (1 / h));
        rbc.normal = this.body_.rotateBodyToWorld(ne);
        Util.assert(Math.abs(rbc.normal.length() - 1.0) < 1e-8);
        rbc.radius2 = (this.outsideIsOut_ ? 1 : -1) * this.radius_;
        rbc.radius2 += dist;
        const rw = this.body_.bodyToWorld(this.edgeToBody(ne.multiply(rbc.radius2)));
        rbc.impact1 = rw;
        rbc.ballNormal = true;
        rbc.radius1 = v.getCurvature();
        rbc.creator = Util.DEBUG ? 'CircularEdge.findVertexContact' : '';
        return rbc;
    }
    ;
    getBottomBody() {
        let angle = -Math.PI / 2;
        angle += angle < this.angle_low_ ? 2 * Math.PI : 0;
        if (this.angle_low_ <= angle && angle <= this.angle_high_) {
            return this.center_body_.getY() - this.radius_;
        }
        else {
            return this.v1_.locBodyY() < this.v2_.locBodyY() ?
                this.v1_.locBodyY() : this.v2_.locBodyY();
        }
    }
    ;
    getCenterBody(_p_body) {
        return this.center_body_;
    }
    ;
    getClassName() {
        return 'CircularEdge';
    }
    ;
    getCurvature(_p_body) {
        return (this.outsideIsOut_ ? 1 : -1) * this.radius_;
    }
    ;
    getDecoratedVertexes() {
        return this.decoratedVertexes_;
    }
    ;
    getLeftBody() {
        let angle = Math.PI;
        angle += angle < this.angle_low_ ? 2 * Math.PI : 0;
        if (this.angle_low_ <= angle && angle <= this.angle_high_) {
            return this.center_body_.getX() - this.radius_;
        }
        else {
            return this.v1_.locBodyX() < this.v2_.locBodyX() ?
                this.v1_.locBodyX() : this.v2_.locBodyX();
        }
    }
    ;
    getNormalBody(p_body) {
        const p_edge = this.bodyToEdge(p_body);
        const h = p_edge.length();
        if (h < CircularEdge.TINY_POSITIVE) {
            throw Util.DEBUG ? ('cannot get normal at point ' + p_body) : '';
        }
        return p_edge.multiply(this.outsideIsOut_ ? 1 / h : -1 / h);
    }
    ;
    getPointOnEdge(p_body) {
        const n = this.getNormalBody(p_body);
        const r = (this.outsideIsOut_ ? 1 : -1) * this.radius_;
        const p = this.edgeToBody(n.multiply(r));
        return [p, n];
    }
    ;
    getRadius() {
        return this.radius_;
    }
    ;
    getRightBody() {
        let angle = 0;
        angle += angle < this.angle_low_ ? 2 * Math.PI : 0;
        if (this.angle_low_ <= angle && angle <= this.angle_high_) {
            return this.center_body_.getX() + this.radius_;
        }
        else {
            return this.v1_.locBodyX() > this.v2_.locBodyX() ?
                this.v1_.locBodyX() : this.v2_.locBodyX();
        }
    }
    ;
    getTopBody() {
        let angle = Math.PI / 2;
        angle += angle < this.angle_low_ ? 2 * Math.PI : 0;
        if (this.angle_low_ <= angle && angle <= this.angle_high_) {
            return this.center_body_.getY() + this.radius_;
        }
        else {
            return this.v1_.locBodyY() > this.v2_.locBodyY() ?
                this.v1_.locBodyY() : this.v2_.locBodyY();
        }
    }
    ;
    highlight() { }
    ;
    improveAccuracyEdge(rbc, edge) {
        if (edge instanceof StraightEdge) {
            CircleStraight.improveAccuracy(rbc, this, edge);
        }
        else if (edge instanceof CircularEdge) {
            if (rbc.getNormalBody() == edge.getBody()) {
                CircleCircle.improveAccuracy(rbc, this, edge);
            }
            else {
                CircleCircle.improveAccuracy(rbc, edge, this);
            }
        }
        else {
            throw '';
        }
    }
    ;
    intersection(p1_body, p2_body) {
        if (p1_body == p2_body) {
            return null;
        }
        const pe1 = this.bodyToEdge(p1_body);
        const pe2 = this.bodyToEdge(p2_body);
        let qe1 = null;
        let qe2 = null;
        if (Math.abs(pe2.getX() - pe1.getX()) < CircularEdge.TINY_POSITIVE) {
            const x = (pe1.getX() + pe2.getX()) / 2;
            if (Math.abs(x) > this.radius_) {
                return null;
            }
            const y = Math.sqrt(this.radius_ * this.radius_ - x * x);
            const ylow = pe1.getY() < pe2.getY() ? pe1.getY() : pe2.getY();
            const yhigh = pe1.getY() > pe2.getY() ? pe1.getY() : pe2.getY();
            if (ylow <= y && y <= yhigh)
                qe1 = new Vector(x, y);
            if (ylow <= -y && -y <= yhigh)
                qe2 = new Vector(x, -y);
        }
        else {
            const k = (pe2.getY() - pe1.getY()) / (pe2.getX() - pe1.getX());
            const k12 = 1 + k * k;
            const d = pe1.getY() - k * pe1.getX();
            let e = k12 * this.radius_ * this.radius_ - d * d;
            if (e < 0) {
                return null;
            }
            e = Math.sqrt(e);
            const x1 = -(k * d + e) / k12;
            const x2 = (k * (-d) + e) / k12;
            const y1 = (d - k * e) / k12;
            const y2 = (d + k * e) / k12;
            const xlow = pe1.getX() < pe2.getX() ? pe1.getX() : pe2.getX();
            const xhigh = pe1.getX() > pe2.getX() ? pe1.getX() : pe2.getX();
            const ylow = pe1.getY() < pe2.getY() ? pe1.getY() : pe2.getY();
            const yhigh = pe1.getY() > pe2.getY() ? pe1.getY() : pe2.getY();
            if (xlow <= x1 && x1 <= xhigh && ylow <= y1 && y1 <= yhigh) {
                qe1 = new Vector(x1, y1);
            }
            if (xlow <= x2 && x2 <= xhigh && ylow <= y2 && y2 <= yhigh) {
                qe2 = new Vector(x2, y2);
            }
        }
        let qb1 = null;
        let qb2 = null;
        if (qe1 != null && this.isWithinArc(qe1)) {
            qb1 = this.edgeToBody(qe1);
        }
        if (qe2 != null && this.isWithinArc(qe2)) {
            qb2 = this.edgeToBody(qe2);
        }
        if (qb1 == null && qb2 == null) {
            return null;
        }
        if (qb1 != null && qb2 != null) {
            return [qb1, qb2];
        }
        if (qb1 != null) {
            return [qb1];
        }
        if (qb2 === null)
            throw '';
        return [qb2];
    }
    ;
    isStraight() {
        return false;
    }
    ;
    static isWithinArc(p_edge, angleLow, angleHigh) {
        Util.assert(!isNaN(p_edge.getX()));
        Util.assert(!isNaN(p_edge.getY()));
        let angle = p_edge.getAngle();
        if (angle < angleLow) {
            angle += 2 * Math.PI;
        }
        return angleLow <= angle && angle <= angleHigh;
    }
    ;
    isWithinArc(p_edge) {
        if (this.completeCircle_) {
            return true;
        }
        return CircularEdge.isWithinArc(p_edge, this.angle_low_, this.angle_high_);
    }
    ;
    isWithinArc2(p_world) {
        if (this.completeCircle_) {
            return true;
        }
        const p_edge = this.bodyToEdge(this.body_.worldToBody(p_world));
        return CircularEdge.isWithinArc(p_edge, this.angle_low_, this.angle_high_);
    }
    ;
    isWithinReflectedArc(p_edge) {
        if (p_edge == null) {
            return false;
        }
        let angle = p_edge.getAngle();
        while (angle < this.angle_low_ + Math.PI) {
            angle += 2 * Math.PI;
        }
        return this.angle_low_ + Math.PI <= angle && angle <= this.angle_high_ + Math.PI;
    }
    ;
    isWithinReflectedArc2(p_world) {
        return this.isWithinReflectedArc(this.bodyToEdge(this.body_.worldToBody(p_world)));
    }
    ;
    maxDistanceTo(p_body) {
        return this.center_body_.distanceTo(p_body) + this.radius_;
    }
    ;
    nearestPointByAngle(p_body) {
        const angle = this.bodyToEdge(p_body).getAngle();
        const angle2 = angle + (angle < this.angle_low_ ? 2 * Math.PI : 0);
        if (this.angle_low_ <= angle2 && angle2 <= this.angle_high_) {
            return p_body;
        }
        else {
            const d1 = angle < this.angle_low_ ?
                this.angle_low_ - angle : this.angle_low_ - (angle - 2 * Math.PI);
            const d2 = angle > this.angle_high_ ?
                angle - this.angle_high_ : (2 * Math.PI + angle) - this.angle_high_;
            const angle_new = d1 < d2 ? this.angle_low_ : this.angle_high_;
            const qb2 = this.angleToBody(angle_new);
            return qb2;
        }
    }
    ;
    outsideIsOut() {
        return this.outsideIsOut_;
    }
    ;
    testCollisionEdge(collisions, edge, time) {
        if (edge instanceof StraightEdge) {
            if (Util.DEBUG) {
                UtilCollision.edgeEdgeCollisionTests++;
            }
            CircleStraight.testCollision(collisions, edge, this, time);
        }
        else if (edge instanceof CircularEdge) {
            if (Util.DEBUG) {
                UtilCollision.edgeEdgeCollisionTests++;
            }
            CircleCircle.testCollision(collisions, edge, this, time);
        }
        else {
            throw '';
        }
    }
    ;
}
CircularEdge.SMALL_POSITIVE = 1E-6;
Util.defineGlobal('lab$engine2D$CircularEdge', CircularEdge);
class CircleStraight {
    constructor() {
        throw '';
    }
    ;
    static improveAccuracy(rbc, circle, straight) {
        const circleBody = circle.getBody();
        const straightBody = straight.getBody();
        Util.assert(rbc.getPrimaryBody() == circleBody);
        Util.assert(rbc.getNormalBody() == straightBody);
        const oldX = rbc.impact1.getX();
        const oldY = rbc.impact1.getY();
        const cw = circleBody.bodyToWorld(circle.getCenterBody());
        const cb = straightBody.worldToBody(cw);
        const pb2 = straight.pointOffset(cb, -circle.getRadius());
        let pb;
        if (rbc.contact())
            pb = straight.projectionOntoLine(cb);
        else
            pb = pb2;
        const pw = straightBody.bodyToWorld(pb);
        const nb = straight.getNormalBody(pb);
        const nw = straightBody.rotateBodyToWorld(nb);
        rbc.distance = straight.distanceToLine(pb2);
        rbc.impact1 = pw;
        rbc.normal = nw;
    }
    ;
    static testCollision(collisions, straight, circle, time) {
        if (UtilCollision.DISABLE_EDGE_EDGE)
            return;
        if (!circle.outsideIsOut()) {
            return;
        }
        const cw = circle.getBody().bodyToWorld(circle.getCenterBody());
        const cb = straight.getBody().worldToBody(cw);
        const pb = straight.pointOffset(cb, -circle.getRadius());
        const pw = straight.getBody().bodyToWorld(pb);
        const dist = straight.distanceToLine(pb);
        if (dist > 0) {
            if (dist > straight.getBody().getDistanceTol()) {
                return;
            }
            const dist2 = straight.distanceToPoint(pb);
            if (dist2 == Infinity) {
                return;
            }
            Util.assert(Math.abs(dist - dist2) < 1e-8);
            if (!circle.isWithinArc2(pw)) {
                return;
            }
            const pb2 = straight.projectionOntoLine(cb);
            const pw2 = straight.getBody().bodyToWorld(pb2);
            CircleStraight.addCollision(true, collisions, straight, circle, dist, pw2, pb2, time);
            return;
        }
        let pb0;
        {
            const circleBody = circle.getBody();
            const straightBody = straight.getBody();
            const circleOldCoords = circleBody.getOldCoords();
            const straightOldCoords = straightBody.getOldCoords();
            if (circleOldCoords == null || straightOldCoords == null) {
                if (straightOldCoords != null || circleOldCoords != null) {
                    throw 'problem with old copy in CircleStraight';
                }
                return;
            }
            const cw0 = circleOldCoords.bodyToWorld(circle.getCenterBody());
            const cb0 = straightOldCoords.worldToBody(cw0);
            pb0 = straight.pointOffset(cb0, -circle.getRadius());
            let pw0 = straightOldCoords.bodyToWorld(pb0);
            let pcb0 = circleOldCoords.worldToBody(pw0);
            pcb0 = circle.nearestPointByAngle(pcb0);
            pw0 = circleOldCoords.bodyToWorld(pcb0);
            pb0 = straightOldCoords.worldToBody(pw0);
        }
        const dist0 = straight.distanceToLine(pb0);
        if (dist0 < 0) {
            return;
        }
        if (!circle.isWithinArc2(pw)) {
            return;
        }
        const r = straight.intersection(pb, pb0);
        if (r == null) {
            return;
        }
        CircleStraight.addCollision(false, collisions, straight, circle, dist, pw, pb, time);
    }
    ;
    static addCollision(contact, collisions, straight, circle, dist, pw, pb, time) {
        const rbc = new EdgeEdgeCollision(circle, straight);
        Util.assert(circle.outsideIsOut());
        rbc.ballNormal = false;
        rbc.ballObject = true;
        rbc.radius1 = circle.getRadius();
        rbc.radius2 = Infinity;
        Util.assert(rbc.radius1 > 0);
        if (contact) {
            rbc.radius1 += dist;
        }
        rbc.distance = dist;
        rbc.impact1 = pw;
        rbc.creator = Util.DEBUG ? 'CircleStraight' : '';
        rbc.normal = straight.getBody().rotateBodyToWorld(straight.getNormalBody(pb));
        rbc.setDetectedTime(time);
        UtilCollision.addCollision(collisions, rbc);
    }
    ;
}
class CircleCircle {
    constructor() {
        throw '';
    }
    ;
    static improveAccuracy(rbc, other, normalCircle) {
        const otherBody = other.getBody();
        const normalBody = normalCircle.getBody();
        Util.assert(rbc.getPrimaryBody() == otherBody);
        Util.assert(rbc.getNormalBody() == normalBody);
        const oldX = rbc.impact1.getX();
        const oldY = rbc.impact1.getY();
        if (!normalCircle.outsideIsOut() && !other.outsideIsOut()) {
            return;
        }
        const cnw = normalBody.bodyToWorld(normalCircle.getCenterBody());
        const cow = otherBody.bodyToWorld(other.getCenterBody());
        const cob = normalBody.worldToBody(cow);
        const coe = normalCircle.bodyToEdge(cob);
        const len = coe.length();
        if (normalCircle.outsideIsOut() && other.outsideIsOut()) {
            rbc.distance = len - (normalCircle.getRadius() + other.getRadius());
        }
        else if (!normalCircle.outsideIsOut() && other.outsideIsOut()) {
            rbc.distance = normalCircle.getRadius() - other.getRadius() - len;
        }
        else if (normalCircle.outsideIsOut() && !other.outsideIsOut()) {
            rbc.distance = other.getRadius() - normalCircle.getRadius() - len;
        }
        else {
            throw '';
        }
        let ne = coe.multiply(1 / len);
        const pw = normalCircle.edgeToWorld(ne.multiply(normalCircle.getRadius()));
        rbc.impact1 = pw;
        if (!normalCircle.outsideIsOut()) {
            ne = ne.multiply(-1);
        }
        rbc.normal = normalBody.rotateBodyToWorld(ne);
    }
    ;
    static testCollision(collisions, self, other, time) {
        if (UtilCollision.DISABLE_EDGE_EDGE)
            return;
        if (!self.outsideIsOut() && !other.outsideIsOut()) {
            return;
        }
        else if (self.outsideIsOut() && other.outsideIsOut()) {
            const csw = self.getBody().bodyToWorld(self.getCenterBody());
            if (!other.isWithinArc2(csw))
                return;
            const cow = other.getBody().bodyToWorld(other.getCenterBody());
            const cob = self.getBody().worldToBody(cow);
            const coe = self.bodyToEdge(cob);
            if (!self.isWithinArc(coe))
                return;
            const len = coe.length();
            const r1 = other.getRadius();
            const r2 = self.getRadius();
            const distance = len - (r1 + r2);
            if (distance > self.getBody().getDistanceTol())
                return;
            if (distance > 0) {
                CircleCircle.addCollision(true, collisions, self, other, distance, len, coe, time);
                return;
            }
            const maxDepth = other.depthOfArc() > self.depthOfArc() ?
                other.depthOfArc() : self.depthOfArc();
            if (distance < -maxDepth)
                return;
            CircleCircle.addCollision(false, collisions, self, other, distance, len, coe, time);
        }
        else {
            Util.assert(self.outsideIsOut() != other.outsideIsOut());
            const convex = self.outsideIsOut() ? self : other;
            const concave = self.outsideIsOut() ? other : self;
            if (convex.getRadius() > concave.getRadius()) {
                return;
            }
            const cuw = concave.getBody().bodyToWorld(concave.getCenterBody());
            if (!convex.isWithinReflectedArc2(cuw))
                return;
            const cnw = convex.getBody().bodyToWorld(convex.getCenterBody());
            const cnb = concave.getBody().worldToBody(cnw);
            const cne = concave.bodyToEdge(cnb);
            if (!concave.isWithinArc(cne))
                return;
            const len = cne.length();
            const distance = concave.getRadius() - convex.getRadius() - len;
            if (distance > self.getBody().getDistanceTol())
                return;
            if (distance > 0) {
                CircleCircle.addCollision(true, collisions, concave, convex, distance, len, cne, time);
                return;
            }
            if (distance < -convex.depthOfArc())
                return;
            CircleCircle.addCollision(false, collisions, concave, convex, distance, len, cne, time);
        }
    }
    ;
    static addCollision(contact, collisions, self, other, distance, len, coe, time) {
        const rbc = new EdgeEdgeCollision(other, self);
        rbc.distance = distance;
        rbc.ballNormal = true;
        rbc.ballObject = true;
        rbc.creator = Util.DEBUG ? 'CircleCircle' : '';
        let ne = coe.multiply(1 / len);
        const pw = self.edgeToWorld(ne.multiply(self.getRadius()));
        rbc.impact1 = pw;
        if (!self.outsideIsOut()) {
            ne = ne.multiply(-1);
        }
        rbc.normal = self.getBody().rotateBodyToWorld(ne);
        rbc.radius1 = (other.outsideIsOut() ? 1 : -1) * other.getRadius();
        rbc.radius2 = (self.outsideIsOut() ? 1 : -1) * self.getRadius();
        if (contact) {
            rbc.radius1 += distance / 2;
            rbc.radius2 += distance / 2;
        }
        rbc.setDetectedTime(time);
        UtilCollision.addCollision(collisions, rbc);
    }
    ;
}
