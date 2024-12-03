import { Util } from "./Util.js";
import { AbstractSubject } from "./AbstractSubject.js";
import { GenericEvent, ParameterNumber } from "./Observe.js";
;
export class StdSystemClock {
    constructor() { }
    ;
    systemTime() {
        return Util.systemTime();
    }
    ;
    cancelCallback(timeoutID) {
        clearTimeout(timeoutID);
    }
    ;
    scheduleCallback(callback, delay_ms) {
        return setTimeout(callback, delay_ms);
    }
    ;
    requestAnimFrame(callback) {
        return requestAnimationFrame(callback);
    }
    ;
    cancelAnimFrame(requestID) {
        cancelAnimationFrame(requestID);
    }
}
;
export class Clock extends AbstractSubject {
    constructor(opt_name, opt_sysClock) {
        super(opt_name || 'CLOCK');
        this.timeRate_ = 1.0;
        this.saveTime_secs_ = 0;
        this.saveRealTime_secs_ = 0;
        this.isRunning_ = false;
        this.stepMode_ = false;
        this.tasks_ = [];
        this.clockDebug_ = false;
        this.sysClock_ = opt_sysClock || new StdSystemClock();
        this.clockStart_sys_secs_ = this.sysClock_.systemTime();
        this.realStart_sys_secs_ = this.clockStart_sys_secs_;
        this.addParameter(new ParameterNumber(this, Clock.en.TIME_RATE, Clock.i18n.TIME_RATE, () => this.getTimeRate(), a => this.setTimeRate(a)));
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', timeRate_: ' + Util.NF5(this.timeRate_)
            + ', saveTime_secs_: ' + Util.NF5(this.saveTime_secs_)
            + ', saveRealTime_secs_: ' + Util.NF5(this.saveRealTime_secs_)
            + ', isRunning_: ' + this.isRunning_
            + ', stepMode_: ' + this.stepMode_
            + ', clockStart_sys_secs_: ' + Util.NF5(this.clockStart_sys_secs_)
            + ', realStart_sys_secs_: ' + Util.NF5(this.realStart_sys_secs_)
            + ', tasks_: [' + this.tasks_ + ']'
            + super.toString();
    }
    ;
    toStringShort() {
        return super.toStringShort().slice(0, -1)
            + ', time: ' + Util.NF5(this.getTime()) + '}';
    }
    ;
    getClassName() {
        return 'Clock';
    }
    ;
    addTask(task) {
        if (!this.tasks_.includes(task)) {
            this.tasks_.push(task);
            this.scheduleTask(task);
        }
    }
    ;
    cancelAllTasks() {
        this.tasks_.forEach(task => task.cancel());
    }
    ;
    clearStepMode() {
        this.stepMode_ = false;
    }
    ;
    clockToSystem(clockTime) {
        return clockTime / this.timeRate_ + this.clockStart_sys_secs_;
    }
    ;
    executeTasks(startTime, timeStep) {
        this.tasks_.forEach(task => {
            if (task.getTime() >= startTime && task.getTime() <= startTime + timeStep) {
                task.schedule(0);
            }
        });
    }
    ;
    getRealTime() {
        if (this.isRunning_) {
            return (this.sysClock_.systemTime() - this.realStart_sys_secs_) * this.timeRate_;
        }
        else {
            return this.saveRealTime_secs_;
        }
    }
    ;
    getTasks() {
        return Array.from(this.tasks_);
    }
    ;
    getTime() {
        if (this.isRunning_) {
            return (this.sysClock_.systemTime() - this.clockStart_sys_secs_) * this.timeRate_;
        }
        else {
            return this.saveTime_secs_;
        }
    }
    ;
    getTimeRate() {
        return this.timeRate_;
    }
    ;
    isRunning() {
        return this.isRunning_;
    }
    ;
    isStepping() {
        return this.stepMode_;
    }
    ;
    pause() {
        this.clearStepMode();
        if (this.isRunning_) {
            this.saveTime_secs_ = this.getTime();
            this.saveRealTime_secs_ = this.getRealTime();
            this.cancelAllTasks();
            this.isRunning_ = false;
            this.broadcast(new GenericEvent(this, Clock.CLOCK_PAUSE));
            if (Util.DEBUG && this.clockDebug_)
                console.log('Clock.pause ' + this.toString());
        }
    }
    ;
    removeTask(task) {
        Util.remove(this.tasks_, task);
        task.cancel();
    }
    ;
    resume() {
        this.clearStepMode();
        if (!this.isRunning_) {
            this.isRunning_ = true;
            this.setTimePrivate(this.saveTime_secs_);
            this.setRealTime(this.saveRealTime_secs_);
            if (Util.DEBUG && this.clockDebug_) {
                console.log('Clock.resume ' + this.toString());
            }
            this.broadcast(new GenericEvent(this, Clock.CLOCK_RESUME));
        }
    }
    ;
    scheduleTask(task) {
        task.cancel();
        if (this.isRunning_) {
            const nowTime = this.clockToSystem(this.getTime());
            const taskTime = this.clockToSystem(task.getTime());
            if (!Util.veryDifferent(taskTime, nowTime)) {
                task.execute();
            }
            else if (taskTime > nowTime) {
                task.schedule(taskTime - nowTime);
            }
        }
    }
    ;
    setRealTime(time_secs) {
        if (Util.DEBUG && this.clockDebug_)
            console.log('Clock.setRealTime ' + Util.NF5(time_secs));
        if (this.isRunning_) {
            this.realStart_sys_secs_ = this.sysClock_.systemTime() - time_secs / this.timeRate_;
        }
        else {
            this.saveRealTime_secs_ = time_secs;
        }
    }
    ;
    setTime(time_secs) {
        const t = this.getTime();
        if (Util.veryDifferent(t, time_secs, 0.001)) {
            this.setTimePrivate(time_secs);
            if (Util.DEBUG && this.clockDebug_) {
                console.log('Clock.setTime(' + time_secs + ') getTime=' + t
                    + ' realTime=' + Util.NF5(this.getRealTime()));
            }
            this.broadcast(new GenericEvent(this, Clock.CLOCK_SET_TIME));
        }
    }
    ;
    setTimePrivate(time_secs) {
        if (this.isRunning_) {
            this.clockStart_sys_secs_ = this.sysClock_.systemTime() - time_secs / this.timeRate_;
            this.tasks_.forEach(task => this.scheduleTask(task));
        }
        else {
            this.saveTime_secs_ = time_secs;
        }
    }
    ;
    setTimeRate(rate) {
        if (Util.veryDifferent(this.timeRate_, rate)) {
            const t = this.getTime();
            const sysT = this.getRealTime();
            this.timeRate_ = rate;
            this.setTimePrivate(t);
            this.setRealTime(sysT);
            let diff = Math.abs(t - this.getTime());
            Util.assert(diff < 2E-3, 'time diff=' + diff);
            diff = Math.abs(sysT - this.getRealTime());
            Util.assert(diff < 2E-3, 'realTime diff=' + diff);
            this.broadcastParameter(Clock.en.TIME_RATE);
        }
        ;
    }
    ;
    step(timeStep) {
        this.pause();
        this.stepMode_ = true;
        Util.assert(typeof timeStep === "number");
        const startStepTime = this.saveTime_secs_;
        this.saveTime_secs_ += timeStep;
        this.saveRealTime_secs_ += timeStep;
        this.broadcast(new GenericEvent(this, Clock.CLOCK_STEP));
        if (Util.DEBUG && this.clockDebug_) {
            console.log('Clock.step timeStep=' + Util.NFE(timeStep) + ' ' + this.toString());
        }
        this.executeTasks(startStepTime, timeStep);
    }
    ;
    systemToClock(systemTime) {
        return (systemTime - this.clockStart_sys_secs_) * this.timeRate_;
    }
    ;
}
Clock.CLOCK_PAUSE = 'CLOCK_PAUSE';
Clock.CLOCK_RESUME = 'CLOCK_RESUME';
Clock.CLOCK_SET_TIME = 'CLOCK_SET_TIME';
Clock.CLOCK_STEP = 'CLOCK_STEP';
Clock.en = {
    TIME_RATE: 'time rate'
};
Clock.de_strings = {
    TIME_RATE: 'Zeitraffer'
};
Clock.i18n = Util.LOCALE === 'de' ? Clock.de_strings : Clock.en;
;
Util.defineGlobal('lab$util$Clock', Clock);
export class ClockTask {
    constructor(time, callBack, opt_sysClock) {
        this.timeoutID_ = NaN;
        this.sysClock_ = opt_sysClock || new StdSystemClock();
        this.callBack_ = callBack;
        this.time_ = time;
    }
    ;
    toString() {
        return 'ClockTask{time_: ' + Util.NF(this.time_)
            + ', timeoutID_: ' + this.timeoutID_
            + ', callBack_: ' + this.callBack_
            + '}';
    }
    ;
    cancel() {
        if (isFinite(this.timeoutID_)) {
            this.sysClock_.cancelCallback(this.timeoutID_);
            this.timeoutID_ = NaN;
        }
    }
    ;
    execute() {
        if (typeof this.callBack_ === 'function') {
            this.callBack_();
        }
    }
    ;
    getTime() {
        return this.time_;
    }
    ;
    schedule(delay) {
        this.cancel();
        if (typeof this.callBack_ === 'function') {
            const delay_ms = Math.round(delay * 1000);
            this.timeoutID_ = this.sysClock_.scheduleCallback(this.callBack_, delay_ms);
        }
    }
    ;
    setCallback(callBack) {
        this.callBack_ = callBack;
    }
    ;
}
;
Util.defineGlobal('lab$util$ClockTask', ClockTask);
