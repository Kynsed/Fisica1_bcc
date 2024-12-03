import { Util } from '../util/Util.js';
export class ToggleControl {
    constructor(parameter, imageOn, imageOff) {
        this.parameter_ = parameter;
        this.name_ = this.parameter_.getName();
        this.state_ = this.parameter_.getValue();
        this.imageOn_ = imageOn;
        this.imageOff_ = imageOff;
        this.button_ = document.createElement('button');
        this.button_.type = 'button';
        this.button_.className = 'icon';
        imageOff.style.display = this.state_ ? 'block' : 'none';
        imageOn.style.display = this.state_ ? 'none' : 'block';
        this.button_.appendChild(imageOn);
        this.button_.appendChild(imageOff);
        this.clickFn_ = this.handleClick.bind(this);
        this.button_.addEventListener('click', this.clickFn_, true);
        this.parameter_.getSubject().addObserver(this);
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', state_: ' + this.state_
            + '}';
    }
    ;
    toStringShort() {
        return 'ToggleControl{parameter_: ' +
            this.parameter_.toStringShort() + '}';
    }
    ;
    disconnect() {
        this.parameter_.getSubject().removeObserver(this);
        this.button_.removeEventListener('click', this.clickFn_, true);
    }
    ;
    getElement() {
        return this.button_;
    }
    ;
    getParameter() {
        return this.parameter_;
    }
    ;
    getState() {
        return this.state_;
    }
    ;
    handleClick(_event) {
        this.setState(!this.state_);
    }
    ;
    observe(event) {
        if (event == this.parameter_) {
            this.setState(this.parameter_.getValue());
        }
    }
    ;
    setEnabled(enabled) {
        this.button_.disabled = !enabled;
    }
    ;
    setState(newState) {
        if (this.state_ != newState) {
            this.parameter_.setValue(newState);
            this.state_ = newState;
            this.imageOff_.style.display = newState ? 'block' : 'none';
            this.imageOn_.style.display = newState ? 'none' : 'block';
        }
    }
    ;
}
Util.defineGlobal('lab$controls$ToggleControl', ToggleControl);
