import { AbstractSubject } from '../util/AbstractSubject.js';
import { Clock, ClockTask } from '../util/Clock.js';
import { ConcreteMemoList } from '../util/ConcreteMemoList.js';
import { GenericEvent, ParameterBoolean, ParameterNumber } from '../util/Observe.js';
import { Timer } from '../util/Timer.js';
import { Util } from '../util/Util.js';
export class SimRunner extends AbstractSubject {
    constructor(advance, opt_name) {
        super(opt_name || 'SIM_RUNNER');
        this.appName_ = '';
        this.displayPeriod_ = 0;
        this.nonStop_ = false;
        this.canvasList_ = [];
        this.memoList_ = new ConcreteMemoList();
        this.errorObservers_ = [];
        this.frames_ = 0;
        this.advanceList_ = [advance];
        this.timeStep_ = advance.getTimeStep();
        this.timer_ = new Timer();
        this.timer_.setPeriod(this.displayPeriod_);
        this.timer_.setCallBack(() => this.callback());
        const clockName = (opt_name ? opt_name + '_' : '') + 'CLOCK';
        this.clock_ = new Clock(clockName);
        const t = advance.getTime();
        this.clock_.setTime(t);
        this.clock_.setRealTime(t);
        this.clock_.addObserver(this);
        this.addParameter(new ParameterNumber(this, SimRunner.en.TIME_STEP, SimRunner.i18n.TIME_STEP, () => this.getTimeStep(), a => this.setTimeStep(a))
            .setSignifDigits(3));
        this.addParameter(new ParameterNumber(this, SimRunner.en.DISPLAY_PERIOD, SimRunner.i18n.DISPLAY_PERIOD, () => this.getDisplayPeriod(), a => this.setDisplayPeriod(a))
            .setSignifDigits(3));
        this.addParameter(new ParameterBoolean(this, SimRunner.en.RUNNING, SimRunner.i18n.RUNNING, () => this.getRunning(), a => this.setRunning(a)));
        this.addParameter(new ParameterBoolean(this, SimRunner.en.FIRING, SimRunner.i18n.FIRING, () => this.getFiring(), a => this.setFiring(a)));
        this.addParameter(new ParameterBoolean(this, SimRunner.en.NON_STOP, SimRunner.i18n.NON_STOP, () => this.getNonStop(), a => this.setNonStop(a)));
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', advanceList_: ['
            + this.advanceList_.map(a => a.toStringShort())
            + '], clock_: ' + this.clock_.toStringShort()
            + ', timer_: ' + this.timer_
            + ', timeStep_: ' + Util.NF(this.timeStep_)
            + ', displayPeriod_: ' + Util.NF(this.displayPeriod_)
            + ', nonStop_: ' + this.nonStop_
            + ', canvasList_: ['
            + this.canvasList_.map(a => a.toStringShort())
            + '], memoList_: ' + this.memoList_
            + super.toString();
    }
    ;
    getClassName() {
        return 'SimRunner';
    }
    ;
    addCanvas(canvas) {
        if (!this.canvasList_.includes(canvas)) {
            this.canvasList_.push(canvas);
            this.addMemo(canvas);
        }
    }
    ;
    addErrorObserver(errorObserver) {
        if (!this.errorObservers_.includes(errorObserver)) {
            this.errorObservers_.push(errorObserver);
        }
    }
    ;
    addMemo(memorizable) {
        this.memoList_.addMemo(memorizable);
    }
    ;
    addStrategy(advance) {
        this.advanceList_.push(advance);
    }
    ;
    advanceSims(strategy, targetTime) {
        let simTime = strategy.getTime();
        while (simTime < targetTime) {
            strategy.advance(this.timeStep_, this);
            if (!this.getRunning()) {
                break;
            }
            const lastSimTime = simTime;
            simTime = strategy.getTime();
            if (simTime - lastSimTime <= 1e-15) {
                throw 'SimRunner: time did not advance';
            }
            if (targetTime - simTime < this.timeStep_) {
                break;
            }
        }
    }
    ;
    callback() {
        try {
            if (this.clock_.isRunning() || this.clock_.isStepping()) {
                let clockTime = this.clock_.getTime();
                let simTime = this.advanceList_[0].getTime();
                if (clockTime > simTime + 1 || clockTime < simTime - 1) {
                    const t = simTime + this.timeStep_;
                    this.clock_.setTime(t);
                    this.clock_.setRealTime(t);
                    clockTime = t;
                }
                const targetTime = clockTime;
                for (let i = 0, n = this.advanceList_.length; i < n; i++) {
                    this.advanceSims(this.advanceList_[i], targetTime);
                }
                if (this.clock_.isStepping()) {
                    this.clock_.clearStepMode();
                }
                else {
                    clockTime = this.clock_.getTime();
                    simTime = this.advanceList_[0].getTime();
                    if (clockTime - simTime > 20 * this.timeStep_) {
                        this.clock_.setTime(simTime);
                    }
                }
            }
            this.paintAll();
            this.frames_++;
        }
        catch (ex) {
            this.handleException(ex);
        }
    }
    ;
    destroy() {
        this.stopFiring();
    }
    ;
    getCanvasList() {
        return Array.from(this.canvasList_);
    }
    ;
    getClock() {
        return this.clock_;
    }
    ;
    getDisplayPeriod() {
        return this.displayPeriod_;
    }
    ;
    getFiring() {
        return this.timer_.isFiring();
    }
    ;
    getFrameRate() {
        return this.frames_ / this.clock_.getTime();
    }
    ;
    getMemos() {
        return this.memoList_.getMemos();
    }
    ;
    getNonStop() {
        return this.nonStop_;
    }
    ;
    getRunning() {
        return this.clock_.isRunning();
    }
    ;
    getTimeStep() {
        return this.timeStep_;
    }
    ;
    handleException(error) {
        this.pause();
        this.timer_.stopFiring();
        this.errorObservers_.forEach(e => e.notifyError(error));
        const s = error != null ? ' ' + error : '';
        alert(SimRunner.i18n.STUCK + s);
    }
    ;
    memorize() {
        this.memoList_.memorize();
    }
    ;
    observe(event) {
        if (event.getSubject() == this.clock_) {
            if (event.nameEquals(Clock.CLOCK_RESUME) || event.nameEquals(Clock.CLOCK_PAUSE)) {
                const t = this.advanceList_[0].getTime();
                this.clock_.setTime(t);
                this.clock_.setRealTime(t);
                this.broadcastParameter(SimRunner.en.RUNNING);
            }
            else if (event.nameEquals(Clock.CLOCK_SET_TIME)) {
                this.memorize();
            }
        }
    }
    ;
    paintAll() {
        this.canvasList_.forEach(c => c.paint());
    }
    ;
    pause() {
        this.clock_.pause();
        return this.clock_.getTime();
    }
    ;
    playUntil(pauseTime) {
        const pauseTask = new ClockTask(pauseTime, null);
        pauseTask.setCallback(() => {
            this.clock_.pause();
            this.clock_.removeTask(pauseTask);
        });
        this.clock_.addTask(pauseTask);
        return this.resume();
    }
    ;
    removeCanvas(canvas) {
        Util.remove(this.canvasList_, canvas);
        this.removeMemo(canvas);
    }
    ;
    removeErrorObserver(errorObserver) {
        Util.remove(this.errorObservers_, errorObserver);
    }
    ;
    removeMemo(memorizable) {
        this.memoList_.removeMemo(memorizable);
    }
    ;
    reset() {
        this.frames_ = 0;
        this.timer_.startFiring();
        this.clock_.pause();
        this.advanceList_.forEach(strategy => strategy.reset());
        const t = this.advanceList_[0].getTime();
        this.clock_.setTime(t);
        this.clock_.setRealTime(t);
        this.paintAll();
        this.broadcast(new GenericEvent(this, SimRunner.RESET));
        return this.clock_.getTime();
    }
    ;
    resume() {
        this.timer_.startFiring();
        this.clock_.resume();
        return this.clock_.getTime();
    }
    ;
    save() {
        this.advanceList_.forEach(strategy => strategy.save());
        return this.clock_.getTime();
    }
    ;
    setAppName(name) {
        this.appName_ = name;
    }
    ;
    setDisplayPeriod(displayPeriod) {
        this.displayPeriod_ = displayPeriod;
        this.timer_.setPeriod(displayPeriod);
        this.broadcastParameter(SimRunner.en.DISPLAY_PERIOD);
    }
    ;
    setFiring(value) {
        if (value) {
            this.startFiring();
        }
        else {
            this.paintAll();
            this.stopFiring();
        }
        this.broadcastParameter(SimRunner.en.FIRING);
    }
    ;
    setNonStop(value) {
        this.nonStop_ = value;
        this.broadcastParameter(SimRunner.en.NON_STOP);
    }
    ;
    setRunning(value) {
        if (value) {
            this.resume();
        }
        else {
            this.pause();
        }
    }
    ;
    setTimeStep(timeStep) {
        this.timeStep_ = timeStep;
        this.broadcastParameter(SimRunner.en.TIME_STEP);
    }
    ;
    startFiring() {
        this.timer_.startFiring();
    }
    ;
    step() {
        const dt = this.advanceList_[0].getTime() + this.timeStep_ - this.clock_.getTime();
        this.clock_.step(dt);
        this.timer_.startFiring();
        return this.clock_.getTime();
    }
    ;
    stopFiring() {
        if (!this.nonStop_) {
            this.timer_.stopFiring();
        }
    }
    ;
}
SimRunner.RESET = 'RESET';
SimRunner.en = {
    TIME_STEP: 'time step',
    DISPLAY_PERIOD: 'display period',
    RESTART: 'restart',
    RUNNING: 'running',
    FIRING: 'firing',
    PAUSE: 'pause',
    RESUME: 'resume',
    NON_STOP: 'non-stop',
    STEP: 'step',
    STUCK: 'Simulation is stuck; click reset and play to continue.'
};
SimRunner.de_strings = {
    TIME_STEP: 'Zeitschritt',
    DISPLAY_PERIOD: 'Bilddauer',
    RESTART: 'Neustart',
    RUNNING: 'laufend',
    FIRING: 'tätigend',
    PAUSE: 'pausieren',
    RESUME: 'weiter',
    NON_STOP: 'durchgehend',
    STEP: 'kleine Schritte',
    STUCK: 'Simulation hat sich aufgehängt; drücken Sie Neustart und Weiter um fort zu fahren.'
};
SimRunner.i18n = Util.LOCALE === 'de' ? SimRunner.de_strings : SimRunner.en;
Util.defineGlobal('lab$app$SimRunner', SimRunner);
