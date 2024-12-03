import { Util } from "../util/Util.js";
;
export class AbstractSimObject {
    constructor(opt_name, opt_localName) {
        this.expireTime_ = Infinity;
        this.changed_ = true;
        const name = opt_name || 'SIM_OBJ' + AbstractSimObject.ID++;
        this.name_ = Util.validName(Util.toName(name));
        this.localName_ = opt_localName || name;
    }
    ;
    toString() {
        return this.getClassName() + '{name_: "' + this.getName() + '"'
            + ', expireTime_: ' + Util.NF(this.expireTime_) + '}';
    }
    ;
    toStringShort() {
        return this.getClassName() + '{name_: "' + this.getName() + '"}';
    }
    ;
    getChanged() {
        if (this.changed_) {
            this.changed_ = false;
            return true;
        }
        else {
            return false;
        }
    }
    ;
    getExpireTime() {
        return this.expireTime_;
    }
    ;
    getName(opt_localized) {
        return opt_localized ? this.localName_ : this.name_;
    }
    ;
    isMassObject() {
        return false;
    }
    ;
    nameEquals(name) {
        return this.name_ == Util.toName(name);
    }
    ;
    setChanged() {
        this.changed_ = true;
    }
    ;
    setExpireTime(time) {
        this.expireTime_ = time;
    }
    ;
    similar(obj, _opt_tolerance) {
        return obj == this;
    }
    ;
}
AbstractSimObject.ID = 1;
;
Util.defineGlobal('lab$model$AbstractSimObject', AbstractSimObject);
