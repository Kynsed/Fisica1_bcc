import { AbstractSubject } from '../util/AbstractSubject.js';
import { DoubleRect } from '../util/DoubleRect.js';
import { GraphLine } from './GraphLine.js';
import { GenericEvent, ParameterBoolean, ParameterNumber, ParameterString } from '../util/Observe.js';
import { SimView } from '../view/SimView.js';
import { Util } from '../util/Util.js';
export class AutoScale extends AbstractSubject {
    constructor(name, graphLine, simView) {
        super(name);
        this.enabled_ = true;
        this.isActive_ = true;
        this.ownEvent_ = false;
        this.axis_ = AutoScale.BOTH_AXES;
        this.rangeSetX_ = false;
        this.rangeSetY_ = false;
        this.rangeXHi_ = 0;
        this.rangeXLo_ = 0;
        this.rangeYHi_ = 0;
        this.rangeYLo_ = 0;
        this.timeWindow_ = 10;
        this.extraMargin = 0.01;
        this.minSize = 1E-14;
        if (!(graphLine instanceof GraphLine)) {
            throw 'not a GraphLine ' + graphLine;
        }
        this.graphLines_ = [];
        this.graphLines_.push(graphLine);
        graphLine.addObserver(this);
        this.simView_ = simView;
        simView.addMemo(this);
        simView.addObserver(this);
        this.lastIndex_ = Util.repeat(-1, this.graphLines_.length);
        const timeWindowParam = new ParameterNumber(this, AutoScale.en.TIME_WINDOW, AutoScale.i18n.TIME_WINDOW, () => this.getTimeWindow(), a => this.setTimeWindow(a));
        timeWindowParam.setSignifDigits(3);
        this.addParameter(timeWindowParam);
        const choices = [AutoScale.VERTICAL, AutoScale.HORIZONTAL, AutoScale.BOTH_AXES];
        this.addParameter(new ParameterString(this, AutoScale.en.AXIS, AutoScale.i18n.AXIS, () => this.getAxis(), a => this.setAxis(a), choices, choices));
        this.addParameter(new ParameterBoolean(this, AutoScale.en.ACTIVE, AutoScale.i18n.ACTIVE, () => this.getActive(), a => this.setActive(a)));
        this.addParameter(new ParameterBoolean(this, AutoScale.en.ENABLED, AutoScale.i18n.ENABLED, () => this.getEnabled(), a => this.setEnabled(a)));
        this.setComputed(this.isActive_);
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', enabled_: ' + this.enabled_
            + ', isActive_: ' + this.isActive_
            + ', axis_: ' + this.axis_
            + ', extraMargin: ' + Util.NF(this.extraMargin)
            + ', minSize: ' + Util.NF(this.minSize)
            + ', timeWindow_: ' + Util.NF(this.timeWindow_)
            + ', simView_: ' + this.simView_.toStringShort()
            + ', graphLines_: ['
            + this.graphLines_.map(g => g.toStringShort())
            + ']' + super.toString();
    }
    ;
    getClassName() {
        return 'AutoScale';
    }
    ;
    addGraphLine(graphLine) {
        if (!(graphLine instanceof GraphLine)) {
            throw 'not a GraphLine ' + graphLine;
        }
        if (!this.graphLines_.includes(graphLine)) {
            this.graphLines_.push(graphLine);
            this.lastIndex_.push(-1);
        }
    }
    ;
    clearRange() {
        this.rangeXLo_ = 0;
        this.rangeXHi_ = 0;
        this.rangeSetX_ = false;
        this.rangeYLo_ = 0;
        this.rangeYHi_ = 0;
        this.rangeSetY_ = false;
    }
    ;
    getActive() {
        return this.isActive_;
    }
    ;
    getAxis() {
        return this.axis_;
    }
    ;
    getEnabled() {
        return this.enabled_;
    }
    ;
    getRangeRect() {
        return new DoubleRect(this.rangeXLo_, this.rangeYLo_, this.rangeXHi_, this.rangeYHi_);
    }
    ;
    getTimeWindow() {
        return this.timeWindow_;
    }
    ;
    memorize() {
        for (let i = 0, n = this.graphLines_.length; i < n; i++) {
            const graphPts = this.graphLines_[i].getGraphPoints();
            if (this.lastIndex_[i] > graphPts.getEndIndex()) {
                this.reset();
            }
        }
        for (let i = 0, n = this.graphLines_.length; i < n; i++) {
            const graphPts = this.graphLines_[i].getGraphPoints();
            const iter = graphPts.getIterator(this.lastIndex_[i]);
            while (iter.hasNext()) {
                const gp = iter.nextValue();
                this.updateRange_(this.graphLines_[i], gp.x, gp.y);
                this.lastIndex_[i] = iter.getIndex();
            }
        }
        this.rangeCheck_();
    }
    ;
    observe(event) {
        if (event.getSubject() == this.simView_) {
            if (event.nameEquals(SimView.SIM_RECT_CHANGED)) {
                if (!this.ownEvent_) {
                    this.setActive(false);
                }
            }
        }
        else if (this.graphLines_.includes(event.getSubject())) {
            if (event.nameEquals(GraphLine.en.X_VARIABLE) ||
                event.nameEquals(GraphLine.en.Y_VARIABLE)) {
                this.reset();
            }
            else if (event.nameEquals(GraphLine.RESET)) {
                this.setActive(true);
            }
        }
    }
    ;
    rangeCheck_() {
        let avg, incr;
        const e = this.minSize;
        if (this.rangeXHi_ - this.rangeXLo_ < e) {
            avg = (this.rangeXHi_ + this.rangeXLo_) / 2;
            incr = Math.max(avg * e, e);
            this.rangeXHi_ = avg + incr;
            this.rangeXLo_ = avg - incr;
        }
        if (this.rangeYHi_ - this.rangeYLo_ < e) {
            avg = (this.rangeYHi_ + this.rangeYLo_) / 2;
            incr = Math.max(avg * e, e);
            this.rangeYHi_ = avg + incr;
            this.rangeYLo_ = avg - incr;
        }
        let nr = this.getRangeRect();
        const sr = this.simView_.getSimRect();
        if (this.axis_ == AutoScale.VERTICAL) {
            nr = new DoubleRect(sr.getLeft(), nr.getBottom(), sr.getRight(), nr.getTop());
        }
        else if (this.axis_ == AutoScale.HORIZONTAL) {
            nr = new DoubleRect(nr.getLeft(), sr.getBottom(), nr.getRight(), sr.getTop());
        }
        if (this.isActive_ && !nr.nearEqual(sr)) {
            this.ownEvent_ = true;
            this.simView_.setSimRect(nr);
            this.ownEvent_ = false;
            this.broadcast(new GenericEvent(this, AutoScale.AUTO_SCALE, nr));
        }
    }
    ;
    removeGraphLine(graphLine) {
        if (!(graphLine instanceof GraphLine)) {
            throw 'not a GraphLine ' + graphLine;
        }
        const idx = this.graphLines_.indexOf(graphLine);
        if (idx < 0) {
            throw 'not found ' + graphLine;
        }
        this.graphLines_.splice(idx, 1);
        this.lastIndex_.splice(idx, 1);
        Util.assert(!this.graphLines_.includes(graphLine));
        this.reset();
    }
    ;
    reset() {
        this.clearRange();
        for (let i = 0, n = this.lastIndex_.length; i < n; i++) {
            this.lastIndex_[i] = -1;
        }
    }
    ;
    setActive(value) {
        if (this.isActive_ != value) {
            if (value) {
                if (this.enabled_) {
                    this.reset();
                    this.simView_.addMemo(this);
                    this.setComputed(true);
                    this.isActive_ = true;
                    this.broadcastParameter(AutoScale.en.ACTIVE);
                }
            }
            else {
                this.simView_.removeMemo(this);
                this.setComputed(false);
                this.isActive_ = false;
                this.broadcastParameter(AutoScale.en.ACTIVE);
            }
        }
        Util.assert(this.enabled_ || !this.isActive_);
    }
    ;
    setAxis(value) {
        if (value == AutoScale.VERTICAL || value == AutoScale.HORIZONTAL
            || value == AutoScale.BOTH_AXES) {
            this.axis_ = value;
            this.broadcastParameter(AutoScale.en.AXIS);
        }
        else {
            throw 'unknown ' + value;
        }
    }
    ;
    setComputed(value) {
        const names = [SimView.en.WIDTH, SimView.en.HEIGHT, SimView.en.CENTER_X,
            SimView.en.CENTER_Y];
        names.forEach(nm => this.simView_.getParameter(nm).setComputed(value));
    }
    ;
    setEnabled(value) {
        if (this.enabled_ != value) {
            this.enabled_ = value;
            this.setActive(value);
            this.broadcastParameter(AutoScale.en.ENABLED);
        }
        Util.assert(this.enabled_ || !this.isActive_);
    }
    ;
    setTimeWindow(value) {
        if (Util.veryDifferent(value, this.timeWindow_)) {
            this.timeWindow_ = value;
            this.reset();
            this.memorize();
            this.setActive(true);
            this.broadcastParameter(AutoScale.en.TIME_WINDOW);
        }
    }
    ;
    updateRange_(line, nowX, nowY) {
        if (!isFinite(nowX)) {
            if (nowX == Number.POSITIVE_INFINITY) {
                nowX = 1e308;
            }
            else if (nowX == Number.NEGATIVE_INFINITY) {
                nowX = -1e308;
            }
        }
        if (!isFinite(nowY)) {
            if (nowY == Number.POSITIVE_INFINITY) {
                nowY = 1e308;
            }
            else if (nowY == Number.NEGATIVE_INFINITY) {
                nowY = -1e308;
            }
        }
        const timeIdx = line.getVarsList().timeIndex();
        const xIsTimeVar = line.getXVariable() == timeIdx;
        const yIsTimeVar = line.getYVariable() == timeIdx;
        if (!this.rangeSetX_) {
            this.rangeXLo_ = nowX;
            this.rangeXHi_ = nowX + (xIsTimeVar ? this.timeWindow_ : 0);
            this.rangeSetX_ = true;
        }
        else {
            if (nowX < this.rangeXLo_) {
                if (xIsTimeVar) {
                    this.rangeXLo_ = nowX;
                    this.rangeXHi_ = nowX + this.timeWindow_;
                }
                else {
                    this.rangeXLo_ = nowX - this.extraMargin * (this.rangeXHi_ - this.rangeXLo_);
                }
            }
            if (xIsTimeVar) {
                if (nowX > this.rangeXHi_ - this.extraMargin * this.timeWindow_) {
                    this.rangeXHi_ = nowX + this.extraMargin * this.timeWindow_;
                    this.rangeXLo_ = this.rangeXHi_ - this.timeWindow_;
                }
            }
            else {
                if (nowX > this.rangeXHi_) {
                    this.rangeXHi_ = nowX + this.extraMargin * (this.rangeXHi_ - this.rangeXLo_);
                }
            }
        }
        if (!this.rangeSetY_) {
            this.rangeYLo_ = nowY;
            this.rangeYHi_ = nowY + (yIsTimeVar ? this.timeWindow_ : 0);
            this.rangeSetY_ = true;
        }
        else {
            if (nowY < this.rangeYLo_) {
                if (yIsTimeVar) {
                    this.rangeYLo_ = nowY;
                    this.rangeYHi_ = nowY + this.timeWindow_;
                }
                else {
                    this.rangeYLo_ = nowY - this.extraMargin * (this.rangeYHi_ - this.rangeYLo_);
                }
            }
            if (yIsTimeVar) {
                if (nowY > this.rangeYHi_ - this.extraMargin * this.timeWindow_) {
                    this.rangeYHi_ = nowY + this.extraMargin * this.timeWindow_;
                    this.rangeYLo_ = this.rangeYHi_ - this.timeWindow_;
                }
            }
            else {
                if (nowY > this.rangeYHi_) {
                    this.rangeYHi_ = nowY + this.extraMargin * (this.rangeYHi_ - this.rangeYLo_);
                }
            }
        }
    }
    ;
}
AutoScale.AUTO_SCALE = 'AUTO_SCALE';
AutoScale.BOTH_AXES = 'BOTH_AXES';
AutoScale.HORIZONTAL = 'HORIZONTAL';
AutoScale.VERTICAL = 'VERTICAL';
AutoScale.en = {
    AXIS: 'axis',
    TIME_WINDOW: 'time window',
    ACTIVE: 'active',
    ENABLED: 'enabled'
};
AutoScale.de_strings = {
    AXIS: 'Achse',
    TIME_WINDOW: 'Zeitfenster',
    ACTIVE: 'aktiviert',
    ENABLED: 'ermöglichte'
};
AutoScale.i18n = Util.LOCALE === 'de' ? AutoScale.de_strings : AutoScale.en;
Util.defineGlobal('lab$graph$AutoScale', AutoScale);
