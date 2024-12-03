import { RungeKutta } from './RungeKutta.js';
import { Util } from '../util/Util.js';
export class SimpleAdvance {
    constructor(sim, opt_diffEqSolver) {
        this.sim_ = sim;
        this.odeSolver_ = opt_diffEqSolver || new RungeKutta(sim);
        this.timeStep_ = 0.025;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', odeSolver_: ' + this.odeSolver_.toStringShort()
            + '}';
    }
    ;
    toStringShort() {
        return 'SimpleAdvance{sim_: ' + this.sim_.toStringShort() + '}';
    }
    ;
    advance(timeStep, opt_memoList) {
        this.sim_.getSimList().removeTemporary(this.sim_.getTime());
        const err = this.odeSolver_.step(timeStep);
        if (err != null) {
            throw 'error during advance ' + err;
        }
        this.sim_.modifyObjects();
        if (opt_memoList !== undefined) {
            opt_memoList.memorize();
        }
    }
    ;
    getDiffEqSolver() {
        return this.odeSolver_;
    }
    ;
    getTime() {
        return this.sim_.getTime();
    }
    ;
    getTimeStep() {
        return this.timeStep_;
    }
    ;
    reset() {
        this.sim_.reset();
    }
    ;
    save() {
        this.sim_.saveInitialState();
    }
    ;
    setDiffEqSolver(diffEqSolver) {
        this.odeSolver_ = diffEqSolver;
    }
    ;
    setTimeStep(timeStep) {
        this.timeStep_ = timeStep;
    }
    ;
}
Util.defineGlobal('lab$model$SimpleAdvance', SimpleAdvance);
