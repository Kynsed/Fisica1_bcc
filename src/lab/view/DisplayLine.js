import { ConcreteLine } from '../model/ConcreteLine.js';
import { Util } from '../util/Util.js';
export class DisplayLine {
    constructor(line, proto) {
        this.changed_ = true;
        this.line_ = line ?? new ConcreteLine('proto');
        this.scale_ = 1.0;
        this.proto_ = proto ?? null;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', scale_: ' + Util.NF(this.scale_)
            + ', thickness: ' + Util.NF(this.getThickness())
            + ', color: "' + this.getColor() + '"'
            + ', lineDash: [' + this.getLineDash() + ']'
            + ', zIndex: ' + this.getZIndex()
            + ', proto: ' + (this.proto_ != null ? this.proto_.toStringShort() : 'null')
            + '}';
    }
    ;
    toStringShort() {
        return 'DisplayLine{line_: ' + this.line_.toStringShort() + '}';
    }
    ;
    contains(_p_world) {
        return false;
    }
    ;
    draw(context, map) {
        const thickness = this.getThickness();
        if (thickness > 0) {
            let p1 = this.line_.getStartPoint();
            let p2;
            if (this.scale_ == 1.0) {
                p2 = this.line_.getEndPoint();
            }
            else {
                const v = this.line_.getVector();
                p2 = p1.add(v.multiply(this.scale_));
            }
            p1 = map.simToScreen(p1);
            p2 = map.simToScreen(p2);
            const len = p1.distanceTo(p2);
            if (len < 1e-6)
                return;
            context.save();
            const lineDash = this.getLineDash();
            if (lineDash.length > 0 && context.setLineDash) {
                context.setLineDash(lineDash);
            }
            context.lineWidth = this.getThickness();
            context.strokeStyle = this.getColor();
            context.beginPath();
            context.moveTo(p1.getX(), p1.getY());
            context.lineTo(p2.getX(), p2.getY());
            context.stroke();
            context.restore();
        }
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
    getChanged() {
        if (this.line_.getChanged() || this.changed_) {
            this.changed_ = false;
            return true;
        }
        return false;
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
            return [];
        }
    }
    ;
    getMassObjects() {
        return [];
    }
    ;
    getPosition() {
        return this.line_.getStartPoint().add(this.line_.getEndPoint()).multiply(0.5);
    }
    ;
    getScale() {
        return this.scale_;
    }
    ;
    getSimObjects() {
        return [this.line_];
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
    setColor(color) {
        this.color_ = color;
        this.changed_ = true;
        return this;
    }
    ;
    setDragable(_dragable) {
    }
    ;
    setLineDash(lineDash) {
        this.lineDash_ = lineDash;
        this.changed_ = true;
        return this;
    }
    ;
    setPosition(_position) {
    }
    ;
    setScale(scale) {
        this.scale_ = scale;
        return this;
    }
    ;
    setThickness(thickness) {
        this.thickness_ = thickness;
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
Util.defineGlobal('lab$view$DisplayLine', DisplayLine);
