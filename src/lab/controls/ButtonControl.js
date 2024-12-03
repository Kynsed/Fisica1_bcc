import { Util } from '../util/Util.js';
export class ButtonControl {
    constructor(label, clickFunction, opt_image, button) {
        this.repeatDelay = 0;
        this.repeatFirst = 2;
        this.label_ = label;
        if (button === undefined) {
            button = document.createElement('button');
            button.type = 'button';
            if (opt_image === undefined) {
                button.appendChild(document.createTextNode(label));
            }
            else {
                button.className = 'icon';
                button.appendChild(opt_image);
            }
        }
        this.button_ = button;
        this.clickFunction_ = clickFunction;
        this.mouseDownFn_ = this.handleClick.bind(this);
        this.button_.addEventListener('mousedown', this.mouseDownFn_, true);
        this.mouseUpFn_ = this.handleMouseUp.bind(this);
        this.button_.addEventListener('mouseup', this.mouseUpFn_, true);
        this.button_.addEventListener('dragleave', this.mouseUpFn_, false);
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', timeoutID_: ' + this.timeoutID_
            + ', repeatDelay: ' + Util.NF(this.repeatDelay)
            + ', repeatFirst: ' + this.repeatFirst
            + '}';
    }
    ;
    toStringShort() {
        return 'ButtonControl{label_: "' + this.label_ + '"}';
    }
    ;
    disconnect() {
        this.button_.removeEventListener('mousedown', this.mouseDownFn_, true);
        this.button_.removeEventListener('mouseup', this.mouseUpFn_, true);
        this.button_.removeEventListener('dragleave', this.mouseUpFn_, false);
    }
    ;
    getElement() {
        return this.button_;
    }
    ;
    getParameter() {
        return null;
    }
    ;
    handleClick(_evt) {
        this.holdClick();
    }
    ;
    handleMouseUp(_evt) {
        if (this.timeoutID_ !== undefined) {
            clearTimeout(this.timeoutID_);
            this.timeoutID_ = undefined;
        }
    }
    ;
    holdClick() {
        this.clickFunction_();
        if (this.repeatDelay > 0) {
            const d = this.timeoutID_ !== undefined ?
                this.repeatDelay : this.repeatFirst * this.repeatDelay;
            this.timeoutID_ = setTimeout(() => this.holdClick(), d);
        }
    }
    ;
    setClickFunction(clickFunction) {
        this.clickFunction_ = clickFunction;
    }
    ;
    setEnabled(enabled) {
        this.button_.disabled = !enabled;
    }
    ;
}
Util.defineGlobal('lab$controls$ButtonControl', ButtonControl);
