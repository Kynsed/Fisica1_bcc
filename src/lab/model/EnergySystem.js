import { Util } from '../util/Util.js';
;
export class EnergyInfo {
    constructor(potential, translational, rotational, workDone, initialEnergy) {
        this.potential_ = potential || 0;
        this.translational_ = translational || 0;
        this.rotational_ = (rotational === undefined) ? NaN : rotational;
        this.workDone_ = (workDone === undefined) ? NaN : workDone;
        this.initialEnergy_ = (initialEnergy === undefined) ? NaN : initialEnergy;
    }
    ;
    toString() {
        return 'EnergyInfo{potential_: ' + Util.NF(this.potential_)
            + ', translational_: ' + Util.NF(this.translational_)
            + ', rotational_: ' + Util.NF(this.rotational_)
            + ', workDone_: ' + Util.NF(this.workDone_)
            + ', initialEnergy_: ' + Util.NF(this.initialEnergy_)
            + '}';
    }
    ;
    getInitialEnergy() {
        return this.initialEnergy_;
    }
    ;
    getPotential() {
        return this.potential_;
    }
    ;
    getRotational() {
        return this.rotational_;
    }
    ;
    getTotalEnergy() {
        let tot = this.potential_ + this.translational_;
        if (!isNaN(this.rotational_)) {
            tot += this.rotational_;
        }
        return tot;
    }
    ;
    getTranslational() {
        return this.translational_;
    }
    ;
    getWorkDone() {
        return this.workDone_;
    }
    ;
    setInitialEnergy(value) {
        this.initialEnergy_ = value;
    }
    ;
    setPotential(value) {
        this.potential_ = value;
    }
    ;
    setRotational(value) {
        this.rotational_ = value;
    }
    ;
    setTranslational(value) {
        this.translational_ = value;
    }
    ;
    setWorkDone(value) {
        this.workDone_ = value;
    }
    ;
}
EnergyInfo.en = {
    POTENTIAL_ENERGY: 'potential energy',
    TRANSLATIONAL_ENERGY: 'translational energy',
    KINETIC_ENERGY: 'kinetic energy',
    ROTATIONAL_ENERGY: 'rotational energy',
    TOTAL: 'total',
    TOTAL_ENERGY: 'total energy',
    PE_OFFSET: 'potential energy offset'
};
EnergyInfo.de_strings = {
    POTENTIAL_ENERGY: 'potenzielle Energie',
    TRANSLATIONAL_ENERGY: 'Translationsenergie',
    KINETIC_ENERGY: 'kinetische Energie',
    ROTATIONAL_ENERGY: 'Rotationsenergie',
    TOTAL: 'gesamt',
    TOTAL_ENERGY: 'gesamte Energie',
    PE_OFFSET: 'Potenzielle Energie Ausgleich'
};
EnergyInfo.i18n = Util.LOCALE === 'de' ? EnergyInfo.de_strings : EnergyInfo.en;
Util.defineGlobal('lab$model$EnergyInfo', EnergyInfo);
