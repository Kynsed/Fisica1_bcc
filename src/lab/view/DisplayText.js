import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class DisplayText {
    constructor(opt_text, opt_position, proto) {
        this.zIndex_ = 0;
        this.dragable_ = false;
        this.changed_ = true;
        this.text_ = opt_text ?? '';
        this.location_ = opt_position ?? Vector.ORIGIN;
        this.proto_ = proto ?? null;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', location: ' + this.location_
            + ', font: ' + this.getFont()
            + ', fillStyle: "' + this.getFillStyle() + '"'
            + ', textAlign: ' + this.getTextAlign()
            + ', textBaseline: ' + this.getTextBaseline()
            + ', zIndex: ' + this.getZIndex()
            + '}';
    }
    ;
    toStringShort() {
        return 'DisplayText{text_: ' + this.text_ + '}';
    }
    ;
    contains(_p_world) {
        return false;
    }
    ;
    draw(context, map) {
        context.save();
        context.fillStyle = this.getFillStyle();
        context.font = this.getFont();
        context.textAlign = this.getTextAlign();
        context.textBaseline = this.getTextBaseline();
        const x1 = map.simToScreenX(this.location_.getX());
        const y1 = map.simToScreenY(this.location_.getY());
        context.fillText(this.text_, x1, y1);
        context.restore();
    }
    ;
    getChanged() {
        if (this.changed_) {
            this.changed_ = false;
            return true;
        }
        return false;
    }
    ;
    getFillStyle() {
        if (this.fillStyle_ !== undefined) {
            return this.fillStyle_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getFillStyle();
        }
        else {
            return 'black';
        }
    }
    ;
    getFont() {
        if (this.font_ !== undefined) {
            return this.font_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getFont();
        }
        else {
            return '12pt sans-serif';
        }
    }
    ;
    getMassObjects() {
        return [];
    }
    ;
    getPosition() {
        return this.location_;
    }
    ;
    getSimObjects() {
        return [];
    }
    ;
    getTextAlign() {
        if (this.textAlign_ !== undefined) {
            return this.textAlign_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getTextAlign();
        }
        else {
            return 'left';
        }
    }
    ;
    getTextBaseline() {
        if (this.textBaseline_ !== undefined) {
            return this.textBaseline_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getTextBaseline();
        }
        else {
            return 'alphabetic';
        }
    }
    ;
    getText() {
        return this.text_;
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
        return this.dragable_;
    }
    ;
    setDragable(dragable) {
        this.dragable_ = dragable;
    }
    ;
    setFillStyle(value) {
        this.fillStyle_ = value;
        this.changed_ = true;
        return this;
    }
    ;
    setFont(value) {
        this.font_ = value;
        this.changed_ = true;
        return this;
    }
    ;
    setPosition(position) {
        this.location_ = Vector.clone(position);
        this.changed_ = true;
    }
    ;
    setText(text) {
        this.text_ = text;
        this.changed_ = true;
    }
    ;
    setTextAlign(value) {
        this.textAlign_ = value;
        this.changed_ = true;
        return this;
    }
    ;
    setTextBaseline(value) {
        this.textBaseline_ = value;
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
Util.defineGlobal('lab$view$DisplayText', DisplayText);
