import { Util } from '../util/Util.js';
export class ConstantForceLaw {
    constructor(force) {
        this.force_ = force;
    }
    ;
    toString() {
        return this.toStringShort();
    }
    ;
    toStringShort() {
        return 'ConstantForceLaw{force=' + this.force_ + '}';
    }
    ;
    getBodies() {
        return this.force_ != null ? [this.force_.getBody()] : [];
    }
    ;
    calculateForces() {
        if (this.force_ != null)
            return [this.force_];
        else
            return [];
    }
    ;
    disconnect() {
    }
    ;
    getForce() {
        return this.force_;
    }
    ;
    getPotentialEnergy() {
        return 0;
    }
    ;
    setForce(force) {
        this.force_ = force;
    }
    ;
}
Util.defineGlobal('lab$model$ConstantForceLaw', ConstantForceLaw);
