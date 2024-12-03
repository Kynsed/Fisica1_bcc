import { AbstractSubject } from "../util/AbstractSubject.js";
import { DisplayShape } from "./DisplayShape.js";
import { DisplaySpring } from "./DisplaySpring.js";
import { GenericEvent } from "../util/Observe.js";
import { Util } from "../util/Util.js";
export class DisplayList extends AbstractSubject {
    constructor(opt_name) {
        super(opt_name || 'DISPLAY_LIST_' + (DisplayList.NAME_ID++));
        this.drawables_ = [];
        this.changed_ = true;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', drawables_: ['
            + this.drawables_.map((d, idx) => idx + ': ' + d.toStringShort())
            + ']' + super.toString();
    }
    ;
    toStringShort() {
        return super.toStringShort().slice(0, -1)
            + ', drawables_.length: ' + this.drawables_.length + '}';
    }
    ;
    getClassName() {
        return 'DisplayList';
    }
    ;
    add(...dispObjs) {
        dispObjs.forEach(dispObj => {
            if (!Util.isObject(dispObj)) {
                throw 'non-object: ' + dispObj;
            }
            const zIndex = dispObj.getZIndex();
            if (Util.DEBUG) {
                this.preExist(dispObj);
            }
            this.sort();
            let i = this.drawables_.findIndex(d => zIndex < d.getZIndex());
            i = i < 0 ? this.drawables_.length : i;
            this.drawables_.splice(i, 0, dispObj);
            this.changed_ = true;
            this.broadcast(new GenericEvent(this, DisplayList.OBJECT_ADDED, dispObj));
        });
    }
    ;
    contains(dispObj) {
        if (!Util.isObject(dispObj)) {
            throw 'non-object passed to DisplayList.contains';
        }
        return this.drawables_.includes(dispObj);
    }
    ;
    draw(context, map) {
        this.sort();
        this.drawables_.forEach(dispObj => dispObj.draw(context, map));
    }
    ;
    find(search) {
        if (typeof search === 'number') {
            const index = search;
            const n = this.drawables_.length;
            if (index < 0 || index >= n) {
                return undefined;
            }
            else {
                this.sort();
                return this.drawables_[index];
            }
        }
        else if (typeof search === 'string') {
            const objName = Util.toName(search);
            return this.drawables_.find(element => {
                const simObjs = element.getSimObjects();
                for (let i = 0, n = simObjs.length; i < n; i++) {
                    if (simObjs[i].getName() == objName) {
                        return true;
                    }
                }
                return false;
            });
        }
        else if (Util.isObject(search)) {
            return this.drawables_.find(element => {
                const simObjs = element.getSimObjects();
                return simObjs.some(element => element === search);
            });
        }
        else {
            return undefined;
        }
    }
    ;
    findShape(search) {
        const ds = this.find(search);
        if (ds instanceof DisplayShape) {
            return ds;
        }
        throw 'DisplayShape not found: ' + search;
    }
    ;
    findSpring(search) {
        const ds = this.find(search);
        if (ds instanceof DisplaySpring) {
            return ds;
        }
        throw 'DisplaySpring not found: ' + search;
    }
    ;
    get(index) {
        const n = this.drawables_.length;
        if (index < 0 || index >= n) {
            throw index + ' is not in range 0 to ' + (n - 1);
        }
        this.sort();
        return this.drawables_[index];
    }
    ;
    getChanged() {
        let chg = false;
        for (let i = 0, n = this.drawables_.length; i < n; i++) {
            const c = this.drawables_[i].getChanged();
            chg = chg || c;
        }
        if (chg || this.changed_) {
            this.changed_ = false;
            return true;
        }
        return false;
    }
    ;
    length() {
        return this.drawables_.length;
    }
    ;
    preExist(dispObj) {
        if (Util.DEBUG) {
            const simObjs = dispObj.getSimObjects();
            for (let i = 0, len = simObjs.length; i < len; i++) {
                const obj = simObjs[i];
                const preExist = this.find(obj);
                if (preExist != null) {
                    console.log('*** WARNING PRE-EXISTING DISPLAYOBJECT ' + preExist);
                    console.log('*** FOR SIMOBJECT=' + obj);
                    console.log('*** WHILE ADDING ' + dispObj);
                    throw 'pre-existing object ' + preExist + ' for ' + obj + ' adding ' + dispObj;
                }
            }
        }
    }
    ;
    prepend(dispObj) {
        if (!Util.isObject(dispObj)) {
            throw 'non-object passed to DisplayList.add';
        }
        const zIndex = dispObj.getZIndex();
        if (Util.DEBUG) {
            this.preExist(dispObj);
        }
        this.sort();
        let n = this.drawables_.length;
        let i;
        for (i = n; i > 0; i--) {
            const z = this.drawables_[i - 1].getZIndex();
            if (zIndex > z) {
                break;
            }
        }
        this.drawables_.splice(i, 0, dispObj);
        this.changed_ = true;
        this.broadcast(new GenericEvent(this, DisplayList.OBJECT_ADDED, dispObj));
    }
    ;
    remove(dispObj) {
        if (!Util.isObject(dispObj)) {
            throw 'non-object passed to DisplayList.remove';
        }
        const idx = this.drawables_.indexOf(dispObj);
        if (idx > -1) {
            this.drawables_.splice(idx, 1);
            this.changed_ = true;
            this.broadcast(new GenericEvent(this, DisplayList.OBJECT_REMOVED, dispObj));
        }
        ;
    }
    ;
    removeAll() {
        Util.forEachRight(this.drawables_, dispObj => this.remove(dispObj), this);
    }
    ;
    sort() {
        let isSorted = true;
        let lastZ = Number.NEGATIVE_INFINITY;
        for (let i = 0, n = this.drawables_.length; i < n; i++) {
            const z = this.drawables_[i].getZIndex();
            if (z < lastZ) {
                isSorted = false;
                break;
            }
            lastZ = z;
        }
        if (!isSorted) {
            this.drawables_.sort(function (e1, e2) {
                const z1 = e1.getZIndex();
                const z2 = e2.getZIndex();
                if (z1 < z2) {
                    return -1;
                }
                else if (z1 > z2) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            this.changed_ = true;
        }
    }
    ;
    toArray() {
        this.sort();
        return Array.from(this.drawables_);
    }
    ;
}
DisplayList.OBJECT_ADDED = 'OBJECT_ADDED';
DisplayList.OBJECT_REMOVED = 'OBJECT_REMOVED';
DisplayList.NAME_ID = 1;
;
Util.defineGlobal('lab$view$DisplayList', DisplayList);
