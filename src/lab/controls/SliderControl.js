import { Util } from '../util/Util.js';
export class SliderControl {
    constructor(parameter, min, max, multiply, increments) {
        this.textboxValue_ = '';
        this.firstClick_ = false;
        this.parameter_ = parameter;
        this.min_ = min;
        const lowerLimit = parameter.getLowerLimit();
        if (lowerLimit > min) {
            throw 'lower limit on slider =' + Util.NF(min)
                + ' is less than parameter lower limit =' + Util.NF(lowerLimit);
        }
        this.max_ = max;
        if (min >= max) {
            throw 'min >= max';
        }
        const upperLimit = parameter.getUpperLimit();
        if (upperLimit < max) {
            throw 'upper limit on slider =' + Util.NF(max)
                + ' is greater than parameter upper limit =' + Util.NF(upperLimit);
        }
        this.increments_ = increments || 100;
        if (this.increments_ < 2) {
            throw 'increments < 2';
        }
        this.multiply_ = multiply ?? true;
        if (this.multiply_ && min <= 0) {
            throw 'slider cannot have min <= 0 and also exponential scale';
        }
        this.delta_ = SliderControl.rangeToDelta(min, max, this.increments_, this.multiply_);
        this.signifDigits_ = parameter.getSignifDigits();
        this.decimalPlaces_ = parameter.getDecimalPlaces();
        this.columns_ = Math.max(8, 1 + this.signifDigits_);
        this.paramValue_ = parameter.getValue();
        Util.assert(typeof this.paramValue_ === 'number');
        this.slider_ = document.createElement('input');
        this.slider_.type = 'range';
        if (this.slider_.type == 'text') {
            throw 'cannot make slider';
        }
        ;
        this.slider_.min = '0';
        this.slider_.max = String(this.increments_);
        this.slider_.step = '1';
        this.slider_.value = String(this.valueToIncrement(this.paramValue_));
        this.sliderValue_ = this.incrementToValue(Number(this.slider_.value));
        this.textField_ = document.createElement('input');
        this.textField_.type = 'text';
        this.textField_.size = this.columns_;
        this.label_ = document.createElement('div');
        this.label_.className = 'slider';
        this.label_.appendChild(document.createTextNode(parameter.getName(true) + parameter.getUnits()));
        this.label_.appendChild(this.slider_);
        this.label_.appendChild(this.textField_);
        this.textField_.style.textAlign = 'right';
        this.changeSliderFn_ = this.changeSlider.bind(this);
        this.slider_.addEventListener('input', this.changeSliderFn_, true);
        this.slider_.addEventListener('change', this.changeSliderFn_, true);
        this.clickSliderFn_ = this.clickSlider.bind(this);
        this.slider_.addEventListener('click', this.clickSliderFn_, true);
        this.validateTextFn_ = this.validateText.bind(this);
        this.textField_.addEventListener('change', this.validateTextFn_, true);
        this.focusTextFn_ = this.focusText.bind(this);
        this.textField_.addEventListener('focus', this.focusTextFn_, false);
        this.clickTextFn_ = this.clickText.bind(this);
        this.textField_.addEventListener('click', this.clickTextFn_, true);
        this.formatTextField();
        this.parameter_.getSubject().addObserver(this);
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', paramValue_: ' + Util.NF(this.paramValue_)
            + ', sliderValue_: ' + Util.NF(this.sliderValue_)
            + ', slider_.value: ' + this.slider_.value
            + ', textboxValue_: ' + this.textboxValue_
            + ', min_: ' + Util.NF(this.min_)
            + ', max_: ' + Util.NF(this.max_)
            + ', increments_: ' + this.increments_
            + ', delta_: ' + Util.NF(this.delta_)
            + ', multiply_: ' + this.multiply_
            + ', signifDigits_: ' + this.signifDigits_
            + ', decimalPlaces_: ' + this.decimalPlaces_
            + ', columns_: ' + this.columns_
            + '}';
    }
    ;
    toStringShort() {
        return 'SliderControl{parameter: ' + this.parameter_.toStringShort() + '}';
    }
    ;
    columnsNeeded(x, sigDigits) {
        const mag = SliderControl.magnitude(x);
        return 2 + this.decimalPlacesNeeded(x, sigDigits) + (mag > 0 ? mag : 0);
    }
    ;
    decimalPlacesNeeded(x, sigDigits) {
        if (this.decimalPlaces_ > -1) {
            return this.decimalPlaces_;
        }
        else {
            let d = sigDigits - 1 - SliderControl.magnitude(x);
            if (d > 16) {
                d = 16;
            }
            return d > 0 ? d : 0;
        }
    }
    ;
    disconnect() {
        this.parameter_.getSubject().removeObserver(this);
        this.slider_.removeEventListener('input', this.changeSliderFn_, true);
        this.slider_.removeEventListener('change', this.changeSliderFn_, true);
        this.slider_.removeEventListener('click', this.clickSliderFn_, true);
        this.textField_.removeEventListener('change', this.validateTextFn_, true);
        this.textField_.removeEventListener('focus', this.focusTextFn_, false);
        this.textField_.removeEventListener('click', this.clickTextFn_, true);
    }
    ;
    clickText(_evt) {
        if (this.firstClick_) {
            this.textField_.select();
            this.firstClick_ = false;
        }
    }
    ;
    clickSlider(_evt) {
        this.slider_.focus();
    }
    ;
    formatTextField() {
        const dec = this.decimalPlacesNeeded(this.paramValue_, this.signifDigits_);
        const col = this.columnsNeeded(this.paramValue_, this.signifDigits_);
        this.textboxValue_ = this.paramValue_.toFixed(dec);
        this.textField_.value = this.textboxValue_;
        if (col != this.columns_) {
            this.columns_ = col;
            this.textField_.size = this.columns_;
        }
    }
    ;
    focusText(_event) {
        this.firstClick_ = true;
    }
    ;
    getDecimalPlaces() {
        return this.decimalPlaces_;
    }
    ;
    getElement() {
        return this.label_;
    }
    ;
    getParameter() {
        return this.parameter_;
    }
    ;
    getSignifDigits() {
        return this.signifDigits_;
    }
    ;
    getValue() {
        return this.paramValue_;
    }
    ;
    incrementToValue(increment) {
        if (this.multiply_) {
            return this.min_ * Math.pow(this.delta_, increment);
        }
        else {
            return this.min_ + increment * this.delta_;
        }
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
    observe(event) {
        if (event == this.parameter_) {
            this.setValue(this.parameter_.getValue());
        }
    }
    ;
    static rangeToDelta(min, max, increments, multiply) {
        if (multiply) {
            return Math.exp((Math.log(max) - Math.log(min)) / increments);
        }
        else {
            return (max - min) / increments;
        }
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
        this.slider_.disabled = !enabled;
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
        if (value != this.paramValue_) {
            if (isNaN(value)) {
                throw 'not a number: ' + value;
            }
            try {
                this.paramValue_ = value;
                this.parameter_.setValue(value);
            }
            catch (ex) {
                alert(ex);
                this.paramValue_ = this.parameter_.getValue();
            }
            this.formatTextField();
            const incr = this.valueToIncrement(this.paramValue_);
            this.sliderValue_ = this.incrementToValue(incr);
            this.slider_.value = String(incr);
        }
    }
    ;
    changeSlider(_event) {
        const newValue = this.incrementToValue(Number(this.slider_.value));
        if (Util.veryDifferent(newValue, this.sliderValue_)) {
            this.setValue(newValue);
        }
    }
    ;
    validateText(_event) {
        const newValue = this.textField_.value.trim();
        if (newValue != this.textboxValue_) {
            const value = parseFloat(newValue);
            if (isNaN(value)) {
                alert('not a number: ' + newValue);
                this.formatTextField();
            }
            else {
                this.setValue(value);
            }
        }
    }
    ;
    valueToIncrement(value) {
        if (this.multiply_) {
            return Math.floor(0.5 + (Math.log(value) - Math.log(this.min_)) /
                Math.log(this.delta_));
        }
        else {
            return Math.floor(0.5 + (value - this.min_) / this.delta_);
        }
    }
    ;
}
Util.defineGlobal('lab$controls$SliderControl', SliderControl);
