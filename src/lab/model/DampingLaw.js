import { AbstractSubject } from '../util/AbstractSubject.js';
import { Force } from './Force.js';
import { ParameterNumber } from '../util/Observe.js';
import { SimList } from './SimList.js';
import { Util } from '../util/Util.js';
export class DampingLaw extends AbstractSubject {
    constructor(damping, rotateRatio, opt_simList) {
        const id = DampingLaw.NAME_ID++;
        const nm = 'DAMPING_LAW' + (id > 0 ? '_' + id : '');
        super(nm);
        this.bods_ = [];
        this.simList_ = null;
        this.damping_ = damping;
        this.rotateRatio_ = rotateRatio || 1.0;
        if (opt_simList !== undefined) {
            this.connect(opt_simList);
        }
        ;
        let pn = new ParameterNumber(this, DampingLaw.en.DAMPING, DampingLaw.i18n.DAMPING, () => this.getDamping(), a => this.setDamping(a));
        pn.setSignifDigits(3);
        this.addParameter(pn);
        pn = new ParameterNumber(this, DampingLaw.en.ROTATE_RATIO, DampingLaw.i18n.ROTATE_RATIO, () => this.getRotateRatio(), a => this.setRotateRatio(a));
        pn.setSignifDigits(3);
        this.addParameter(pn);
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', rotateRatio: ' + Util.NF5(this.rotateRatio_)
            + ', bodies: ' + this.bods_.length
            + super.toString();
    }
    ;
    toStringShort() {
        return super.toStringShort().slice(0, -1)
            + ', damping: ' + Util.NF5(this.damping_) + '}';
    }
    ;
    getClassName() {
        return 'DampingLaw';
    }
    ;
    addBodies(bodies) {
        bodies.forEach(b => this.addBody(b));
    }
    ;
    addBody(obj) {
        if (!obj.isMassObject()) {
            return;
        }
        const mobj = obj;
        if (this.bods_.includes(mobj)) {
            return;
        }
        const m = mobj.getMass();
        if (m > 0 && isFinite(m)) {
            this.bods_.push(mobj);
        }
    }
    ;
    calculateForces() {
        const forces = [];
        if (this.damping_ == 0) {
            return forces;
        }
        this.bods_.forEach(bod => {
            if (!isFinite(bod.getMass()))
                return;
            const cm = bod.getPosition();
            const f = new Force('damping', bod, cm, 1, bod.getVelocity().multiply(-this.damping_), 1, -this.damping_ * this.rotateRatio_ * bod.getAngularVelocity());
            forces.push(f);
        });
        return forces;
    }
    ;
    connect(simList) {
        this.addBodies(simList.toArray());
        simList.addObserver(this);
        this.simList_ = simList;
    }
    ;
    disconnect() {
        if (this.simList_ != null) {
            this.simList_.removeObserver(this);
        }
    }
    ;
    getBodies() {
        return Array.from(this.bods_);
    }
    ;
    getDamping() {
        return this.damping_;
    }
    ;
    getPotentialEnergy() {
        return 0;
    }
    ;
    getRotateRatio() {
        return this.rotateRatio_;
    }
    ;
    observe(event) {
        if (event.nameEquals(SimList.OBJECT_ADDED)) {
            const obj = event.getValue();
            this.addBody(obj);
        }
        else if (event.nameEquals(SimList.OBJECT_REMOVED)) {
            const obj = event.getValue();
            Util.remove(this.bods_, obj);
            Util.assert(!this.bods_.includes(obj));
        }
    }
    ;
    setDamping(value) {
        this.damping_ = value;
        this.broadcastParameter(DampingLaw.en.DAMPING);
    }
    ;
    setRotateRatio(value) {
        this.rotateRatio_ = value;
        this.broadcastParameter(DampingLaw.en.ROTATE_RATIO);
    }
    ;
}
DampingLaw.NAME_ID = 0;
DampingLaw.en = {
    DAMPING: 'damping',
    ROTATE_RATIO: 'rotate ratio'
};
DampingLaw.de_strings = {
    DAMPING: 'Dämpfung',
    ROTATE_RATIO: 'Drehquotient'
};
DampingLaw.i18n = Util.LOCALE === 'de' ? DampingLaw.de_strings : DampingLaw.en;
Util.defineGlobal('lab$model$DampingLaw', DampingLaw);
