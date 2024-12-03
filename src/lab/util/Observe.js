import { Util } from "./Util.js";
export const CHOICES_MODIFIED = 'CHOICES_MODIFIED';
export class GenericEvent {
    constructor(subject, name, value) {
        this.name_ = Util.validName(Util.toName(name));
        this.subject_ = subject;
        this.value_ = value;
    }
    ;
    toString() {
        return this.toStringShort();
    }
    ;
    toStringShort() {
        const v = this.value_;
        let s;
        if (typeof v === 'object' && v !== null && v.toStringShort !== undefined) {
            s = v.toStringShort();
        }
        else {
            s = v;
        }
        return 'GenericEvent{name_:"' + this.name_ + '"'
            + ', subject_: ' + this.subject_.toStringShort()
            + ', value_: ' + s
            + '}';
    }
    ;
    getName(opt_localized) {
        return opt_localized ? this.name_ : this.name_;
    }
    ;
    getSubject() {
        return this.subject_;
    }
    ;
    getValue() {
        return this.value_;
    }
    ;
    nameEquals(name) {
        return this.name_ == Util.toName(name);
    }
    ;
}
Util.defineGlobal('lab$util$GenericEvent', GenericEvent);
export class GenericObserver {
    constructor(subject, observeFn, opt_purpose) {
        this.purpose_ = (opt_purpose || '');
        this.subject_ = subject;
        subject.addObserver(this);
        this.observeFn_ = observeFn;
    }
    toString() {
        return this.toStringShort();
    }
    ;
    toStringShort() {
        return 'GenericObserver{subject_: ' + this.subject_.toStringShort()
            + (this.purpose_.length > 0 ? ', purpose_:"' + this.purpose_ + '"' : '')
            + '}';
    }
    ;
    disconnect() {
        this.subject_.removeObserver(this);
    }
    ;
    observe(event) {
        this.observeFn_(event);
    }
    ;
}
Util.defineGlobal('lab$util$GenericObserver', GenericObserver);
export class ParameterBoolean {
    constructor(subject, name, localName, getter, setter, opt_choices, opt_values) {
        this.isComputed_ = false;
        this.choices_ = [];
        this.values_ = [];
        this.subject_ = subject;
        this.name_ = Util.validName(Util.toName(name));
        this.localName_ = localName;
        this.getter_ = getter;
        this.setter_ = setter;
        this.isComputed_ = false;
        if (opt_choices !== undefined) {
            if (opt_values !== undefined) {
                this.setChoices(opt_choices, opt_values, false);
            }
            else {
                throw 'values not defined';
            }
        }
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', isComputed_: ' + this.isComputed_
            + ', localName_: "' + this.localName_ + '"'
            + ', choices_: ' + this.choices_
            + '}';
    }
    ;
    toStringShort() {
        return 'ParameterBoolean{name_: "' + this.name_ + '"'
            + ', subject_: ' + this.subject_.toStringShort()
            + ', value: ' + this.getValue() + '}';
    }
    ;
    getAsString() {
        return this.getValue().toString();
    }
    ;
    getChoices() {
        return Array.from(this.choices_);
    }
    ;
    getName(opt_localized) {
        return opt_localized ? this.localName_ : this.name_;
    }
    ;
    getSubject() {
        return this.subject_;
    }
    ;
    getValue() {
        return this.getter_();
    }
    ;
    getValues() {
        return this.values_.map(v => v.toString());
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
    setChoices(choices, values, opt_broadcast) {
        if (values.length !== choices.length) {
            throw 'choices and values not same length';
        }
        this.choices_ = choices;
        this.values_ = values;
        if ((opt_broadcast === undefined) || opt_broadcast) {
            const evt = new GenericEvent(this.subject_, CHOICES_MODIFIED, this);
            this.subject_.broadcast(evt);
        }
    }
    ;
    setComputed(value) {
        this.isComputed_ = value;
    }
    ;
    setFromString(value) {
        this.setValue(value == 'true' || value == 'TRUE');
    }
    ;
    setValue(value) {
        if (typeof value !== 'boolean')
            throw 'non-boolean value: ' + value;
        if (value !== this.getValue()) {
            this.setter_(value);
        }
    }
    ;
}
;
Util.defineGlobal('lab$util$ParameterBoolean', ParameterBoolean);
export class ParameterNumber {
    constructor(subject, name, localName, getter, setter, opt_choices, opt_values) {
        this.units_ = '';
        this.isComputed_ = false;
        this.signifDigits_ = 3;
        this.decimalPlaces_ = -1;
        this.lowerLimit_ = 0;
        this.upperLimit_ = Number.POSITIVE_INFINITY;
        this.choices_ = [];
        this.values_ = [];
        this.subject_ = subject;
        this.name_ = Util.validName(Util.toName(name));
        this.localName_ = localName;
        this.getter_ = getter;
        this.setter_ = setter;
        if (opt_choices !== undefined) {
            if (opt_values !== undefined) {
                this.setChoices(opt_choices, opt_values, false);
            }
            else {
                throw 'values is not defined';
            }
        }
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', isComputed_: ' + this.isComputed_
            + ', localName_: "' + this.localName_ + '"'
            + ', units_: "' + this.units_ + '"'
            + ', lowerLimit_: ' + Util.NF(this.lowerLimit_)
            + ', upperLimit_: ' + Util.NF(this.upperLimit_)
            + ', decimalPlaces_: ' + this.decimalPlaces_
            + ', signifDigits_: ' + this.signifDigits_
            + ', choices_: [' + this.choices_ + ']'
            + ', values_: [' + this.values_ + ']'
            + '}';
    }
    ;
    toStringShort() {
        return 'ParameterNumber{name_: "' + this.name_ + '"'
            + ', subject_: ' + this.subject_.toStringShort()
            + ', value: ' + Util.NF(this.getValue()) + '}';
    }
    ;
    getAsString() {
        return this.getValue().toString();
    }
    ;
    getChoices() {
        return Array.from(this.choices_);
    }
    ;
    getDecimalPlaces() {
        return this.decimalPlaces_;
    }
    ;
    getLowerLimit() {
        return this.lowerLimit_;
    }
    ;
    getName(opt_localized) {
        return opt_localized ? this.localName_ : this.name_;
    }
    ;
    getSignifDigits() {
        return this.signifDigits_;
    }
    ;
    getSubject() {
        return this.subject_;
    }
    ;
    getUnits() {
        return this.units_;
    }
    ;
    getUpperLimit() {
        return this.upperLimit_;
    }
    ;
    getValue() {
        return this.getter_();
    }
    ;
    getValues() {
        return this.values_.map(v => v.toString());
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
    setChoices(choices, values, opt_broadcast) {
        if (values.length !== choices.length) {
            throw 'choices and values not same length';
        }
        this.choices_ = choices;
        this.values_ = values;
        if ((opt_broadcast === undefined) || opt_broadcast) {
            const evt = new GenericEvent(this.subject_, CHOICES_MODIFIED, this);
            this.subject_.broadcast(evt);
        }
    }
    ;
    setComputed(value) {
        this.isComputed_ = value;
    }
    ;
    setDecimalPlaces(decimals) {
        this.decimalPlaces_ = decimals;
        return this;
    }
    ;
    setFromString(value) {
        const v = Number(value);
        if (isNaN(v)) {
            throw 'not a number: ' + value;
        }
        this.setValue(v);
    }
    ;
    setLowerLimit(lowerLimit) {
        if (lowerLimit > this.getValue() || lowerLimit > this.upperLimit_)
            throw 'out of range: ' + lowerLimit + ' value=' + this.getValue()
                + ' upper=' + this.upperLimit_;
        this.lowerLimit_ = lowerLimit;
        return this;
    }
    ;
    setSignifDigits(signifDigits) {
        this.signifDigits_ = signifDigits;
        return this;
    }
    ;
    setUnits(value) {
        this.units_ = value;
        return this;
    }
    ;
    setUpperLimit(upperLimit) {
        if (upperLimit < this.getValue() || upperLimit < this.lowerLimit_)
            throw 'out of range: ' + upperLimit + ' value=' + this.getValue()
                + ' lower=' + this.lowerLimit_;
        this.upperLimit_ = upperLimit;
        return this;
    }
    ;
    setValue(value) {
        if (typeof value !== 'number') {
            throw 'not a number: ' + value;
        }
        if (value < this.lowerLimit_ || value > this.upperLimit_) {
            throw 'out of range. ' + value + ' is not between ' + this.lowerLimit_
                + ' and ' + this.upperLimit_;
        }
        if (this.values_.length > 0) {
            if (!this.values_.includes(value)) {
                throw value + ' is not an allowed value among: [' + this.values_.join(',') + ']';
            }
        }
        if (value !== this.getValue()) {
            this.setter_(value);
        }
    }
    ;
}
;
Util.defineGlobal('lab$util$ParameterNumber', ParameterNumber);
export class ParameterString {
    constructor(subject, name, localName, getter, setter, opt_choices, opt_values) {
        this.isComputed_ = false;
        this.suggestedLength_ = 20;
        this.maxLength_ = Number.POSITIVE_INFINITY;
        this.choices_ = [];
        this.values_ = [];
        this.inputFunction_ = null;
        this.subject_ = subject;
        this.name_ = Util.validName(Util.toName(name));
        this.localName_ = localName;
        this.getter_ = getter;
        this.setter_ = setter;
        if (opt_choices !== undefined) {
            if (opt_values !== undefined) {
                this.setChoices(opt_choices, opt_values, false);
            }
            else {
                throw 'values is not defined';
            }
        }
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', isComputed_: ' + this.isComputed_
            + ', localName_: "' + this.localName_ + '"'
            + ', suggestedLength_: ' + this.suggestedLength_
            + ', maxLength_: ' + this.maxLength_
            + ', choices_: [' + this.choices_ + ']'
            + ', values_: [' + this.values_ + ']'
            + '}';
    }
    ;
    toStringShort() {
        return 'ParameterString{name_: "' + this.name_ + '"'
            + ', subject_: ' + this.subject_.toStringShort()
            + ', value: "' + this.getValue() + '"}';
    }
    ;
    getAsString() {
        return this.getValue();
    }
    ;
    getChoices() {
        return Array.from(this.choices_);
    }
    ;
    getMaxLength() {
        return this.maxLength_;
    }
    ;
    getName(opt_localized) {
        return opt_localized ? this.localName_ : this.name_;
    }
    ;
    getSubject() {
        return this.subject_;
    }
    ;
    getSuggestedLength() {
        return this.suggestedLength_;
    }
    ;
    getValue() {
        return this.getter_();
    }
    ;
    getValues() {
        return Array.from(this.values_);
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
    setChoices(choices, values, opt_broadcast) {
        if (values.length !== choices.length) {
            throw 'choices and values not same length';
        }
        this.choices_ = choices;
        this.values_ = values;
        if ((opt_broadcast === undefined) || opt_broadcast) {
            const evt = new GenericEvent(this.subject_, CHOICES_MODIFIED, this);
            this.subject_.broadcast(evt);
        }
    }
    ;
    setComputed(value) {
        this.isComputed_ = value;
    }
    ;
    setFromString(value) {
        this.setValue(value);
    }
    ;
    setInputFunction(fn) {
        this.inputFunction_ = fn;
        return this;
    }
    ;
    setMaxLength(len) {
        if (len < this.getValue().length)
            throw 'too long';
        this.maxLength_ = len;
        return this;
    }
    ;
    setSuggestedLength(len) {
        this.suggestedLength_ = len;
        return this;
    }
    ;
    setValue(value) {
        if (this.inputFunction_ != null) {
            value = this.inputFunction_(value);
        }
        if (typeof value !== 'string') {
            throw 'non-string value: ' + value;
        }
        if (value.length > this.maxLength_) {
            throw 'string too long: ' + value + ' maxLength=' + this.maxLength_;
        }
        if (this.values_.length > 0) {
            if (!this.values_.includes(value)) {
                throw '"' + value + '" is not an allowed value among: [' + this.values_.join(',') + ']';
            }
        }
        if (value !== this.getValue()) {
            this.setter_(value);
        }
    }
    ;
}
;
Util.defineGlobal('lab$util$ParameterString', ParameterString);
