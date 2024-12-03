import { Vector } from "./Vector.js";
import { Util } from "./Util.js";
export class DoubleRect {
    constructor(left, bottom, right, top) {
        if (left > right) {
            throw 'DoubleRect: left > right: ' + left + ' > ' + right;
        }
        if (bottom > top) {
            throw 'DoubleRect: bottom > top: ' + bottom + ' > ' + top;
        }
        this.left_ = Util.testNumber(left);
        this.right_ = Util.testNumber(right);
        this.bottom_ = Util.testNumber(bottom);
        this.top_ = Util.testNumber(top);
    }
    ;
    toString() {
        return 'DoubleRect{left_: ' + Util.NF(this.left_)
            + ', bottom_: ' + Util.NF(this.bottom_)
            + ', right_: ' + Util.NF(this.right_)
            + ', top_: ' + Util.NF(this.top_)
            + '}';
    }
    ;
    static clone(rect) {
        return new DoubleRect(rect.getLeft(), rect.getBottom(), rect.getRight(), rect.getTop());
    }
    ;
    static make(point1, point2) {
        const left = Math.min(point1.getX(), point2.getX());
        const right = Math.max(point1.getX(), point2.getX());
        const bottom = Math.min(point1.getY(), point2.getY());
        const top = Math.max(point1.getY(), point2.getY());
        return new DoubleRect(left, bottom, right, top);
    }
    ;
    static makeCentered(center, width, height) {
        const x = center.getX();
        const y = center.getY();
        return new DoubleRect(x - width / 2, y - height / 2, x + width / 2, y + height / 2);
    }
    ;
    static makeCentered2(center, size) {
        const x = center.getX();
        const y = center.getY();
        const w = size.getX();
        const h = size.getY();
        return new DoubleRect(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
    }
    ;
    contains(point) {
        return point.getX() >= this.left_ &&
            point.getX() <= this.right_ &&
            point.getY() >= this.bottom_ &&
            point.getY() <= this.top_;
    }
    ;
    equals(obj) {
        if (obj === this)
            return true;
        if (obj instanceof DoubleRect) {
            return obj.getLeft() == this.left_ && obj.getRight() == this.right_ &&
                obj.getBottom() == this.bottom_ && obj.getTop() == this.top_;
        }
        else {
            return false;
        }
    }
    ;
    expand(marginX, marginY) {
        marginY = (marginY === undefined) ? marginX : marginY;
        return new DoubleRect(this.getLeft() - marginX, this.getBottom() - marginY, this.getRight() + marginX, this.getTop() + marginX);
    }
    ;
    getBottom() {
        return this.bottom_;
    }
    ;
    getCenter() {
        return new Vector(this.getCenterX(), this.getCenterY());
    }
    ;
    getCenterX() {
        return (this.left_ + this.right_) / 2.0;
    }
    ;
    getCenterY() {
        return (this.bottom_ + this.top_) / 2.0;
    }
    ;
    getHeight() {
        return this.top_ - this.bottom_;
    }
    ;
    getLeft() {
        return this.left_;
    }
    ;
    getRight() {
        return this.right_;
    }
    ;
    getTop() {
        return this.top_;
    }
    ;
    getWidth() {
        return this.right_ - this.left_;
    }
    ;
    intersection(rect) {
        const left = Math.max(this.left_, rect.getLeft());
        const bottom = Math.max(this.bottom_, rect.getBottom());
        const right = Math.min(this.right_, rect.getRight());
        const top = Math.min(this.top_, rect.getTop());
        if (left > right || bottom > top) {
            return DoubleRect.EMPTY_RECT;
        }
        else {
            return new DoubleRect(left, bottom, right, top);
        }
    }
    ;
    isEmpty(opt_tolerance) {
        const tol = opt_tolerance || 1E-16;
        return this.getWidth() < tol || this.getHeight() < tol;
    }
    ;
    maybeVisible(p1, p2) {
        if (this.contains(p1) || this.contains(p2)) {
            return true;
        }
        const p1x = p1.getX();
        const p1y = p1.getY();
        const p2x = p2.getX();
        const p2y = p2.getY();
        let d = this.left_;
        if (p1x < d && p2x < d) {
            return false;
        }
        d = this.right_;
        if (p1x > d && p2x > d) {
            return false;
        }
        d = this.bottom_;
        if (p1y < d && p2y < d) {
            return false;
        }
        d = this.top_;
        if (p1y > d && p2y > d) {
            return false;
        }
        return true;
    }
    ;
    nearEqual(rect, opt_tolerance) {
        if (Util.veryDifferent(this.left_, rect.getLeft(), opt_tolerance)) {
            return false;
        }
        if (Util.veryDifferent(this.bottom_, rect.getBottom(), opt_tolerance)) {
            return false;
        }
        if (Util.veryDifferent(this.right_, rect.getRight(), opt_tolerance)) {
            return false;
        }
        if (Util.veryDifferent(this.top_, rect.getTop(), opt_tolerance)) {
            return false;
        }
        return true;
    }
    ;
    scale(factorX, factorY) {
        factorY = (factorY === undefined) ? factorX : factorY;
        const x0 = this.getCenterX();
        const y0 = this.getCenterY();
        const w = this.getWidth();
        const h = this.getHeight();
        return new DoubleRect(x0 - (factorX * w) / 2, y0 - (factorY * h) / 2, x0 + (factorX * w) / 2, y0 + (factorY * h) / 2);
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
            throw '';
        }
        return new DoubleRect(this.left_ + x1, this.bottom_ + y1, this.right_ + x1, this.top_ + y1);
    }
    ;
    union(rect) {
        return new DoubleRect(Math.min(this.left_, rect.getLeft()), Math.min(this.bottom_, rect.getBottom()), Math.max(this.right_, rect.getRight()), Math.max(this.top_, rect.getTop()));
    }
    ;
    unionPoint(point) {
        return new DoubleRect(Math.min(this.left_, point.getX()), Math.min(this.bottom_, point.getY()), Math.max(this.right_, point.getX()), Math.max(this.top_, point.getY()));
    }
    ;
}
DoubleRect.EMPTY_RECT = new DoubleRect(0, 0, 0, 0);
Util.defineGlobal('lab$util$DoubleRect', DoubleRect);
