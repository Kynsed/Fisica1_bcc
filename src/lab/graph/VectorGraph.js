import { ScreenRect } from '../view/ScreenRect.js';
import { Util } from '../util/Util.js';
import { Vector } from "../util/Vector.js";
export class VectorGraph {
    constructor(sim, xVariable, yVariable) {
        this.offScreen_ = null;
        this.lastMap_ = null;
        this.screenRect_ = ScreenRect.EMPTY_RECT;
        this.needRedraw_ = true;
        this.gridPoints = 10;
        this.dotStyle = 'red';
        this.lineStyle = 'blue';
        this.zIndex = 0;
        this.sim_ = sim;
        this.xVariable_ = xVariable;
        this.yVariable_ = yVariable;
        sim.addObserver(this);
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', screenRect_: ' + this.screenRect_
            + ', zIndex: ' + this.zIndex
            + '}';
    }
    ;
    toStringShort() {
        return 'VectorGraph{sim_: ' + this.sim_.toStringShort() + '}';
    }
    ;
    contains(_p_world) {
        return false;
    }
    ;
    draw(context, map) {
        if (this.screenRect_.isEmpty()) {
            return;
        }
        context.save();
        if (this.lastMap_ == null || this.lastMap_ != map) {
            this.lastMap_ = map;
            this.needRedraw_ = true;
        }
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
        Util.assert(Util.isObject(osb));
        if (this.needRedraw_) {
            osb.clearRect(0, 0, w, h);
            this.fullDraw(osb, map);
            this.needRedraw_ = false;
        }
        context.drawImage(this.offScreen_, 0, 0, w, h);
        context.restore();
    }
    ;
    fullDraw(context, coordMap) {
        const gp = this.gridPoints;
        const sr = this.screenRect_;
        const w = sr.getWidth();
        const h = sr.getHeight();
        const left = sr.getLeft();
        const top = sr.getTop();
        const va = this.sim_.getVarsList();
        const state = Util.newNumberArray(va.numVariables());
        const change = Util.newNumberArray(va.numVariables());
        for (let i = 0; i < gp; i++) {
            for (let j = 0; j < gp; j++) {
                const x = left + (i * w / gp) + w / (2 * gp);
                const y = top + (j * h / gp) + h / (2 * gp);
                const dot = new ScreenRect(x - 3, y - 3, 6, 6);
                dot.makeOval(context);
                context.lineWidth = 1;
                context.strokeStyle = this.dotStyle;
                context.stroke();
                const sim_x = coordMap.screenToSimX(x);
                const sim_y = coordMap.screenToSimY(y);
                state[this.xVariable_] = sim_x;
                state[this.yVariable_] = sim_y;
                Util.zeroArray(change);
                this.sim_.evaluate(state, change, 0);
                const delta_x = coordMap.simToScreenScaleX(change[this.xVariable_]);
                const delta_y = coordMap.simToScreenScaleY(change[this.yVariable_]);
                const k = delta_y / delta_x;
                const r = w / (2 * gp);
                const absX = r / Math.sqrt(1 + k * k);
                const dx = delta_x > 0 ? absX : -absX;
                const dy = -k * dx;
                context.strokeStyle = this.lineStyle;
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x + dx, y + dy);
                context.stroke();
            }
        }
    }
    ;
    getChanged() {
        return this.needRedraw_;
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
    getZIndex() {
        return this.zIndex;
    }
    ;
    isDragable() {
        return false;
    }
    ;
    observe(event) {
        if (event.getSubject() == this.sim_) {
            this.needRedraw_ = true;
        }
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
    }
    ;
    setZIndex(zIndex) {
        this.zIndex = zIndex !== undefined ? zIndex : 0;
    }
    ;
}
Util.defineGlobal('lab$graph$VectorGraph', VectorGraph);
