import { Util } from '../util/Util.js';
export class ModifiedEuler {
    constructor(ode) {
        this.inp_ = [];
        this.k1_ = [];
        this.k2_ = [];
        this.ode_ = ode;
    }
    ;
    toString() {
        return this.toStringShort();
    }
    ;
    toStringShort() {
        return 'ModifiedEuler{ode_: ' + this.ode_.toStringShort() + '}';
    }
    ;
    getName(opt_localized) {
        return opt_localized ? ModifiedEuler.i18n.NAME :
            Util.toName(ModifiedEuler.en.NAME);
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
        if (this.inp_.length != N) {
            this.inp_ = new Array(N);
            this.k1_ = new Array(N);
            this.k2_ = new Array(N);
        }
        const inp = this.inp_;
        const k1 = this.k1_;
        const k2 = this.k2_;
        for (let i = 0; i < N; i++) {
            inp[i] = vars[i];
        }
        Util.zeroArray(k1);
        let error = this.ode_.evaluate(inp, k1, 0);
        if (error != null)
            return error;
        for (let i = 0; i < N; i++) {
            inp[i] = vars[i] + k1[i] * stepSize;
        }
        Util.zeroArray(k2);
        error = this.ode_.evaluate(inp, k2, stepSize);
        if (error != null)
            return error;
        for (let i = 0; i < N; i++) {
            vars[i] += (k1[i] + k2[i]) * stepSize / 2;
        }
        va.setValues(vars, true);
        return null;
    }
    ;
}
ModifiedEuler.en = {
    NAME: 'Modified Euler'
};
ModifiedEuler.de_strings = {
    NAME: 'Modifiziert Euler'
};
ModifiedEuler.i18n = Util.LOCALE === 'de' ? ModifiedEuler.de_strings :
    ModifiedEuler.en;
Util.defineGlobal('lab$model$ModifiedEuler', ModifiedEuler);
