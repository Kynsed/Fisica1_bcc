import { Util } from '../util/Util.js';
export class NumericControlBase {
    constructor(label, getter, setter, textField) {
        this.signifDigits_ = 3;
        this.decimalPlaces_ = -1;
        this.columns_ = Math.max(8, 1 + this.signifDigits_);
        this.lastValue_ = '';
        this.firstClick_ = false;
        this.label_ = label;
        this.getter_ = getter;
        this.setter_ = setter;
        this.value_ = getter();
        if (typeof this.value_ !== 'number') {
            throw 'not a number ' + this.value_;
        }
        let labelElement = null;
        if (textField !== undefined) {
            const parent = textField.parentElement;
            if (parent !== null && parent.tagName == 'LABEL') {
                labelElement = parent;
            }
        }
        else {
            textField = document.createElement('input');
            textField.type = 'text';
            textField.size = this.columns_;
            labelElement = document.createElement('label');
            labelElement.appendChild(document.createTextNode(this.label_));
            labelElement.appendChild(textField);
        }
        this.textField_ = textField;
        this.topElement_ = labelElement !== null ? labelElement : this.textField_;
        this.textField_.style.textAlign = 'right';
        this.changeFn_ = this.validate.bind(this);
        this.textField_.addEventListener('change', this.changeFn_, true);
        this.focusFn_ = this.gainFocus.bind(this);
        this.textField_.addEventListener('focus', this.focusFn_, false);
        this.clickFn_ = this.doClick.bind(this);
        this.textField_.addEventListener('click', this.clickFn_, false);
        this.formatTextField();
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', signifDigits_: ' + this.signifDigits_
            + ', decimalPlaces_: ' + this.decimalPlaces_
            + ', columns_: ' + this.columns_
            + '}';
    }
    ;
    toStringShort() {
        return this.getClassName() + '{label_: "' + this.label_ + '"}';
    }
    ;
    columnsNeeded(x, sigDigits) {
        const mag = NumericControlBase.magnitude(x);
        return 2 + this.decimalPlacesNeeded(x, sigDigits) + (mag > 0 ? mag : 0);
    }
    ;
    decimalPlacesNeeded(x, sigDigits) {
        if (this.decimalPlaces_ > -1) {
            return this.decimalPlaces_;
        }
        else {
            let d = sigDigits - 1 - NumericControlBase.magnitude(x);
            if (d > 16) {
                d = 16;
            }
            return d > 0 ? d : 0;
        }
    }
    ;
    disconnect() {
        this.textField_.removeEventListener('change', this.changeFn_, true);
        this.textField_.removeEventListener('focus', this.focusFn_, false);
        this.textField_.removeEventListener('click', this.clickFn_, false);
    }
    ;
    doClick(_event) {
        if (this.firstClick_) {
            this.textField_.select();
            this.firstClick_ = false;
        }
    }
    ;
    formatTextField() {
        const dec = this.decimalPlacesNeeded(this.value_, this.signifDigits_);
        const col = this.columnsNeeded(this.value_, this.signifDigits_);
        this.lastValue_ = this.value_.toFixed(dec);
        this.textField_.value = this.lastValue_;
        if (col != this.columns_) {
            this.columns_ = col;
            this.textField_.size = this.columns_;
        }
    }
    ;
    gainFocus(_event) {
        this.firstClick_ = true;
    }
    ;
    getClassName() {
        return 'NumericControlBase';
    }
    ;
    getDecimalPlaces() {
        return this.decimalPlaces_;
    }
    ;
    getElement() {
        return this.topElement_;
    }
    ;
    getParameter() {
        return null;
    }
    ;
    getSignifDigits() {
        return this.signifDigits_;
    }
    ;
    getValue() {
        return this.value_;
    }
    ;
    static magnitude(x) {
        if (Math.abs(x) < 1E-15) {
            return 0;
        }
        else {
            return Math.floor(Math.LOG10E * Math.log(Math.abs(x)));
        }
    }
    ;
    observe(_event) {
        this.setValue(this.getter_());
    }
    ;
    setDecimalPlaces(decimalPlaces) {
        if (this.decimalPlaces_ != decimalPlaces) {
            this.decimalPlaces_ = decimalPlaces > -1 ? decimalPlaces : -1;
            this.formatTextField();
        }
        return this;
    }
    ;
    setEnabled(enabled) {
        this.textField_.disabled = !enabled;
    }
    ;
    setSignifDigits(signifDigits) {
        if (this.signifDigits_ != signifDigits) {
            this.signifDigits_ = signifDigits;
            this.formatTextField();
        }
        return this;
    }
    ;
    setValue(value) {
        if (value != this.value_) {
            try {
                if (isNaN(value)) {
                    throw 'not a number ' + value;
                }
                this.value_ = value;
                this.setter_(value);
            }
            catch (ex) {
                alert(ex);
                this.value_ = this.getter_();
            }
            this.formatTextField();
        }
    }
    ;
    validate(_event) {
        const nowValue = this.textField_.value.replace(/^\s*|\s*$/g, '');
        if (nowValue != this.lastValue_) {
            const value = parseFloat(nowValue);
            if (isNaN(value)) {
                alert('not a number: ' + nowValue);
                this.formatTextField();
            }
            else {
                this.setValue(value);
            }
        }
    }
    ;
}
Util.defineGlobal('lab$controls$NumericControlBase', NumericControlBase);
export class NumericControl extends NumericControlBase {
    constructor(parameter, textField) {
        super(parameter.getName(true) + parameter.getUnits(), () => parameter.getValue(), a => parameter.setValue(a), textField);
        this.parameter_ = parameter;
        this.setSignifDigits(parameter.getSignifDigits());
        this.setDecimalPlaces(parameter.getDecimalPlaces());
        this.parameter_.getSubject().addObserver(this);
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', parameter_: ' + this.parameter_.toStringShort() + '}';
    }
    ;
    disconnect() {
        super.disconnect();
        this.parameter_.getSubject().removeObserver(this);
    }
    ;
    getClassName() {
        return 'NumericControl';
    }
    ;
    getParameter() {
        return this.parameter_;
    }
    ;
    observe(event) {
        if (event === this.parameter_) {
            super.observe(event);
            this.setSignifDigits(this.parameter_.getSignifDigits());
            this.setDecimalPlaces(this.parameter_.getDecimalPlaces());
        }
    }
    ;
}
Util.defineGlobal('lab$controls$NumericControl', NumericControl);
