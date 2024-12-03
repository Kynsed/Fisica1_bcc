import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class PathPoint {
    constructor(p, calculateRadius) {
        this.x = 0;
        this.y = 0;
        this.slope = NaN;
        this.radius = NaN;
        this.direction = 1;
        this.idx = -1;
        this.normalX = 0;
        this.normalY = 0;
        this.normalXdp = 0;
        this.normalYdp = 0;
        this.slopeX = 0;
        this.slopeY = 0;
        this.dxdp = 0;
        this.dydp = 0;
        this.p = p || 0;
        this.radius_flag = calculateRadius || false;
    }
    ;
    toString() {
        return 'PathPoint{'
            + 'p=' + Util.NF(this.p)
            + ' x=' + Util.NF(this.x)
            + ' y=' + Util.NF(this.y)
            + ' slope=' + Util.NF(this.slope)
            + ' radius=' + Util.NF(this.radius)
            + ' radius_flag=' + this.radius_flag
            + ' direction=' + this.direction
            + ' index=' + this.idx
            + ' normalX=' + Util.NF(this.normalX)
            + ' normalY=' + Util.NF(this.normalY)
            + ' normalXdp=' + Util.NF(this.normalXdp)
            + ' normalYdp=' + Util.NF(this.normalYdp)
            + ' slopeX=' + Util.NF(this.slopeX)
            + ' slopeY=' + Util.NF(this.slopeY)
            + ' dxdp=' + Util.NF(this.dxdp)
            + ' dydp=' + Util.NF(this.dydp)
            + '}';
    }
    ;
    copyFrom(ppt) {
        this.x = ppt.x;
        this.y = ppt.y;
        this.p = ppt.p;
        this.slope = ppt.slope;
        this.radius = ppt.radius;
        this.radius_flag = ppt.radius_flag;
        this.direction = ppt.direction;
        this.idx = ppt.idx;
        this.normalX = ppt.normalX;
        this.normalY = ppt.normalY;
        this.normalXdp = ppt.normalXdp;
        this.normalYdp = ppt.normalYdp;
        this.slopeX = ppt.slopeX;
        this.slopeY = ppt.slopeY;
        this.dxdp = ppt.dxdp;
        this.dydp = ppt.dxdp;
    }
    ;
    distanceToNormalLine(point) {
        const err = Math.abs(this.normalX * this.normalX + this.normalY * this.normalY - 1);
        Util.assert(err < 1E-15);
        if (Math.abs(this.normalX) < 1E-16) {
            return Math.abs(point.getX() - this.x);
        }
        else {
            const A = -this.normalY;
            const B = this.normalX;
            const C = this.normalY * this.x - this.normalX * this.y;
            return Math.abs(A * point.getX() + B * point.getY() + C) /
                Math.sqrt(A * A + B * B);
        }
    }
    ;
    getNormal() {
        return new Vector(this.normalX, this.normalY);
    }
    ;
    getPosition() {
        return new Vector(this.x, this.y);
    }
    ;
    getSlope() {
        return new Vector(this.slopeX, this.slopeY);
    }
    ;
    getX() {
        return this.x;
    }
    ;
    getY() {
        return this.y;
    }
    ;
    getZ() {
        return 0;
    }
    ;
}
Util.defineGlobal('lab$model$PathPoint', PathPoint);
