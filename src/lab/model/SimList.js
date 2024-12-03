import { Arc } from './Arc.js';
import { ConcreteLine } from './ConcreteLine.js';
import { AbstractSubject } from '../util/AbstractSubject.js';
import { GenericEvent } from '../util/Observe.js';
import { PointMass } from './PointMass.js';
import { Spring } from './Spring.js';
import { Util } from '../util/Util.js';
export class SimList extends AbstractSubject {
    constructor() {
        super('SIM_LIST');
        this.elements_ = [];
        this.tolerance_ = 0.1;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', tolerance_: ' + Util.NF(this.tolerance_)
            + ', elements_: ['
            + this.elements_.map((e, idx) => idx + ': ' + e.toStringShort())
            + ']' + super.toString();
    }
    ;
    toStringShort() {
        return super.toStringShort().slice(0, -1)
            + ', length: ' + this.elements_.length + '}';
    }
    ;
    getClassName() {
        return 'SimList';
    }
    ;
    add(...objs) {
        for (let i = 0; i < objs.length; i++) {
            const element = objs[i];
            if (!element) {
                throw 'cannot add invalid SimObject';
            }
            const expire = element.getExpireTime();
            if (isFinite(expire)) {
                let similar;
                while (similar = this.getSimilar(element)) {
                    this.remove(similar);
                }
            }
            if (!this.elements_.includes(element)) {
                this.elements_.push(element);
                this.broadcast(new GenericEvent(this, SimList.OBJECT_ADDED, element));
            }
        }
    }
    ;
    addAll(objList) {
        for (let i = 0, len = objList.length; i < len; i++) {
            this.add(objList[i]);
        }
    }
    ;
    clear() {
        this.removeAll(this.toArray());
    }
    ;
    contains(simObj) {
        return this.elements_.includes(simObj);
    }
    ;
    get(arg) {
        if (typeof arg === 'number') {
            if (arg >= 0 && arg < this.elements_.length) {
                return this.elements_[arg];
            }
        }
        else if (typeof arg === 'string') {
            arg = Util.toName(arg);
            const e = this.elements_.find(obj => obj.getName() == arg);
            if (e !== undefined) {
                return e;
            }
        }
        throw 'SimList did not find ' + arg;
    }
    ;
    getArc(name) {
        const obj = this.get(name);
        if (obj instanceof Arc) {
            return obj;
        }
        else {
            throw 'no Arc named ' + name;
        }
    }
    ;
    getConcreteLine(name) {
        const obj = this.get(name);
        if (obj instanceof ConcreteLine) {
            return obj;
        }
        else {
            throw 'no ConcreteLine named ' + name;
        }
    }
    ;
    getMassObject(name) {
        const obj = this.get(name);
        if (obj instanceof PointMass) {
            return obj;
        }
        else {
            throw 'no MassObject named ' + name;
        }
    }
    ;
    getPointMass(name) {
        const obj = this.get(name);
        if (obj instanceof PointMass) {
            return obj;
        }
        else {
            throw 'no PointMass named ' + name;
        }
    }
    ;
    getSimilar(simObj, tolerance) {
        const tol = (tolerance === undefined) ? this.tolerance_ : tolerance;
        const r = this.elements_.find(obj => obj.similar(simObj, tol));
        return r !== undefined ? r : null;
    }
    ;
    getSpring(name) {
        const obj = this.get(name);
        if (obj instanceof Spring) {
            return obj;
        }
        else {
            throw 'no Spring named ' + name;
        }
    }
    ;
    getTolerance() {
        return this.tolerance_;
    }
    ;
    indexOf(simObj) {
        return this.elements_.indexOf(simObj);
    }
    ;
    length() {
        return this.elements_.length;
    }
    ;
    remove(simObj) {
        if (Util.remove(this.elements_, simObj)) {
            this.broadcast(new GenericEvent(this, SimList.OBJECT_REMOVED, simObj));
        }
    }
    ;
    removeAll(objList) {
        for (let i = 0, len = objList.length; i < len; i++) {
            this.remove(objList[i]);
        }
    }
    ;
    removeTemporary(time) {
        for (let i = this.elements_.length - 1; i >= 0; i--) {
            const simobj = this.elements_[i];
            if (simobj.getExpireTime() < time) {
                this.elements_.splice(i, 1);
                this.broadcast(new GenericEvent(this, SimList.OBJECT_REMOVED, simobj));
            }
        }
    }
    ;
    setTolerance(tolerance) {
        this.tolerance_ = tolerance;
    }
    ;
    toArray() {
        return Array.from(this.elements_);
    }
    ;
}
SimList.OBJECT_ADDED = 'OBJECT_ADDED';
SimList.OBJECT_MODIFIED = 'OBJECT_MODIFIED';
SimList.OBJECT_REMOVED = 'OBJECT_REMOVED';
