import { AbstractSubject } from '../util/AbstractSubject.js';
import { Force } from './Force.js';
import { ParameterNumber } from '../util/Observe.js';
import { SimList } from './SimList.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class GravityLaw extends AbstractSubject {
    constructor(gravity, opt_simList) {
        const id = GravityLaw.NAME_ID++;
        const nm = 'GRAVITY_LAW' + (id > 0 ? '_' + id : '');
        super(nm);
        this.zeroEnergyLevel_ = 0;
        this.bods_ = [];
        this.simList_ = null;
        this.gravity_ = gravity;
        if (opt_simList !== undefined) {
            this.connect(opt_simList);
        }
        ;
        let pn = new ParameterNumber(this, GravityLaw.en.GRAVITY, GravityLaw.i18n.GRAVITY, () => this.getGravity(), a => this.setGravity(a));
        pn.setSignifDigits(4);
        this.addParameter(pn);
        pn = new ParameterNumber(this, GravityLaw.en.ZERO_ENERGY, GravityLaw.i18n.ZERO_ENERGY, () => this.getZeroEnergyLevel(), a => this.setZeroEnergyLevel(a));
        pn.setLowerLimit(Number.NEGATIVE_INFINITY);
        this.addParameter(pn);
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', bodies: ' + this.bods_.length
            + super.toString();
    }
    ;
    toStringShort() {
        return super.toStringShort().slice(0, -1)
            + ', gravity: ' + Util.NF5(this.gravity_) + '}';
    }
    ;
    getClassName() {
        return 'GravityLaw';
    }
    ;
    addBodies(bodies) {
        bodies.forEach(body => this.addBody(body));
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
        this.bods_.forEach(body => {
            if (isFinite(body.getMass())) {
                forces.push(new Force('gravity', body, body.getPosition(), 1, new Vector(0, -this.gravity_ * body.getMass(), 0), 1));
            }
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
            this.simList_ = null;
        }
    }
    ;
    getBodies() {
        return Array.from(this.bods_);
    }
    ;
    getGravity() {
        return this.gravity_;
    }
    ;
    getPotentialEnergy() {
        let pe = 0;
        this.bods_.forEach(body => {
            if (isFinite(body.getMass())) {
                let zel = body.getZeroEnergyLevel();
                zel = zel ?? this.zeroEnergyLevel_;
                pe += (body.getPosition().getY() - zel) * body.getMass() * this.gravity_;
            }
        });
        return pe;
    }
    ;
    getZeroEnergyLevel() {
        return this.zeroEnergyLevel_;
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
    setGravity(gravity) {
        this.gravity_ = gravity;
        this.broadcastParameter(GravityLaw.en.GRAVITY);
    }
    ;
    setZeroEnergyLevel(value) {
        this.zeroEnergyLevel_ = value;
        this.broadcastParameter(GravityLaw.en.ZERO_ENERGY);
    }
    ;
}
GravityLaw.NAME_ID = 0;
GravityLaw.en = {
    GRAVITY: 'gravity',
    ZERO_ENERGY: 'zero energy level'
};
GravityLaw.de_strings = {
    GRAVITY: 'Gravitation',
    ZERO_ENERGY: 'Null-Energie Level'
};
GravityLaw.i18n = Util.LOCALE === 'de' ? GravityLaw.de_strings : GravityLaw.en;
Util.defineGlobal('lab$model$GravityLaw', GravityLaw);
