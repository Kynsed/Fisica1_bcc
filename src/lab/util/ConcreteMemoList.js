import { Util } from "./Util.js";
export class ConcreteMemoList {
    constructor() {
        this.memorizables_ = [];
        this.isMemorizing_ = false;
    }
    ;
    toString() {
        return 'ConcreteMemoList{'
            + 'memorizables_: ['
            + this.memorizables_.map(a => a.toStringShort())
            + ']}';
    }
    ;
    toStringShort() {
        return 'ConcreteMemoList{memorizables_.length: ' + this.memorizables_.length + '}';
    }
    ;
    addMemo(memorizable) {
        if (this.isMemorizing_) {
            throw 'addMemo during memorize';
        }
        if (!this.memorizables_.includes(memorizable)) {
            this.memorizables_.push(memorizable);
        }
    }
    ;
    getMemos() {
        return Array.from(this.memorizables_);
    }
    ;
    memorize() {
        try {
            this.isMemorizing_ = true;
            this.memorizables_.forEach(c => c.memorize());
        }
        finally {
            this.isMemorizing_ = false;
        }
    }
    ;
    removeMemo(memorizable) {
        if (this.isMemorizing_) {
            throw 'removeMemo during memorize';
        }
        Util.remove(this.memorizables_, memorizable);
    }
    ;
}
Util.defineGlobal('lab$util$ConcreteMemoList', ConcreteMemoList);
