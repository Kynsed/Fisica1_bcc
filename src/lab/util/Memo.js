import { Util } from "./Util.js";
;
;
export class GenericMemo {
    constructor(func, opt_purpose) {
        this.function_ = func;
        this.purpose_ = (opt_purpose || '');
    }
    ;
    toString() {
        return this.toStringShort();
    }
    ;
    toStringShort() {
        return 'GenericMemo{'
            + (this.purpose_.length > 0 ? 'purpose_:"' + this.purpose_ + '"' : '')
            + '}';
    }
    ;
    memorize() {
        this.function_();
    }
    ;
}
Util.defineGlobal('lab$util$GenericMemo', GenericMemo);
