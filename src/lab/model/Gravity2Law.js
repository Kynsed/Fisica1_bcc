import { AbstractSubject } from '../util/AbstractSubject.js';
import { Force } from './Force.js';
import { ParameterNumber } from '../util/Observe.js';
import { SimList } from './SimList.js';
import { Util } from '../util/Util.js';
export class Gravity2Law extends AbstractSubject {
    constructor(gravity, opt_simList) {
        const id = Gravity2Law.NAME_ID++;
        const nm = 'GRAVITY_INVERSE_SQUARE_LAW' + (id > 0 ? '_' + id : '');
        super(nm);
        this.bods_ = [];
        this.simList_ = null;
        this.gravity_ = gravity;
        if (opt_simList !== undefined) {
            this.connect(opt_simList);
        }
        ;
        let pn = new ParameterNumber(this, Gravity2Law.en.GRAVITY, Gravity2Law.i18n.GRAVITY, () => this.getGravity(), a => this.setGravity(a));
        pn.setSignifDigits(4);
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
        return 'Gravity2Law';
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
        const bodies2 = this.bods_.slice();
        const forces = [];
        let j = 0;
        const n = bodies2.length;
        this.bods_.forEach(body1 => {
            j++;
            const m1 = body1.getMass();
            if (m1 <= 0 || !isFinite(m1))
                return;
            const body1cm = body1.getPosition();
            for (let k = j; k < n; k++) {
                const body2 = bodies2[k];
                const m2 = body2.getMass();
                if (m2 <= 0 || !isFinite(m2))
                    continue;
                const vector = body1cm.subtract(body2.getPosition());
                const r = vector.length();
                let direction = vector.normalize();
                if (direction != null) {
                    direction = direction.multiply(this.gravity_ * m1 * m2 / (r * r));
                    forces.push(new Force('gravity', body1, body1.getPosition(), 1, direction.multiply(-1), 1));
                    forces.push(new Force('gravity', body2, body2.getPosition(), 1, direction, 1));
                }
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
        const bodies2 = this.bods_.slice();
        let j = 0;
        const n = bodies2.length;
        this.bods_.forEach(body1 => {
            j++;
            const m1 = body1.getMass();
            if (m1 <= 0 || !isFinite(m1))
                return;
            const h1 = body1.getMinHeight();
            const body1cm = body1.getPosition();
            for (let k = j; k < n; k++) {
                const body2 = bodies2[k];
                const m2 = body2.getMass();
                if (m2 <= 0 || !isFinite(m2))
                    continue;
                const h2 = body2.getMinHeight();
                const vector = body1cm.subtract(body2.getPosition());
                const r = vector.length();
                pe += this.gravity_ * m1 * m2 * ((1 / (h1 + h2)) - (1 / r));
            }
        });
        return pe;
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
    setBodies(bodies) {
        this.bods_ = Array.from(bodies);
    }
    ;
    setGravity(gravity) {
        this.gravity_ = gravity;
        this.broadcastParameter(Gravity2Law.en.GRAVITY);
    }
    ;
}
Gravity2Law.NAME_ID = 0;
Gravity2Law.en = {
    GRAVITY: 'gravity'
};
Gravity2Law.de_strings = {
    GRAVITY: 'Gravitation'
};
Gravity2Law.i18n = Util.LOCALE === 'de' ? Gravity2Law.de_strings : Gravity2Law.en;
Util.defineGlobal('lab$model$Gravity2Law', Gravity2Law);
