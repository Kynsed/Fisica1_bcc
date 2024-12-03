import { CircularEdge } from './CircularEdge.js';
import { ConcreteVertex } from './ConcreteVertex.js';
import { LocalCoords } from './LocalCoords.js';
import { AbstractMassObject } from '../model/MassObject.js';
import { MutableVector } from '../util/MutableVector.js';
import { StraightEdge } from './StraightEdge.js';
import { UtilEngine } from './UtilEngine.js';
import { UtilCollision } from './UtilCollision.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class Polygon extends AbstractMassObject {
    constructor(opt_name, opt_localName) {
        let name, localName;
        if (opt_name) {
            name = opt_name;
            localName = opt_localName ?? name;
        }
        else {
            const id = Polygon.ID++;
            name = Polygon.en.POLYGON + id;
            localName = Polygon.i18n.POLYGON + id;
        }
        super(name, localName);
        this.vertices_ = [];
        this.edges_ = [];
        this.finished_ = false;
        this.startVertex_ = null;
        this.paths_ = [];
        this.nonCollideSet_ = null;
        this.elasticity_ = 1.0;
        this.nonCollideBodies_ = [];
        this.centroid_body_ = null;
        this.centroidRadius_ = NaN;
        this.specialEdge_ = null;
        this.specialNormalWorld_ = null;
        this.left_body_ = NaN;
        this.right_body_ = NaN;
        this.top_body_ = NaN;
        this.bottom_body_ = NaN;
        this.varsIndex_ = -1;
        this.body_old_ = null;
        this.body_old_save_ = new LocalCoords();
        this.distanceTol_ = 0.01;
        this.velocityTol_ = 0.5;
        this.accuracy_ = 0.6;
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', elasticity: ' + Util.NF(this.elasticity_)
            + ', distanceTol_: ' + Util.NF(this.distanceTol_)
            + ', velocityTol_: ' + Util.NF(this.velocityTol_)
            + ', accuracy_:' + Util.NF(this.accuracy_)
            + ', varsIndex_: ' + this.varsIndex_
            + ', centroid_body_: ' + this.centroid_body_
            + '}';
    }
    ;
    getClassName() {
        return 'Polygon';
    }
    ;
    addCircularEdge(p_body, center_body, clockwise, outsideIsOut) {
        const edge = new CircularEdge(this, this.lastOpenVertex(), new ConcreteVertex(p_body), center_body, clockwise, outsideIsOut);
        this.addEdge(edge);
        return edge;
    }
    ;
    addCircularEdge2(p_body, radius, aboveRight, clockwise, outsideIsOut) {
        const edge = CircularEdge.make(this, this.lastOpenVertex(), new ConcreteVertex(p_body), radius, aboveRight, clockwise, outsideIsOut);
        this.addEdge(edge);
        return edge;
    }
    ;
    addEdge(edge) {
        if (this.finished_) {
            throw 'cannot add edges to finished Polygon';
        }
        if (this.startVertex_ == null) {
            throw Polygon.OPEN_PATH_ERROR;
        }
        if (edge.getVertex2() != this.lastOpenVertex()) {
            throw 'edge is not connected to open path';
        }
        this.edges_.push(edge);
        edge.getDecoratedVertexes().forEach((v) => this.vertices_.push(v));
        if (edge.getVertex2() == this.startVertex_) {
            this.closePath();
        }
        else {
            this.vertices_.push(edge.getVertex2());
        }
    }
    ;
    addNonCollide(bodies) {
        bodies.forEach(b => this.nonCollideBodies_.includes(b) ? 0 : this.nonCollideBodies_.push(b));
    }
    ;
    addStraightEdge(p_body, outsideIsUp) {
        const edge = new StraightEdge(this, this.lastOpenVertex(), new ConcreteVertex(p_body), outsideIsUp);
        this.addEdge(edge);
        return edge;
    }
    ;
    calculateSize() {
        let xmin = Infinity;
        let xmax = Number.NEGATIVE_INFINITY;
        let ymin = Infinity;
        let ymax = Number.NEGATIVE_INFINITY;
        this.edges_.forEach(e => {
            if (e.getLeftBody() < xmin)
                xmin = e.getLeftBody();
            if (e.getRightBody() > xmax)
                xmax = e.getRightBody();
            if (e.getBottomBody() < ymin)
                ymin = e.getBottomBody();
            if (e.getTopBody() > ymax)
                ymax = e.getTopBody();
        });
        this.left_body_ = xmin;
        this.right_body_ = xmax;
        this.bottom_body_ = ymin;
        this.top_body_ = ymax;
    }
    ;
    checkCollision(collisions, body, time) {
        UtilCollision.checkVertexes(collisions, this, body, time);
        UtilCollision.checkVertexes(collisions, body, this, time);
        this.edges_.forEach(e1 => {
            if (body.nonCollideEdge(e1))
                return;
            body.getEdges().forEach(e2 => {
                if (this.nonCollideEdge(e2))
                    return;
                if (UtilEngine.PROXIMITY_TEST) {
                    if (!e1.intersectionPossible(e2, this.distanceTol_)) {
                        return;
                    }
                }
                if (UtilCollision.HIGHLIGHT_COLLISION_TESTING && Util.DEBUG) {
                    e1.highlight();
                    e2.highlight();
                }
                e1.testCollisionEdge(collisions, e2, time);
            });
        });
    }
    ;
    checkConsistent() {
        if (!this.finished_) {
            throw 'Polygon construction is not finished.';
        }
        this.paths_.forEach(v0 => {
            let v = v0;
            do {
                const e = v.getEdge2();
                if (e == null) {
                    throw '';
                }
                Util.assert(Util.isObject(e));
                Util.assert(e.getVertex1() == v);
                v = e.getVertex2();
                Util.assert(v.getEdge1() == e);
            } while (v != v0);
        });
    }
    ;
    closePath() {
        if (this.finished_) {
            throw 'Polygon construction is finished.';
        }
        if (this.startVertex_ == null) {
            return false;
        }
        const lastEdge = this.lastOpenEdge();
        if (lastEdge == null) {
            return false;
        }
        if (lastEdge.getVertex2() != this.startVertex_) {
            this.closePath_(this.startVertex_, lastEdge.getVertex2());
        }
        else {
            Util.assert(this.startVertex_.getEdge2() == lastEdge);
        }
        this.paths_.push(this.startVertex_);
        this.startVertex_ = null;
        return true;
    }
    ;
    closePath_(v1, v2) {
        if (v1.locBody().distanceTo(v2.locBody()) > 1E-8) {
            throw Util.DEBUG ? ('Vertexes must be at same location ' + v1 + ' ' + v2) : '';
        }
        const v2_edge1 = v2.getEdge1();
        if (v2_edge1 == null) {
            throw 'v2.edge1 is null; v2=' + v2 + '; this=' + this;
        }
        v1.setEdge1(v2_edge1);
        v2_edge1.setVertex2(v1);
        Util.assert(this.vertices_.includes(v2));
        Util.remove(this.vertices_, v2);
    }
    ;
    createCanvasPath(context) {
        context.beginPath();
        this.paths_.forEach(v0 => {
            context.moveTo(v0.locBodyX(), v0.locBodyY());
            let v = v0;
            do {
                const e = v.getEdge2();
                if (e == null) {
                    throw '';
                }
                Util.assert(Util.isObject(e));
                Util.assert(e.getVertex1() == v);
                v = e.getVertex2();
                Util.assert(v.getEdge1() == e);
                e.addPath(context);
            } while (v != v0);
            context.closePath();
        });
        if (Util.DEBUG && (Polygon.SHOW_VERTICES || Polygon.SHOW_ALL_VERTICES)) {
            this.vertices_.forEach(v => {
                context.moveTo(v.locBodyX(), v.locBodyY());
                if (Polygon.SHOW_ALL_VERTICES || v.isEndPoint()) {
                    context.arc(v.locBodyX(), v.locBodyY(), 0.1, 0, 2 * Math.PI, false);
                }
            });
        }
    }
    ;
    doesNotCollide(body) {
        return this.nonCollideBodies_.includes(body);
    }
    ;
    eraseOldCoords() {
        this.body_old_ = null;
    }
    ;
    findCentroid() {
        const NEARNESS_TOLERANCE = 1e-6;
        const info = new Array(2);
        const delta = 0.1 * Math.max(this.getWidth(), this.getHeight());
        const s = new Array(3);
        s[0] = new MutableVector(this.cm_body_.getX() + delta, this.cm_body_.getY());
        s[1] = new MutableVector(this.cm_body_.getX(), this.cm_body_.getY() + delta);
        s[2] = new MutableVector(this.cm_body_.getX() - delta, this.cm_body_.getY() - delta);
        const centroid = UtilEngine.findMinimumSimplex(s, p_body => this.maxRadiusSquared(Vector.clone(p_body)), NEARNESS_TOLERANCE, info);
        if (info[1] != 0) {
            throw Util.DEBUG ? ('could not find centroid, iterations=' + info[0]) : '';
        }
        return centroid;
    }
    ;
    finish() {
        if (this.finished_) {
            throw 'Polygon construction is finished.';
        }
        if (this.startVertex_ != null) {
            this.closePath();
        }
        this.finished_ = true;
        this.checkConsistent();
        this.calculateSize();
        this.setCenterOfMass(new Vector(this.getLeftBody() + this.getWidth() / 2, this.getBottomBody() + this.getHeight() / 2));
        if (this.getWidth() <= this.getHeight()) {
            this.setDragPoints([new Vector(this.getLeftBody() + 0.5 * this.getWidth(), this.getBottomBody() + 0.8 * this.getHeight()),
                new Vector(this.getLeftBody() + 0.5 * this.getWidth(), this.getBottomBody() + 0.2 * this.getHeight())
            ]);
        }
        else {
            this.setDragPoints([new Vector(this.getLeftBody() + 0.8 * this.getWidth(), this.getBottomBody() + 0.5 * this.getHeight()),
                new Vector(this.getLeftBody() + 0.2 * this.getWidth(), this.getBottomBody() + 0.5 * this.getHeight())
            ]);
        }
        const w = this.getWidth();
        const h = this.getHeight();
        this.setMomentAboutCM((w * w + h * h) / 12);
        this.specialNormalWorld_ = null;
        const centroid_body = this.getCentroidBody();
        if (Polygon.PRINT_POLYGON_STRUCTURE && Util.DEBUG) {
            this.printAll();
        }
    }
    ;
    getAccuracy() {
        return this.accuracy_;
    }
    ;
    getBottomBody() {
        return this.bottom_body_;
    }
    ;
    getCentroidBody() {
        if (this.centroid_body_ == null) {
            this.centroid_body_ = this.findCentroid();
            this.setCentroid(this.centroid_body_);
        }
        return this.centroid_body_;
    }
    ;
    getCentroidRadius() {
        return this.centroidRadius_;
    }
    ;
    getDistanceTol() {
        return this.distanceTol_;
    }
    ;
    getEdges() {
        return this.edges_;
    }
    ;
    getElasticity() {
        return this.elasticity_;
    }
    ;
    getLeftBody() {
        return this.left_body_;
    }
    ;
    getMinHeight() {
        if (isNaN(this.minHeight_)) {
            let dist = Infinity;
            this.edges_.forEach(e => {
                let d = e.distanceToPoint(this.cm_body_);
                if (d == Infinity)
                    return;
                if (d > 0) {
                    dist = 0;
                    return;
                }
                d = -d;
                if (d < dist)
                    dist = d;
            });
            if (dist == Infinity)
                dist = this.getMinHeight2();
            this.minHeight_ = dist;
        }
        return this.minHeight_;
    }
    ;
    getMinHeight2() {
        if (isNaN(this.minHeight_)) {
            let dist = Infinity;
            let d;
            for (let i = 0; i <= 3; i++) {
                switch (i) {
                    case 0:
                        d = this.cm_body_.getY() - this.getBottomBody();
                        break;
                    case 1:
                        d = this.getRightBody() - this.cm_body_.getX();
                        break;
                    case 2:
                        d = this.getTopBody() - this.cm_body_.getY();
                        break;
                    case 3:
                        d = this.cm_body_.getX() - this.getLeftBody();
                        break;
                    default:
                        d = Infinity;
                        break;
                }
                if (d < dist)
                    dist = d;
            }
            this.minHeight_ = dist;
        }
        return this.minHeight_;
    }
    ;
    getOldCoords() {
        return this.body_old_;
    }
    ;
    getRightBody() {
        return this.right_body_;
    }
    ;
    getSpecialNormalWorld() {
        const e = this.specialEdge_;
        if (e == null)
            return null;
        let v = this.specialNormalWorld_;
        if (v == null) {
            if (Util.DEBUG)
                UtilCollision.specialNormalMisses++;
            v = this.rotateBodyToWorld(e.getNormalBody(Vector.ORIGIN));
            this.specialNormalWorld_ = v;
        }
        else {
            if (Util.DEBUG)
                UtilCollision.specialNormalHits++;
        }
        return v;
    }
    ;
    getStartVertex() {
        return this.startVertex_;
    }
    ;
    getTopBody() {
        return this.top_body_;
    }
    ;
    getVarName(index, localized) {
        let s = this.getName(localized) + ' ';
        switch (index) {
            case 0:
                s += 'X ' + (localized ? Polygon.i18n.POSITION : Polygon.en.POSITION);
                break;
            case 1:
                s += 'X ' + (localized ? Polygon.i18n.VELOCITY : Polygon.en.VELOCITY);
                break;
            case 2:
                s += 'Y ' + (localized ? Polygon.i18n.POSITION : Polygon.en.POSITION);
                break;
            case 3:
                s += 'Y ' + (localized ? Polygon.i18n.VELOCITY : Polygon.en.VELOCITY);
                break;
            case 4:
                s += localized ? Polygon.i18n.ANGLE : Polygon.en.ANGLE;
                break;
            case 5:
                s += localized ? Polygon.i18n.ANGULAR_VELOCITY :
                    Polygon.en.ANGULAR_VELOCITY;
                break;
            default:
                throw '';
        }
        return s;
    }
    ;
    getVarsIndex() {
        return this.varsIndex_;
    }
    ;
    getVelocityTol() {
        return this.velocityTol_;
    }
    ;
    getVertexes_() {
        return this.vertices_;
    }
    ;
    getVerticesBody() {
        return this.vertices_.map(v => v.locBody());
    }
    ;
    lastOpenEdge() {
        if (this.startVertex_ == null) {
            throw '';
        }
        let edge = this.startVertex_.safeGetEdge2();
        if (edge === null) {
            return null;
        }
        while (true) {
            if (edge === null)
                throw '';
            const v = edge.getVertex2();
            const e = v.safeGetEdge2();
            if (e === null) {
                break;
            }
            edge = e;
            if (v == this.startVertex_)
                throw '';
        }
        return edge;
    }
    ;
    lastOpenVertex() {
        if (this.startVertex_ == null) {
            throw Polygon.OPEN_PATH_ERROR;
        }
        const lastEdge = this.lastOpenEdge();
        if (lastEdge == null) {
            return this.startVertex_;
        }
        else {
            return lastEdge.getVertex2();
        }
    }
    ;
    maxRadiusSquared(p_body) {
        let maxR = 0;
        this.vertices_.forEach(v => {
            const d = p_body.distanceTo(v.locBody());
            if (d > maxR)
                maxR = d;
        });
        let mce = 0;
        this.edges_.forEach(e => {
            const ce = e.chordError();
            if (ce > mce)
                mce = ce;
        });
        maxR += mce;
        return maxR * maxR;
    }
    ;
    nonCollideEdge(edge) {
        if (edge == null) {
            return true;
        }
        if (this.nonCollideSet_ != null) {
            return this.nonCollideSet_.contains(edge);
        }
        else {
            return false;
        }
    }
    ;
    printAll() {
        if (Util.DEBUG) {
            console.log(this.toString());
            let vLast = this.vertices_[this.vertices_.length - 1];
            this.vertices_.forEach((v, k) => {
                const d = v.locBody().distanceTo(vLast.locBody());
                console.log('(' + (k) + ') ' + v + ' dist to prev vertex = ' + Util.NF(d));
                vLast = v;
            });
            this.edges_.forEach((e, k) => console.log('(' + (k) + ') ' + e));
        }
        ;
    }
    ;
    probablyPointInside(p_body) {
        return undefined === this.edges_.find((e) => e.distanceToLine(p_body) > 0);
    }
    ;
    removeNonCollide(bodies) {
        bodies.forEach((body) => Util.removeAll(this.nonCollideBodies_, body));
    }
    ;
    saveOldCoords() {
        if (this.body_old_ == null) {
            this.body_old_ = this.body_old_save_;
        }
        this.body_old_.set(this.cm_body_, this.loc_world_, this.sinAngle_, this.cosAngle_);
    }
    ;
    setAccuracy(accuracy) {
        if (accuracy <= 0 || accuracy > 1) {
            throw 'accuracy must be between 0 and 1, is ' + accuracy;
        }
        this.accuracy_ = accuracy;
    }
    ;
    setCentroid(centroid_body) {
        if (this.startVertex_ != null) {
            throw 'setCentroid called before finish, while creating Polygon';
        }
        this.centroid_body_ = centroid_body;
        if (Util.DEBUG) {
            const ctrd = this.findCentroid();
            const c_dist = centroid_body.distanceTo(ctrd);
            Util.assert(c_dist < 0.01, 'dist=' + Util.NF(c_dist) + ' ctrd=' + ctrd
                + ' centroid_body=' + centroid_body);
        }
        this.centroidRadius_ = Math.sqrt(this.maxRadiusSquared(centroid_body));
        return this;
    }
    ;
    setDistanceTol(value) {
        this.distanceTol_ = value;
    }
    ;
    setElasticity(value) {
        this.elasticity_ = value;
    }
    ;
    setNonCollideEdge(nonCollideSet) {
        this.nonCollideSet_ = nonCollideSet;
    }
    ;
    setPosition(loc_world, angle) {
        this.loc_world_ = Vector.clone(loc_world);
        if (angle !== undefined && isFinite(angle) && this.angle_ != angle) {
            this.angle_ = angle;
            this.sinAngle_ = Math.sin(angle);
            this.cosAngle_ = Math.cos(angle);
            this.specialNormalWorld_ = null;
        }
        this.edges_.forEach(e => e.forgetPosition());
        this.setChanged();
    }
    ;
    setSpecialEdge(edgeIndex, radius) {
        if (this.edges_.length != 4)
            throw Util.DEBUG ? 'can only set special edge on rectangle' : '';
        if (edgeIndex < 0 || edgeIndex > 3)
            throw '';
        this.specialEdge_ = this.edges_[edgeIndex];
        this.centroidRadius_ = radius;
        this.edges_.forEach(e => {
            if (e != this.specialEdge_) {
                e.setCentroidRadius(0);
            }
        });
    }
    ;
    setVarsIndex(index) {
        this.varsIndex_ = index;
    }
    ;
    setVelocityTol(value) {
        this.velocityTol_ = value;
    }
    ;
    startPath(vertexOrEdge) {
        if (this.finished_) {
            throw 'Polygon construction is finished.';
        }
        if (this.startVertex_ != null) {
            throw 'there is already an open path';
        }
        if (vertexOrEdge instanceof ConcreteVertex) {
            const vertex = vertexOrEdge;
            this.startVertex_ = vertex;
            this.vertices_.push(this.startVertex_);
        }
        else {
            const edge = vertexOrEdge;
            this.startVertex_ = edge.getVertex1();
            this.vertices_.push(this.startVertex_);
            this.edges_.push(edge);
        }
    }
    ;
}
Polygon.OPEN_PATH_ERROR = 'Polygon does not have an open path to add edges to';
Polygon.SHOW_VERTICES = false;
Polygon.SHOW_ALL_VERTICES = false;
Polygon.PRINT_POLYGON_STRUCTURE = false;
Polygon.en = {
    POLYGON: 'polygon',
    ANGLE: 'angle',
    ANGULAR_VELOCITY: 'angular velocity',
    POSITION: 'position',
    VELOCITY: 'velocity'
};
Polygon.de_strings = {
    POLYGON: 'Polygon',
    ANGLE: 'Winkel',
    ANGULAR_VELOCITY: 'Winkelgeschwindigkeit',
    POSITION: 'Position',
    VELOCITY: 'Geschwindigkeit'
};
Polygon.i18n = Util.LOCALE === 'de' ? Polygon.de_strings : Polygon.en;
Util.defineGlobal('lab$engine2D$Polygon', Polygon);
