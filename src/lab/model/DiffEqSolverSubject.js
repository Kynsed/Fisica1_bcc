import { AbstractSubject } from '../util/AbstractSubject.js';
import { AdaptiveStepSolver } from './AdaptiveStepSolver.js';
import { EulersMethod } from './EulersMethod.js';
import { ModifiedEuler } from './ModifiedEuler.js';
import { ParameterString } from '../util/Observe.js';
import { RungeKutta } from './RungeKutta.js';
import { Util } from '../util/Util.js';
export class DiffEqSolverSubject extends AbstractSubject {
    constructor(sim, energySystem, advanceStrategy, opt_name) {
        super(opt_name || 'DIFF_EQ_SUBJECT');
        this.sim_ = sim;
        this.energySystem_ = energySystem;
        this.advanceStrategy_ = advanceStrategy;
        this.solvers_ = [];
        this.solvers_.push(new EulersMethod(this.sim_));
        this.solvers_.push(new ModifiedEuler(this.sim_));
        this.solvers_.push(new RungeKutta(this.sim_));
        if (this.energySystem_ != null) {
            let solver = new AdaptiveStepSolver(this.sim_, this.energySystem_, new ModifiedEuler(this.sim_));
            this.solvers_.push(solver);
            solver = new AdaptiveStepSolver(this.sim_, this.energySystem_, new RungeKutta(this.sim_));
            this.solvers_.push(solver);
        }
        ;
        const choices = this.solvers_.map(s => s.getName(true));
        const values = this.solvers_.map(s => s.getName());
        this.addParameter(new ParameterString(this, DiffEqSolverSubject.en.DIFF_EQ_SOLVER, DiffEqSolverSubject.i18n.DIFF_EQ_SOLVER, () => this.getDiffEqSolver(), a => this.setDiffEqSolver(a), choices, values));
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', sim_: ' + this.sim_.toStringShort()
            + ', energySystem_: ' + (this.energySystem_ == null ? 'null'
            : this.energySystem_.toStringShort())
            + ', advanceStrategy_: ' + this.advanceStrategy_
            + ', solvers_: [ '
            + this.solvers_.map(s => s.toStringShort())
            + ']'
            + super.toString();
    }
    ;
    getClassName() {
        return 'DiffEqSolverSubject';
    }
    ;
    getDiffEqSolver() {
        return this.advanceStrategy_.getDiffEqSolver().getName();
    }
    ;
    setDiffEqSolver(value) {
        if (!this.advanceStrategy_.getDiffEqSolver().nameEquals(value)) {
            const solver = this.solvers_.find(s => s.nameEquals(value));
            if (solver !== undefined) {
                this.advanceStrategy_.setDiffEqSolver(solver);
                this.broadcastParameter(DiffEqSolverSubject.en.DIFF_EQ_SOLVER);
            }
            else {
                throw 'unknown solver: ' + value;
            }
        }
    }
    ;
}
DiffEqSolverSubject.en = {
    DIFF_EQ_SOLVER: 'Diff Eq Solver'
};
DiffEqSolverSubject.de_strings = {
    DIFF_EQ_SOLVER: 'Diff Eq Löser'
};
DiffEqSolverSubject.i18n = Util.LOCALE === 'de' ?
    DiffEqSolverSubject.de_strings : DiffEqSolverSubject.en;
Util.defineGlobal('lab$model$DiffEqSolverSubject', DiffEqSolverSubject);
