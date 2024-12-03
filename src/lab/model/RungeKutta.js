import { Util } from '../util/Util.js';
export class RungeKutta {
    constructor(ode) {
        this.inp_ = [];
        this.k1_ = [];
        this.k2_ = [];
        this.k3_ = [];
        this.k4_ = [];
        this.ode_ = ode;
    }
    ;
    toString() {
        return this.toStringShort();
    }
    ;
    toStringShort() {
        return 'RungeKutta{ode_: ' + this.ode_.toStringShort() + '}';
    }
    ;
    getName(opt_localized) {
        return opt_localized ? RungeKutta.i18n.NAME :
            Util.toName(RungeKutta.en.NAME);
    }
    ;
    nameEquals(name) {
        return this.getName() == Util.toName(name);
    }
    ;
    step(stepSize) {
        const va = this.ode_.getVarsList();
        const vars = va.getValues();
        const N = vars.length;
        if (this.inp_.length < N) {
            this.inp_ = new Array(N);
            this.k1_ = new Array(N);
            this.k2_ = new Array(N);
            this.k3_ = new Array(N);
            this.k4_ = new Array(N);
        }
        const inp = this.inp_;
        const k1 = this.k1_;
        const k2 = this.k2_;
        const k3 = this.k3_;
        const k4 = this.k4_;
        for (let i = 0; i < N; i++) {
            inp[i] = vars[i];
        }
        Util.zeroArray(k1);
        let error = this.ode_.evaluate(inp, k1, 0);
        if (error !== null) {
            return error;
        }
        for (let i = 0; i < N; i++) {
            inp[i] = vars[i] + k1[i] * stepSize / 2;
        }
        Util.zeroArray(k2);
        error = this.ode_.evaluate(inp, k2, stepSize / 2);
        if (error !== null) {
            return error;
        }
        for (let i = 0; i < N; i++) {
            inp[i] = vars[i] + k2[i] * stepSize / 2;
        }
        Util.zeroArray(k3);
        error = this.ode_.evaluate(inp, k3, stepSize / 2);
        if (error !== null) {
            return error;
        }
        for (let i = 0; i < N; i++) {
            inp[i] = vars[i] + k3[i] * stepSize;
        }
        Util.zeroArray(k4);
        error = this.ode_.evaluate(inp, k4, stepSize);
        if (error !== null) {
            return error;
        }
        for (let i = 0; i < N; i++) {
            vars[i] += (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) * stepSize / 6;
        }
        va.setValues(vars, true);
        return null;
    }
    ;
}
RungeKutta.en = {
    NAME: 'Runge-Kutta'
};
RungeKutta.de_strings = {
    NAME: 'Runge-Kutta'
};
RungeKutta.i18n = Util.LOCALE === 'de' ? RungeKutta.de_strings :
    RungeKutta.en;
Util.defineGlobal('lab$model$RungeKutta', RungeKutta);
