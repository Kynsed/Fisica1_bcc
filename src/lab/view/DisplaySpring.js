import { Util } from "../util/Util.js";
import { Vector } from "../util/Vector.js";
export class DisplaySpring {
    constructor(spring, proto) {
        this.changed_ = true;
        this.spring_ = spring ?? null;
        this.proto_ = proto ?? null;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', width: ' + Util.NF(this.getWidth())
            + ', colorCompressed: "' + this.getColorCompressed() + '"'
            + ', colorExpanded: "' + this.getColorExpanded() + '"'
            + ', thickness: ' + Util.NF(this.getThickness())
            + ', drawMode: ' + this.getDrawMode()
            + ', zIndex: ' + this.getZIndex()
            + '}';
    }
    ;
    toStringShort() {
        return 'DisplaySpring{spring_: ' +
            (this.spring_ != null ? this.spring_.toStringShort() : 'null') + '}';
    }
    ;
    contains(_p_world) {
        return false;
    }
    ;
    draw(context, map) {
        if (this.spring_ == null) {
            return;
        }
        const len = this.spring_.getLength();
        if (len < 1e-6 || this.spring_.getStiffness() == 0) {
            return;
        }
        context.save();
        context.lineWidth = this.getThickness();
        if (len < this.spring_.getRestLength() - 0.00001) {
            context.strokeStyle = this.getColorCompressed();
        }
        else {
            context.strokeStyle = this.getColorExpanded();
        }
        if (this.getDrawMode() === DisplaySpring.JAGGED) {
            let at = map.getAffineTransform();
            const p1 = this.spring_.getStartPoint();
            const p2 = this.spring_.getEndPoint();
            at = at.translate(p1.getX(), p1.getY());
            const theta = Math.atan2(p2.getY() - p1.getY(), p2.getX() - p1.getX());
            at = at.rotate(theta);
            at = at.scale(len / DisplaySpring.pathLength, this.getWidth() / 0.5);
            DisplaySpring.drawSpring(context, at);
        }
        else {
            const p1 = map.simToScreen(this.spring_.getStartPoint());
            const p2 = map.simToScreen(this.spring_.getEndPoint());
            context.beginPath();
            context.moveTo(p1.getX(), p1.getY());
            context.lineTo(p2.getX(), p2.getY());
            context.stroke();
        }
        context.restore();
    }
    ;
    static drawSpring(context, at) {
        const size = DisplaySpring.pathLength;
        const t = DisplaySpring.pathWidth / 2;
        const w = size / 16;
        context.beginPath();
        at.moveTo(0, 0, context);
        at.lineTo(w, 0, context);
        at.lineTo(2 * w, t, context);
        for (let i = 1; i <= 3; i++) {
            at.lineTo(4 * i * w, -t, context);
            at.lineTo((4 * i + 2) * w, t, context);
        }
        at.lineTo(15 * w, 0, context);
        at.lineTo(size, 0, context);
        context.stroke();
    }
    ;
    getChanged() {
        const chg = this.spring_ == null ? false : this.spring_.getChanged();
        if (chg || this.changed_) {
            this.changed_ = false;
            return true;
        }
        return false;
    }
    ;
    getColorCompressed() {
        if (this.colorCompressed_ !== undefined) {
            return this.colorCompressed_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getColorCompressed();
        }
        else {
            return 'red';
        }
    }
    ;
    getColorExpanded() {
        if (this.colorExpanded_ !== undefined) {
            return this.colorExpanded_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getColorExpanded();
        }
        else {
            return 'green';
        }
    }
    ;
    getDrawMode() {
        if (this.drawMode_ !== undefined) {
            return this.drawMode_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getDrawMode();
        }
        else {
            return DisplaySpring.JAGGED;
        }
    }
    ;
    getMassObjects() {
        return [];
    }
    ;
    getPosition() {
        return this.spring_ == null ? Vector.ORIGIN :
            this.spring_.getStartPoint().add(this.spring_.getEndPoint()).multiply(0.5);
    }
    ;
    getPrototype() {
        return this.proto_;
    }
    ;
    getSimObjects() {
        return this.spring_ == null ? [] : [this.spring_];
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
    getWidth() {
        if (this.width_ !== undefined) {
            return this.width_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getWidth();
        }
        else {
            return 0.5;
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
    setColorCompressed(colorCompressed) {
        this.colorCompressed_ = colorCompressed;
        this.changed_ = true;
        return this;
    }
    ;
    setColorExpanded(colorExpanded) {
        this.colorExpanded_ = colorExpanded;
        this.changed_ = true;
        return this;
    }
    ;
    setDragable(_dragable) {
    }
    ;
    setDrawMode(drawMode) {
        this.drawMode_ = drawMode;
        this.changed_ = true;
        return this;
    }
    ;
    setPosition(_position) {
    }
    ;
    setPrototype(value) {
        this.proto_ = value;
        return this;
    }
    ;
    setThickness(thickness) {
        this.thickness_ = thickness;
        this.changed_ = true;
        return this;
    }
    ;
    setWidth(width) {
        this.width_ = width;
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
DisplaySpring.JAGGED = 1;
DisplaySpring.STRAIGHT = 2;
DisplaySpring.pathLength = 6.0;
DisplaySpring.pathWidth = 0.5;
Util.defineGlobal('lab$view$DisplaySpring', DisplaySpring);
