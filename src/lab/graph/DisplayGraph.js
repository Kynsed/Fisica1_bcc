import { GraphLine } from './GraphLine.js';
import { ScreenRect } from '../view/ScreenRect.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class DisplayGraph {
    constructor(opt_graphLine) {
        this.offScreen_ = null;
        this.lastMap_ = null;
        this.screenRect_ = ScreenRect.EMPTY_RECT;
        this.needRedraw_ = false;
        this.useBuffer_ = true;
        this.zIndex = 0;
        if (opt_graphLine !== undefined && !(opt_graphLine instanceof GraphLine)) {
            throw 'not a GraphLine ' + opt_graphLine;
        }
        this.graphLines_ = opt_graphLine !== undefined ? [opt_graphLine] : [];
        this.memDraw_ = Util.repeat(-1, this.graphLines_.length);
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', screenRect_: ' + this.screenRect_
            + ', useBuffer_: ' + this.useBuffer_
            + ', zIndex: ' + this.zIndex
            + ', graphLines_: ['
            + this.graphLines_.map(g => g.toStringShort())
            + ']}';
    }
    ;
    toStringShort() {
        return 'DisplayGraph{graphLines_.length: ' + this.graphLines_.length + '}';
    }
    ;
    addGraphLine(graphLine) {
        if (!(graphLine instanceof GraphLine)) {
            throw 'not a GraphLine ' + graphLine;
        }
        if (!this.graphLines_.includes(graphLine)) {
            this.graphLines_.push(graphLine);
            this.memDraw_.push(-1);
        }
    }
    ;
    contains(_p_world) {
        return false;
    }
    ;
    draw(context, map) {
        if (this.screenRect_.isEmpty()) {
            if (Util.DEBUG) {
                console.log('DisplayGraph: screenRect is empty');
            }
            return;
        }
        context.save();
        if (this.lastMap_ == null || this.lastMap_ != map) {
            this.lastMap_ = map;
            this.needRedraw_ = true;
        }
        for (let i = 0, n = this.graphLines_.length; i < n; i++) {
            if (this.memDraw_[i] > this.graphLines_[i].getGraphPoints().getEndIndex()) {
                this.reset();
                break;
            }
        }
        if (!this.useBuffer_) {
            this.needRedraw_ = true;
            if (this.needRedraw_) {
                this.fullDraw(context, map);
                this.needRedraw_ = false;
            }
            else {
                this.incrementalDraw(context, map);
            }
        }
        else {
            const w = this.screenRect_.getWidth();
            const h = this.screenRect_.getHeight();
            if (this.offScreen_ == null) {
                Util.assert(w > 0 && h > 0);
                this.offScreen_ = document.createElement('canvas');
                this.offScreen_.width = w;
                this.offScreen_.height = h;
                this.needRedraw_ = true;
            }
            Util.assert(Util.isObject(this.offScreen_));
            const osb = this.offScreen_.getContext('2d');
            if (osb === null) {
                throw 'DisplayGraph: getContext fail';
            }
            ;
            if (this.needRedraw_) {
                osb.clearRect(0, 0, w, h);
                this.fullDraw(osb, map);
                this.needRedraw_ = false;
            }
            else {
                this.incrementalDraw(osb, map);
            }
            context.drawImage(this.offScreen_, 0, 0, w, h);
        }
        for (let i = 0, n = this.graphLines_.length; i < n; i++) {
            this.drawHotSpot(context, map, this.graphLines_[i]);
        }
        context.restore();
    }
    ;
    drawHotSpot(context, coordMap, graphLine) {
        const p = graphLine.getGraphPoints().getEndValue();
        if (p != null) {
            const x = coordMap.simToScreenX(p.getX());
            const y = coordMap.simToScreenY(p.getY());
            const color = graphLine.getHotSpotColor();
            if (color) {
                context.fillStyle = color;
                context.fillRect(x - 2, y - 2, 5, 5);
            }
        }
    }
    ;
    drawPoints(context, coordMap, from, graphLine) {
        const simRect = coordMap.screenToSimRect(this.screenRect_);
        const iter = graphLine.getGraphPoints().getIterator(from);
        if (!iter.hasNext()) {
            return from;
        }
        let next = iter.nextValue();
        let style = graphLine.getGraphStyle(iter.getIndex());
        if (style.drawMode == "dots") {
            const x = coordMap.simToScreenX(next.x);
            const y = coordMap.simToScreenY(next.y);
            const w = style.lineWidth;
            context.fillStyle = style.color_;
            context.fillRect(x, y, w, w);
        }
        while (iter.hasNext()) {
            const last = next;
            next = iter.nextValue();
            if (next.x == last.x && next.y == last.y)
                continue;
            style = graphLine.getGraphStyle(iter.getIndex());
            const continuous = next.seqX == last.seqX && next.seqY == last.seqY;
            if (style.drawMode == "dots" || !continuous) {
                if (!simRect.contains(next))
                    continue;
                const x = coordMap.simToScreenX(next.x);
                const y = coordMap.simToScreenY(next.y);
                const w = style.lineWidth;
                context.fillStyle = style.color_;
                context.fillRect(x, y, w, w);
            }
            else {
                if (!simRect.maybeVisible(last, next)) {
                    continue;
                }
                const x1 = coordMap.simToScreenX(last.x);
                const y1 = coordMap.simToScreenY(last.y);
                const x2 = coordMap.simToScreenX(next.x);
                const y2 = coordMap.simToScreenY(next.y);
                context.strokeStyle = style.color_;
                context.lineWidth = style.lineWidth;
                context.beginPath();
                context.moveTo(x1, y1);
                context.lineTo(x2, y2);
                context.stroke();
            }
        }
        return iter.getIndex();
    }
    ;
    fullDraw(context, coordMap) {
        this.memDraw_ = Util.repeat(-1, this.graphLines_.length);
        this.incrementalDraw(context, coordMap);
    }
    ;
    getChanged() {
        let chg = false;
        for (let i = 0, n = this.graphLines_.length; i < n; i++) {
            const c = this.graphLines_[i].getChanged();
            chg = chg || c;
        }
        return chg || this.needRedraw_;
    }
    ;
    getMassObjects() {
        return [];
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
        return [];
    }
    ;
    getUseBuffer() {
        return this.useBuffer_;
    }
    ;
    getZIndex() {
        return this.zIndex;
    }
    ;
    incrementalDraw(context, coordMap) {
        for (let i = 0, n = this.graphLines_.length; i < n; i++) {
            this.memDraw_[i] = this.drawPoints(context, coordMap, this.memDraw_[i], this.graphLines_[i]);
        }
    }
    ;
    isDragable() {
        return false;
    }
    ;
    removeGraphLine(graphLine) {
        if (!(graphLine instanceof GraphLine)) {
            throw 'not a GraphLine ' + graphLine;
        }
        const idx = this.graphLines_.indexOf(graphLine);
        if (idx < 0)
            throw 'not found ' + graphLine;
        this.graphLines_.splice(idx, 1);
        this.memDraw_.splice(idx, 1);
        Util.assert(!this.graphLines_.includes(graphLine));
        this.needRedraw_ = true;
    }
    ;
    reset() {
        this.memDraw_ = Util.repeat(-1, this.graphLines_.length);
        this.needRedraw_ = true;
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
        this.offScreen_ = null;
        this.needRedraw_ = true;
    }
    ;
    setUseBuffer(value) {
        if (value != this.useBuffer_) {
            this.useBuffer_ = value;
            if (!this.useBuffer_) {
                this.offScreen_ = null;
            }
        }
    }
    ;
    setZIndex(zIndex) {
        this.zIndex = zIndex !== undefined ? zIndex : 0;
        this.needRedraw_ = true;
    }
    ;
}
Util.defineGlobal('lab$graph$DisplayGraph', DisplayGraph);
