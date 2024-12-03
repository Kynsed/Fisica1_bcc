import { Util } from '../util/Util.js';
export class GroupControl {
    constructor(name, topElement, controls) {
        this.name_ = name;
        this.topElement_ = topElement;
        this.controls_ = controls;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', controls_: ['
            + this.controls_.map(a => a.toStringShort())
            + ']}';
    }
    ;
    toStringShort() {
        return 'GroupControl{name_: "' + this.name_ + '"'
            + ', controls_.length: ' + this.controls_.length
            + '}';
    }
    ;
    disconnect() {
        this.controls_.forEach(c => c.disconnect());
    }
    ;
    getControls() {
        return Array.from(this.controls_);
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
    setEnabled(enabled) {
        this.controls_.forEach(c => c.setEnabled(enabled));
    }
    ;
}
Util.defineGlobal('lab$controls$GroupControl', GroupControl);
