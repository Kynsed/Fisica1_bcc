import { AbstractSubject } from '../util/AbstractSubject.js';
import { CircularList } from '../util/HistoryList.js';
import { DrawingModeChoices, DrawingModeValues } from '../view/DrawingMode.js';
import { GenericEvent, ParameterNumber, ParameterString } from '../util/Observe.js';
import { Util } from '../util/Util.js';
import { VarsList } from '../model/VarsList.js';
export class GraphLine extends AbstractSubject {
    constructor(name, varsList, opt_capacity) {
        super(name);
        this.xVar_ = -1;
        this.yVar_ = -1;
        this.changed_ = true;
        this.drawColor_ = 'lime';
        this.drawMode_ = "lines";
        this.lineWidth_ = 1.0;
        this.hotSpotColor_ = 'red';
        this.styles_ = [];
        this.xTransform = (x, _y) => x;
        this.yTransform = (_x, y) => y;
        this.varsList_ = varsList;
        varsList.addObserver(this);
        this.yVarParam_ = new ParameterNumber(this, GraphLine.en.Y_VARIABLE, GraphLine.i18n.Y_VARIABLE, () => this.getYVariable(), a => this.setYVariable(a))
            .setLowerLimit(-1);
        this.addParameter(this.yVarParam_);
        this.xVarParam_ = new ParameterNumber(this, GraphLine.en.X_VARIABLE, GraphLine.i18n.X_VARIABLE, () => this.getXVariable(), a => this.setXVariable(a))
            .setLowerLimit(-1);
        this.addParameter(this.xVarParam_);
        this.buildMenu();
        this.dataPoints_ = new CircularList(opt_capacity || 100000);
        this.addGraphStyle();
        this.addParameter(new ParameterNumber(this, GraphLine.en.LINE_WIDTH, GraphLine.i18n.LINE_WIDTH, () => this.getLineWidth(), a => this.setLineWidth(a)));
        this.addParameter(new ParameterString(this, GraphLine.en.DRAWING_MODE, GraphLine.i18n.DRAWING_MODE, () => this.getDrawingMode(), a => this.setDrawingMode(a), DrawingModeChoices(), DrawingModeValues()));
        this.addParameter(new ParameterString(this, GraphLine.en.GRAPH_COLOR, GraphLine.i18n.GRAPH_COLOR, () => this.getColor(), a => this.setColor(a)));
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', drawColor_:"' + this.drawColor_ + '"'
            + ', lineWidth_: ' + Util.NF(this.lineWidth_)
            + ', drawMode_: ' + this.drawMode_
            + ', hotSpotColor_:"' + this.hotSpotColor_ + '"'
            + ', styles_.length: ' + Util.NF(this.styles_.length)
            + ', varsList: ' + this.varsList_.toStringShort()
            + ', dataPoints_: ' + this.dataPoints_
            + super.toString();
    }
    ;
    toStringShort() {
        return super.toStringShort().slice(0, -1)
            + ', xVar: ' + Util.NF(this.xVar_)
            + ', yVar: ' + Util.NF(this.yVar_)
            + '}';
    }
    ;
    getClassName() {
        return 'GraphLine';
    }
    ;
    addGraphStyle() {
        this.styles_.push(new GraphStyle(this.dataPoints_.getEndIndex() + 1, this.drawMode_, this.drawColor_, this.lineWidth_));
        this.changed_ = true;
    }
    ;
    buildMenu() {
        const varNames = [GraphLine.i18n.NONE];
        const vals = [-1];
        for (let i = 0, len = this.varsList_.numVariables(); i < len; i++) {
            varNames.push(this.varsList_.getVariable(i).getName(true));
            vals.push(i);
        }
        this.yVarParam_.setChoices(varNames, vals);
        this.xVarParam_.setChoices(varNames, vals);
    }
    ;
    getChanged() {
        if (this.changed_) {
            this.changed_ = false;
            return true;
        }
        else {
            return false;
        }
    }
    ;
    getColor() {
        return this.drawColor_;
    }
    ;
    getDrawingMode() {
        return this.drawMode_;
    }
    ;
    getGraphPoints() {
        return this.dataPoints_;
    }
    ;
    getGraphStyle(index) {
        const styles = this.styles_;
        if (styles.length == 0) {
            throw 'graph styles list is empty';
        }
        let last = styles[0];
        for (let i = 1, len = styles.length; i < len; i++) {
            const s = styles[i];
            Util.assert(last.index_ <= s.index_);
            if (s.index_ > index)
                break;
            last = s;
        }
        Util.assert(Util.isObject(last));
        return last;
    }
    ;
    getHotSpotColor() {
        return this.hotSpotColor_;
    }
    ;
    getLineWidth() {
        return this.lineWidth_;
    }
    ;
    getVarsList() {
        return this.varsList_;
    }
    ;
    getXVariable() {
        return this.xVar_;
    }
    ;
    getXVarName() {
        return this.xVar_ > -1 ?
            this.varsList_.getVariable(this.xVar_).getName(true) : '';
    }
    ;
    getYVariable() {
        return this.yVar_;
    }
    ;
    getYVarName() {
        return this.yVar_ > -1 ?
            this.varsList_.getVariable(this.yVar_).getName(true) : '';
    }
    ;
    memorize() {
        if (this.xVar_ > -1 && this.yVar_ > -1) {
            const xVar = this.varsList_.getVariable(this.xVar_);
            const yVar = this.varsList_.getVariable(this.yVar_);
            const x = xVar.getValue();
            const y = yVar.getValue();
            const nextX = this.xTransform(x, y);
            const nextY = this.yTransform(x, y);
            const seqX = xVar.getSequence();
            const seqY = yVar.getSequence();
            const newPoint = new GraphPoint(nextX, nextY, seqX, seqY);
            const last = this.dataPoints_.getEndValue();
            if (last == null || !last.equals(newPoint)) {
                this.dataPoints_.store(newPoint);
                this.changed_ = true;
            }
        }
    }
    ;
    observe(event) {
        if (event.getSubject() == this.varsList_) {
            if (event.nameEquals(VarsList.VARS_MODIFIED)) {
                this.buildMenu();
            }
        }
    }
    reset() {
        this.dataPoints_.reset();
        this.resetStyle();
        this.memorize();
        this.broadcast(new GenericEvent(this, GraphLine.RESET));
    }
    ;
    resetStyle() {
        this.styles_ = [];
        this.addGraphStyle();
        this.changed_ = true;
    }
    ;
    setColor(color) {
        if (this.drawColor_ != color) {
            this.drawColor_ = color;
            this.addGraphStyle();
            this.changed_ = true;
            this.broadcastParameter(GraphLine.en.GRAPH_COLOR);
        }
    }
    ;
    setDrawingMode(value) {
        if (this.drawMode_ != value) {
            this.drawMode_ = value;
            this.addGraphStyle();
            this.changed_ = true;
            this.broadcastParameter(GraphLine.en.DRAWING_MODE);
        }
    }
    ;
    setHotSpotColor(color) {
        this.hotSpotColor_ = color;
        this.changed_ = true;
    }
    ;
    setLineWidth(value) {
        if (Util.veryDifferent(value, this.lineWidth_)) {
            this.lineWidth_ = value;
            this.addGraphStyle();
            this.changed_ = true;
            this.broadcastParameter(GraphLine.en.LINE_WIDTH);
        }
    }
    ;
    setXVariable(xVar) {
        if (typeof xVar === 'string') {
            var v = this.varsList_.getVariable(xVar);
            xVar = this.varsList_.indexOf(v);
        }
        else if (xVar < -1 || xVar > this.varsList_.numVariables() - 1) {
            throw 'setXVariable bad index ' + xVar;
        }
        if (this.xVar_ != xVar) {
            this.xVar_ = xVar;
            this.reset();
            this.broadcastParameter(GraphLine.en.X_VARIABLE);
        }
    }
    ;
    setYVariable(yVar) {
        if (typeof yVar === 'string') {
            var v = this.varsList_.getVariable(yVar);
            yVar = this.varsList_.indexOf(v);
        }
        else if (yVar < -1 || yVar > this.varsList_.numVariables() - 1) {
            throw 'setYVariable bad index ' + yVar;
        }
        if (this.yVar_ != yVar) {
            this.yVar_ = yVar;
            this.reset();
            this.broadcastParameter(GraphLine.en.Y_VARIABLE);
        }
    }
    ;
}
GraphLine.RESET = 'RESET';
GraphLine.en = {
    DRAWING_MODE: 'draw mode',
    GRAPH_COLOR: 'graph color',
    GRAPH_DRAW_MODE: 'graph draw mode',
    GRAPH_POINTS: 'graph points',
    LINE_WIDTH: 'draw width',
    X_VARIABLE: 'X variable',
    Y_VARIABLE: 'Y variable',
    CLEAR_GRAPH: 'clear graph',
    NONE: '-none-'
};
GraphLine.de_strings = {
    DRAWING_MODE: 'Zeichnenart',
    GRAPH_COLOR: 'Graph Farbe',
    GRAPH_DRAW_MODE: 'Graph Zeichnenart',
    GRAPH_POINTS: 'Punkteanzahl',
    LINE_WIDTH: 'Zeichenbreite',
    X_VARIABLE: 'X Variable',
    Y_VARIABLE: 'Y Yariable',
    CLEAR_GRAPH: 'Graph erneuern',
    NONE: '-keine-'
};
GraphLine.i18n = Util.LOCALE === 'de' ? GraphLine.de_strings : GraphLine.en;
Util.defineGlobal('lab$graph$GraphLine', GraphLine);
export class GraphPoint {
    constructor(x, y, seqX, seqY) {
        if (isNaN(x) || isNaN(y)) {
            throw 'NaN in GraphPoint';
        }
        this.x = x;
        this.y = y;
        this.seqX = seqX;
        this.seqY = seqY;
    }
    ;
    toString() {
        return 'GraphPoint{x: ' + Util.NF(this.x)
            + ', y: ' + Util.NF(this.y)
            + ', seqX: ' + Util.NF(this.seqX)
            + ', seqY: ' + Util.NF(this.seqY)
            + '}';
    }
    ;
    equals(other) {
        return this.x == other.x && this.y == other.y && this.seqX == other.seqX
            && this.seqY == other.seqY;
    }
    ;
    getX() {
        return this.x;
    }
    ;
    getY() {
        return this.y;
    }
    ;
    getZ() {
        return 0;
    }
    ;
}
Util.defineGlobal('lab$graph$GraphPoint', GraphPoint);
export class GraphStyle {
    constructor(index, drawMode, color, lineWidth) {
        this.index_ = index;
        this.drawMode = drawMode;
        this.color_ = color;
        this.lineWidth = lineWidth;
    }
    ;
    toString() {
        return 'GraphStyle{index_: ' + this.index_
            + ', drawMode: ' + this.drawMode
            + ', color_:"' + this.color_ + '"'
            + ', lineWidth: ' + this.lineWidth
            + '}';
    }
    ;
}
Util.defineGlobal('lab$graph$GraphStyle', GraphStyle);
