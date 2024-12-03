import { Util } from "./Util.js";
export class CircularList {
    constructor(capacity) {
        this.capacity_ = 3000;
        this.size_ = 0;
        this.cycles_ = 0;
        this.nextPtr_ = 0;
        this.lastPtr_ = -1;
        this.values_ = new Array(this.capacity_);
        this.lastValue_ = null;
        if (capacity !== undefined && capacity > 1) {
            this.capacity_ = capacity;
            this.values_ = new Array(capacity);
        }
    }
    ;
    toString() {
        return 'CircularList{capacity_: ' + this.capacity_
            + ', size_: ' + this.size_
            + ', cycles_: ' + this.cycles_
            + ', nextPtr_: ' + this.nextPtr_
            + ', lastPtr_: ' + this.lastPtr_
            + '}';
    }
    ;
    causeMaxIntError() {
        this.size_ = this.capacity_;
        this.cycles_ = Math.floor(Util.MAX_INTEGER / this.capacity_) - 1;
    }
    ;
    getEndIndex() {
        if (this.size_ == 0)
            return -1;
        let idx;
        if (this.nextPtr_ == 0)
            idx = this.pointerToIndex(this.size_ - 1);
        else
            idx = this.pointerToIndex(this.nextPtr_ - 1);
        return idx;
    }
    ;
    getEndValue() {
        const idx = this.getEndIndex();
        return idx == -1 ? null : this.values_[this.indexToPointer(idx)];
    }
    ;
    getIterator(index) {
        return new CircularListIterator(this, index);
    }
    ;
    getSize() {
        return this.size_;
    }
    ;
    getStartIndex() {
        const idx = (this.size_ < this.capacity_) ? 0 : this.pointerToIndex(this.nextPtr_);
        return idx;
    }
    ;
    getValue(index) {
        const i = this.indexToPointer(index);
        return this.values_[i];
    }
    ;
    getValueAtPointer(pointer) {
        return this.values_[pointer];
    }
    ;
    indexToPointer(index) {
        if (this.size_ < this.capacity_)
            return index;
        const p = index % this.capacity_;
        const idx = index - (this.cycles_ - (p < this.nextPtr_ ? 0 : 1)) * this.capacity_;
        return idx;
    }
    ;
    pointerToIndex(pointer) {
        if (this.size_ < this.capacity_)
            return pointer;
        const idx = pointer +
            (this.cycles_ - (pointer < this.nextPtr_ ? 0 : 1)) * this.capacity_;
        if (idx >= Util.MAX_INTEGER)
            throw CircularList.MAX_INDEX_ERROR;
        return idx;
    }
    ;
    reset() {
        this.nextPtr_ = this.size_ = 0;
        this.cycles_ = 0;
        this.lastPtr_ = -1;
    }
    ;
    store(value) {
        this.lastPtr_ = this.nextPtr_;
        this.values_[this.nextPtr_] = value;
        this.nextPtr_++;
        if (this.size_ < this.capacity_)
            this.size_++;
        if (this.nextPtr_ >= this.capacity_) {
            this.cycles_++;
            this.nextPtr_ = 0;
        }
        return this.pointerToIndex(this.lastPtr_);
    }
    ;
}
CircularList.MAX_INDEX_ERROR = 'exceeded max int';
Util.defineGlobal('lab$util$CircularList', CircularList);
export class CircularListIterator {
    constructor(cList, startIndex) {
        this.first_ = cList.getSize() > 0;
        this.cList_ = cList;
        if (startIndex === undefined || startIndex < 0) {
            startIndex = cList.getStartIndex();
        }
        if (cList.getSize() > 0 &&
            (startIndex < cList.getStartIndex() || startIndex > cList.getEndIndex())) {
            throw 'out of range startIndex=' + startIndex;
        }
        this.index_ = startIndex;
        this.pointer_ = cList.indexToPointer(startIndex);
    }
    ;
    getIndex() {
        if (this.cList_.getSize() == 0)
            throw 'no data';
        return this.index_;
    }
    ;
    getValue() {
        if (this.cList_.getSize() == 0)
            throw 'no data';
        return this.cList_.getValueAtPointer(this.pointer_);
    }
    ;
    hasNext() {
        return this.first_ || this.index_ < this.cList_.getEndIndex();
    }
    ;
    hasPrevious() {
        return this.first_ || this.index_ > this.cList_.getStartIndex();
    }
    ;
    nextValue() {
        if (this.cList_.getSize() === 0)
            throw 'no data';
        if (this.first_) {
            this.first_ = false;
        }
        else {
            if (this.index_ + 1 > this.cList_.getEndIndex()) {
                throw 'cannot iterate past end of list';
            }
            this.index_++;
            this.pointer_ = this.cList_.indexToPointer(this.index_);
        }
        return this.cList_.getValueAtPointer(this.pointer_);
    }
    ;
    previousValue() {
        if (this.cList_.getSize() === 0)
            throw 'no data';
        if (this.first_) {
            this.first_ = false;
        }
        else {
            if (this.index_ - 1 < this.cList_.getStartIndex()) {
                throw 'cannot iterate prior to start of list';
            }
            this.index_--;
            this.pointer_ = this.cList_.indexToPointer(this.index_);
        }
        return this.cList_.getValueAtPointer(this.pointer_);
    }
    ;
}
Util.defineGlobal('lab$util$CircularListIterator', CircularListIterator);
