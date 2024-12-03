import { Util } from '../util/Util.js';
export class AdaptiveStepSolver {
    constructor(diffEq, energySystem, diffEqSolver) {
        this.totSteps_ = 0;
        this.secondDiff_ = true;
        this.specialTest_ = false;
        this.tolerance_ = 1E-6;
        this.diffEq_ = diffEq;
        this.energySystem_ = energySystem;
        this.odeSolver_ = diffEqSolver;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', odeSolver_: ' + this.odeSolver_.toStringShort()
            + ', energySystem_: ' + this.energySystem_.toStringShort()
            + ', secondDiff_: ' + this.secondDiff_
            + ', tolerance_: ' + Util.NFE(this.tolerance_)
            + '}';
    }
    ;
    toStringShort() {
        return 'AdaptiveStepSolver{diffEq_: ' + this.diffEq_.toStringShort() + '}';
    }
    ;
    getName(opt_localized) {
        if (opt_localized) {
            return AdaptiveStepSolver.i18n.NAME + '-'
                + this.odeSolver_.getName(true);
        }
        else {
            return Util.toName(AdaptiveStepSolver.en.NAME) + '_'
                + this.odeSolver_.getName(false);
        }
    }
    ;
    nameEquals(name) {
        return this.getName() == Util.toName(name);
    }
    ;
    getSecondDiff() {
        return this.secondDiff_;
    }
    ;
    getTolerance() {
        return this.tolerance_;
    }
    ;
    setSecondDiff(value) {
        this.secondDiff_ = value;
    }
    ;
    setTolerance(value) {
        this.tolerance_ = value;
    }
    ;
    step(stepSize) {
        this.diffEq_.saveState();
        const startTime = this.diffEq_.getTime();
        let d_t = stepSize;
        let steps = 0;
        this.diffEq_.modifyObjects();
        const startEnergy = this.energySystem_.getEnergyInfo().getTotalEnergy();
        let lastEnergyDiff = Infinity;
        let value = Infinity;
        let firstTime = true;
        if (stepSize < 1E-15)
            return null;
        do {
            let t = startTime;
            if (!firstTime) {
                this.diffEq_.restoreState();
                this.diffEq_.modifyObjects();
                Util.assert(Math.abs(this.diffEq_.getTime() - startTime) < 1E-12);
                const e = this.energySystem_.getEnergyInfo().getTotalEnergy();
                Util.assert(Math.abs(e - startEnergy) < 1E-10);
                d_t = d_t / 5;
                if (d_t < 1E-15)
                    throw 'time step too small ' + d_t;
            }
            steps = 0;
            while (t < startTime + stepSize) {
                let h = d_t;
                if (t + h > startTime + stepSize - 1E-10)
                    h = startTime + stepSize - t;
                steps++;
                const error = this.odeSolver_.step(h);
                this.diffEq_.modifyObjects();
                if (error != null)
                    return error;
                t += h;
            }
            const finishEnergy = this.energySystem_.getEnergyInfo().getTotalEnergy();
            const energyDiff = Math.abs(startEnergy - finishEnergy);
            if (this.secondDiff_) {
                if (!firstTime) {
                    value = Math.abs(energyDiff - lastEnergyDiff);
                }
            }
            else {
                value = energyDiff;
            }
            lastEnergyDiff = energyDiff;
            firstTime = false;
        } while (value > this.tolerance_);
        this.totSteps_ += steps;
        return null;
    }
    ;
}
AdaptiveStepSolver.en = {
    NAME: 'Adaptive'
};
AdaptiveStepSolver.de_strings = {
    NAME: 'Adaptiert'
};
AdaptiveStepSolver.i18n = Util.LOCALE === 'de' ?
    AdaptiveStepSolver.de_strings : AdaptiveStepSolver.en;
Util.defineGlobal('lab$model$AdaptiveStepSolver', AdaptiveStepSolver);
