import { DrawingStyle } from './DrawingStyle.js';
import { MutableVector } from '../util/MutableVector.js';
import { ScreenRect } from './ScreenRect.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class DisplayPath {
    constructor(proto) {
        this.offScreen_ = null;
        this.paths_ = [];
        this.styles_ = [];
        this.sequence_ = [];
        this.screenRect_ = ScreenRect.EMPTY_RECT;
        this.redraw_ = true;
        this.lastMap_ = null;
        this.proto_ = proto ?? null;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', screenRect_: ' + this.screenRect_
            + ', zIndex: ' + this.zIndex_
            + ', useBuffer_: ' + this.useBuffer_
            + ', defaultStyle: ' + this.defaultStyle_
            + ', paths_: ['
            + this.paths_.map((p, idx) => idx + ': ' + p.toString())
            + ']}';
    }
    ;
    toStringShort() {
        return 'DisplayPath{paths_.length: ' + this.paths_.length + '}';
    }
    ;
    addPath(path, opt_style) {
        if (!this.containsPath(path)) {
            this.paths_.push(path);
            this.styles_.push(opt_style ?? this.getDefaultStyle());
            this.sequence_.push(path.getSequence());
            this.redraw_ = true;
            this.flush();
        }
    }
    ;
    contains(_p_world) {
        return false;
    }
    ;
    containsPath(path) {
        return this.paths_.includes(path);
    }
    ;
    draw(context, map) {
        const r = this.screenRect_;
        if (r.isEmpty()) {
            return;
        }
        Util.assert(r.getLeft() == 0);
        Util.assert(r.getTop() == 0);
        const w = r.getWidth();
        const h = r.getHeight();
        context.save();
        this.paths_.forEach((path, idx) => {
            const seq = path.getSequence();
            if (seq != this.sequence_[idx]) {
                this.sequence_[idx] = seq;
                this.redraw_ = true;
            }
        });
        if (this.lastMap_ == null || this.lastMap_ != map) {
            this.lastMap_ = map;
            this.redraw_ = true;
        }
        const useBuffer = this.getUseBuffer();
        if (useBuffer && this.offScreen_ != null) {
            if (this.offScreen_.width != w || this.offScreen_.height != h) {
                this.flush();
            }
        }
        if (useBuffer && this.offScreen_ == null) {
            this.offScreen_ = document.createElement('canvas');
            this.offScreen_.width = w;
            this.offScreen_.height = h;
            this.redraw_ = true;
        }
        let ctx = context;
        if (useBuffer && this.offScreen_) {
            const offCtx = this.offScreen_.getContext('2d');
            if (offCtx) {
                ctx = offCtx;
            }
        }
        if (this.redraw_ || !useBuffer) {
            if (useBuffer) {
                ctx.clearRect(0, 0, w, h);
            }
            this.paths_.forEach((path, idx) => this.drawPath(path, ctx, map, this.styles_[idx]));
            this.redraw_ = false;
        }
        if (useBuffer && this.offScreen_) {
            context.drawImage(this.offScreen_, 0, 0, w, h);
        }
        context.restore();
    }
    ;
    drawPath(path, context, map, style) {
        const point = new MutableVector(0, 0);
        let firstTime = true;
        const w = style.lineWidth;
        const pointsIterator = path.getIterator(DisplayPath.DRAW_POINTS);
        while (pointsIterator.nextPoint(point)) {
            const scrX = map.simToScreenX(point.getX());
            const scrY = map.simToScreenY(point.getY());
            if (firstTime) {
                context.beginPath();
                context.moveTo(scrX, scrY);
                firstTime = false;
            }
            switch (style.drawMode) {
                case "lines":
                    if (!firstTime) {
                        context.lineTo(scrX, scrY);
                    }
                    break;
                case "dots":
                    context.rect(scrX, scrY, w, w);
                    break;
                default:
                    throw '';
            }
        }
        switch (style.drawMode) {
            case "lines":
                context.strokeStyle = style.color;
                context.lineWidth = style.lineWidth;
                if (style.lineDash.length > 0 && typeof context.setLineDash === 'function') {
                    context.setLineDash(style.lineDash);
                }
                context.stroke();
                break;
            case "dots":
                context.fillStyle = style.color;
                context.fill();
                break;
            default:
                throw '';
        }
    }
    ;
    flush() {
        this.offScreen_ = null;
    }
    getChanged() {
        return this.redraw_;
    }
    ;
    getDefaultStyle() {
        if (this.defaultStyle_ !== undefined) {
            return this.defaultStyle_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getDefaultStyle();
        }
        else {
            return DrawingStyle.lineStyle('gray', 4);
        }
    }
    ;
    getMassObjects() {
        return [];
    }
    ;
    getPath(arg) {
        if (typeof arg === 'number') {
            if (arg >= 0 && arg < this.paths_.length) {
                return this.paths_[arg];
            }
        }
        else if (typeof arg === 'string') {
            arg = Util.toName(arg);
            const e = this.paths_.find((p) => p.getName() == arg);
            if (e !== undefined) {
                return e;
            }
        }
        throw 'DisplayPath did not find ' + arg;
    }
    ;
    getPosition() {
        return Vector.ORIGIN;
    }
    ;
    getScreenRect() {
        return this.screenRect_;
    }
    ;
    getSimObjects() {
        return Array.from(this.paths_);
    }
    ;
    getStyle(idx) {
        if (idx < 0 || idx >= this.styles_.length) {
            throw '';
        }
        return this.styles_[idx];
    }
    getUseBuffer() {
        if (this.useBuffer_ !== undefined) {
            return this.useBuffer_;
        }
        else if (this.proto_ != null) {
            return this.proto_.getUseBuffer();
        }
        else {
            return true;
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
    removePath(path) {
        if (this.containsPath(path)) {
            const idx = this.paths_.indexOf(path);
            if (idx > -1) {
                this.paths_.splice(idx, 1);
                this.styles_.splice(idx, 1);
                this.sequence_.splice(idx, 1);
                this.redraw_ = true;
                this.flush();
            }
        }
    }
    ;
    setDefaultStyle(value) {
        this.defaultStyle_ = value;
        return this;
    }
    ;
    setDragable(_dragable) {
    }
    ;
    setPosition(_position) {
    }
    ;
    setScreenRect(screenRect) {
        this.screenRect_ = screenRect;
        this.flush();
        this.redraw_ = true;
    }
    ;
    setStyle(idx, value) {
        if (idx < 0 || idx >= this.styles_.length) {
            throw '';
        }
        this.styles_[idx] = value;
        this.redraw_ = true;
    }
    ;
    setUseBuffer(value) {
        this.useBuffer_ = value;
        if (!this.getUseBuffer()) {
            this.flush();
        }
        return this;
    }
    ;
    setZIndex(zIndex) {
        this.zIndex_ = zIndex;
        this.redraw_ = true;
    }
    ;
}
DisplayPath.DRAW_POINTS = 3000;
Util.defineGlobal('lab$view$DisplayPath', DisplayPath);
