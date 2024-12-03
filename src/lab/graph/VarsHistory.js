import { CircularList } from '../util/HistoryList.js';
import { Util } from '../util/Util.js';
export class VarsHistory {
    constructor(variablesList, opt_capacity) {
        this.numberFormat = Util.NF5E;
        this.separator = '\t';
        this.variablesList_ = variablesList;
        this.dataPoints_ = new CircularList(opt_capacity || 100000);
        this.varIndex_ = Util.range(this.variablesList_.numVariables());
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', samples: ' + this.dataPoints_.getSize()
            + ', separator: ' + this.separator
            + ', varIndex_: [' + Util.array2string(this.varIndex_, Util.NF0)
            + ']}';
    }
    ;
    toStringShort() {
        return 'VarsHistory{variablesList: ' + this.variablesList_.toStringShort() + '}';
    }
    ;
    getDataPoints() {
        return this.dataPoints_;
    }
    ;
    getVariables() {
        return Array.from(this.varIndex_);
    }
    ;
    memorize() {
        const vars = this.variablesList_.getValues(true);
        const data = this.varIndex_.map(idx => vars[idx]);
        const last = this.dataPoints_.getEndValue();
        if (last == null || !Util.equals(data, last)) {
            this.dataPoints_.store(data);
        }
    }
    ;
    output(opt_localized) {
        if (opt_localized === undefined) {
            opt_localized = true;
        }
        let s = '';
        this.varIndex_.forEach((idx, i) => {
            s += (i > 0 ? this.separator : '');
            s += this.variablesList_.getVariable(idx).getName(opt_localized);
        });
        s += '\n';
        const iter = this.dataPoints_.getIterator();
        while (iter.hasNext()) {
            const data = iter.nextValue();
            s += Util.array2string(data, this.numberFormat, this.separator) + '\n';
        }
        return s;
    }
    ;
    reset() {
        this.dataPoints_.reset();
    }
    ;
    setVariables(varIndex) {
        const numVars = this.variablesList_.numVariables();
        varIndex.forEach(idx => {
            if (idx < 0 || idx > numVars - 1) {
                throw 'variable index ' + idx + ' not between 0 and ' + (numVars - 1);
            }
        });
        this.varIndex_ = varIndex;
        this.dataPoints_.reset();
    }
    ;
    setNumberFormat(numberFormatFn) {
        this.numberFormat = numberFormatFn;
    }
    ;
    setSeparator(separator) {
        this.separator = separator;
    }
    ;
    toArray() {
        const iter = this.dataPoints_.getIterator();
        const r = [];
        while (iter.hasNext()) {
            r.push(iter.nextValue());
        }
        return r;
    }
    ;
}
Util.defineGlobal('lab$graph$VarsHistory', VarsHistory);
