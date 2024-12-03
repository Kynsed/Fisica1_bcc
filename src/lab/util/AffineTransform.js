import { Vector } from "./Vector.js";
import { Util } from "./Util.js";
export class AffineTransform {
    constructor(m11, m12, m21, m22, dx, dy) {
        this.m11_ = m11;
        this.m12_ = m12;
        this.m21_ = m21;
        this.m22_ = m22;
        this.dx_ = dx;
        this.dy_ = dy;
    }
    ;
    toString() {
        return 'AffineTransform{m11_: ' + Util.NF(this.m11_)
            + ', m12_: ' + Util.NF(this.m12_)
            + ', m21_: ' + Util.NF(this.m21_)
            + ', m22_: ' + Util.NF(this.m22_)
            + ', dx_: ' + Util.NF(this.dx_)
            + ', dy_: ' + Util.NF(this.dy_)
            + '}';
    }
    ;
    applyTransform(context) {
        context.transform(this.m11_, this.m12_, this.m21_, this.m22_, this.dx_, this.dy_);
    }
    ;
    concatenate(at) {
        const m11 = this.m11_ * at.m11_ + this.m21_ * at.m12_;
        const m12 = this.m12_ * at.m11_ + this.m22_ * at.m12_;
        const m21 = this.m11_ * at.m21_ + this.m21_ * at.m22_;
        const m22 = this.m12_ * at.m21_ + this.m22_ * at.m22_;
        const dx = this.m11_ * at.dx_ + this.m21_ * at.dy_ + this.dx_;
        const dy = this.m12_ * at.dx_ + this.m22_ * at.dy_ + this.dy_;
        return new AffineTransform(m11, m12, m21, m22, dx, dy);
    }
    ;
    lineTo(x, y, context) {
        const p = this.transform(x, y);
        context.lineTo(p.getX(), p.getY());
    }
    ;
    moveTo(x, y, context) {
        const p = this.transform(x, y);
        context.moveTo(p.getX(), p.getY());
    }
    ;
    rotate(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const m11 = c * this.m11_ + s * this.m21_;
        const m12 = c * this.m12_ + s * this.m22_;
        const m21 = -s * this.m11_ + c * this.m21_;
        const m22 = -s * this.m12_ + c * this.m22_;
        return new AffineTransform(m11, m12, m21, m22, this.dx_, this.dy_);
    }
    ;
    scale(x, y) {
        const m11 = this.m11_ * x;
        const m12 = this.m12_ * x;
        const m21 = this.m21_ * y;
        const m22 = this.m22_ * y;
        return new AffineTransform(m11, m12, m21, m22, this.dx_, this.dy_);
    }
    ;
    setTransform(context) {
        context.setTransform(this.m11_, this.m12_, this.m21_, this.m22_, this.dx_, this.dy_);
    }
    ;
    transform(x, y) {
        let x1, y1;
        if (typeof x === 'number') {
            x1 = x;
            y1 = y;
        }
        else {
            const v = x;
            y1 = v.getY();
            x1 = v.getX();
        }
        if (typeof x1 !== 'number' || typeof y1 !== 'number') {
            throw 'need a Vector or two numbers';
        }
        const x2 = this.m11_ * x1 + this.m21_ * y1 + this.dx_;
        const y2 = this.m12_ * x1 + this.m22_ * y1 + this.dy_;
        return new Vector(x2, y2);
    }
    ;
    translate(x, y) {
        let x1, y1;
        if (typeof x === 'number') {
            x1 = x;
            y1 = y;
        }
        else {
            const v = x;
            y1 = v.getY();
            x1 = v.getX();
        }
        if (typeof x1 !== 'number' || typeof y1 !== 'number') {
            throw 'need a Vector or two numbers';
        }
        const dx = this.dx_ + this.m11_ * x1 + this.m21_ * y1;
        const dy = this.dy_ + this.m12_ * x1 + this.m22_ * y1;
        return new AffineTransform(this.m11_, this.m12_, this.m21_, this.m22_, dx, dy);
    }
    ;
}
AffineTransform.IDENTITY = new AffineTransform(1, 0, 0, 1, 0, 0);
Util.defineGlobal('lab$util$AffineTransform', AffineTransform);
