import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class DisplayClock {
    constructor(simTimeFn, realTimeFn, period, radius, location) {
        this.dragable_ = true;
        this.font_ = '14pt sans-serif';
        this.textColor_ = 'blue';
        this.handColor_ = 'blue';
        this.realColor_ = 'red';
        this.handWidth_ = 1;
        this.outlineWidth_ = 1;
        this.outlineColor_ = 'black';
        this.fillStyle_ = 'rgba(255, 255, 255, 0.75)';
        this.zIndex_ = 0;
        this.changed_ = true;
        this.lastSimTime_ = 0;
        this.simTimeFn_ = simTimeFn;
        this.realTimeFn_ = realTimeFn;
        this.period_ = period ?? 2.0;
        this.radius_ = radius ?? 1.0;
        this.location_ = location ?? Vector.ORIGIN;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', radius: ' + Util.NF(this.radius_)
            + ', period: ' + Util.NF(this.period_)
            + ', location_: ' + this.location_
            + ', zIndex: ' + this.zIndex_
            + '}';
    }
    ;
    toStringShort() {
        return 'DisplayClock{' + 'time: ' + Util.NF(this.simTimeFn_()) + '}';
    }
    ;
    contains(p_world) {
        return p_world.distanceTo(this.location_) <= this.radius_;
    }
    ;
    draw(context, map) {
        const center = map.simToScreen(this.location_);
        const r = map.simToScreenScaleX(this.radius_);
        context.save();
        context.beginPath();
        context.arc(center.getX(), center.getY(), r, 0, 2 * Math.PI, false);
        context.closePath();
        context.lineWidth = this.outlineWidth_;
        context.strokeStyle = this.outlineColor_;
        context.stroke();
        context.fillStyle = this.fillStyle_;
        context.fill();
        const time = this.simTimeFn_();
        this.lastSimTime_ = time;
        const realTime = this.realTimeFn_();
        this.drawHand(context, map, this.handColor_, time, center);
        this.drawHand(context, map, this.realColor_, realTime, center);
        const tx = time.toFixed(3);
        context.fillStyle = this.textColor_;
        context.font = this.font_;
        context.textAlign = 'center';
        context.fillText(tx, center.getX(), center.getY());
        context.restore();
    }
    ;
    drawHand(context, map, color, time, center) {
        time = time - this.period_ * Math.floor(time / this.period_);
        const fraction = time / this.period_;
        const endx = map.simToScreenScaleX(this.radius_ * Math.sin(2 * Math.PI * fraction));
        const endy = map.simToScreenScaleY(this.radius_ * Math.cos(2 * Math.PI * fraction));
        context.lineWidth = this.handWidth_;
        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(center.getX(), center.getY());
        context.lineTo(center.getX() + endx, center.getY() - endy);
        context.stroke();
    }
    ;
    isDragable() {
        return this.dragable_;
    }
    ;
    getChanged() {
        if (this.simTimeFn_() != this.lastSimTime_ || this.changed_) {
            this.changed_ = false;
            return true;
        }
        return false;
    }
    ;
    getFillStyle() {
        return this.fillStyle_;
    }
    ;
    getFont() {
        return this.font_;
    }
    ;
    getHandColor() {
        return this.handColor_;
    }
    ;
    getHandWidth() {
        return this.handWidth_;
    }
    ;
    getMassObjects() {
        return [];
    }
    ;
    getOutlineColor() {
        return this.outlineColor_;
    }
    ;
    getOutlineWidth() {
        return this.outlineWidth_;
    }
    ;
    getPosition() {
        return this.location_;
    }
    ;
    getRealColor() {
        return this.realColor_;
    }
    ;
    getSimObjects() {
        return [];
    }
    ;
    getTextColor() {
        return this.textColor_;
    }
    ;
    getZIndex() {
        return this.zIndex_;
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
    setHandColor(value) {
        this.handColor_ = value;
        this.changed_ = true;
        return this;
    }
    ;
    setHandWidth(value) {
        this.handWidth_ = value;
        this.changed_ = true;
        return this;
    }
    ;
    setOutlineColor(value) {
        this.outlineColor_ = value;
        this.changed_ = true;
        return this;
    }
    ;
    setOutlineWidth(value) {
        this.outlineWidth_ = value;
        this.changed_ = true;
        return this;
    }
    ;
    setPosition(position) {
        this.location_ = Vector.clone(position);
        this.changed_ = true;
    }
    ;
    setRealColor(value) {
        this.realColor_ = value;
        this.changed_ = true;
        return this;
    }
    ;
    setTextColor(value) {
        this.textColor_ = value;
        this.changed_ = true;
        return this;
    }
    ;
    setZIndex(zIndex) {
        this.zIndex_ = zIndex !== undefined ? zIndex : 0;
        this.changed_ = true;
    }
    ;
}
DisplayClock.en = {
    SHOW_CLOCK: 'show clock'
};
DisplayClock.de_strings = {
    SHOW_CLOCK: 'Zeit anzeigen'
};
DisplayClock.i18n = Util.LOCALE === 'de' ? DisplayClock.de_strings :
    DisplayClock.en;
Util.defineGlobal('lab$view$DisplayClock', DisplayClock);
