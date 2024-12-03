import { ConcreteVertex } from './ConcreteVertex.js';
import { Polygon } from './Polygon.js';
import { RandomLCG } from '../util/Random.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class Shapes {
    constructor() {
        throw '';
    }
    ;
    static makeBall(radius, opt_name, opt_localName) {
        const p = new Polygon(opt_name, opt_localName);
        p.startPath(new ConcreteVertex(new Vector(-radius, 0)));
        p.addCircularEdge(new Vector(-radius, 0), Vector.ORIGIN, false, true);
        p.finish();
        p.setCentroid(Vector.ORIGIN);
        p.setMomentAboutCM(radius * radius / 2);
        p.setElasticity(0.8);
        return p;
    }
    ;
    static makeBlock(width, height, opt_name, opt_localName) {
        const p = new Polygon(opt_name, opt_localName);
        const w = width / 2;
        const h = height / 2;
        p.startPath(new ConcreteVertex(new Vector(-w, -h)));
        p.addStraightEdge(new Vector(w, -h), false);
        p.addStraightEdge(new Vector(w, h), true);
        p.addStraightEdge(new Vector(-w, h), true);
        p.addStraightEdge(new Vector(-w, -h), false);
        p.finish();
        p.setCentroid(Vector.ORIGIN);
        p.setMomentAboutCM((width * width + height * height) / 12);
        p.setElasticity(0.8);
        return p;
    }
    ;
    static makeBlock2(width, height, opt_name, opt_localName) {
        const p = new Polygon(opt_name, opt_localName);
        p.startPath(new ConcreteVertex(new Vector(0, 0)));
        p.addStraightEdge(new Vector(width, 0), false);
        p.addStraightEdge(new Vector(width, height), true);
        p.addStraightEdge(new Vector(0, height), true);
        p.addStraightEdge(new Vector(0, 0), false);
        p.finish();
        p.setCentroid(new Vector(width / 2, height / 2));
        p.setMomentAboutCM((width * width + height * height) / 12);
        p.setElasticity(0.8);
        return p;
    }
    static makeDiamond(width, height, angle, opt_name, opt_localName) {
        if (angle < -Math.PI / 2 || angle > Math.PI / 2)
            throw 'angle must be within +/- pi/2';
        const p = new Polygon(opt_name, opt_localName);
        const w = width / 2;
        const h = height / 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        let v = (new Vector(-w, -h)).rotate(cos, sin);
        p.startPath(new ConcreteVertex(new Vector(v.getX(), v.getY())));
        v = (new Vector(w, -h)).rotate(cos, sin);
        p.addStraightEdge(v, false);
        v = (new Vector(w, h)).rotate(cos, sin);
        p.addStraightEdge(v, angle >= 0);
        v = (new Vector(-w, h)).rotate(cos, sin);
        p.addStraightEdge(v, true);
        v = (new Vector(-w, -h)).rotate(cos, sin);
        p.addStraightEdge(v, angle < 0);
        p.finish();
        p.setMomentAboutCM((width * width + height * height) / 12);
        p.setCentroid(Vector.ORIGIN);
        p.setElasticity(0.8);
        return p;
    }
    ;
    static makeFrame(width, height, thickness, opt_name, opt_localName) {
        const w = width / 2;
        const h = height / 2;
        const t = thickness / 2;
        const p = new Polygon(opt_name, opt_localName);
        p.startPath(new ConcreteVertex(new Vector(w - t, h - t)));
        p.addStraightEdge(new Vector(w - t, -(h - t)), false);
        p.addStraightEdge(new Vector(-(w - t), -(h - t)), true);
        p.addStraightEdge(new Vector(-(w - t), h - t), true);
        p.addStraightEdge(new Vector(w - t, h - t), false);
        p.closePath();
        p.startPath(new ConcreteVertex(new Vector(w + t, h + t)));
        p.addStraightEdge(new Vector(-(w + t), h + t), true);
        p.addStraightEdge(new Vector(-(w + t), -(h + t)), false);
        p.addStraightEdge(new Vector(w + t, -(h + t)), false);
        p.addStraightEdge(new Vector(w + t, h + t), true);
        p.closePath();
        p.finish();
        p.setElasticity(0.8);
        return p;
    }
    ;
    static makeHexagon(size, opt_name, opt_localName) {
        const p = new Polygon(opt_name, opt_localName);
        const a = Math.sin(Math.PI / 3);
        const b = Math.cos(Math.PI / 3);
        p.startPath(new ConcreteVertex(new Vector(size * (1 - b), 0)));
        p.addStraightEdge(new Vector(size * (1 + b), 0), false);
        p.addStraightEdge(new Vector(size * 2, size * a), false);
        p.addStraightEdge(new Vector(size * (1 + b), size * 2 * a), true);
        p.addStraightEdge(new Vector(size * (1 - b), size * 2 * a), true);
        p.addStraightEdge(new Vector(0, size * a), true);
        p.addStraightEdge(new Vector(size * (1 - b), 0), false);
        p.finish();
        const r = Math.sqrt(3) / 2;
        p.setMomentAboutCM(r * r / 2);
        p.setElasticity(0.8);
        return p;
    }
    ;
    static makePendulum(width, length, radius, opt_name, opt_localName) {
        const p = new Polygon(opt_name, opt_localName);
        p.startPath(new ConcreteVertex(new Vector(width, radius)));
        p.addStraightEdge(new Vector(width, length + width), true);
        p.addStraightEdge(new Vector(-width, length + width), true);
        p.addStraightEdge(new Vector(-width, radius), false);
        p.addCircularEdge(new Vector(width, radius), Vector.ORIGIN, false, true);
        p.finish();
        p.setCenterOfMass(Vector.ORIGIN);
        p.setDragPoints([Vector.ORIGIN]);
        const r = Math.sqrt(width * width + radius * radius);
        p.setMomentAboutCM(r * r / 2);
        p.setElasticity(0.8);
        return p;
    }
    ;
    static makePolygon(points, outIsUp, moment, opt_name, opt_localName) {
        if (points.length < 3 || points.length != outIsUp.length) {
            throw '';
        }
        const p = new Polygon(opt_name, opt_localName);
        const v0 = points[0];
        p.startPath(new ConcreteVertex(v0));
        for (let i = 1; i < points.length; i++) {
            p.addStraightEdge(points[i], outIsUp[i - 1]);
        }
        p.addStraightEdge(v0, outIsUp[points.length - 1]);
        p.finish();
        p.setMomentAboutCM(moment);
        p.setElasticity(0.8);
        return p;
    }
    ;
    static makeRandomPolygon(sides, radius, minAngle, maxAngle, opt_name, opt_localName) {
        if (minAngle === undefined) {
            minAngle = Math.PI / sides;
        }
        if (maxAngle === undefined) {
            maxAngle = 3 * Math.PI / sides;
        }
        const angles = [0];
        let sum = 0;
        for (let i = 0; i < sides - 1; i++) {
            let angle = (0.5 + Shapes.RANDOM.nextFloat()) * (2 * Math.PI - sum) / (sides - i);
            const remain = 2 * Math.PI - sum;
            const max = Math.min(maxAngle, remain - minAngle * (sides - 1 - i));
            angle = Math.min(max, Math.max(minAngle, angle));
            angle = Math.min(2 * Math.PI, sum + angle);
            angles.push(angle);
            sum = angle;
        }
        const p = new Polygon(opt_name, opt_localName);
        const v0 = new Vector(radius, 0);
        let v1 = v0;
        p.startPath(new ConcreteVertex(v1));
        for (let i = 1; i < sides; i++) {
            const v2 = new Vector(radius * Math.cos(angles[i]), radius * Math.sin(angles[i]));
            const outsideIsUp = v2.getX() < v1.getX();
            p.addStraightEdge(v2, outsideIsUp);
            v1 = v2;
        }
        p.addStraightEdge(v0, false);
        p.finish();
        p.setMomentAboutCM(radius * radius / 6);
        p.setElasticity(0.8);
        return p;
    }
    ;
    static makeRoundBlock(width, height, opt_name, opt_localName) {
        if (height < width) {
            throw 'Height must be greater than width.';
        }
        const p = new Polygon(opt_name, opt_localName);
        const w = width / 2;
        const h = height / 2;
        p.startPath(new ConcreteVertex(new Vector(-w, -h + w)));
        p.addCircularEdge(new Vector(w, -h + w), new Vector(0, -h + w), false, true);
        p.addStraightEdge(new Vector(w, h - w), true);
        p.addCircularEdge(new Vector(-w, h - w), new Vector(0, h - w), false, true);
        p.addStraightEdge(new Vector(-w, -h + w), false);
        p.finish();
        p.setCentroid(Vector.ORIGIN);
        p.setMomentAboutCM((width * width + height * height) / 12);
        p.setElasticity(0.8);
        return p;
    }
    ;
    static makeRoundCornerBlock(width, height, radius, opt_name, opt_localName) {
        const w = width / 2;
        const h = height / 2;
        const r = radius;
        if (r > w || r > h) {
            throw 'radius must be less than half of width or height';
        }
        const p = new Polygon(opt_name, opt_localName);
        p.startPath(new ConcreteVertex(new Vector(-w + r, -h)));
        p.addStraightEdge(new Vector(w - r, -h), false);
        p.addCircularEdge(new Vector(w, -h + r), new Vector(w - r, -h + r), false, true);
        p.addStraightEdge(new Vector(w, h - r), true);
        p.addCircularEdge(new Vector(w - r, h), new Vector(w - r, h - r), false, true);
        p.addStraightEdge(new Vector(-w + r, h), true);
        p.addCircularEdge(new Vector(-w, h - r), new Vector(-w + r, h - r), false, true);
        p.addStraightEdge(new Vector(-w, -h + r), false);
        p.addCircularEdge(new Vector(-w + r, -h), new Vector(-w + r, -h + r), false, true);
        p.finish();
        p.setCentroid(Vector.ORIGIN);
        p.setMomentAboutCM((width * width + height * height) / 12);
        p.setElasticity(0.8);
        return p;
    }
    ;
    static makeWall(width, height, edgeIndex, opt_name, opt_localName) {
        if (edgeIndex < 0 || edgeIndex > 3)
            throw '';
        const w = Shapes.makeBlock(width, height, opt_name, opt_localName);
        let r;
        if (edgeIndex == Shapes.BOTTOM_EDGE || edgeIndex == Shapes.TOP_EDGE) {
            r = w.getHeight() / 2;
        }
        else {
            r = w.getWidth() / 2;
        }
        w.setSpecialEdge(edgeIndex, r);
        return w;
    }
    ;
}
Shapes.ID = 1;
Shapes.BOTTOM_EDGE = 0;
Shapes.RIGHT_EDGE = 1;
Shapes.TOP_EDGE = 2;
Shapes.LEFT_EDGE = 3;
Shapes.RANDOM = new RandomLCG(0);
Util.defineGlobal('lab$engine2D$Shapes', Shapes);
