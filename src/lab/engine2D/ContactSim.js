import { ComputeForces } from './ComputeForces.js';
import { ExtraAccelChoices, ExtraAccelValues } from './ExtraAccel.js';
import { Force } from '../model/Force.js';
import { GenericEvent, ParameterString } from '../util/Observe.js';
import { ImpulseSim } from './ImpulseSim.js';
import { RigidBodySim } from './RigidBodySim.js';
import { Scrim } from './Scrim.js';
import { Util } from '../util/Util.js';
import { UtilCollision } from './UtilCollision.js';
import { UtilEngine } from './UtilEngine.js';
const TIME = 0;
const KE = 1;
const PE = 2;
const TE = 3;
export class ContactSim extends ImpulseSim {
    constructor(opt_name) {
        super(opt_name);
        this.connectors_ = [];
        this.contactDepth_ = 0;
        this.contactCount_ = 0;
        this.numContacts_ = 0;
        this.extraAccelTimeStep_ = 0.025;
        this.maxForce_ = 0;
        this.forceHistory_ = Util.newNumberArray(4);
        this.forceHistoryIndex_ = 0;
        this.extra_accel_ = "velocity_and_distance_joints";
        this.debugPrintTime_ = 0;
        this.computeForces_ = new ComputeForces('C', this.simRNG_);
        this.addParameter(new ParameterString(this, RigidBodySim.en.EXTRA_ACCEL, RigidBodySim.i18n.EXTRA_ACCEL, () => this.getExtraAccel(), a => this.setExtraAccel(a), ExtraAccelChoices(), ExtraAccelValues()));
    }
    ;
    toString_() {
        return ', extra_accel_: ' + this.extra_accel_
            + ', extraAccelTimeStep_: ' + Util.NF(this.extraAccelTimeStep_)
            + super.toString_();
    }
    ;
    getClassName() {
        return 'ContactSim';
    }
    ;
    getExtraAccel() {
        return this.extra_accel_;
    }
    ;
    setExtraAccel(value) {
        if (this.extra_accel_ != value) {
            this.extra_accel_ = value;
            this.broadcastParameter(RigidBodySim.en.EXTRA_ACCEL);
        }
    }
    ;
    getExtraAccelTimeStep() {
        return this.extraAccelTimeStep_;
    }
    ;
    setExtraAccelTimeStep(value) {
        this.extraAccelTimeStep_ = value;
    }
    ;
    cleanSlate() {
        super.cleanSlate();
        this.connectors_ = [];
        this.computeForces_ = new ComputeForces('C', this.simRNG_);
    }
    ;
    reset() {
        const saveBroadcast = this.setBroadcast(false);
        super.reset();
        this.setBroadcast(saveBroadcast);
        this.alignConnectors();
        this.broadcast(new GenericEvent(this, 'RESET'));
    }
    ;
    removeBody(body) {
        super.removeBody(body);
        Util.forEachRight(this.connectors_, connect => {
            if (connect.getBody1() == body || connect.getBody2() == body) {
                this.removeConnector(connect);
            }
        });
    }
    ;
    addConnector(connector, follow) {
        if (this.connectors_.includes(connector)) {
            return;
        }
        const errMsg = 'body not yet added to simulation ';
        const b1 = connector.getBody1();
        if (!(b1 instanceof Scrim)) {
            if (!this.bods_.includes(b1)) {
                throw errMsg + b1;
            }
        }
        const b2 = connector.getBody2();
        if (!(b2 instanceof Scrim)) {
            if (!this.bods_.includes(b2)) {
                throw errMsg + b2;
            }
        }
        if (follow === null) {
            this.connectors_.unshift(connector);
        }
        else if (follow != null) {
            const idx = this.connectors_.indexOf(follow);
            if (idx < 0) {
                throw 'connector not found ' + follow;
            }
            this.connectors_.splice(idx + 1, 0, connector);
        }
        else {
            this.connectors_.push(connector);
        }
        this.getSimList().add(connector);
    }
    ;
    addConnectors(connectors) {
        connectors.map(c => this.addConnector(c));
    }
    ;
    removeConnector(connector) {
        Util.remove(this.connectors_, connector);
        this.getSimList().remove(connector);
    }
    ;
    getConnectors() {
        return this.connectors_.slice();
    }
    ;
    alignConnectors() {
        this.connectors_.map(c => c.align());
    }
    ;
    getNumContacts() {
        return this.numContacts_;
    }
    ;
    evaluate(vars, change, timeStep) {
        let maxContacts = 0;
        super.evaluate(vars, change, timeStep);
        const contactsFound = [];
        this.findCollisions(contactsFound, vars, timeStep);
        const ccount = contactsFound.reduce((sum, c) => sum + (c.illegalState() ? 1 : 0), 0);
        if (ccount > 0) {
            return contactsFound;
        }
        this.removeNonContacts(contactsFound);
        const startN = contactsFound.length;
        let loopCtr = 0;
        while (contactsFound.length > 0) {
            if (Util.DEBUG && loopCtr++ > 2 * startN)
                this.myPrint('ContactSim.evaluate loopCtr=' + loopCtr);
            const subset = ContactSim.SUBSET_COLLISIONS ?
                UtilCollision.subsetCollisions1(contactsFound) : contactsFound;
            if (subset.length > maxContacts) {
                maxContacts = subset.length;
            }
            this.calcContactForces(vars, change, subset);
            if (subset.length == contactsFound.length) {
                break;
            }
            else {
                subset.map(s => Util.remove(contactsFound, s));
            }
        }
        this.numContacts_ = maxContacts;
        if (Util.DEBUG)
            this.printNumContacts();
        return null;
    }
    ;
    calcContactForces(vars, change, subset) {
        const pileDebug = false;
        const A = ContactSim.calculate_a_matrix(subset);
        const b = this.calculate_b_vector(subset, change, vars);
        const joint = subset.map(c => c.joint);
        const f = Util.newNumberArray(b.length);
        if (Util.DEBUG && pileDebug) {
            this.printContactInfo(subset, b, vars);
        }
        const time = vars[TIME];
        const tol = 1e-4;
        const error = this.computeForces_.compute_forces(A, f, b, joint, pileDebug, time, tol);
        const maxF = UtilEngine.maxSize(f);
        if (maxF > this.maxForce_) {
            this.maxForce_ = maxF;
        }
        if (error !== -1) {
            this.reportError(error, tol, A, f, b, joint);
        }
        if (Util.DEBUG && ContactSim.SHOW_CONTACTS && subset.length > 0) {
            this.myPrint('found ' + subset.length + ' contacts');
        }
        for (let i = 0, len = subset.length; i < len; i++) {
            const c = subset[i];
            this.applyContactForce(c, f[i], change);
            if (Util.DEBUG && ContactSim.SHOW_CONTACTS) {
                this.myPrint('contact[' + i + ']= ' + c);
            }
        }
    }
    ;
    removeNonContacts(contactsFound) {
        for (let i = contactsFound.length - 1; i >= 0; i--) {
            const c = contactsFound[i];
            if (c.illegalState()) {
                throw 'unexpected collision at time=' + this.getTime() + ' ' + c;
            }
            if (!c.contact()) {
                contactsFound.splice(i, 1);
                continue;
            }
            else {
                this.contactCount_++;
                this.contactDepth_ += c.distance;
            }
        }
    }
    ;
    findCollisions(collisions, vars, stepSize) {
        super.findCollisions(collisions, vars, stepSize);
        if (ImpulseSim.COLLISIONS_DISABLED) {
            return;
        }
        for (let j = 0, len = this.connectors_.length; j < len; j++) {
            const connector = this.connectors_[j];
            const time = vars[TIME];
            connector.addCollision(collisions, time, this.collisionAccuracy_);
        }
    }
    ;
    static calculate_a_matrix(contacts) {
        const nc = contacts.length;
        const a = UtilEngine.newEmptyMatrix(nc, nc);
        for (let i = 0; i < nc; i++) {
            const ci = contacts[i];
            const m1 = ci.primaryBody.getMass();
            const I1 = ci.primaryBody.momentAboutCM();
            const m2 = ci.normalBody.getMass();
            const I2 = ci.normalBody.momentAboutCM();
            let r1 = ci.getU1();
            let r2 = ci.getU2();
            const Rx = r1.getX();
            const Ry = r1.getY();
            const R2x = r2.getX();
            const R2y = r2.getY();
            for (let j = 0; j < nc; j++) {
                a[i][j] = 0;
                const cj = contacts[j];
                r1 = cj.getU1();
                r2 = cj.getU2();
                const Rxj = r1.getX();
                const Ryj = r1.getY();
                const R2xj = r2.getX();
                const R2yj = r2.getY();
                if (isFinite(m1) && ci.primaryBody == cj.primaryBody) {
                    a[i][j] += ci.normal.getX() * (cj.normal.getX() / m1
                        + (-Ry * Rxj * cj.normal.getY() + Ry * Ryj * cj.normal.getX()) / I1);
                    a[i][j] += ci.normal.getY() * (cj.normal.getY() / m1
                        + (-Rx * Ryj * cj.normal.getX() + Rx * Rxj * cj.normal.getY()) / I1);
                }
                if (isFinite(m1) && ci.primaryBody == cj.normalBody) {
                    a[i][j] -= ci.normal.getX() * (cj.normal.getX() / m1
                        + (-Ry * R2xj * cj.normal.getY() + Ry * R2yj * cj.normal.getX()) / I1);
                    a[i][j] -= ci.normal.getY() * (cj.normal.getY() / m1
                        + (-Rx * R2yj * cj.normal.getX() + Rx * R2xj * cj.normal.getY()) / I1);
                }
                if (isFinite(m2) && ci.normalBody == cj.primaryBody) {
                    a[i][j] -= ci.normal.getX() * (cj.normal.getX() / m2
                        + (-R2y * Rxj * cj.normal.getY() + R2y * Ryj * cj.normal.getX()) / I2);
                    a[i][j] -= ci.normal.getY() * (cj.normal.getY() / m2
                        + (-R2x * Ryj * cj.normal.getX() + R2x * Rxj * cj.normal.getY()) / I2);
                }
                if (isFinite(m2) && ci.normalBody == cj.normalBody) {
                    a[i][j] += ci.normal.getX() * (cj.normal.getX() / m2
                        + (-R2y * R2xj * cj.normal.getY() + R2y * R2yj * cj.normal.getX()) / I2);
                    a[i][j] += ci.normal.getY() * (cj.normal.getY() / m2
                        + (-R2x * R2yj * cj.normal.getX() + R2x * R2xj * cj.normal.getY()) / I2);
                }
                if (Util.DEBUG && !isFinite(a[i][j])) {
                    console.log('ci= ' + ci);
                    console.log('cj= ' + cj);
                    Util.printNums5('nums ', Rx, Ry, Rxj, Ryj, R2x, R2y, R2xj, R2yj, m1, I1, m2, I2);
                    throw 'possible zero mass object';
                }
            }
        }
        return a;
    }
    ;
    calculate_b_vector(contacts, change, vars) {
        const c_len = contacts.length;
        const b = new Array(c_len);
        for (let i = 0; i < c_len; i++) {
            const c = contacts[i];
            b[i] = 0;
            const fixedObj = c.primaryBody.getMass() == Infinity;
            const fixedNBody = c.normalBody.getMass() == Infinity;
            const obj = fixedObj ? -1 : c.primaryBody.getVarsIndex();
            const nobj = fixedNBody ? -1 : c.normalBody.getVarsIndex();
            Util.assert(c.contact());
            let extrab = 0;
            switch (this.extra_accel_) {
                case "none":
                    extrab = 0;
                    break;
                case "velocity":
                    if (c.joint) {
                        break;
                    }
                case "velocity_joints":
                    extrab = c.getNormalVelocity() / this.extraAccelTimeStep_;
                    break;
                case "velocity_and_distance":
                    if (c.joint) {
                        break;
                    }
                case "velocity_and_distance_joints":
                    const v0 = c.getNormalVelocity();
                    const h = this.extraAccelTimeStep_;
                    const x0 = c.distanceToHalfGap();
                    extrab = (2 * v0 * h + x0) / (h * h);
                    break;
                default:
                    Util.assert(false);
            }
            b[i] += extrab;
            const vx1 = fixedObj ? 0 : vars[1 + obj];
            const vy1 = fixedObj ? 0 : vars[3 + obj];
            const w1 = fixedObj ? 0 : vars[5 + obj];
            const vx2 = fixedNBody ? 0 : vars[1 + nobj];
            const vy2 = fixedNBody ? 0 : vars[3 + nobj];
            const w2 = fixedNBody ? 0 : vars[5 + nobj];
            const r1 = c.getU1();
            const r2 = c.getU2();
            const Rx = r1.getX();
            const Ry = r1.getY();
            let R2x = NaN;
            let R2y = NaN;
            if (!fixedNBody) {
                R2x = r2.getX();
                R2y = r2.getY();
            }
            if (!c.normalFixed) {
                let npx = 0;
                let npy = 0;
                if (c.ballNormal) {
                    const normal_dt = c.normal_dt;
                    if (normal_dt != null) {
                        npx = normal_dt.getX();
                        npy = normal_dt.getY();
                    }
                    else {
                        let radius;
                        if (c.ballObject) {
                            Util.assert(!isNaN(c.radius1) && !isNaN(c.radius2));
                            radius = c.radius1 + c.radius2;
                        }
                        else {
                            Util.assert(!isNaN(c.radius2));
                            radius = c.radius2;
                        }
                        npx = (vx1 - w1 * Ry) / radius;
                        npy = (vy1 + w1 * Rx) / radius;
                        if (!fixedNBody) {
                            npx -= (vx2 - w2 * R2y) / radius;
                            npy -= (vy2 + w2 * R2x) / radius;
                        }
                    }
                }
                else {
                    Util.assert(c.normal_dt == null);
                    npx = -w2 * c.normal.getY();
                    npy = w2 * c.normal.getX();
                    if (c.ballObject) {
                        if (!fixedNBody)
                            b[i] += -c.radius1 * w2 * w2;
                    }
                    else {
                    }
                }
                {
                    const v1x = fixedObj ? 0 : vx1 - w1 * Ry;
                    const v1y = fixedObj ? 0 : vy1 + w1 * Rx;
                    const v2x = fixedNBody ? 0 : vx2 - w2 * R2y;
                    const v2y = fixedNBody ? 0 : vy2 + w2 * R2x;
                    if (!c.ballNormal) {
                        b[i] += 2 * (npx * (v1x - v2x) + npy * (v1y - v2y));
                    }
                    else {
                        b[i] += npx * (v1x - v2x) + npy * (v1y - v2y);
                    }
                }
            }
            if (!fixedObj) {
                b[i] += c.normal.getX() * (change[obj + 1]
                    - change[obj + 5] * Ry - w1 * w1 * Rx);
                b[i] += c.normal.getY() * (change[obj + 3]
                    + change[obj + 5] * Rx - w1 * w1 * Ry);
            }
            if (!fixedNBody) {
                b[i] -= c.normal.getX() * (change[nobj + 1]
                    - change[nobj + 5] * R2y - w2 * w2 * R2x);
                b[i] -= c.normal.getY() * (change[nobj + 3]
                    + change[nobj + 5] * R2x - w2 * w2 * R2y);
            }
            if (!isFinite(b[i])) {
                console.log('c= ' + c);
                Util.printNums5('nums ', Rx, Ry, R2x, R2y, w1, w2, vx1, vy1, vx2, vy2);
                throw '';
            }
        }
        return b;
    }
    ;
    applyContactForce(c, f, change) {
        c.force = f;
        if (f == 0) {
            return;
        }
        let forceNum = 1;
        if (isFinite(c.primaryBody.getMass())) {
            const f1 = new Force('contact_force' + forceNum + '_' + c.primaryBody.getName(), c.primaryBody, c.impact1, 1, c.normal.multiply(f), 1);
            f1.contactDistance = c.distance;
            f1.contactTolerance = c.primaryBody.getDistanceTol();
            forceNum++;
            this.applyForce(change, f1);
        }
        if (isFinite(c.normalBody.getMass())) {
            const impact2 = (c.impact2 == null) ? c.impact1 : c.impact2;
            const f2 = new Force('contact_force' + forceNum + '_' + c.normalBody.getName(), c.normalBody, impact2, 1, c.normal.multiply(-f), 1);
            f2.contactDistance = c.distance;
            f2.contactTolerance = c.normalBody.getDistanceTol();
            this.applyForce(change, f2);
        }
    }
    ;
    reportError(error, tol, A, f, b, joint) {
        let accel = UtilEngine.matrixMultiply(A, f);
        accel = UtilEngine.vectorAdd(accel, b);
        if (!ComputeForces.checkForceAccel(tol, f, accel, joint)) {
            if (Util.DEBUG) {
                console.log(this.varsList_.printHistory());
            }
            throw Util.NF7(this.getTime()) + ' compute_forces failed error=' + error
                + ' with tol=' + Util.NFE(tol);
        }
        else if (error != -1 && Util.DEBUG) {
            this.myPrint('warning: compute_forces failed error=' + error
                + ' but is within tol=' + Util.NFE(tol));
        }
    }
    ;
    static matrixDiff(A1, A2) {
        let s = 0;
        if (Util.DEBUG) {
            for (let i = 0, len = A1.length; i < len; i++) {
                for (let j = 0, len2 = A1[i].length; j < len2; j++) {
                    const t = A1[i][j] - A2[i][j];
                    {
                        if (Math.abs(t) > s) {
                            s = Math.abs(t);
                        }
                    }
                }
            }
        }
        return s;
    }
    ;
    getMaxForce() {
        return this.maxForce_;
    }
    ;
    printContactInfo(subset, b, vars) {
        if (Util.DEBUG) {
            for (let i = 0, len = subset.length; i < len; i++) {
                this.myPrint('b[' + i + ']=' + Util.NF7(b[i]) + ' ' + subset[i], 'background:#ffc', 'color:black');
            }
            UtilEngine.printArray(Util.NF7(this.getTime()) + ' vars', vars);
        }
    }
    ;
    printForceInfo(subset, A, f, b, joint, _vars) {
        if (Util.DEBUG) {
            const maxForce = UtilEngine.maxSize(f);
            const lastMaxForce = UtilEngine.maxSize(this.forceHistory_);
            const limitForce = (lastMaxForce > 0.5) ? 2.5 * lastMaxForce : 80;
            if (maxForce > 1 && maxForce > limitForce) {
                this.myPrint('==== maxForce increased from ' + Util.NF5(lastMaxForce)
                    + ' to ' + Util.NF5(maxForce));
                for (let i = 0, len = subset.length; i < len; i++) {
                    this.myPrint('c[' + i + ']=' + subset[i]);
                }
                console.log(this.formatVars());
                UtilEngine.printArray(Util.NF7(this.getTime()) + ' f', f);
                UtilEngine.printArray('b', b, Util.NFSCI);
                UtilEngine.printList('joint', joint);
                UtilEngine.printMatrix2('A ' + A.length + 'vars' + A[0].length, A, Util.NFSCI);
            }
            this.addForceHistory(maxForce);
        }
    }
    ;
    addForceHistory(f) {
        if (Util.DEBUG) {
            if (this.forceHistoryIndex_ >= this.forceHistory_.length)
                this.forceHistoryIndex_ = 0;
            this.forceHistory_[this.forceHistoryIndex_] = f;
            this.forceHistoryIndex_++;
        }
        ;
    }
    ;
    printContactDistances(contacts) {
        if (Util.DEBUG) {
            let s = 'contact dist ';
            for (let i = 0, len = contacts.length; i < len; i++) {
                s += ' ' + Util.NF7(contacts[i].distance);
            }
            this.myPrint(s);
        }
    }
    ;
    printNumContacts() {
        if (Util.DEBUG) {
            if (ContactSim.SHOW_NUM_CONTACTS) {
                const t = this.getTime();
                if (t - this.debugPrintTime_ > 2.0 || t < this.debugPrintTime_) {
                    this.myPrint('num bodies=' + this.bods_.length
                        + ', num contacts=' + this.getNumContacts());
                    this.debugPrintTime_ = t;
                }
            }
        }
        ;
    }
    ;
}
ContactSim.SUBSET_COLLISIONS = true;
ContactSim.SHOW_CONTACTS = false;
ContactSim.SHOW_NUM_CONTACTS = false;
Util.defineGlobal('lab$engine2D$ContactSim', ContactSim);
