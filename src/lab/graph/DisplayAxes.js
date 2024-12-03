import { DoubleRect } from '../util/DoubleRect.js';
import { Util } from '../util/Util.js';
import { Vector } from "../util/Vector.js";
export class DisplayAxes {
    constructor(opt_simRect, opt_font, opt_color) {
        this.fontDescent = 8;
        this.fontAscent = 12;
        this.horizAlignValue_ = 0;
        this.horizAxisAlignment_ = "VALUE";
        this.vertAlignValue_ = 0;
        this.vertAxisAlignment_ = "VALUE";
        this.numDecimal_ = 0;
        this.changed_ = true;
        this.horizName_ = 'x';
        this.verticalName_ = 'y';
        this.zIndex = 100;
        this.simRect_ = opt_simRect ?? DoubleRect.EMPTY_RECT;
        this.numFont_ = opt_font ?? '14pt sans-serif';
        this.drawColor_ = opt_color ?? 'gray';
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', horizAxisAlignment_: ' + this.horizAxisAlignment_
            + ', vertAxisAlignment_: ' + this.vertAxisAlignment_
            + ', this.horizAlignValue_: ' + Util.NF(this.horizAlignValue_)
            + ', this.vertAlignValue_: ' + Util.NF(this.vertAlignValue_)
            + ', drawColor_: "' + this.drawColor_ + '"'
            + ', numFont_: "' + this.numFont_ + '"'
            + ', simRect_: ' + this.simRect_
            + ', zIndex: ' + this.zIndex
            + '}';
    }
    ;
    toStringShort() {
        return 'DisplayAxes{horizName_: "' + this.horizName_
            + '", verticalName_: "' + this.verticalName_ + '"}';
    }
    ;
    contains(_p_world) {
        return false;
    }
    ;
    draw(context, map) {
        context.save();
        context.strokeStyle = this.drawColor_;
        context.fillStyle = this.drawColor_;
        context.font = this.numFont_;
        context.textAlign = 'start';
        context.textBaseline = 'alphabetic';
        let x0, y0;
        const r = this.simRect_;
        const sim_x1 = r.getLeft();
        const sim_x2 = r.getRight();
        const sim_y1 = r.getBottom();
        const sim_y2 = r.getTop();
        const sim_right = sim_x2 - 0.06 * (sim_x2 - sim_x1);
        const sim_left = sim_x1 + 0.01 * (sim_x2 - sim_x1);
        switch (this.vertAxisAlignment_) {
            case "VALUE":
                let sim_v = this.vertAlignValue_;
                if (sim_v < sim_left) {
                    sim_v = sim_left;
                }
                else if (sim_v > sim_right) {
                    sim_v = sim_right;
                }
                x0 = map.simToScreenX(sim_v);
                break;
            case "RIGHT":
                x0 = map.simToScreenX(sim_right);
                break;
            case "LEFT":
                x0 = map.simToScreenX(sim_left);
                break;
            default:
                x0 = map.simToScreenX(r.getCenterX());
        }
        const scr_top = map.simToScreenY(sim_y2);
        const scr_bottom = map.simToScreenY(sim_y1);
        const lineHeight = 10 + this.fontDescent + this.fontAscent;
        switch (this.horizAxisAlignment_) {
            case "VALUE":
                y0 = map.simToScreenY(this.horizAlignValue_);
                if (y0 < scr_top + lineHeight) {
                    y0 = scr_top + lineHeight;
                }
                else if (y0 > scr_bottom - lineHeight) {
                    y0 = scr_bottom - lineHeight;
                }
                break;
            case "TOP":
                y0 = scr_top + lineHeight;
                break;
            case "BOTTOM":
                y0 = scr_bottom - lineHeight;
                break;
            default:
                y0 = map.simToScreenY(r.getCenterY());
        }
        context.beginPath();
        context.moveTo(map.simToScreenX(sim_x1), y0);
        context.lineTo(map.simToScreenX(sim_x2), y0);
        context.stroke();
        this.drawHorizTicks(y0, context, map, this.simRect_);
        context.beginPath();
        context.moveTo(x0, map.simToScreenY(sim_y1));
        context.lineTo(x0, map.simToScreenY(sim_y2));
        context.stroke();
        this.drawVertTicks(x0, context, map, this.simRect_);
        context.restore();
    }
    ;
    drawHorizTicks(y0, context, map, r) {
        const y1 = y0 - 4;
        const y2 = y1 + 8;
        const sim_x1 = r.getLeft();
        const sim_x2 = r.getRight();
        const graphDelta = this.getNiceIncrement(sim_x2 - sim_x1);
        let x_sim = DisplayAxes.getNiceStart(sim_x1, graphDelta);
        while (x_sim < sim_x2) {
            const x_screen = map.simToScreenX(x_sim);
            context.beginPath();
            context.moveTo(x_screen, y1);
            context.lineTo(x_screen, y2);
            context.stroke();
            const next_x_sim = x_sim + graphDelta;
            if (next_x_sim > x_sim) {
                const s = x_sim.toFixed(this.numDecimal_);
                const textWidth = context.measureText(s).width;
                context.fillText(s, x_screen - textWidth / 2, y2 + this.fontAscent);
            }
            else {
                context.fillText('scale is too small', x_screen, y2 + this.fontAscent);
                break;
            }
            x_sim = next_x_sim;
        }
        const w = context.measureText(this.horizName_).width;
        context.fillText(this.horizName_, map.simToScreenX(sim_x2) - w - 5, y0 - 8);
    }
    ;
    drawVertTicks(x0, context, map, r) {
        const x1 = x0 - 4;
        const x2 = x1 + 8;
        const sim_y1 = r.getBottom();
        const sim_y2 = r.getTop();
        const graphDelta = this.getNiceIncrement(sim_y2 - sim_y1);
        let y_sim = DisplayAxes.getNiceStart(sim_y1, graphDelta);
        while (y_sim < sim_y2) {
            const y_screen = map.simToScreenY(y_sim);
            context.beginPath();
            context.moveTo(x1, y_screen);
            context.lineTo(x2, y_screen);
            context.stroke();
            const next_y_sim = y_sim + graphDelta;
            if (next_y_sim > y_sim) {
                const s = y_sim.toFixed(this.numDecimal_);
                const textWidth = context.measureText(s).width;
                if (this.vertAxisAlignment_ === "RIGHT") {
                    context.fillText(s, x2 - (textWidth + 10), y_screen + (this.fontAscent / 2));
                }
                else {
                    context.fillText(s, x2 + 5, y_screen + (this.fontAscent / 2));
                }
            }
            else {
                context.fillText('scale is too small', x2, y_screen);
                break;
            }
            y_sim = next_y_sim;
        }
        const w = context.measureText(this.verticalName_).width;
        if (this.vertAxisAlignment_ === "RIGHT") {
            context.fillText(this.verticalName_, x0 - (w + 6), map.simToScreenY(sim_y2) + 13);
        }
        else {
            context.fillText(this.verticalName_, x0 + 6, map.simToScreenY(sim_y2) + 13);
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
    getColor() {
        return this.drawColor_;
    }
    ;
    getFont() {
        return this.numFont_;
    }
    ;
    getHorizName() {
        return this.horizName_;
    }
    ;
    getMassObjects() {
        return [];
    }
    ;
    getNiceIncrement(range) {
        const power = Math.pow(10, Math.floor(Math.log(range) / Math.LN10));
        const logTot = range / power;
        let incr;
        if (logTot >= 8)
            incr = 2;
        else if (logTot >= 5)
            incr = 1;
        else if (logTot >= 3)
            incr = 0.5;
        else if (logTot >= 2)
            incr = 0.4;
        else
            incr = 0.2;
        incr *= power;
        const dlog = Math.log(incr) / Math.LN10;
        this.numDecimal_ = (dlog < 0) ? Math.ceil(-dlog) : 0;
        return incr;
    }
    ;
    static getNiceStart(start, incr) {
        return Math.ceil(start / incr) * incr;
    }
    ;
    getPosition() {
        return Vector.ORIGIN;
    }
    ;
    getSimObjects() {
        return [];
    }
    ;
    getSimRect() {
        return this.simRect_;
    }
    ;
    getVerticalName() {
        return this.verticalName_;
    }
    ;
    getXAxisAlignment() {
        return this.horizAxisAlignment_;
    }
    ;
    getYAxisAlignment() {
        return this.vertAxisAlignment_;
    }
    ;
    getZIndex() {
        return this.zIndex;
    }
    ;
    isDragable() {
        return false;
    }
    ;
    setColor(color) {
        this.drawColor_ = color;
        this.changed_ = true;
    }
    ;
    setDragable(_dragable) {
    }
    ;
    setFont(font) {
        this.numFont_ = font;
        this.changed_ = true;
    }
    ;
    setHorizName(name) {
        this.horizName_ = name;
        this.changed_ = true;
    }
    ;
    setPosition(_position) {
    }
    ;
    setSimRect(simRect) {
        this.simRect_ = simRect;
        this.changed_ = true;
    }
    ;
    setVerticalName(name) {
        this.verticalName_ = name;
        this.changed_ = true;
    }
    ;
    setXAxisAlignment(alignment, value) {
        this.horizAxisAlignment_ = alignment;
        if (typeof value === 'number') {
            this.horizAlignValue_ = value;
        }
        this.changed_ = true;
        return this;
    }
    ;
    setYAxisAlignment(alignment, value) {
        this.vertAxisAlignment_ = alignment;
        if (typeof value === 'number') {
            this.vertAlignValue_ = value;
        }
        this.changed_ = true;
        return this;
    }
    ;
    setZIndex(zIndex) {
        if (zIndex !== undefined) {
            this.zIndex = zIndex;
        }
        this.changed_ = true;
    }
    ;
}
Util.defineGlobal('lab$graph$DisplayAxes', DisplayAxes);
