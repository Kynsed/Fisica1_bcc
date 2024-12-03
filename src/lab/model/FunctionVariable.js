import { ConcreteVariable } from './VarsList.js';
import { Util } from '../util/Util.js';
export class FunctionVariable extends ConcreteVariable {
    constructor(varsList, name, localName, getter, setter) {
        super(varsList, name, localName);
        this.getter_ = getter;
        this.setter_ = setter;
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', getter_: ' + this.getter_
            + ', setter_: ' + this.setter_ + '}';
    }
    ;
    getBroadcast() {
        return false;
    }
    ;
    getClassName() {
        return 'FunctionVariable';
    }
    ;
    getValue() {
        return this.getter_();
    }
    ;
    setValue(value) {
        if (this.setter_ !== undefined && this.getValue() != value) {
            this.setter_(value);
            this.seq_++;
            if (this.doesBroadcast_) {
                this.varsList_.broadcast(this);
            }
        }
    }
    ;
    setValueSmooth(value) {
        if (this.setter_ !== undefined) {
            this.setter_(value);
        }
    }
    ;
}
Util.defineGlobal('lab$model$FunctionVariable', FunctionVariable);
