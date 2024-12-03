import { Util } from '../util/Util.js';
export class CheckBoxControlBase {
    constructor(label, getter, setter, checkBox) {
        this.label_ = label;
        this.getter_ = getter;
        this.setter_ = setter;
        this.state_ = getter();
        let labelElement = null;
        if (checkBox !== undefined) {
            const parent = checkBox.parentElement;
            if (parent != null && parent.tagName == 'LABEL') {
                labelElement = parent;
            }
        }
        else {
            checkBox = document.createElement('input');
            checkBox.type = 'checkbox';
            labelElement = document.createElement('label');
            labelElement.appendChild(checkBox);
            labelElement.appendChild(document.createTextNode(this.label_));
        }
        this.checkBox_ = checkBox;
        this.checkBox_.checked = this.state_;
        this.topElement_ = labelElement !== null ? labelElement : this.checkBox_;
        this.changeFn_ = this.handleClick.bind(this);
        this.checkBox_.addEventListener('change', this.changeFn_, true);
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', state_: ' + this.state_
            + '}';
    }
    ;
    toStringShort() {
        return this.getClassName() + '{label_: "' + this.label_ + '"}';
    }
    ;
    disconnect() {
        this.checkBox_.removeEventListener('change', this.changeFn_, true);
    }
    ;
    getClassName() {
        return 'CheckBoxControlBase';
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
    getState() {
        return this.getter_();
    }
    ;
    handleClick(_event) {
        this.setState(!this.getState());
    }
    ;
    observe(_event) {
        this.setState(this.getState());
    }
    ;
    setEnabled(enabled) {
        this.checkBox_.disabled = !enabled;
    }
    ;
    setState(newState) {
        if (this.getState() != newState) {
            this.setter_(newState);
        }
        if (this.state_ != this.getState()) {
            this.state_ = this.getState();
            this.checkBox_.checked = this.state_;
        }
    }
    ;
}
Util.defineGlobal('lab$controls$CheckBoxControlBase', CheckBoxControlBase);
export class CheckBoxControl extends CheckBoxControlBase {
    constructor(parameter, checkBox) {
        super(parameter.getName(true), () => parameter.getValue(), a => parameter.setValue(a), checkBox);
        this.parameter_ = parameter;
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
        return 'CheckBoxControl';
    }
    ;
    getParameter() {
        return this.parameter_;
    }
    ;
    observe(event) {
        if (event == this.parameter_) {
            super.observe(event);
        }
    }
    ;
}
Util.defineGlobal('lab$controls$CheckBoxControl', CheckBoxControl);
