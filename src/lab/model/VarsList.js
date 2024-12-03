import { AbstractSubject } from '../util/AbstractSubject.js';
import { GenericEvent } from '../util/Observe.js';
import { Util } from '../util/Util.js';
export class VarsList extends AbstractSubject {
    constructor(varNames, localNames, opt_name) {
        const name = opt_name !== undefined ? opt_name : 'VARIABLES';
        super(name);
        this.timeIdx_ = -1;
        this.varList_ = [];
        this.history_ = Util.DEBUG;
        this.histArray_ = [];
        if (varNames.length != localNames.length) {
            throw 'varNames and localNames are different lengths';
        }
        for (let i = 0, n = varNames.length; i < n; i++) {
            let s = varNames[i];
            if (typeof s !== 'string') {
                throw 'variable name ' + s + ' is not a string i=' + i;
            }
            s = Util.validName(Util.toName(s));
            varNames[i] = s;
            if (s == VarsList.TIME) {
                this.timeIdx_ = i;
            }
        }
        if (!Util.uniqueElements(varNames)) {
            throw 'duplicate variable names';
        }
        for (let i = 0, n = varNames.length; i < n; i++) {
            this.varList_.push(new ConcreteVariable(this, varNames[i], localNames[i]));
        }
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', timeIdx_: ' + this.timeIdx_
            + ', history_: ' + this.history_
            + ', ' + this.varList_.map((v, idx) => '(' + idx + ') ' + v.getName() + ': ' + Util.NF5E(v.getValue()))
            + super.toString();
    }
    ;
    toStringShort() {
        return super.toStringShort().slice(0, -1)
            + ', numVars: ' + this.varList_.length + '}';
    }
    ;
    getClassName() {
        return 'VarsList';
    }
    ;
    addParameter(_parameter) {
        throw 'addParameter not allowed on VarsList';
    }
    ;
    addVariable(variable) {
        const name = variable.getName();
        if (name == VarsList.DELETED) {
            throw 'variable cannot be named "' + VarsList.DELETED + '"';
        }
        const position = this.findOpenSlot_(1);
        this.varList_[position] = variable;
        if (name == VarsList.TIME) {
            this.timeIdx_ = position;
        }
        this.broadcast(new GenericEvent(this, VarsList.VARS_MODIFIED));
        return position;
    }
    addVariables(names, localNames) {
        const howMany = names.length;
        if (howMany == 0) {
            throw '';
        }
        if (names.length != localNames.length) {
            throw 'names and localNames are different lengths';
        }
        const position = this.findOpenSlot_(howMany);
        for (let i = 0; i < howMany; i++) {
            const name = Util.validName(Util.toName(names[i]));
            if (name == VarsList.DELETED) {
                throw "variable cannot be named ''+VarsList.DELETED+''";
            }
            const idx = position + i;
            this.varList_[idx] = new ConcreteVariable(this, name, localNames[i]);
            if (name == VarsList.TIME) {
                this.timeIdx_ = idx;
            }
        }
        this.broadcast(new GenericEvent(this, VarsList.VARS_MODIFIED));
        return position;
    }
    ;
    checkIndex_(index) {
        if (index < 0 || index >= this.varList_.length) {
            throw 'bad variable index=' + index + '; numVars=' + this.varList_.length;
        }
    }
    ;
    deleteVariables(index, howMany) {
        if (howMany == 0) {
            return;
        }
        if (howMany < 0 || index < 0 || index + howMany > this.varList_.length) {
            throw 'deleteVariables';
        }
        for (let i = index; i < index + howMany; i++) {
            this.varList_[i] = new ConcreteVariable(this, VarsList.DELETED, VarsList.DELETED);
        }
        this.broadcast(new GenericEvent(this, VarsList.VARS_MODIFIED));
    }
    ;
    findOpenSlot_(quantity) {
        if (quantity < 0) {
            throw '';
        }
        let found = 0;
        let startIdx = -1;
        for (let i = 0, n = this.varList_.length; i < n; i++) {
            if (this.varList_[i].getName() == VarsList.DELETED) {
                if (startIdx == -1) {
                    startIdx = i;
                }
                found++;
                if (found >= quantity) {
                    return startIdx;
                }
            }
            else {
                startIdx = -1;
                found = 0;
            }
        }
        let expand;
        if (found > 0) {
            expand = quantity - found;
            Util.assert(startIdx >= 0 && expand > 0);
        }
        else {
            startIdx = this.varList_.length;
            expand = quantity;
        }
        for (let i = 0; i < expand; i++) {
            this.varList_.push(new ConcreteVariable(this, VarsList.DELETED, VarsList.DELETED));
        }
        return startIdx;
    }
    ;
    getHistory() {
        return this.history_;
    }
    ;
    getParameter(name) {
        name = Util.toName(name);
        const p = this.varList_.find(p => p.getName() == name);
        if (p === undefined) {
            throw 'Parameter not found ' + name;
        }
        return p;
    }
    ;
    getParameters() {
        return Array.from(this.varList_);
    }
    ;
    getTime() {
        if (this.timeIdx_ < 0) {
            throw 'no time variable';
        }
        return this.getValue(this.timeIdx_);
    }
    ;
    getValue(index) {
        this.checkIndex_(index);
        return this.varList_[index].getValue();
    }
    ;
    getValues(computed) {
        return this.varList_.map(v => {
            if (!computed && v.isComputed()) {
                return NaN;
            }
            else {
                return v.getValue();
            }
        });
    }
    ;
    getVariable(id) {
        let index;
        if (typeof id === 'number') {
            index = id;
        }
        else if (typeof id === 'string') {
            id = Util.toName(id);
            index = this.varList_.findIndex(v => v.getName() == id);
            if (index < 0) {
                throw 'unknown variable name ' + id;
            }
        }
        else {
            throw '';
        }
        this.checkIndex_(index);
        return this.varList_[index];
    }
    ;
    incrSequence(...indexes) {
        if (indexes.length == 0) {
            for (let i = 0, n = this.varList_.length; i < n; i++) {
                this.varList_[i].incrSequence();
            }
        }
        else {
            for (let i = 0, n = indexes.length; i < n; i++) {
                const idx = indexes[i];
                this.checkIndex_(idx);
                this.varList_[idx].incrSequence();
            }
        }
    }
    ;
    indexOf(id) {
        if (typeof id === 'string') {
            id = Util.toName(id);
            return this.varList_.findIndex(v => v.getName() == id);
        }
        else {
            return this.varList_.findIndex(v => v === id);
        }
    }
    ;
    numVariables() {
        return this.varList_.length;
    }
    ;
    printOneHistory(idx) {
        let r = '';
        if (this.history_ && idx <= this.histArray_.length) {
            const v = this.histArray_[this.histArray_.length - idx];
            r = '//time = ' + Util.NF5(v[v.length - 1]);
            for (let i = 0, len = v.length - 1; i < len; i++) {
                r += '\nsim.getVarsList().setValue(' + i + ', ' + v[i] + ');';
            }
        }
        return r;
    }
    ;
    printHistory(index) {
        if (typeof index === 'number') {
            return this.printOneHistory(index);
        }
        else {
            let r = this.printOneHistory(10);
            r += '\n' + this.printOneHistory(3);
            r += '\n' + this.printOneHistory(2);
            r += '\n' + this.printOneHistory(1);
            return r;
        }
    }
    ;
    saveHistory() {
        if (this.history_) {
            const v = this.getValues();
            v.push(this.getTime());
            this.histArray_.push(v);
            if (this.histArray_.length > 20) {
                this.histArray_.shift();
            }
        }
    }
    ;
    setComputed(...indexes) {
        for (let i = 0, n = indexes.length; i < n; i++) {
            const idx = indexes[i];
            this.checkIndex_(idx);
            this.varList_[idx].setComputed(true);
        }
    }
    ;
    setHistory(value) {
        this.history_ = value;
    }
    ;
    setTime(time) {
        this.setValue(this.timeIdx_, time);
    }
    ;
    setValue(index, value, continuous) {
        this.checkIndex_(index);
        const variable = this.varList_[index];
        if (variable.getName() == VarsList.DELETED) {
            return;
        }
        if (isNaN(value) && !variable.isComputed()) {
            throw 'cannot set variable ' + variable.getName() + ' to NaN';
        }
        if (continuous) {
            variable.setValueSmooth(value);
        }
        else {
            variable.setValue(value);
        }
    }
    ;
    setValues(vars, continuous) {
        const N = this.varList_.length;
        const n = vars.length;
        if (n > N) {
            throw 'setValues bad length n=' + n + ' > N=' + N;
        }
        for (let i = 0; i < N; i++) {
            if (i < n) {
                this.setValue(i, vars[i], continuous);
            }
        }
    }
    ;
    timeIndex() {
        return this.timeIdx_;
    }
    ;
    toArray() {
        return Array.from(this.varList_);
    }
    ;
}
VarsList.VARS_MODIFIED = 'VARS_MODIFIED';
VarsList.DELETED = 'DELETED';
VarsList.TIME = 'TIME';
VarsList.en = {
    TIME: 'time'
};
VarsList.de_strings = {
    TIME: 'Zeit'
};
VarsList.i18n = Util.LOCALE === 'de' ? VarsList.de_strings : VarsList.en;
Util.defineGlobal('lab$model$VarsList', VarsList);
export class ConcreteVariable {
    constructor(varsList, name, localName) {
        this.value_ = 0;
        this.isComputed_ = false;
        this.seq_ = 0;
        this.doesBroadcast_ = false;
        this.varsList_ = varsList;
        this.name_ = Util.validName(Util.toName(name));
        this.localName_ = localName;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', isComputed_: ' + this.isComputed_
            + ', localName_: "' + this.localName_ + '"'
            + ', varsList_: ' + this.varsList_.toStringShort()
            + '}';
    }
    ;
    toStringShort() {
        return this.getClassName() + '{name_: "' + this.name_ + '"'
            + ', value_: ' + Util.NF(this.getValue()) + '}';
    }
    ;
    getClassName() {
        return 'ConcreteVariable';
    }
    ;
    getAsString() {
        return this.value_.toString();
    }
    ;
    getBroadcast() {
        return this.doesBroadcast_;
    }
    ;
    getChoices() {
        return [];
    }
    ;
    getName(opt_localized) {
        return opt_localized ? this.localName_ : this.name_;
    }
    ;
    getSequence() {
        return this.seq_;
    }
    ;
    getSubject() {
        return this.varsList_;
    }
    ;
    getValue() {
        return this.value_;
    }
    ;
    getValues() {
        return [];
    }
    ;
    incrSequence() {
        this.seq_++;
    }
    ;
    indexOf() {
        return this.varsList_.indexOf(this);
    }
    ;
    isComputed() {
        return this.isComputed_;
    }
    ;
    nameEquals(name) {
        return this.name_ == Util.toName(name);
    }
    ;
    setBroadcast(value) {
        this.doesBroadcast_ = value;
    }
    ;
    setComputed(value) {
        this.isComputed_ = value;
    }
    ;
    setFromString(value) {
        const v = Number(value);
        if (isNaN(v)) {
            throw 'not a number: ' + value + ' (ConcreteVariable.setFromString)';
        }
        this.setValue(v);
    }
    ;
    setValue(value) {
        if (this.value_ != value) {
            this.value_ = value;
            this.seq_++;
            if (this.doesBroadcast_) {
                this.varsList_.broadcast(this);
            }
        }
    }
    ;
    setValueSmooth(value) {
        this.value_ = value;
    }
    ;
}
Util.defineGlobal('lab$model$ConcreteVariable', ConcreteVariable);
