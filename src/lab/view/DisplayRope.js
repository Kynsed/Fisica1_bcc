import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class DisplayRope {
    ;
    constructor(rope, proto) {
        this.changed_ = true;
        this.rope_ = rope ?? null;
        this.proto_ = proto ?? null;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', colorTight: "' + this.getColorTight() + '"'
            + ', colorSlack: "' + this.getColorSlack() + '"'
            + ', thickness: ' + Util.NF(this.getThickness())
            + ', zIndex: ' + this.getZIndex()
            + '}';
    }
    ;
    toStringShort() {
        return 'DisplayRope{rope_: ' +
            (this.rope_ != null ? this.rope_.toStringShort() : 'null') + '}';
    }
    ;
    contains(_p_world) {
        return false;
    }
    ;
    draw(context, map) {
        if (this.rope_ == null) {
            return;
        }
        const len = this.rope_.getLength();
        if (len < 1e-6) {
            return;
        }
        context.save();
        context.lineWidth = this.getThickness();
        const tight = this.rope_.isTight();
        const slack = tight ? 0 : this.rope_.getRestLength() - len;
        if (tight) {
            context.strokeStyle = this.getColorTight();
        }
        else {
            context.strokeStyle = this.getColorSlack();
        }
        let p1 = this.rope_.getStartPoint();
        let p2 = this.rope_.getEndPoint();
        if (tight) {
            p1 = map.simToScreen(p1);
            p2 = map.simToScreen(p2);
            context.beginPath();
            context.moveTo(p1.getX(), p1.getY());
            context.lineTo(p2.getX(), p2.getY());
            context.stroke();
        }
        else {
            let at = map.getAffineTransform();
            at = at.translate(p1.getX(), p1.getY());
            const theta = Math.atan2(p2.getY() - p1.getY(), p2.getX() - p1.getX());
            at = at.rotate(theta);
            at = at.scale(len / DisplayRope.pathLength, Math.max(2 * slack / DisplayRope.pathLength, 0.1));
            DisplayRope.drawRope(context, at);
        }
        context.restore();
    }
    ;
    static drawRope(context, at) {
        const ropeHeight = (x) => DisplayRope.pathWidth * Math.sin(Math.PI * x / DisplayRope.pathLength);
        const size = DisplayRope.pathLength;
        const t = DisplayRope.pathWidth / 2;
        const w = size / 16;
        context.beginPath();
        at.moveTo(0, 0, context);
        at.lineTo(w, -ropeHeight(w), context);
        at.lineTo(2 * w, ropeHeight(2 * w), context);
        for (let i = 1; i <= 3; i++) {
            let x = 4 * i * w;
            at.lineTo(x, -ropeHeight(x), context);
            x = (4 * i + 2) * w;
            at.lineTo(x, ropeHeight(x), context);
        }
        at.lineTo(15 * w, -ropeHeight(15 * w), context);
        at.lineTo(size, 0, context);
        context.stroke();
    }
    ;
    getChanged() {
        const chg = this.rope_ == null ? false : this.rope_.getChanged();
        if (chg || this.changed_) {
            this.changed_ = false;
            return true;
        }
        return false;
    }
    ;
    getColorSlack() {
        if (this.colorSlack_ !== undefined) {
            return this.colorSlack_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getColorSlack();
        }
        else {
            return 'green';
        }
    }
    ;
    getColorTight() {
        if (this.colorTight_ !== undefined) {
            return this.colorTight_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getColorTight();
        }
        else {
            return 'red';
        }
    }
    ;
    getMassObjects() {
        return [];
    }
    ;
    getPosition() {
        return this.rope_ == null ? Vector.ORIGIN :
            this.rope_.getStartPoint().add(this.rope_.getEndPoint()).multiply(0.5);
    }
    ;
    getSimObjects() {
        return this.rope_ == null ? [] : [this.rope_];
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
            return 3;
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
    setColorSlack(value) {
        this.colorSlack_ = value;
        this.changed_ = true;
        return this;
    }
    ;
    setColorTight(value) {
        this.colorTight_ = value;
        this.changed_ = true;
        return this;
    }
    ;
    setDragable(_dragable) {
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
DisplayRope.pathLength = 6.0;
DisplayRope.pathWidth = 0.5;
Util.defineGlobal('lab$view$DisplayRope', DisplayRope);
