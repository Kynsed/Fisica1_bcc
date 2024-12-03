import { Util } from '../util/Util.js';
export class EulersMethod {
    constructor(ode) {
        this.inp_ = [];
        this.k1_ = [];
        this.ode_ = ode;
    }
    ;
    toString() {
        return this.toStringShort();
    }
    ;
    toStringShort() {
        return 'EulersMethod{ode_: ' + this.ode_.toStringShort() + '}';
    }
    ;
    getName(opt_localized) {
        return opt_localized ? EulersMethod.i18n.NAME :
            Util.toName(EulersMethod.en.NAME);
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
        }
        const inp = this.inp_;
        const k1 = this.k1_;
        for (let i = 0; i < N; i++) {
            inp[i] = vars[i];
        }
        Util.zeroArray(k1);
        const error = this.ode_.evaluate(inp, k1, 0);
        if (error != null) {
            return error;
        }
        for (let i = 0; i < N; i++) {
            vars[i] += k1[i] * stepSize;
        }
        va.setValues(vars, true);
        return null;
    }
    ;
}
EulersMethod.en = {
    NAME: 'Eulers Method'
};
EulersMethod.de_strings = {
    NAME: 'Eulers Methode'
};
EulersMethod.i18n = Util.LOCALE === 'de' ? EulersMethod.de_strings :
    EulersMethod.en;
Util.defineGlobal('lab$model$EulersMethod', EulersMethod);
