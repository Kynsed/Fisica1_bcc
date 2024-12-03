import { AbstractSubject } from "../util/AbstractSubject.js";
import { ConcreteMemoList } from "../util/ConcreteMemoList.js";
import { CoordMap } from "./CoordMap.js";
import { HorizAlignValues, HorizAlignChoices } from "./HorizAlign.js";
import { VerticalAlignValues, VerticalAlignChoices } from "./VerticalAlign.js";
import { DisplayList } from "./DisplayList.js";
import { DoubleRect } from "../util/DoubleRect.js";
import { GenericEvent, ParameterBoolean, ParameterNumber, ParameterString } from "../util/Observe.js";
import { ScreenRect } from "./ScreenRect.js";
import { Util } from "../util/Util.js";
export class SimView extends AbstractSubject {
    constructor(name, simRect) {
        super(name);
        this.panY = 0.05;
        this.panX = 0.05;
        this.zoom = 1.1;
        this.screenRect_ = new ScreenRect(0, 0, 800, 600);
        this.horizAlign_ = "MIDDLE";
        this.verticalAlign_ = "MIDDLE";
        this.aspectRatio_ = 1.0;
        this.displayList_ = new DisplayList();
        this.scaleTogether_ = true;
        this.opaqueness = 1.0;
        this.changed_ = true;
        this.memoList_ = new ConcreteMemoList();
        if (!(simRect instanceof DoubleRect))
            throw 'not a DoubleRect ' + simRect;
        if (simRect.isEmpty())
            throw 'empty DoubleRect ' + simRect;
        this.simRect_ = simRect;
        this.coordMap_ = CoordMap.make(this.screenRect_, this.simRect_, this.horizAlign_, this.verticalAlign_, this.aspectRatio_);
        this.width_ = simRect.getWidth();
        this.height_ = simRect.getHeight();
        this.centerX_ = simRect.getCenterX();
        this.centerY_ = simRect.getCenterY();
        this.ratio_ = this.height_ / this.width_;
        this.addParameter(new ParameterNumber(this, SimView.en.WIDTH, SimView.i18n.WIDTH, () => this.getWidth(), a => this.setWidth(a)));
        this.addParameter(new ParameterNumber(this, SimView.en.HEIGHT, SimView.i18n.HEIGHT, () => this.getHeight(), a => this.setHeight(a)));
        this.addParameter(new ParameterNumber(this, SimView.en.CENTER_X, SimView.i18n.CENTER_X, () => this.getCenterX(), a => this.setCenterX(a))
            .setLowerLimit(Number.NEGATIVE_INFINITY));
        this.addParameter(new ParameterNumber(this, SimView.en.CENTER_Y, SimView.i18n.CENTER_Y, () => this.getCenterY(), a => this.setCenterY(a))
            .setLowerLimit(Number.NEGATIVE_INFINITY));
        this.addParameter(new ParameterBoolean(this, SimView.en.SCALE_TOGETHER, SimView.i18n.SCALE_TOGETHER, () => this.getScaleTogether(), a => this.setScaleTogether(a)));
        this.addParameter(new ParameterString(this, SimView.en.VERTICAL_ALIGN, SimView.i18n.VERTICAL_ALIGN, () => this.getVerticalAlign(), s => this.setVerticalAlign(s), VerticalAlignChoices(), VerticalAlignValues()));
        this.addParameter(new ParameterString(this, SimView.en.HORIZONTAL_ALIGN, SimView.i18n.HORIZONTAL_ALIGN, () => this.getHorizAlign(), s => this.setHorizAlign(s), HorizAlignChoices(), HorizAlignValues()));
        this.addParameter(new ParameterNumber(this, SimView.en.ASPECT_RATIO, SimView.i18n.ASPECT_RATIO, () => this.getAspectRatio(), a => this.setAspectRatio(a)));
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', simRect_: ' + this.simRect_
            + ', screenRect_: ' + this.screenRect_
            + ', horizAlign_: ' + this.horizAlign_
            + ', verticalAlign_: ' + this.verticalAlign_
            + ', aspectRatio_: ' + Util.NF5(this.aspectRatio_)
            + ', opaqueness: ' + Util.NF5(this.opaqueness)
            + ', coordMap_: ' + this.coordMap_
            + ', memoList_: ' + this.memoList_
            + super.toString();
    }
    ;
    toStringShort() {
        return super.toStringShort().slice(0, -1)
            + ', displayList_: ' + this.displayList_.toStringShort() + '}';
    }
    ;
    getClassName() {
        return 'SimView';
    }
    ;
    addMemo(memorizable) {
        this.memoList_.addMemo(memorizable);
    }
    ;
    gainFocus() { }
    ;
    getAspectRatio() {
        return this.aspectRatio_;
    }
    ;
    getCenterX() {
        return this.centerX_;
    }
    ;
    getCenterY() {
        return this.centerY_;
    }
    ;
    getChanged() {
        const c = this.displayList_.getChanged();
        if (c || this.changed_) {
            this.changed_ = false;
            return true;
        }
        return false;
    }
    ;
    getCoordMap() {
        return this.coordMap_;
    }
    ;
    getDisplayList() {
        return this.displayList_;
    }
    ;
    getHeight() {
        return this.height_;
    }
    ;
    getHorizAlign() {
        return this.horizAlign_;
    }
    ;
    getMemos() {
        return this.memoList_.getMemos();
    }
    ;
    getScaleTogether() {
        return this.scaleTogether_;
    }
    ;
    getScreenRect() {
        return this.screenRect_;
    }
    ;
    getSimRect() {
        return this.simRect_;
    }
    ;
    getVerticalAlign() {
        return this.verticalAlign_;
    }
    ;
    getWidth() {
        return this.width_;
    }
    ;
    loseFocus() { }
    ;
    memorize() {
        this.memoList_.memorize();
    }
    ;
    modifySimRect() {
        const left = this.centerX_ - this.width_ / 2.0;
        const bottom = this.centerY_ - this.height_ / 2.0;
        const r = new DoubleRect(left, bottom, left + this.width_, bottom + this.height_);
        this.changed_ = true;
        this.setSimRect(r);
    }
    ;
    paint(context) {
        context.save();
        context.globalAlpha = this.opaqueness;
        this.displayList_.draw(context, this.coordMap_);
        context.restore();
    }
    ;
    panDown() {
        this.setCenterY(this.centerY_ - this.panY * this.height_);
    }
    ;
    panLeft() {
        this.setCenterX(this.centerX_ - this.panX * this.width_);
    }
    ;
    panRight() {
        this.setCenterX(this.centerX_ + this.panX * this.width_);
    }
    ;
    panUp() {
        this.setCenterY(this.centerY_ + this.panY * this.height_);
    }
    ;
    realign() {
        this.setCoordMap(CoordMap.make(this.screenRect_, this.simRect_, this.horizAlign_, this.verticalAlign_, this.aspectRatio_));
        this.width_ = this.simRect_.getWidth();
        this.height_ = this.simRect_.getHeight();
        this.centerX_ = this.simRect_.getCenterX();
        this.centerY_ = this.simRect_.getCenterY();
        this.ratio_ = this.height_ / this.width_;
        this.changed_ = true;
    }
    ;
    removeMemo(memorizable) {
        this.memoList_.removeMemo(memorizable);
    }
    ;
    setAspectRatio(aspectRatio) {
        if (Util.veryDifferent(this.aspectRatio_, aspectRatio)) {
            this.aspectRatio_ = aspectRatio;
            this.realign();
            this.broadcastParameter(SimView.en.ASPECT_RATIO);
        }
    }
    ;
    setCenterX(value) {
        if (Util.veryDifferent(this.centerX_, value)) {
            this.centerX_ = value;
            this.modifySimRect();
        }
    }
    ;
    setCenterY(value) {
        if (Util.veryDifferent(this.centerY_, value)) {
            this.centerY_ = value;
            this.modifySimRect();
        }
    }
    ;
    setCoordMap(map) {
        if (!(map instanceof CoordMap))
            throw 'not a CoordMap: ' + map;
        this.coordMap_ = map;
        this.changed_ = true;
        this.broadcast(new GenericEvent(this, SimView.COORD_MAP_CHANGED));
    }
    ;
    setHeight(value) {
        if (Util.veryDifferent(this.height_, value)) {
            this.height_ = value;
            if (this.scaleTogether_) {
                this.width_ = this.height_ / this.ratio_;
            }
            this.modifySimRect();
        }
    }
    ;
    setHorizAlign(alignHoriz) {
        if (!HorizAlignValues().includes(alignHoriz)) {
            throw "invalid HorizAlign " + alignHoriz;
        }
        this.horizAlign_ = alignHoriz;
        this.realign();
        this.broadcastParameter(SimView.en.HORIZONTAL_ALIGN);
    }
    ;
    setScaleTogether(value) {
        if (this.scaleTogether_ != value) {
            this.scaleTogether_ = value;
            if (this.scaleTogether_) {
                this.ratio_ = this.height_ / this.width_;
            }
            this.changed_ = true;
            this.broadcastParameter(SimView.en.SCALE_TOGETHER);
        }
    }
    ;
    setScreenRect(screenRect) {
        if (!(screenRect instanceof ScreenRect))
            throw 'not a ScreenRect: ' + screenRect;
        if (screenRect.isEmpty()) {
            throw 'empty screenrect';
        }
        if (!this.screenRect_.equals(screenRect)) {
            this.screenRect_ = screenRect;
            this.realign();
            this.broadcast(new GenericEvent(this, SimView.SCREEN_RECT_CHANGED));
        }
    }
    ;
    setSimRect(simRect) {
        if (!(simRect instanceof DoubleRect))
            throw 'not a DoubleRect: ' + simRect;
        if (!this.simRect_.equals(simRect)) {
            this.simRect_ = simRect;
            this.realign();
            this.broadcastParameter(SimView.en.WIDTH);
            this.broadcastParameter(SimView.en.HEIGHT);
            this.broadcastParameter(SimView.en.CENTER_X);
            this.broadcastParameter(SimView.en.CENTER_Y);
            this.broadcast(new GenericEvent(this, SimView.SIM_RECT_CHANGED));
        }
    }
    ;
    setVerticalAlign(alignVert) {
        if (!VerticalAlignValues().includes(alignVert)) {
            throw "invalid VerticalAlign " + alignVert;
        }
        this.verticalAlign_ = alignVert;
        this.realign();
        this.broadcastParameter(SimView.en.VERTICAL_ALIGN);
    }
    ;
    setWidth(value) {
        if (Util.veryDifferent(this.width_, value)) {
            this.width_ = value;
            if (this.scaleTogether_) {
                this.height_ = this.width_ * this.ratio_;
            }
            this.modifySimRect();
        }
    }
    ;
    zoomIn() {
        this.setHeight(this.height_ / this.zoom);
    }
    ;
    zoomOut() {
        this.setHeight(this.height_ * this.zoom);
    }
    ;
}
SimView.COORD_MAP_CHANGED = 'COORD_MAP_CHANGED';
SimView.SCREEN_RECT_CHANGED = 'SCREEN_RECT_CHANGED';
SimView.SIM_RECT_CHANGED = 'SIM_RECT_CHANGED';
SimView.en = {
    SCALE_TOGETHER: 'scale X-Y together',
    WIDTH: 'width',
    HEIGHT: 'height',
    CENTER_X: 'center-x',
    CENTER_Y: 'center-y',
    VERTICAL_ALIGN: 'vertical-align',
    HORIZONTAL_ALIGN: 'horizontal-align',
    ASPECT_RATIO: 'aspect-ratio'
};
SimView.de_strings = {
    SCALE_TOGETHER: 'X-Y zusammen skalieren',
    WIDTH: 'Breite',
    HEIGHT: 'Höhe',
    CENTER_X: 'Mitte X',
    CENTER_Y: 'Mitte Y',
    VERTICAL_ALIGN: 'Vertikalejustierung',
    HORIZONTAL_ALIGN: 'Horizontalejustierung',
    ASPECT_RATIO: 'Querschnittsverhältnis'
};
SimView.i18n = Util.LOCALE === 'de' ? SimView.de_strings : SimView.en;
;
Util.defineGlobal('lab$view$SimView', SimView);
