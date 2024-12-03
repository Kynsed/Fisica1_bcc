import { DoubleRect } from '../util/DoubleRect.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class EnergyBarGraph {
    constructor(system) {
        this.graphFont = '10pt sans-serif';
        this.rect_ = DoubleRect.EMPTY_RECT;
        this.fontDescent_ = 8;
        this.fontAscent_ = 12;
        this.graphOrigin_ = 0;
        this.leftEdge_ = 0;
        this.rightEdge_ = 0;
        this.graphFactor_ = 10;
        this.graphDelta_ = 2;
        this.needRescale_ = true;
        this.drawBackground_ = true;
        this.potentialColor = '#666';
        this.translationColor = '#999';
        this.rotationColor = '#ccc';
        this.lastTime_ = Util.systemTime();
        this.lastTime2_ = 0;
        this.totalEnergyDisplay_ = 0;
        this.lastEnergyDisplay_ = 0;
        this.totalDigits_ = 1;
        this.totalEnergyPeriod_ = 0.3;
        this.lastTotalEnergyTime_ = Number.NEGATIVE_INFINITY;
        this.megaMinEnergy_ = 0;
        this.megaMaxEnergy_ = 0;
        this.minEnergy_ = 0;
        this.maxEnergy_ = 0;
        this.totalEnergy_ = 0;
        this.BUFFER_ = 12;
        this.history_ = new Array(this.BUFFER_);
        this.bufptr_ = 0;
        this.dragable_ = true;
        this.visibleRect_ = DoubleRect.EMPTY_RECT;
        this.needResize_ = true;
        this.zIndex = 0;
        this.changed_ = true;
        this.debug_ = false;
        this.system_ = system;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', visibleRect: ' + this.visibleRect_
            + ', rect: ' + this.rect_
            + ', needRescale: ' + this.needRescale_
            + ', leftEdge: ' + Util.NF(this.leftEdge_)
            + ', rightEdge: ' + Util.NF(this.rightEdge_)
            + ', graphOrigin: ' + Util.NF(this.graphOrigin_)
            + ', graphFactor: ' + Util.NF(this.graphFactor_)
            + ', minHistory: ' + Util.NF(this.minHistory())
            + ', minEnergy: ' + Util.NF(this.minEnergy_)
            + ', megaMinEnergy: ' + Util.NF(this.megaMinEnergy_)
            + ', megaMinEnergyLoc: ' + Math.floor(this.graphOrigin_ + 0.5 +
            this.graphFactor_ * this.megaMinEnergy_)
            + ', maxEnergy: ' + Util.NF(this.maxEnergy_)
            + ', megaMaxEnergy: ' + Util.NF(this.megaMaxEnergy_)
            + ', totalEnergy: ' + Util.NF(this.totalEnergy_)
            + ', time: ' + Util.NF(Util.systemTime() - this.lastTime_)
            + ', zIndex: ' + this.zIndex
            + '}';
    }
    ;
    toStringShort() {
        return 'EnergyBarGraph{system: ' + this.system_.toStringShort() + '}';
    }
    ;
    contains(point) {
        return this.rect_.contains(point);
    }
    ;
    draw(context, map) {
        if (this.visibleRect_.isEmpty())
            return;
        context.save();
        context.font = this.graphFont;
        context.textAlign = 'start';
        context.textBaseline = 'alphabetic';
        const e = this.system_.getEnergyInfo();
        const te = e.getTranslational();
        const pe = e.getPotential();
        const re = e.getRotational();
        let tes2 = EnergyBarGraph.i18n.TRANSLATIONAL_ENERGY + ',';
        if (isNaN(re)) {
            tes2 = EnergyBarGraph.i18n.KINETIC_ENERGY + ',';
        }
        const height2 = EnergyBarGraph.TOP_MARGIN + 3 * EnergyBarGraph.HEIGHT
            + this.fontAscent_ + 8 + this.fontDescent_;
        const h2 = map.screenToSimScaleY(height2);
        if (this.needResize_ || this.rect_.isEmpty()
            || Util.veryDifferent(h2, this.rect_.getHeight())) {
            if (this.debug_ && Util.DEBUG) {
                console.log('h2 = ' + h2 + ' this.rect_.getHeight=' + this.rect_.getHeight());
            }
            this.resizeRect(h2);
        }
        if (this.debug_ && Util.DEBUG) {
            const r = map.simToScreenRect(this.rect_);
            context.fillStyle = 'rgba(255,255,0,0.5)';
            context.fillRect(r.getLeft(), r.getTop(), r.getWidth(), r.getHeight());
        }
        this.leftEdge_ = map.simToScreenX(this.rect_.getLeft()) + EnergyBarGraph.LEFT_MARGIN;
        this.rightEdge_ = map.simToScreenX(this.rect_.getRight())
            - EnergyBarGraph.RIGHT_MARGIN;
        const maxWidth = this.rightEdge_ - this.leftEdge_;
        const top = map.simToScreenY(this.rect_.getTop());
        if (this.drawBackground_) {
            context.fillStyle = 'rgba(255,255,255,0.75)';
            context.fillRect(this.leftEdge_ - EnergyBarGraph.LEFT_MARGIN, top + EnergyBarGraph.TOP_MARGIN, maxWidth + EnergyBarGraph.LEFT_MARGIN + EnergyBarGraph.RIGHT_MARGIN, height2);
        }
        if (this.debug_ && Util.DEBUG) {
            context.strokeStyle = '#90c';
            context.strokeRect(this.leftEdge_ - EnergyBarGraph.LEFT_MARGIN, top + EnergyBarGraph.TOP_MARGIN, maxWidth + EnergyBarGraph.LEFT_MARGIN + EnergyBarGraph.RIGHT_MARGIN, height2);
        }
        this.totalEnergy_ = te + pe + (isNaN(re) ? 0 : re);
        Util.assert(Math.abs(this.totalEnergy_ - e.getTotalEnergy()) < 1e-12);
        this.minEnergy_ = pe < 0 ? pe : 0;
        this.maxEnergy_ = this.totalEnergy_ > 0 ? this.totalEnergy_ : 0;
        if (Util.systemTime() - this.lastTotalEnergyTime_ > this.totalEnergyPeriod_) {
            this.lastTotalEnergyTime_ = Util.systemTime();
            this.lastEnergyDisplay_ = this.totalEnergyDisplay_;
            this.totalEnergyDisplay_ = e.getTotalEnergy();
        }
        this.rescale(maxWidth);
        let w = this.graphOrigin_;
        let w2 = 0;
        context.fillStyle = this.potentialColor;
        if (pe < 0) {
            w2 = Math.floor(0.5 - pe * this.graphFactor_);
            context.fillRect(w - w2, top + EnergyBarGraph.TOP_MARGIN, w2, EnergyBarGraph.HEIGHT);
            w = w - w2;
        }
        else {
            w2 = Math.floor(0.5 + pe * this.graphFactor_);
            context.fillRect(w, top + EnergyBarGraph.HEIGHT + EnergyBarGraph.TOP_MARGIN, w2, EnergyBarGraph.HEIGHT);
            w += w2;
        }
        if (!isNaN(re)) {
            w2 = Math.floor(0.5 + re * this.graphFactor_);
            context.fillStyle = this.rotationColor;
            context.fillRect(w, top + EnergyBarGraph.HEIGHT + EnergyBarGraph.TOP_MARGIN, w2, EnergyBarGraph.HEIGHT);
            w += w2;
        }
        w2 = Math.floor(0.5 + te * this.graphFactor_);
        const totalLoc = this.graphOrigin_ +
            Math.floor(0.5 + this.totalEnergy_ * this.graphFactor_);
        Util.assert(Math.abs(w + w2 - totalLoc) <= 2);
        w2 = totalLoc - w;
        context.fillStyle = this.translationColor;
        context.fillRect(w, top + EnergyBarGraph.HEIGHT + EnergyBarGraph.TOP_MARGIN, w2, EnergyBarGraph.HEIGHT);
        const rightEnergy = (this.rightEdge_ - this.graphOrigin_) / this.graphFactor_;
        const y = this.drawScale(context, this.leftEdge_, top + EnergyBarGraph.HEIGHT + EnergyBarGraph.TOP_MARGIN, rightEnergy);
        let x = this.leftEdge_;
        x = this.drawLegend(context, EnergyBarGraph.i18n.POTENTIAL_ENERGY + ',', this.potentialColor, true, x, y);
        if (!isNaN(re)) {
            x = this.drawLegend(context, EnergyBarGraph.i18n.ROTATIONAL_ENERGY + ',', this.rotationColor, true, x, y);
        }
        x = this.drawLegend(context, tes2, this.translationColor, true, x, y);
        x = this.drawTotalEnergy(context, x, y);
        context.restore();
    }
    ;
    drawLegend(context, s, c, filled, x, y) {
        const BOX = 10;
        if (filled) {
            context.fillStyle = c;
            context.fillRect(x, y, BOX, BOX);
        }
        else {
            context.strokeStyle = c;
            context.strokeRect(x, y, BOX, BOX);
        }
        x += BOX + 3;
        const textWidth = context.measureText(s).width;
        context.fillStyle = '#000';
        context.fillText(s, x, y + this.fontAscent_);
        x += textWidth + 5;
        return x;
    }
    ;
    drawScale(context, left, top, total) {
        const graphAscent = this.fontAscent_;
        if (Math.abs(total) > 1E-18 && this.graphDelta_ > 1E-18) {
            context.fillStyle = '#000';
            context.strokeStyle = '#000';
            let scale = 0;
            let loopCtr = 0;
            do {
                const x = this.graphOrigin_ + Math.floor(scale * this.graphFactor_);
                context.beginPath();
                context.moveTo(x, top + EnergyBarGraph.HEIGHT / 2);
                context.lineTo(x, top + EnergyBarGraph.HEIGHT + 2);
                context.stroke();
                const s = EnergyBarGraph.numberFormat1(scale);
                const textWidth = context.measureText(s).width;
                context.fillText(s, x - textWidth / 2, top + EnergyBarGraph.HEIGHT + graphAscent + 3);
                scale += this.graphDelta_;
                if (this.debug_ && Util.DEBUG && ++loopCtr > 100) {
                    console.log('loop 1 x=' + x + ' s=' + s + ' scale=' + Util.NFE(scale)
                        + ' total=' + Util.NFE(total) + ' graphDelta=' + Util.NFE(this.graphDelta_));
                }
            } while (scale < total + this.graphDelta_ + 1E-16);
            if (this.debug_ && Util.DEBUG) {
                console.log('megaMinEnergy=' + Util.NFE(this.megaMinEnergy_)
                    + ' graphDelta=' + Util.NFE(this.graphDelta_)
                    + ' graphFactor=' + Util.NFE(this.graphFactor_)
                    + ' scale=' + Util.NFE(scale));
            }
            if (this.megaMinEnergy_ < -1E-12) {
                scale = -this.graphDelta_;
                let x;
                do {
                    x = this.graphOrigin_ + Math.floor(scale * this.graphFactor_);
                    context.beginPath();
                    context.moveTo(x, top + EnergyBarGraph.HEIGHT / 2);
                    context.lineTo(x, top + EnergyBarGraph.HEIGHT + 2);
                    context.stroke();
                    const s = EnergyBarGraph.numberFormat1(scale);
                    const textWidth = context.measureText(s).width;
                    context.fillText(s, x - textWidth / 2, top + EnergyBarGraph.HEIGHT + graphAscent + 3);
                    scale -= this.graphDelta_;
                    if (this.debug_ && Util.DEBUG) {
                        console.log('loop 2 x=' + x + ' s=' + s + ' scale=' + Util.NFE(scale)
                            + ' megaMinEnergy=' + Util.NFE(this.megaMinEnergy_));
                    }
                } while (scale > this.megaMinEnergy_ && x >= left);
            }
        }
        return top + EnergyBarGraph.HEIGHT + graphAscent + 3 + this.fontDescent_;
    }
    ;
    drawTotalEnergy(context, x, y) {
        const s = EnergyBarGraph.i18n.TOTAL + ' ' +
            this.formatTotalEnergy(this.totalEnergyDisplay_, this.lastEnergyDisplay_);
        context.fillStyle = '#000';
        context.fillText(s, x, y + this.fontAscent_);
        return x + context.measureText(s).width + 5;
    }
    ;
    formatTotalEnergy(value, previous) {
        const diff = Math.abs(value - previous);
        if (diff > 1E-15) {
            const logDiff = -Math.floor(Math.log(diff) / Math.log(10));
            const digits = logDiff > 0 ? logDiff : 1;
            this.totalDigits_ = digits < 20 ? digits : 20;
        }
        const v = Math.abs(value);
        const sign = value < 0 ? '-' : '+';
        if (v < 1E-6) {
            return sign + v.toExponential(5);
        }
        else if (v < 1000) {
            return sign + v.toFixed(this.totalDigits_);
        }
        else {
            return sign + v.toFixed(this.totalDigits_);
        }
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
    getSimObjects() {
        return [];
    }
    ;
    getMassObjects() {
        return [];
    }
    ;
    getPosition() {
        return !this.rect_.isEmpty() ? this.rect_.getCenter() : new Vector(0, 0);
    }
    ;
    getVisibleArea() {
        return this.visibleRect_;
    }
    ;
    getZIndex() {
        return this.zIndex;
    }
    ;
    isDragable() {
        return this.dragable_;
    }
    ;
    minHistory() {
        let min = 0;
        for (let i = 0, len = this.history_.length; i < len; i++) {
            if (this.history_[i] < min)
                min = this.history_[i];
        }
        return min;
    }
    ;
    static numberFormat1(value) {
        const v = Math.abs(value);
        let s;
        if (v < 1E-16) {
            s = '0';
        }
        else if (v < 1E-3) {
            s = v.toExponential(3);
            s = s.replace(/\.0+([eE])/, '$1');
            s = s.replace(/(\.\d*[1-9])0+([eE])/, '$1$2');
        }
        else if (v < 10) {
            s = v.toFixed(4);
            s = s.replace(/\.0+$/, '');
            s = s.replace(/(\.\d*[1-9])0+$/, '$1');
        }
        else if (v < 100) {
            s = v.toFixed(3);
            s = s.replace(/\.0+$/, '');
            s = s.replace(/(\.\d*[1-9])0+$/, '$1');
        }
        else if (v < 1000) {
            s = v.toFixed(2);
            s = s.replace(/\.0+$/, '');
            s = s.replace(/(\.[1-9])0$/, '$1');
        }
        else if (v < 10000) {
            s = v.toFixed(0);
        }
        else {
            s = v.toExponential(3);
            s = s.replace(/\.0+([eE])/, '$1');
            s = s.replace(/(\.\d*[1-9])0+([eE])/, '$1$2');
        }
        return value < 0 ? '-' + s : s;
    }
    ;
    printEverything(s) {
        if (Util.DEBUG && this.debug_) {
            console.log(s + this);
        }
    }
    ;
    rescale(maxWidth) {
        const time_check = this.timeCheck(this.minEnergy_);
        if (Util.DEBUG) {
            this.printEverything('(status)');
        }
        this.megaMinEnergy_ = this.minHistory();
        Util.assert(isFinite(this.megaMinEnergy_));
        if (this.megaMinEnergy_ < -1E-6) {
            if (this.graphOrigin_ + Math.floor(0.5 + this.megaMinEnergy_ * this.graphFactor_) <
                this.leftEdge_ - EnergyBarGraph.LEFT_MARGIN) {
                if (Util.DEBUG) {
                    this.printEverything('BIG MIN ENERGY');
                }
                this.needRescale_ = true;
            }
            if (time_check) {
                if (-this.megaMinEnergy_ * this.graphFactor_ <
                    0.2 * (this.graphOrigin_ - this.leftEdge_)) {
                    if (Util.DEBUG) {
                        this.printEverything('SMALL MIN ENERGY');
                    }
                    this.needRescale_ = true;
                }
            }
        }
        else if (this.megaMinEnergy_ > 1E-6) {
            if (this.graphOrigin_ > this.leftEdge_) {
                if (Util.DEBUG) {
                    this.printEverything('POSITIVE MIN ENERGY');
                }
                this.needRescale_ = true;
            }
        }
        else {
            if (time_check) {
                if (this.graphOrigin_ - this.leftEdge_ > EnergyBarGraph.LEFT_MARGIN) {
                    this.needRescale_ = true;
                }
            }
        }
        if (this.totalEnergy_ > this.megaMaxEnergy_)
            this.megaMaxEnergy_ = this.totalEnergy_;
        if (this.totalEnergy_ > 1E-12) {
            if (this.graphOrigin_ + this.totalEnergy_ * this.graphFactor_ > this.rightEdge_) {
                this.needRescale_ = true;
                if (Util.DEBUG) {
                    this.printEverything('BIG TOTAL ENERGY');
                }
            }
            if (this.rightEdge_ - this.graphOrigin_ >
                0.2 * (this.graphOrigin_ - this.leftEdge_)
                && this.totalEnergy_ * this.graphFactor_ <
                    0.2 * (this.rightEdge_ - this.graphOrigin_)) {
                this.needRescale_ = true;
                this.megaMaxEnergy_ = this.totalEnergy_;
                if (Util.DEBUG) {
                    this.printEverything('SMALL TOTAL ENERGY');
                }
            }
        }
        else if (this.totalEnergy_ < -1E-12) {
            if (time_check) {
                if (this.megaMaxEnergy_ < 0 && this.graphOrigin_ < this.rightEdge_) {
                    this.needRescale_ = true;
                    if (Util.DEBUG) {
                        this.printEverything('NEGATIVE TOTAL ENERGY');
                    }
                }
                this.megaMaxEnergy_ = this.totalEnergy_;
            }
        }
        if (this.needRescale_) {
            this.lastTime_ = Util.systemTime();
            this.needRescale_ = false;
            let total = this.totalEnergy_ > 0 ? this.totalEnergy_ : 0;
            total -= this.megaMinEnergy_;
            if (total < 1E-16) {
                total = 1.0;
            }
            if (total * this.graphFactor_ > maxWidth) {
                this.graphFactor_ = 0.75 * maxWidth / total;
            }
            else {
                this.graphFactor_ = 0.95 * maxWidth / total;
            }
            Util.assert(isFinite(this.graphFactor_));
            if (this.megaMinEnergy_ < -1E-12) {
                this.graphOrigin_ = this.leftEdge_ +
                    Math.floor(0.5 + this.graphFactor_ * (-this.megaMinEnergy_));
            }
            else {
                this.graphOrigin_ = this.leftEdge_;
            }
            const power = Math.pow(10, Math.floor(Math.log(total) / Math.log(10)));
            const logTot = total / power;
            if (logTot >= 8)
                this.graphDelta_ = 2;
            else if (logTot >= 5)
                this.graphDelta_ = 1;
            else if (logTot >= 3)
                this.graphDelta_ = 0.5;
            else if (logTot >= 2)
                this.graphDelta_ = 0.4;
            else
                this.graphDelta_ = 0.2;
            this.graphDelta_ *= power;
        }
    }
    ;
    resizeRect(height) {
        Util.assert(Util.isObject(this.visibleRect_));
        let top = this.rect_.isEmpty() ?
            this.visibleRect_.getTop() : this.rect_.getTop();
        let bottom = top - height;
        if (top > this.visibleRect_.getTop() || height > this.visibleRect_.getHeight()) {
            top = this.visibleRect_.getTop();
            bottom = top - height;
        }
        else if (bottom < this.visibleRect_.getBottom()) {
            bottom = this.visibleRect_.getBottom();
            top = bottom + height;
        }
        if (this.debug_ && Util.DEBUG) {
            console.log('resizeRect visibleRect=' + this.visibleRect_
                + ' rect=' + this.rect_ + ' top=' + top + ' bottom=' + bottom);
        }
        this.rect_ = new DoubleRect(this.visibleRect_.getLeft(), bottom, this.visibleRect_.getRight(), top);
        if (this.debug_ && Util.DEBUG) {
            console.log('resizeRect new rect=' + this.rect_);
        }
        this.needRescale_ = true;
        this.needResize_ = false;
    }
    ;
    setDragable(dragable) {
        this.dragable_ = dragable;
    }
    ;
    setPosition(position) {
        if (!this.rect_.isEmpty()) {
            const h = this.rect_.getHeight() / 2;
            this.rect_ = new DoubleRect(this.rect_.getLeft(), position.getY() - h, this.rect_.getRight(), position.getY() + h);
            if (this.debug_ && Util.DEBUG) {
                console.log('setPosition ' + this.rect_);
            }
        }
        else {
            this.rect_ = new DoubleRect(-5, position.getY() - 0.5, 5, position.getY() + 0.5);
        }
        this.changed_ = true;
    }
    ;
    setVisibleArea(visibleArea) {
        this.visibleRect_ = visibleArea;
        this.needResize_ = true;
        this.changed_ = true;
    }
    ;
    setZIndex(zIndex) {
        this.zIndex = zIndex ?? 0;
        this.changed_ = true;
    }
    ;
    timeCheck(minEnergy) {
        const nowTime = Util.systemTime();
        if (nowTime - this.lastTime2_ > 1.0) {
            this.lastTime2_ = nowTime;
            if (++this.bufptr_ >= this.history_.length)
                this.bufptr_ = 0;
            this.history_[this.bufptr_] = minEnergy;
        }
        else {
            if (this.minEnergy_ < this.history_[this.bufptr_])
                this.history_[this.bufptr_] = minEnergy;
        }
        if (nowTime - this.lastTime_ > this.BUFFER_) {
            this.lastTime_ = nowTime;
            return true;
        }
        else {
            return false;
        }
    }
    ;
}
EnergyBarGraph.HEIGHT = 10;
EnergyBarGraph.LEFT_MARGIN = 10;
EnergyBarGraph.RIGHT_MARGIN = 0;
EnergyBarGraph.TOP_MARGIN = 0;
EnergyBarGraph.en = {
    SHOW_ENERGY: 'show energy',
    POTENTIAL_ENERGY: 'potential',
    TRANSLATIONAL_ENERGY: 'translational',
    KINETIC_ENERGY: 'kinetic',
    ROTATIONAL_ENERGY: 'rotational',
    TOTAL: 'total'
};
EnergyBarGraph.de_strings = {
    SHOW_ENERGY: 'Energie anzeigen',
    POTENTIAL_ENERGY: 'potenzielle',
    TRANSLATIONAL_ENERGY: 'translation',
    KINETIC_ENERGY: 'kinetische',
    ROTATIONAL_ENERGY: 'rotation',
    TOTAL: 'gesamt'
};
EnergyBarGraph.i18n = Util.LOCALE === 'de' ? EnergyBarGraph.de_strings : EnergyBarGraph.en;
Util.defineGlobal('lab$graph$EnergyBarGraph', EnergyBarGraph);
