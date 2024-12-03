import { AffineTransform } from "../util/AffineTransform.js";
import { PointMass } from "../model/PointMass.js";
import { Util } from "../util/Util.js";
export class DisplayShape {
    constructor(massObject, proto) {
        this.isDarkColor_ = false;
        this.changed_ = true;
        this.massObject_ = massObject ?? new PointMass('proto');
        this.proto_ = proto ?? null;
        this.dragable_ = isFinite(this.massObject_.getMass())
            && this.massObject_.getDragPoints().length > 0;
        this.lastColor_ = this.getFillStyle();
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', dragable_: ' + this.dragable_
            + ', fillStyle: "' + this.getFillStyle() + '"'
            + ', strokeStyle: "' + this.getStrokeStyle() + '"'
            + ', thickness: ' + Util.NF(this.getThickness())
            + ', drawDragPoints: ' + this.getDrawDragPoints()
            + ', drawCenterOfMass: ' + this.getDrawCenterOfMass()
            + ', nameFont: "' + this.getNameFont() + '"'
            + ', nameColor: "' + this.getNameColor() + '"'
            + ', nameRotate: ' + Util.NF(this.getNameRotate())
            + ', zIndex: ' + this.getZIndex()
            + ', proto: ' + (this.proto_ != null ? this.proto_.toStringShort() : 'null')
            + '}';
    }
    ;
    toStringShort() {
        return 'DisplayShape{massObject_: ' + this.massObject_.toStringShort() + '}';
    }
    ;
    contains(p_world) {
        const p_body = this.massObject_.worldToBody(p_world);
        return this.massObject_.getBoundsBody().contains(p_body);
    }
    ;
    draw(context, map) {
        context.save();
        const sim_to_screen = map.getAffineTransform();
        const sim_to_screen_units = 1 / map.getScaleX();
        const body_to_screen = sim_to_screen.concatenate(this.massObject_.bodyToWorldTransform());
        body_to_screen.setTransform(context);
        this.massObject_.createCanvasPath(context);
        if (this.getImageClip()) {
            context.clip();
        }
        const fillStyle = this.getFillStyle();
        if (fillStyle) {
            context.fillStyle = fillStyle;
            context.fill();
        }
        const strokeStyle = this.getStrokeStyle();
        if (strokeStyle) {
            context.lineWidth = map.screenToSimScaleX(this.getThickness());
            const borderDash = this.getBorderDash();
            if (borderDash.length > 0 && typeof context.setLineDash === 'function') {
                const ld = borderDash.map(n => map.screenToSimScaleX(n));
                context.setLineDash(ld);
            }
            context.strokeStyle = strokeStyle;
            context.stroke();
            context.setLineDash([]);
        }
        const image = this.getImage();
        const imageDraw = this.getImageDraw();
        if (image != null || imageDraw != null) {
            context.translate(this.massObject_.getLeftBody(), this.massObject_.getTopBody());
            context.scale(sim_to_screen_units, -sim_to_screen_units);
            this.getImageAT().applyTransform(context);
            if (image != null) {
                context.drawImage(image, 0, 0);
            }
            if (imageDraw != null) {
                imageDraw(context);
            }
        }
        if (this.massObject_.getMass() != Infinity) {
            body_to_screen.setTransform(context);
            if (this.lastColor_ !== fillStyle) {
                this.lastColor_ = fillStyle;
            }
            const pixel = map.screenToSimScaleX(1);
            context.lineWidth = pixel;
            if (this.getDrawCenterOfMass()) {
                const cm_body = this.massObject_.getCenterOfMass();
                if (this.isDarkColor_) {
                    context.strokeStyle = '#ccc';
                }
                else {
                    context.strokeStyle = 'black';
                }
                let len = 0.2 * Math.min(this.massObject_.getWidth(), this.massObject_.getHeight());
                const max_len = 8 * pixel;
                if (len > max_len) {
                    len = max_len;
                }
                context.beginPath();
                context.moveTo(cm_body.getX() - len, cm_body.getY());
                context.lineTo(cm_body.getX() + len, cm_body.getY());
                context.stroke();
                context.beginPath();
                context.moveTo(cm_body.getX(), cm_body.getY() - len);
                context.lineTo(cm_body.getX(), cm_body.getY() + len);
                context.stroke();
            }
            if (this.getDrawDragPoints()) {
                let d = 4 * pixel;
                const sz = 0.15 * Math.min(this.massObject_.getWidth(), this.massObject_.getHeight());
                if (sz < d) {
                    d = sz;
                }
                this.massObject_.getDragPoints().forEach(dpt => {
                    if (this.isDarkColor_) {
                        context.fillStyle = '#ccc';
                    }
                    else {
                        context.fillStyle = 'gray';
                    }
                    context.beginPath();
                    context.arc(dpt.getX(), dpt.getY(), d, 0, 2 * Math.PI, false);
                    context.closePath();
                    context.fill();
                });
            }
        }
        if (this.getNameFont()) {
            const cen = this.massObject_.getCentroidBody();
            let at = body_to_screen.translate(cen);
            const nameRotate = this.getNameRotate();
            if (nameRotate) {
                at = at.rotate(nameRotate);
            }
            at = at.scale(sim_to_screen_units, -sim_to_screen_units);
            at.setTransform(context);
            context.fillStyle = this.getNameColor();
            context.font = this.getNameFont();
            context.textAlign = 'center';
            const tx = this.massObject_.getName(true);
            const ht = context.measureText('M').width;
            context.fillText(tx, 0, ht / 2);
        }
        context.restore();
    }
    ;
    getBorderDash() {
        if (this.borderDash_ !== undefined) {
            return this.borderDash_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getBorderDash();
        }
        else {
            return [];
        }
    }
    ;
    getChanged() {
        if (this.massObject_.getChanged() || this.changed_) {
            this.changed_ = false;
            return true;
        }
        return false;
    }
    ;
    getDrawCenterOfMass() {
        if (this.drawCenterOfMass_ !== undefined) {
            return this.drawCenterOfMass_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getDrawCenterOfMass();
        }
        else {
            return false;
        }
    }
    ;
    getDrawDragPoints() {
        if (this.drawDragPoints_ !== undefined) {
            return this.drawDragPoints_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getDrawDragPoints();
        }
        else {
            return false;
        }
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
            return 'lightGray';
        }
    }
    ;
    getImage() {
        if (this.image_ !== undefined) {
            return this.image_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getImage();
        }
        else {
            return null;
        }
    }
    ;
    getImageAT() {
        if (this.imageAT_ !== undefined) {
            return this.imageAT_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getImageAT();
        }
        else {
            return AffineTransform.IDENTITY;
        }
    }
    ;
    getImageClip() {
        if (this.imageClip_ !== undefined) {
            return this.imageClip_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getImageClip();
        }
        else {
            return false;
        }
    }
    ;
    getImageDraw() {
        if (this.imageDraw_ !== undefined) {
            return this.imageDraw_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getImageDraw();
        }
        else {
            return null;
        }
    }
    ;
    getMassObjects() {
        return [this.massObject_];
    }
    ;
    getNameColor() {
        if (this.nameColor_ !== undefined) {
            return this.nameColor_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getNameColor();
        }
        else {
            return 'black';
        }
    }
    ;
    getNameFont() {
        if (this.nameFont_ !== undefined) {
            return this.nameFont_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getNameFont();
        }
        else {
            return '';
        }
    }
    ;
    getNameRotate() {
        if (this.nameRotate_ !== undefined) {
            return this.nameRotate_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getNameRotate();
        }
        else {
            return 0;
        }
    }
    ;
    getPosition() {
        return this.massObject_.getPosition();
    }
    ;
    getPrototype() {
        return this.proto_;
    }
    ;
    getSimObjects() {
        return [this.massObject_];
    }
    ;
    getStrokeStyle() {
        if (this.strokeStyle_ !== undefined) {
            return this.strokeStyle_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getStrokeStyle();
        }
        else {
            return '';
        }
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
            return 1;
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
        return this.dragable_;
    }
    ;
    setBorderDash(value) {
        this.borderDash_ = value;
        this.changed_ = true;
    }
    ;
    setDragable(dragable) {
        this.dragable_ = dragable;
    }
    ;
    setDrawCenterOfMass(value) {
        this.drawCenterOfMass_ = value;
        this.changed_ = true;
    }
    ;
    setDrawDragPoints(value) {
        this.drawDragPoints_ = value;
        this.changed_ = true;
    }
    ;
    setFillStyle(value) {
        this.fillStyle_ = value;
        this.changed_ = true;
    }
    ;
    setImage(value) {
        this.image_ = value;
        this.changed_ = true;
    }
    ;
    setImageAT(value) {
        this.imageAT_ = value;
        this.changed_ = true;
    }
    ;
    setImageClip(value) {
        this.imageClip_ = value;
        this.changed_ = true;
    }
    ;
    setImageDraw(value) {
        this.imageDraw_ = value;
        this.changed_ = true;
    }
    ;
    setNameColor(value) {
        this.nameColor_ = value;
        this.changed_ = true;
    }
    ;
    setNameFont(value) {
        this.nameFont_ = value;
        this.changed_ = true;
    }
    ;
    setNameRotate(value) {
        this.nameRotate_ = value;
        this.changed_ = true;
    }
    ;
    setPosition(position) {
        this.massObject_.setPosition(position);
        this.changed_ = true;
    }
    ;
    setPrototype(value) {
        this.proto_ = value;
    }
    ;
    setStrokeStyle(value) {
        this.strokeStyle_ = value;
        this.changed_ = true;
    }
    ;
    setThickness(value) {
        this.thickness_ = value;
        this.changed_ = true;
    }
    ;
    setZIndex(zIndex) {
        this.zIndex_ = zIndex;
        this.changed_ = true;
    }
    ;
}
;
Util.defineGlobal('lab$view$DisplayShape', DisplayShape);
