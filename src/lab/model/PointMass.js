import { AbstractMassObject } from "./MassObject.js";
import { Util } from "../util/Util.js";
import { Vector } from "../util/Vector.js";
export var ShapeType;
(function (ShapeType) {
    ShapeType[ShapeType["RECTANGLE"] = 0] = "RECTANGLE";
    ShapeType[ShapeType["OVAL"] = 1] = "OVAL";
})(ShapeType || (ShapeType = {}));
;
export class PointMass extends AbstractMassObject {
    constructor(opt_name, opt_localName) {
        let name, localName;
        if (opt_name === undefined || opt_name == '') {
            const id = PointMass.ID++;
            name = PointMass.en.POINT_MASS + id;
            localName = PointMass.i18n.POINT_MASS + id;
        }
        else {
            name = opt_name;
            localName = opt_localName ? opt_localName : name;
        }
        super(name, localName);
        this.shape_ = ShapeType.OVAL;
        this.width_ = 1;
        this.height_ = 1;
        this.mass_ = 1;
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', shape_: ' + this.shape_
            + ', width_: ' + Util.NF(this.width_)
            + ', height_: ' + Util.NF(this.height_)
            + '}';
    }
    ;
    getClassName() {
        return 'PointMass';
    }
    ;
    static makeCircle(diameter, opt_name, opt_localName) {
        const p = new PointMass(opt_name, opt_localName);
        p.setWidth(diameter);
        p.setHeight(diameter);
        return p;
    }
    ;
    static makeOval(width, height, opt_name, opt_localName) {
        const p = new PointMass(opt_name, opt_localName);
        p.setWidth(width);
        p.setHeight(height);
        return p;
    }
    ;
    static makeSquare(width, opt_name, opt_localName) {
        const p = new PointMass(opt_name, opt_localName);
        p.setWidth(width);
        p.setHeight(width);
        p.setShape(ShapeType.RECTANGLE);
        return p;
    }
    ;
    static makeRectangle(width, height, opt_name, opt_localName) {
        const p = new PointMass(opt_name, opt_localName);
        p.setWidth(width);
        p.setHeight(height);
        p.setShape(ShapeType.RECTANGLE);
        return p;
    }
    ;
    createCanvasPath(context) {
        context.beginPath();
        const h = this.height_ / 2;
        const w = this.width_ / 2;
        if (this.shape_ == ShapeType.RECTANGLE) {
            context.rect(-w, -h, this.width_, this.height_);
        }
        else if (this.shape_ == ShapeType.OVAL) {
            if (typeof context.ellipse === 'function') {
                context.moveTo(w, 0);
                context.ellipse(0, 0, w, h, 0, 0, 2 * Math.PI, false);
            }
            else {
                const min = Math.min(w, h);
                context.arc(0, 0, min, 0, 2 * Math.PI, false);
                context.closePath();
            }
        }
        else {
            throw '';
        }
    }
    ;
    getBottomBody() {
        return -this.height_ / 2;
    }
    ;
    getCentroidBody() {
        return Vector.ORIGIN;
    }
    ;
    getCentroidRadius() {
        const w = this.width_ / 2;
        const h = this.height_ / 2;
        return Math.sqrt(w * w + h * h);
    }
    ;
    getLeftBody() {
        return -this.width_ / 2;
    }
    ;
    getMinHeight() {
        if (isNaN(this.minHeight_)) {
            const cmx = this.cm_body_.getX();
            const cmy = this.cm_body_.getY();
            let dist = cmy - this.getBottomBody();
            let d = cmx - this.getLeftBody();
            if (d < dist) {
                dist = d;
            }
            d = this.getTopBody() - cmy;
            if (d < dist) {
                dist = d;
            }
            d = this.getRightBody() - cmx;
            if (d < dist) {
                dist = d;
            }
            this.minHeight_ = dist;
        }
        return this.minHeight_;
    }
    ;
    getRightBody() {
        return this.width_ / 2;
    }
    ;
    getShape() {
        return this.shape_;
    }
    ;
    getTopBody() {
        return this.height_ / 2;
    }
    ;
    getVerticesBody() {
        const w = this.width_ / 2;
        const h = this.height_ / 2;
        return [new Vector(-w, -h), new Vector(w, -h), new Vector(w, h), new Vector(-w, h)];
    }
    ;
    setHeight(height) {
        this.height_ = height;
        this.setChanged();
    }
    ;
    setShape(shape) {
        this.shape_ = shape;
        this.setChanged();
    }
    ;
    setWidth(width) {
        this.width_ = width;
        this.setChanged();
    }
    ;
    similar(obj, opt_tolerance) {
        if (!(obj instanceof PointMass)) {
            return false;
        }
        const pm = obj;
        if (!pm.loc_world_.nearEqual(this.loc_world_, opt_tolerance))
            return false;
        if (Util.veryDifferent(pm.width_, this.width_, opt_tolerance)) {
            return false;
        }
        if (Util.veryDifferent(pm.height_, this.height_, opt_tolerance)) {
            return false;
        }
        if (pm.shape_ != this.shape_) {
            return false;
        }
        return true;
    }
    ;
}
PointMass.en = {
    POINT_MASS: 'PointMass'
};
PointMass.de_strings = {
    POINT_MASS: 'Punktmasse'
};
PointMass.i18n = Util.LOCALE === 'de' ? PointMass.de_strings : PointMass.en;
;
Util.defineGlobal('lab$model$PointMass', PointMass);
