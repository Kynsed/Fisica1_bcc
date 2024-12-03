import { Util } from "./Util.js";
import { StdSystemClock } from "./Clock.js";
export class Timer {
    constructor(opt_legacy, opt_sysClock) {
        this.timeoutID_ = undefined;
        this.callBack_ = null;
        this.timerCallback_ = () => this.timerCallback();
        this.period_ = 0;
        this.firing_ = false;
        this.fired_sys_ = NaN;
        this.delta_ = 0;
        this.sysClock_ = opt_sysClock || new StdSystemClock();
        this.legacy_ = opt_legacy || typeof requestAnimationFrame !== 'function';
    }
    ;
    toString() {
        return 'Timer{period_: ' + this.period_
            + ', firing_: ' + this.firing_
            + ', timeoutID_: ' + this.timeoutID_
            + ', fired_sys_: ' + Util.nf7(this.fired_sys_)
            + ', delta_: ' + Util.nf7(this.delta_)
            + '}';
    }
    ;
    timerCallback() {
        if (this.callBack_ === null) {
            return;
        }
        const now = this.sysClock_.systemTime();
        const elapsed = now - (this.fired_sys_ - this.delta_);
        if (elapsed >= this.period_) {
            this.callBack_();
            this.fired_sys_ = now;
            this.delta_ = this.period_ > 0 ? elapsed % this.period_ : 0;
        }
        else {
        }
        if (this.legacy_) {
            const delay_ms = this.period_ > 0 ? Math.round(this.period_ * 1000) : 17;
            this.timeoutID_ = this.sysClock_.scheduleCallback(this.timerCallback_, delay_ms);
        }
        else {
            this.timeoutID_ = this.sysClock_.requestAnimFrame(this.timerCallback_);
        }
    }
    ;
    getLegacy() {
        return this.legacy_;
    }
    ;
    getPeriod() {
        return this.period_;
    }
    ;
    isFiring() {
        return this.firing_;
    }
    ;
    setCallBack(callBack) {
        this.stopFiring();
        this.callBack_ = callBack;
    }
    ;
    setLegacy(legacy) {
        if (legacy !== this.legacy_) {
            this.stopFiring();
            this.legacy_ = legacy;
        }
    }
    ;
    setPeriod(period) {
        if (period < 0) {
            throw '';
        }
        this.period_ = period;
    }
    ;
    startFiring() {
        if (!this.firing_) {
            this.firing_ = true;
            this.delta_ = 0;
            this.fired_sys_ = this.sysClock_.systemTime() - this.period_ - 1E-7;
            this.timerCallback();
        }
    }
    ;
    stopFiring() {
        this.firing_ = false;
        if (this.timeoutID_ !== undefined) {
            if (this.legacy_) {
                this.sysClock_.cancelCallback(this.timeoutID_);
            }
            else {
                this.sysClock_.cancelAnimFrame(this.timeoutID_);
            }
            this.timeoutID_ = undefined;
        }
        this.fired_sys_ = NaN;
        this.delta_ = 0;
    }
    ;
}
Util.defineGlobal('lab$util$Timer', Timer);
