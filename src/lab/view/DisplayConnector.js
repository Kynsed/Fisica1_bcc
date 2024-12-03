import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class DisplayConnector {
    constructor(connector, proto) {
        this.changed_ = true;
        this.connector_ = connector ?? null;
        this.proto_ = proto ?? null;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', radius: ' + Util.NF5(this.getRadius())
            + ', color: "' + this.getColor() + '"'
            + ', zIndex: ' + this.getZIndex()
            + ', proto: ' + (this.proto_ != null ? this.proto_.toStringShort() : 'null')
            + '}';
    }
    ;
    toStringShort() {
        return 'DisplayConnector{connector_: ' +
            (this.connector_ != null ? this.connector_.toStringShort() : 'null') + '}';
    }
    ;
    contains(_p_world) {
        return false;
    }
    ;
    draw(context, map) {
        if (this.connector_ == null) {
            return;
        }
        context.save();
        context.fillStyle = this.getColor();
        const p = map.simToScreen(this.getPosition());
        context.translate(p.getX(), p.getY());
        context.beginPath();
        context.arc(0, 0, this.getRadius(), 0, 2 * Math.PI, false);
        context.closePath();
        context.fill();
        context.restore();
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
            return 'blue';
        }
    }
    ;
    getChanged() {
        const chg = this.connector_ === null ? false : this.connector_.getChanged();
        if (chg || this.changed_) {
            this.changed_ = false;
            return true;
        }
        return false;
    }
    ;
    getMassObjects() {
        return [];
    }
    ;
    getPosition() {
        return this.connector_ === null ? Vector.ORIGIN : this.connector_.getPosition1();
    }
    ;
    getRadius() {
        if (this.radius_ !== undefined) {
            return this.radius_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getRadius();
        }
        else {
            return 2;
        }
    }
    ;
    getSimObjects() {
        return this.connector_ === null ? [] : [this.connector_];
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
            return 10;
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
    setPosition(_position) {
    }
    ;
    setRadius(value) {
        this.radius_ = value;
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
Util.defineGlobal('lab$view$DisplayConnector', DisplayConnector);
