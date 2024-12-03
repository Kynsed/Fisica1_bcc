import { Util } from "../util/Util.js";
export class ScreenRect {
    constructor(left, top, width, height) {
        if (typeof left !== 'number' || typeof top !== 'number' || typeof width !== 'number'
            || typeof height !== 'number') {
            throw '';
        }
        if (width < 0 || height < 0) {
            throw '';
        }
        this.left_ = left;
        this.top_ = top;
        this.width_ = width;
        this.height_ = height;
    }
    ;
    toString() {
        return 'ScreenRect{left_: ' + Util.NF(this.left_)
            + ', top_: ' + Util.NF(this.top_)
            + ', width_: ' + Util.NF(this.width_)
            + ', height_: ' + Util.NF(this.height_)
            + '}';
    }
    ;
    static clone(rect) {
        return new ScreenRect(rect.left_, rect.top_, rect.width_, rect.height_);
    }
    ;
    equals(otherRect) {
        return this.left_ == otherRect.left_ &&
            this.top_ == otherRect.top_ &&
            this.width_ == otherRect.width_ &&
            this.height_ == otherRect.height_;
    }
    ;
    getCenterX() {
        return this.left_ + this.width_ / 2;
    }
    ;
    getCenterY() {
        return this.top_ + this.height_ / 2;
    }
    ;
    getHeight() {
        return this.height_;
    }
    ;
    getLeft() {
        return this.left_;
    }
    ;
    getTop() {
        return this.top_;
    }
    ;
    getWidth() {
        return this.width_;
    }
    ;
    isEmpty(opt_tol) {
        const tol = opt_tol || 1E-14;
        return this.width_ < tol || this.height_ < tol;
    }
    ;
    makeOval(context) {
        const w = this.width_ / 2;
        const h = this.height_ / 2;
        if (typeof context.ellipse === 'function') {
            context.beginPath();
            context.moveTo(this.left_ + this.width_, this.top_ + h);
            context.ellipse(this.left_ + w, this.top_ + h, w, h, 0, 0, 2 * Math.PI, false);
        }
        else {
            const min = Math.min(w, h);
            context.beginPath();
            context.moveTo(this.left_ + this.width_, this.top_);
            context.arc(this.left_ + w, this.top_ + h, min, 0, 2 * Math.PI, false);
            context.closePath();
        }
    }
    ;
    makeRect(context) {
        context.rect(this.left_, this.top_, this.width_, this.height_);
    }
    ;
    nearEqual(otherRect, opt_tolerance) {
        if (Util.veryDifferent(this.left_, otherRect.left_, opt_tolerance)) {
            return false;
        }
        if (Util.veryDifferent(this.top_, otherRect.top_, opt_tolerance)) {
            return false;
        }
        if (Util.veryDifferent(this.width_, otherRect.width_, opt_tolerance)) {
            return false;
        }
        if (Util.veryDifferent(this.height_, otherRect.height_, opt_tolerance)) {
            return false;
        }
        return true;
    }
    ;
}
ScreenRect.EMPTY_RECT = new ScreenRect(0, 0, 0, 0);
;
Util.defineGlobal('lab$view$ScreenRect', ScreenRect);
