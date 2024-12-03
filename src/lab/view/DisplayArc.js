import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class DisplayArc {
    constructor(arc, proto) {
        this.changed_ = true;
        this.arc_ = arc ?? null;
        this.proto_ = proto ?? null;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', thickness: ' + Util.NF(this.getThickness())
            + ', arrowHeadLength: ' + Util.NF(this.getArrowHeadLength())
            + ', color: "' + this.getColor() + '"'
            + ', lineDash: [' + this.getLineDash() + ']'
            + ', zIndex: ' + this.getZIndex()
            + '}';
    }
    ;
    toStringShort() {
        return 'DisplayArc{arc_: ' +
            (this.arc_ != null ? this.arc_.toStringShort() : 'null') + '}';
    }
    ;
    contains(_p_world) {
        return false;
    }
    ;
    draw(context, map) {
        if (this.arc_ == null) {
            return;
        }
        const centerX = map.simToScreenX(this.arc_.getCenter().getX());
        const centerY = map.simToScreenY(this.arc_.getCenter().getY());
        const r = map.simToScreenScaleX(this.arc_.getRadius());
        const angle = this.arc_.getAngle();
        if ((angle != 0) && (r > 0)) {
            context.save();
            context.lineWidth = this.getThickness();
            context.strokeStyle = this.getColor();
            const lineDash = this.getLineDash();
            if (lineDash.length > 0 && context.setLineDash) {
                context.setLineDash(lineDash);
            }
            const startAngle = -this.arc_.getStartAngle();
            const endAngle = -(this.arc_.getStartAngle() + angle);
            context.beginPath();
            context.arc(centerX, centerY, r, startAngle, endAngle, angle > 0);
            context.stroke();
            let x, y;
            let a0, a1, a;
            a0 = this.arc_.getStartAngle();
            a1 = this.arc_.getAngle();
            a = -(a0 + a1);
            x = this.arc_.getCenter().getX() + this.arc_.getRadius() * Math.cos(a);
            y = this.arc_.getCenter().getY() - this.arc_.getRadius() * Math.sin(a);
            let h = Math.min(this.getArrowHeadLength(), 0.5 * this.arc_.getRadius());
            if (a1 > 0) {
                h = -h;
            }
            let xp, yp;
            xp = x - h * Math.cos(Math.PI / 2 + a - Math.PI / 6);
            yp = y + h * Math.sin(Math.PI / 2 + a - Math.PI / 6);
            const x1 = map.simToScreenX(x);
            const y1 = map.simToScreenY(y);
            let x2 = map.simToScreenX(xp);
            let y2 = map.simToScreenY(yp);
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();
            xp = x - h * Math.cos(Math.PI / 2 + a + Math.PI / 6);
            yp = y + h * Math.sin(Math.PI / 2 + a + Math.PI / 6);
            x2 = map.simToScreenX(xp);
            y2 = map.simToScreenY(yp);
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();
            context.restore();
        }
    }
    ;
    getArrowHeadLength() {
        if (this.arrowHeadLength_ !== undefined) {
            return this.arrowHeadLength_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getArrowHeadLength();
        }
        else {
            return 0.2;
        }
    }
    ;
    getChanged() {
        const chg = this.arc_ == null ? false : this.arc_.getChanged();
        if (chg || this.changed_) {
            this.changed_ = false;
            return true;
        }
        return false;
    }
    ;
    getColor() {
        if (this.color_ !== undefined) {
            return this.color_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getColor();
        }
        else {
            return 'gray';
        }
    }
    ;
    getLineDash() {
        if (this.lineDash_ !== undefined) {
            return this.lineDash_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getLineDash();
        }
        else {
            return [3, 5];
        }
    }
    ;
    getMassObjects() {
        return [];
    }
    ;
    getPosition() {
        return this.arc_ == null ? Vector.ORIGIN : this.arc_.getCenter();
    }
    ;
    getSimObjects() {
        return this.arc_ == null ? [] : [this.arc_];
    }
    ;
    getThickness() {
        if (this.thickness_ !== undefined) {
            return this.thickness_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getThickness();
        }
        else {
            return 4.0;
        }
    }
    ;
    getZIndex() {
        if (this.zIndex_ !== undefined) {
            return this.zIndex_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getZIndex();
        }
        else {
            return 0;
        }
    }
    ;
    isDragable() {
        return false;
    }
    ;
    setArrowHeadLength(value) {
        this.arrowHeadLength_ = value;
        this.changed_ = true;
        return this;
    }
    ;
    setColor(value) {
        this.color_ = value;
        this.changed_ = true;
        return this;
    }
    ;
    setDragable(_dragable) {
    }
    ;
    setLineDash(value) {
        this.lineDash_ = value;
        this.changed_ = true;
        return this;
    }
    ;
    setPosition(_position) {
    }
    ;
    setThickness(value) {
        this.thickness_ = value;
        this.changed_ = true;
        return this;
    }
    ;
    setZIndex(zIndex) {
        this.zIndex_ = zIndex;
        this.changed_ = true;
    }
    ;
}
Util.defineGlobal('lab$view$DisplayArc', DisplayArc);
