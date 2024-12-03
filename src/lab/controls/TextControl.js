import { Util } from '../util/Util.js';
export class TextControlBase {
    constructor(label, getter, setter, textField) {
        this.columns_ = 40;
        this.lastValue_ = '';
        this.firstClick_ = false;
        this.label_ = label;
        this.getter_ = getter;
        this.setter_ = setter;
        this.value_ = getter();
        if (typeof this.value_ !== 'string') {
            throw 'not a string ' + this.value_;
        }
        let labelElement = null;
        if (textField !== undefined) {
            const parent = textField.parentElement;
            if (parent != null && parent.tagName == 'LABEL') {
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
        this.textField_.style.textAlign = 'left';
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
            + ', columns_: ' + this.columns_
            + '}';
    }
    ;
    toStringShort() {
        return this.getClassName() + '{label_: "' + this.label_ + '"}';
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
        this.lastValue_ = this.value_;
        this.textField_.value = this.value_;
        this.textField_.size = this.columns_;
    }
    ;
    gainFocus(_event) {
        this.firstClick_ = true;
    }
    ;
    getClassName() {
        return 'TextControlBase';
    }
    ;
    getColumns() {
        return this.columns_;
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
    getValue() {
        return this.value_;
    }
    ;
    observe(_event) {
        this.setValue(this.getter_());
    }
    ;
    setColumns(value) {
        if (this.columns_ != value) {
            this.columns_ = value;
            this.formatTextField();
        }
        return this;
    }
    ;
    setEnabled(enabled) {
        this.textField_.disabled = !enabled;
    }
    ;
    setValue(value) {
        if (value != this.value_) {
            try {
                if (typeof value !== 'string') {
                    throw 'not a string ' + value;
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
            const value = nowValue;
            if (typeof value !== 'string') {
                alert('not a string: ' + nowValue);
                this.formatTextField();
            }
            else {
                this.setValue(value);
            }
        }
    }
    ;
}
Util.defineGlobal('lab$controls$TextControlBase', TextControlBase);
export class TextControl extends TextControlBase {
    constructor(parameter, textField) {
        super(parameter.getName(true), () => parameter.getValue(), a => parameter.setValue(a), textField);
        this.parameter_ = parameter;
        this.setColumns(this.parameter_.getSuggestedLength());
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
        return 'TextControl';
    }
    ;
    getParameter() {
        return this.parameter_;
    }
    ;
}
Util.defineGlobal('lab$controls$TextControl', TextControl);
