import { CollisionHandlingValues, CollisionHandlingChoices } from './CollisionHandling.js';
import { ComputeForces } from './ComputeForces.js';
import { ParameterNumber, ParameterString } from '../util/Observe.js';
import { Impulse } from '../model/Impulse.js';
import { RandomLCG } from '../util/Random.js';
import { RigidBodySim } from './RigidBodySim.js';
import { Util } from '../util/Util.js';
import { UtilCollision } from './UtilCollision.js';
import { UtilEngine } from './UtilEngine.js';
const TIME = 0;
const KE = 1;
const PE = 2;
const TE = 3;
export class ImpulseSim extends RigidBodySim {
    constructor(opt_name) {
        super(opt_name);
        this.showCollisions_ = true;
        this.collisionHandling_ = "serial grouped lastpass";
        this.simRNG_ = new RandomLCG(0);
        this.computeImpacts_ = new ComputeForces('I', this.simRNG_);
        this.distanceTol_ = 0.01;
        this.velocityTol_ = 0.5;
        this.collisionAccuracy_ = 0.6;
        this.warningTime_ = 0;
        this.collisionFunction_ = null;
        this.debugPaint_ = null;
        this.addParameter(new ParameterString(this, RigidBodySim.en.COLLISION_HANDLING, RigidBodySim.i18n.COLLISION_HANDLING, () => this.getCollisionHandling(), a => this.setCollisionHandling(a), CollisionHandlingChoices(), CollisionHandlingValues()));
        let pn = new ParameterNumber(this, RigidBodySim.en.DISTANCE_TOL, RigidBodySim.i18n.DISTANCE_TOL, () => this.getDistanceTol(), a => this.setDistanceTol(a));
        pn.setSignifDigits(5);
        this.addParameter(pn);
        pn = new ParameterNumber(this, RigidBodySim.en.VELOCITY_TOL, RigidBodySim.i18n.VELOCITY_TOL, () => this.getVelocityTol(), a => this.setVelocityTol(a));
        pn.setSignifDigits(3);
        this.addParameter(pn);
        pn = new ParameterNumber(this, RigidBodySim.en.COLLISION_ACCURACY, RigidBodySim.i18n.COLLISION_ACCURACY, () => this.getCollisionAccuracy(), a => this.setCollisionAccuracy(a));
        pn.setSignifDigits(3);
        pn.setUpperLimit(1);
        this.addParameter(pn);
        pn = new ParameterNumber(this, RigidBodySim.en.RANDOM_SEED, RigidBodySim.i18n.RANDOM_SEED, () => this.getRandomSeed(), a => this.setRandomSeed(a));
        pn.setDecimalPlaces(0);
        pn.setLowerLimit(Number.NEGATIVE_INFINITY);
        this.addParameter(pn);
    }
    ;
    toString_() {
        return ', collisionHandling_: ' + this.collisionHandling_
            + ', distanceTol_: ' + Util.NF(this.distanceTol_)
            + ', velocityTol_: ' + Util.NF(this.velocityTol_)
            + ', collisionAccuracy_: ' + Util.NF(this.collisionAccuracy_)
            + ', showCollisions_: ' + this.showCollisions_
            + ', simRNG_: ' + this.simRNG_
            + super.toString_();
    }
    ;
    getClassName() {
        return 'ImpulseSim';
    }
    ;
    setDebugPaint(fn) {
        this.debugPaint_ = fn;
    }
    ;
    getRandomSeed() {
        return this.simRNG_.getSeed();
    }
    ;
    setRandomSeed(value) {
        this.simRNG_.setSeed(value);
        this.broadcastParameter(RigidBodySim.en.RANDOM_SEED);
    }
    ;
    getCollisionHandling() {
        return this.collisionHandling_;
    }
    ;
    setCollisionHandling(value) {
        if (this.collisionHandling_ != value) {
            this.collisionHandling_ = value;
            this.broadcastParameter(RigidBodySim.en.COLLISION_HANDLING);
        }
    }
    ;
    getCollisionAccuracy() {
        return this.collisionAccuracy_;
    }
    ;
    setCollisionAccuracy(value) {
        if (value <= 0 || value > 1) {
            throw 'accuracy must be between 0 and 1, is ' + value;
        }
        this.collisionAccuracy_ = value;
        this.bods_.forEach(b => b.setAccuracy(value));
        this.broadcastParameter(RigidBodySim.en.COLLISION_ACCURACY);
    }
    ;
    getDistanceTol() {
        return this.distanceTol_;
    }
    ;
    setDistanceTol(value) {
        this.distanceTol_ = value;
        this.bods_.forEach(b => b.setDistanceTol(value));
        this.broadcastParameter(RigidBodySim.en.DISTANCE_TOL);
    }
    ;
    getVelocityTol() {
        return this.velocityTol_;
    }
    ;
    setVelocityTol(value) {
        this.velocityTol_ = value;
        this.bods_.forEach(b => b.setVelocityTol(value));
        this.broadcastParameter(RigidBodySim.en.VELOCITY_TOL);
    }
    ;
    setShowForces(value) {
        super.setShowForces(value);
        this.showCollisions_ = value;
    }
    ;
    getShowCollisions() {
        return this.showCollisions_;
    }
    ;
    setShowCollisions(value) {
        this.showCollisions_ = value;
    }
    ;
    setCollisionFunction(f) {
        this.collisionFunction_ = f;
    }
    ;
    addBody(body) {
        super.addBody(body);
        body.setDistanceTol(this.distanceTol_);
        body.setVelocityTol(this.velocityTol_);
        body.setAccuracy(this.collisionAccuracy_);
    }
    ;
    cleanSlate() {
        super.cleanSlate();
        this.computeImpacts_ = new ComputeForces('I', this.simRNG_);
    }
    ;
    checkInfiniteMassVelocity(vars) {
        this.bods_.forEach(b => {
            const idx = b.getVarsIndex();
            Util.assert(idx >= 0);
            if (b.getMass() == Infinity) {
                const vx = vars[idx + 1];
                const vy = vars[idx + 3];
                const vw = vars[idx + 5];
                if (vx != 0 || vy != 0 || vw != 0) {
                    console.log(this.formatVars());
                    throw Util.DEBUG ? ('infinite mass object must remain at rest '
                        + vx + ' ' + vy + ' ' + vw + ' ' + b) : '';
                }
            }
        });
    }
    ;
    findCollisions(collisions, vars, stepSize) {
        if (Util.DEBUG)
            this.checkInfiniteMassVelocity(vars);
        if (ImpulseSim.COLLISIONS_DISABLED) {
            return;
        }
        const time = vars[this.varsList_.timeIndex()];
        for (let i = 0, len = this.bods_.length; i < len; i++) {
            const bod1 = this.bods_[i];
            loop2: for (let j = i + 1; j < len; j++) {
                const bod2 = this.bods_[j];
                if (bod1.doesNotCollide(bod2) || bod2.doesNotCollide(bod1)) {
                    continue loop2;
                }
                if (bod1.getMass() == Infinity
                    && bod2.getMass() == Infinity)
                    continue loop2;
                let speeding;
                let speed_limit;
                if (UtilEngine.PROXIMITY_TEST) {
                    speed_limit = 2 * (bod1.getMinHeight() + bod2.getMinHeight()) / stepSize;
                    speeding = bod1.getVelocity().lengthCheap()
                        + bod2.getVelocity().lengthCheap() > speed_limit;
                }
                else {
                    if (this.getTime() - this.warningTime_ > 5) {
                        this.warningTime_ = this.getTime();
                        if (Util.DEBUG)
                            this.myPrint('%cWARNING:  proximity test is off%c', 'background:#fc6', 'color:black');
                    }
                    speeding = true;
                    speed_limit = 0;
                }
                if (!speeding) {
                    if (!UtilCollision.intersectionPossible(bod1, bod2, this.distanceTol_))
                        continue loop2;
                }
                bod1.checkCollision(collisions, bod2, time);
            }
        }
    }
    ;
    influence(ci, cj, body) {
        if (!isFinite(body.getMass()))
            return 0;
        let r1, r2;
        let rix, riy;
        if (ci.primaryBody == body) {
            r1 = ci.getR1();
            rix = r1.getX();
            riy = r1.getY();
        }
        else if (ci.normalBody == body) {
            r2 = ci.getR2();
            rix = r2.getX();
            riy = r2.getY();
        }
        else {
            return 0;
        }
        let rjx, rjy, factor;
        if (cj.primaryBody == body) {
            r1 = cj.getR1();
            rjx = r1.getX();
            rjy = r1.getY();
            factor = 1;
        }
        else if (cj.normalBody == body) {
            r2 = cj.getR2();
            rjx = r2.getX();
            rjy = r2.getY();
            factor = -1;
        }
        else {
            return 0;
        }
        return factor * (ci.normal.getX() * (cj.normal.getX() / body.getMass()
            - riy * (rjx * cj.normal.getY() - rjy * cj.normal.getX()) / body.momentAboutCM())
            + ci.normal.getY() * (cj.normal.getY() / body.getMass()
                + rix * (rjx * cj.normal.getY() - rjy * cj.normal.getX()) / body.momentAboutCM()));
    }
    ;
    makeCollisionMatrix(collisions) {
        const n = collisions.length;
        const A = new Array(n);
        for (let k = 0; k < n; k++) {
            A[k] = new Float64Array(n);
        }
        for (let i = 0; i < n; i++) {
            const ci = collisions[i];
            for (let k = 0; k < n; k++) {
                const cj = collisions[k];
                A[i][k] += this.influence(ci, cj, ci.primaryBody);
                A[i][k] -= this.influence(ci, cj, ci.normalBody);
            }
        }
        return A;
    }
    ;
    handleCollisions(rbcs, opt_totals) {
        if (rbcs.length == 0) {
            throw 'empty array passed to handleCollisions';
        }
        if (Util.DEBUG) {
            rbcs.forEach(c => c.checkConsistent());
        }
        let impulse = true;
        switch (this.collisionHandling_) {
            case "simultaneous":
                impulse = this.handleCollisionsSimultaneous(rbcs, opt_totals);
                break;
            case "hybrid":
                impulse = this.handleCollisionsSerial(rbcs, true, opt_totals);
                break;
            case "serial separate":
                impulse = this.handleCollisionsSerial(rbcs, false, opt_totals, false, false);
                break;
            case "serial grouped":
                impulse = this.handleCollisionsSerial(rbcs, false, opt_totals, true, false);
                break;
            case "serial separate lastpass":
                impulse = this.handleCollisionsSerial(rbcs, false, opt_totals, false, true);
                break;
            case "serial grouped lastpass":
                impulse = this.handleCollisionsSerial(rbcs, false, opt_totals, true, true);
                break;
            default:
                throw Util.DEBUG ? ('unknown collision handler ' + this.collisionHandling_) : '';
        }
        rbcs.forEach(c => {
            if (this.collisionFunction_ != null && this.terminal_ != null) {
                this.collisionFunction_(c, this.terminal_);
            }
        });
        return impulse;
    }
    ;
    handleCollisionsSimultaneous(collisions, opt_totals) {
        const n = collisions.length;
        const b = Util.newNumberArray(n);
        const j = Util.newNumberArray(n);
        const e = Util.newNumberArray(n);
        const joint = Util.newBooleanArray(n);
        let nonJoint = false;
        for (let k = 0; k < n; k++) {
            const ck = collisions[k];
            b[k] = ck.getNormalVelocity();
            e[k] = ck.contact() ? 1 : 1 + ck.getElasticity();
            b[k] *= ck.contact() ? 1 : 1 + ck.getElasticity();
            joint[k] = ck.joint;
            nonJoint = nonJoint || !ck.joint;
        }
        const A = this.makeCollisionMatrix(collisions);
        const error = this.computeImpacts_.compute_forces(A, j, b, joint, false, this.getTime());
        if (Util.DEBUG && error != -1) {
            let accel = UtilEngine.matrixMultiply(A, j);
            accel = UtilEngine.vectorAdd(accel, b);
            const tol = 1E-4;
            if (!ComputeForces.checkForceAccel(tol, j, accel, joint)) {
                throw Util.DEBUG ? (Util.NF7(this.getTime())
                    + ' compute_impulses failed error=' + error
                    + ' with tol=' + Util.NFE(tol)) : '';
            }
            else {
                this.myPrint('warning: compute_impulses failed error=' + error
                    + ' but is within tol=' + Util.NFE(tol));
            }
        }
        let impulse = false;
        for (let i = 0; i < n; i++) {
            const c = collisions[i];
            if (j[i] > ImpulseSim.TINY_IMPULSE) {
                impulse = true;
            }
            this.applyCollisionImpulse(c, j[i]);
        }
        if (nonJoint && impulse) {
            this.getVarsList().incrSequence(KE, TE);
        }
        this.modifyObjects();
        if (opt_totals) {
            opt_totals.addImpulses(1);
        }
        return impulse;
    }
    ;
    handleCollisionsSerial(collisions, hybrid, opt_totals, grouped, lastPass, small_velocity, doPanic) {
        grouped = grouped ?? true;
        lastPass = lastPass ?? true;
        small_velocity = small_velocity ?? 0.00001;
        doPanic = doPanic ?? true;
        const n = collisions.length;
        let loopCtr = 0;
        const LOOP_LIMIT = 100000;
        const PANIC_LIMIT = 20 * n;
        let loopPanic = PANIC_LIMIT;
        let focus = -1;
        let debugHCS = false;
        const e = Util.newNumberArray(n);
        const b = Util.newNumberArray(n);
        const j2 = Util.newNumberArray(n);
        const nv = Util.newNumberArray(n);
        const joint = Util.newBooleanArray(n);
        let nonJoint = false;
        if (Util.DEBUG && debugHCS) {
            console.log('handleCollisionSerial start n = ' + n);
        }
        for (let i = 0; i < n; i++) {
            const ck = collisions[i];
            if (Util.DEBUG && debugHCS)
                console.log('collision[' + i + ']=' + ck);
            joint[i] = ck.joint;
            if (grouped) {
                e[i] = joint[i] ? 0 : ck.getElasticity();
            }
            else {
                e[i] = ck.getElasticity();
            }
            b[i] = ck.getNormalVelocity();
            nv[i] = b[i];
            nonJoint = nonJoint || !ck.joint;
        }
        const A = this.makeCollisionMatrix(collisions);
        do {
            loopCtr++;
            if (doPanic && loopCtr > loopPanic) {
                small_velocity = small_velocity * 2;
                loopPanic = loopPanic + PANIC_LIMIT;
                if (Util.DEBUG) {
                    console.log('loopPanic! loopCtr=' + loopCtr
                        + ' small_velocity=' + Util.NF5(small_velocity));
                }
            }
            if (Util.DEBUG && loopCtr > LOOP_LIMIT) {
                debugHCS = true;
                console.log('handleCollisionsSerial loopCtr=' + loopCtr);
                if (loopCtr <= LOOP_LIMIT + 2) {
                    collisions.forEach((c, i) => console.log('c[' + (i) + '] ' + c));
                    UtilEngine.printArray('nv ', nv, Util.NFE);
                }
            }
            focus = this.hcs_focus(debugHCS, small_velocity, loopCtr, joint, b);
            if (debugHCS && Util.DEBUG && focus > -1) {
                console.log('focus=' + focus + ' loopCtr=' + loopCtr + ' b[' + focus + ']='
                    + Util.NF7E(b[focus]));
            }
            if (focus == -1 && !lastPass) {
                break;
            }
            this.hcs_handle(hybrid, grouped, debugHCS, small_velocity, loopCtr, focus, joint, e, b, j2, collisions, A);
            if (opt_totals) {
                opt_totals.addImpulses(1);
            }
        } while (focus > -1);
        if (Util.DEBUG && debugHCS) {
            console.log('focus= -1 loopCtr=' + loopCtr
                + ' max b=' + Util.NF7E(ImpulseSim.largestVelocity(joint, b)));
        }
        if (Util.DEBUG && debugHCS) {
            for (let i = 0; i < n; i++) {
                const ck = collisions[i];
                console.log('collision[' + i + '] ' + ck);
            }
            UtilEngine.printMatrix2('A ', A);
        }
        if (Util.DEBUG && debugHCS) {
            for (let i = 0; i < n; i++) {
                const c = collisions[i];
                if (j2[i] > ImpulseSim.TINY_IMPULSE || c.joint) {
                    console.log('before impulse '
                        + ' j[' + i + ']=' + Util.NF9(j2[i])
                        + ' v=' + Util.NF9(c.getNormalVelocity())
                        + ' n=' + n);
                }
            }
        }
        let impulse = false;
        for (let i = 0; i < n; i++) {
            const c = collisions[i];
            if (j2[i] > ImpulseSim.TINY_IMPULSE) {
                impulse = true;
            }
            this.applyCollisionImpulse(c, j2[i]);
            if (Util.DEBUG && debugHCS) {
                console.log('impulse j2[' + i + '] = ' + Util.NFE(j2[i]));
            }
        }
        if (nonJoint && impulse) {
            this.getVarsList().incrSequence(KE, TE);
        }
        this.modifyObjects();
        if (Util.DEBUG && debugHCS) {
            for (let i = 0; i < n; i++) {
                const c = collisions[i];
                if (j2[i] > ImpulseSim.TINY_IMPULSE || c.joint) {
                    console.log('after impulse '
                        + ' j[' + i + ']=' + Util.NF9(j2[i])
                        + ' v=' + Util.NF9(c.getNormalVelocity())
                        + ' n=' + n
                        + ' ' + c);
                }
            }
        }
        if (Util.DEBUG && loopCtr > 100 + 2 * n * Math.log(n + 1)) {
            console.log('%c %s %c %s', 'color:red', Util.NF7(this.getTime()), 'color:black', 'handleCollisions many loops: n=' + n
                + ' loopCtr=' + loopCtr + ' small_velocity=' + Util.NF5(small_velocity));
        }
        if (Util.DEBUG && debugHCS) {
            console.log('handleCollisions end  impulse=' + impulse + ' loopCtr=' + loopCtr
                + ' small_velocity=' + Util.NF5(small_velocity));
        }
        return impulse;
    }
    ;
    static largestVelocity(joint, b) {
        let max = 0;
        if (Util.DEBUG) {
            const n = b.length;
            for (let i = 0; i < n; i++) {
                if (joint[i]) {
                    if (Math.abs(b[i]) > max) {
                        max = Math.abs(b[i]);
                    }
                }
                else {
                    if (b[i] < -max) {
                        max = -b[i];
                    }
                }
            }
        }
        return max;
    }
    ;
    hcs_focus(_debugHCS, small_velocity, _loopCtr, joint, b) {
        const n = b.length;
        let focus = -1;
        const indices = this.simRNG_.randomInts(n);
        for (let k = 0; k < n; k++) {
            const j = indices[k];
            if (!joint[j] && b[j] < -small_velocity
                || joint[j] && Math.abs(b[j]) > small_velocity) {
                focus = j;
                break;
            }
        }
        return focus;
    }
    ;
    hcs_handle(hybrid, grouped, debugHCS, small_velocity, loopCtr, focus, joint, e, b, j2, collisions, A) {
        const n = b.length;
        if (Util.DEBUG && debugHCS) {
            console.log('focus=' + focus + ' loopCtr=' + loopCtr);
            UtilEngine.printArray('b ', b, Util.nf7);
            UtilEngine.printArray('e ', e, Util.nf7);
        }
        const set = Util.newBooleanArray(n);
        if (focus == -1) {
            for (let k = 0; k < n; k++) {
                set[k] = true;
            }
        }
        else if (hybrid || grouped) {
            const subset = UtilCollision.subsetCollisions2(collisions, collisions[focus], hybrid, b, -small_velocity);
            const len = subset.length;
            for (let i = 0; i < len; i++) {
                const c = subset[i];
                const loc = collisions.indexOf(c);
                if (loc < 0)
                    throw '';
                set[loc] = true;
            }
        }
        else {
            for (let k = 0; k < n; k++)
                set[k] = k == focus;
        }
        let n1 = 0;
        const idx = Util.newNumberArray(n);
        for (let k = 0; k < n; k++) {
            idx[k] = set[k] ? n1 : -1;
            n1 += set[k] ? 1 : 0;
        }
        const idx2 = Util.newNumberArray(n1);
        for (let k = 0; k < n; k++) {
            if (set[k])
                idx2[idx[k]] = k;
        }
        if (Util.DEBUG && debugHCS) {
            UtilEngine.printArray('idx ', idx);
            UtilEngine.printArray('idx2', idx2);
        }
        let A1;
        let b1 = null;
        let joint1;
        const j1 = Util.newNumberArray(n1);
        {
            A1 = new Array(n1);
            for (let k = 0; k < n1; k++) {
                A1[k] = new Float64Array(n1);
            }
            b1 = Util.newNumberArray(n1);
            joint1 = Util.newBooleanArray(n1);
            for (let i = 0; i < n; i++) {
                if (set[i]) {
                    b1[idx[i]] = b[i];
                    joint1[idx[i]] = joint[i];
                    for (let j = 0; j < n; j++) {
                        if (set[j])
                            A1[idx[i]][idx[j]] = A[i][j];
                    }
                }
            }
        }
        for (let k = 0; k < n1; k++) {
            if (focus != -1) {
                b1[k] *= 1 + e[idx2[k]];
            }
            j1[k] = 0;
        }
        const pileDebug = false;
        const error = this.computeImpacts_.compute_forces(A1, j1, b1, joint1, pileDebug, this.getTime());
        if (error != -1) {
            let accel = UtilEngine.matrixMultiply(A1, j1);
            accel = UtilEngine.vectorAdd(accel, b1);
            const tol = 1E-4;
            if (!ComputeForces.checkForceAccel(tol, j1, accel, joint1)) {
                throw Util.DEBUG ? (Util.NF7(this.getTime())
                    + ' compute_impulses failed error=' + error
                    + ' with tolerance=' + Util.NFE(tol)) : '';
            }
            else if (Util.DEBUG) {
                console.log('warning: compute_impulses failed error=' + error
                    + ' but is within tolerance=' + Util.NFE(tol));
            }
        }
        for (let i = 0; i < n1; i++) {
            j2[idx2[i]] += j1[i];
        }
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (set[j])
                    b[i] += A[i][j] * j1[idx[j]];
            }
        }
        if (Util.DEBUG && debugHCS) {
            UtilEngine.printArray('idx2', idx2, Util.NF0);
            UtilEngine.printArray('j1', j1, Util.nf7);
            UtilEngine.printArray('j2', j2, Util.nf7);
            UtilEngine.printArray('b ', b, Util.nf7);
        }
        const showVelo = false;
        if (Util.DEBUG && showVelo && loopCtr > 5) {
            for (let k = 0; k < n; k++) {
                const c = collisions[k];
                let mag = 0;
                if (Math.abs(b[k]) < 1E-6) {
                    mag = 0.05;
                }
                else {
                    mag = 6.05 + Math.log(Math.abs(b[k])) / ImpulseSim.LOG10;
                }
                mag = (b[k] < 0 ? -1 : 1) * 0.3 * Math.abs(mag);
                this.debugLine('VELOCITY', c.impact1, c.impact1.add(c.normal.multiply(mag)));
                if (this.debugPaint_ != null) {
                    this.debugPaint_();
                }
            }
        }
    }
    ;
    applyCollisionImpulse(cd, j) {
        if (!cd.joint && j < 0) {
            if (j < -ImpulseSim.TINY_IMPULSE) {
                throw Util.DEBUG ? ('negative impulse is impossible ' + j + ' ' + cd) : '';
            }
            else {
                j = 0;
            }
        }
        cd.impulse = j;
        if (j == 0) {
            return;
        }
        this.applyImpulse(new Impulse('IMPULSE1', cd.primaryBody, j, cd.impact1, cd.normal, cd.getR1()));
        const i2 = cd.impact2 != null ? cd.impact2 : cd.impact1;
        this.applyImpulse(new Impulse('IMPULSE2', cd.normalBody, -j, i2, cd.normal, cd.getR2()));
        if (ImpulseSim.DEBUG_IMPULSE && Util.DEBUG) {
            if (j > 1e-16)
                this.myPrint('impulse=' + Util.NF9(j) + ' ' + cd);
        }
    }
    ;
    applyImpulse(impulse) {
        const b = impulse.getBody();
        const body = b;
        const m = body.getMass();
        if (isFinite(m)) {
            const j = impulse.getMagnitude();
            const continuous = Math.abs(j) < ImpulseSim.SMALL_IMPULSE;
            const va = this.getVarsList();
            const I = body.momentAboutCM();
            const offset = body.getVarsIndex();
            const normal = impulse.getVector();
            const r1 = impulse.getOffset();
            if (offset > -1) {
                let idx = 1 + offset;
                va.setValue(idx, va.getValue(idx) + normal.getX() * j / m, continuous);
                idx = 3 + offset;
                va.setValue(idx, va.getValue(idx) + normal.getY() * j / m, continuous);
                idx = 5 + offset;
                va.setValue(idx, va.getValue(idx) +
                    j * (r1.getX() * normal.getY() - r1.getY() * normal.getX()) / I, continuous);
            }
        }
        if (this.showCollisions_) {
            impulse.setExpireTime(this.getTime() + 0.1);
            this.getSimList().add(impulse);
        }
    }
    ;
}
ImpulseSim.COLLISIONS_DISABLED = false;
ImpulseSim.DEBUG_IMPULSE = false;
ImpulseSim.TINY_IMPULSE = 1E-12;
ImpulseSim.SMALL_IMPULSE = 1E-4;
ImpulseSim.LOG10 = Math.log(10);
Util.defineGlobal('lab$engine2D$ImpulseSim', ImpulseSim);
