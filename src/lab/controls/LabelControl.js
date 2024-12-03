import { Util } from '../util/Util.js';
export class LabelControl {
    constructor(text) {
        this.text_ = text;
        this.label_ = document.createElement('label');
        this.label_.appendChild(document.createTextNode(text));
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + '}';
    }
    ;
    toStringShort() {
        return 'LabelControl{text_: "' + this.text_ + '"}';
    }
    ;
    disconnect() {
    }
    ;
    getElement() {
        return this.label_;
    }
    ;
    getParameter() {
        return null;
    }
    ;
    setEnabled(_enabled) {
        throw 'LabelControl cannot be disabled';
    }
    ;
}
Util.defineGlobal('lab$controls$LabelControl', LabelControl);
