import { CollisionStats, CollisionTotals } from './Collision.js';
import { RungeKutta } from './RungeKutta.js';
import { Util } from '../util/Util.js';
export class CollisionAdvance {
    constructor(sim, opt_diffEqSolver) {
        this.timeStep_ = 0.025;
        this.wayPoints_ = [18];
        this.jointSmallImpacts_ = false;
        this.printTime_ = Number.NEGATIVE_INFINITY;
        this.collisionTotals_ = new CollisionTotals();
        this.currentStep_ = 0;
        this.timeAdvanced_ = 0;
        this.totalTimeStep_ = 0;
        this.nextEstimate_ = NaN;
        this.collisions_ = [];
        this.stats_ = new CollisionStats();
        this.removedCollisions_ = [];
        this.binarySearch_ = false;
        this.binarySteps_ = 0;
        this.detectedTime_ = NaN;
        this.stuckCount_ = 0;
        this.debugPaint_ = null;
        this.odeSteps_ = 0;
        this.backupCount_ = 0;
        this.numClose_ = 0;
        this.collisionCounter_ = 0;
        this.sim_ = sim;
        this.odeSolver_ = opt_diffEqSolver || new RungeKutta(sim);
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', odeSolver_: ' + this.odeSolver_.toStringShort()
            + ', jointSmallImpacts_: ' + this.jointSmallImpacts_
            + '}';
    }
    ;
    toStringShort() {
        return 'CollisionAdvance{sim_: ' + this.sim_.toStringShort() + '}';
    }
    ;
    addWayPoints(wayPoints) {
        this.wayPoints_ = this.wayPoints_.concat(wayPoints);
    }
    ;
    advance(timeStep, opt_memoList) {
        if (timeStep < 1E-16) {
            this.sim_.modifyObjects();
            return;
        }
        this.sim_.getSimList().removeTemporary(this.sim_.getTime() + timeStep);
        this.timeAdvanced_ = 0;
        this.totalTimeStep_ = timeStep;
        this.currentStep_ = timeStep;
        this.binarySteps_ = 0;
        this.binarySearch_ = false;
        this.detectedTime_ = NaN;
        this.nextEstimate_ = NaN;
        this.stuckCount_ = 0;
        this.backupCount_ = 0;
        this.odeSteps_ = 0;
        this.collisionCounter_ = 0;
        this.numClose_ = 0;
        this.stats_.clear();
        this.collisions_ = [];
        this.sim_.getVarsList().saveHistory();
        this.print(0);
        let didHandle = false;
        while (this.timeAdvanced_ < this.totalTimeStep_ - 1E-16) {
            const didAdvance = this.do_advance_sim(this.currentStep_);
            this.stats_.update(this.collisions_);
            Util.assert(didAdvance || this.stats_.numNeedsHandling > 0);
            this.print(6);
            let didBackup = false;
            if (this.stats_.numNeedsHandling > 0) {
                this.detectedTime_ = this.stats_.detectedTime;
                this.do_backup(this.currentStep_);
                didBackup = true;
                this.stats_.update(this.collisions_);
                this.print(8);
                this.stuckCount_++;
                if (this.stuckCount_ >= 3) {
                    if (!this.binarySearch_) {
                        this.print(26);
                        this.binarySearch_ = true;
                    }
                    if (this.stuckCount_ >= CollisionAdvance.MAX_STUCK_COUNT) {
                        this.print(18);
                        throw 'collision was not resolved after ' + this.stuckCount_ + ' tries';
                    }
                }
            }
            this.numClose_ = this.collisions_.reduce((sum, c) => sum +
                (((c.needsHandling() || !c.contact()) && c.getVelocity() < 0
                    && c.closeEnough(didBackup)) ? 1 : 0), 0);
            if (this.numClose_ > 0) {
                this.removedCollisions_ = [];
                if (this.removeDistant(didBackup)) {
                    this.print(10);
                }
                const b = this.do_handle_collision(this.numClose_);
                didHandle = didHandle || b;
                this.nextEstimate_ = NaN;
                this.stats_.update(this.removedCollisions_);
            }
            if (!didBackup) {
                if (this.currentStep_ > 0.0000001) {
                    this.stuckCount_ = 0;
                }
                this.timeAdvanced_ += this.currentStep_;
                this.print(1);
                if (opt_memoList !== undefined) {
                    opt_memoList.memorize();
                }
                if (this.binarySearch_ && ++this.binarySteps_ >= 2) {
                    this.print(15);
                    this.binarySearch_ = false;
                    this.binarySteps_ = 0;
                    this.detectedTime_ = NaN;
                }
                else if (isFinite(this.nextEstimate_)) {
                    this.binarySearch_ = true;
                    this.print(25);
                }
            }
            this.checkNoneCollide();
            this.calc_next_step(didBackup);
        }
        if (!didHandle && this.jointSmallImpacts_ && this.stats_.numJoints > 0) {
            this.do_small_impacts();
        }
        this.collisionTotals_.addCollisions(this.collisionCounter_);
        this.collisionTotals_.addSteps(this.odeSteps_);
        this.collisionTotals_.addBackups(this.backupCount_);
        this.print(19);
        this.print(2);
    }
    ;
    allVelocities(collisions) {
        return collisions.map(c => c.getVelocity());
    }
    ;
    calc_next_step(didBackup) {
        this.nextEstimate_ = this.stats_.estTime;
        if (!this.binarySearch_) {
            if (this.nextEstimate_ < this.sim_.getTime()) {
                this.binarySearch_ = true;
                this.print(23);
            }
            if (this.stats_.numNeedsHandling > 0 && isNaN(this.nextEstimate_)) {
                this.binarySearch_ = true;
                this.print(24);
            }
        }
        const fullStep = this.totalTimeStep_ - this.timeAdvanced_;
        if (this.binarySearch_) {
            this.nextEstimate_ = NaN;
            if (didBackup) {
                this.currentStep_ = this.currentStep_ / 2;
                this.binarySteps_ = 0;
            }
            this.currentStep_ = Math.min(this.currentStep_, fullStep);
            this.print(17);
        }
        else if (!isNaN(this.nextEstimate_)) {
            const nextStep = this.nextEstimate_ - this.sim_.getTime();
            Util.assert(nextStep >= 0);
            this.currentStep_ = Math.min(nextStep, fullStep);
            this.print(16);
        }
        else {
            this.currentStep_ = fullStep;
            this.print(22);
        }
    }
    ;
    checkNoneCollide() {
        if (Util.DEBUG) {
            let numIllegal = 0;
            this.collisions_.forEach(c => {
                if (c.illegalState())
                    numIllegal++;
            });
            if (numIllegal > 0) {
                if (this.debugPaint_ != null) {
                    this.debugPaint_();
                }
                this.myPrint('TROUBLE: found ' + numIllegal + ' colliding at end of loop');
                this.myPrint('stats ' + this.stats_);
                this.printCollisions('TROUBLE', true);
                console.log(this.sim_.getVarsList().printHistory());
                throw 'checkNoneCollide numIllegal=' + numIllegal;
            }
        }
    }
    ;
    do_advance_sim(stepSize) {
        Util.assert(!isNaN(stepSize) && isFinite(stepSize));
        this.collisions_ = [];
        this.sim_.saveState();
        if (Util.DEBUG && stepSize <= 1E-15) {
            this.myPrint('*** WARNING tiny time step = ' + Util.NFE(stepSize));
        }
        this.print(3);
        const error = this.odeSolver_.step(stepSize);
        this.sim_.modifyObjects();
        if (Util.DEBUG && this.debugPaint_ != null) {
            this.debugPaint_();
        }
        this.odeSteps_++;
        if (error != null) {
            this.collisions_ = error;
            this.print(4);
        }
        else {
            const vars = this.sim_.getVarsList().getValues();
            this.sim_.findCollisions(this.collisions_, vars, stepSize);
            this.print(5);
        }
        this.collisions_.sort((c1, c2) => {
            const est1 = Math.round(1E7 * c1.getEstimatedTime());
            const est2 = Math.round(1E7 * c2.getEstimatedTime());
            if (isNaN(est1))
                return isNaN(est2) ? 0 : 1;
            else if (isNaN(est2))
                return -1;
            else if (est1 < est2)
                return -1;
            else if (est1 > est2)
                return 1;
            else
                return 0;
        });
        this.collisions_.forEach(c => c.setNeedsHandling(c.isColliding()));
        return error == null;
    }
    ;
    do_backup(stepSize) {
        this.print(7);
        this.sim_.restoreState();
        this.sim_.modifyObjects();
        if (Util.DEBUG && this.debugPaint_ != null) {
            this.debugPaint_();
        }
        this.backupCount_++;
        const time = this.sim_.getTime();
        for (let i = this.collisions_.length - 1; i >= 0; i--) {
            const c = this.collisions_[i];
            if (!c.isColliding()) {
                this.collisions_.splice(i, 1);
                continue;
            }
            c.updateCollision(time);
        }
        const vars = this.sim_.getVarsList().getValues();
        this.sim_.findCollisions(this.collisions_, vars, stepSize);
    }
    ;
    do_handle_collision(numClose) {
        this.print(9);
        this.print(20);
        if (this.sim_.handleCollisions(this.collisions_, this.collisionTotals_)) {
            this.sim_.modifyObjects();
            const time = this.sim_.getTime();
            this.collisions_.forEach(c => c.updateCollision(time));
            this.print(11);
            if (this.binarySearch_) {
                this.collisionTotals_.addSearches(1);
            }
            this.collisionCounter_ += numClose;
            this.binarySearch_ = false;
            this.binarySteps_ = 0;
            this.detectedTime_ = NaN;
            return true;
        }
        else {
            this.binarySearch_ = true;
            this.print(12);
            return false;
        }
    }
    ;
    do_small_impacts() {
        if (this.collisions_.length > 0) {
            this.print(13);
            this.removeDistant(false);
            this.sim_.handleCollisions(this.collisions_, this.collisionTotals_);
            this.sim_.modifyObjects();
            if (Util.DEBUG) {
                const time = this.sim_.getTime();
                this.collisions_.forEach(c => c.updateCollision(time));
            }
            this.print(14);
            this.print(21);
        }
    }
    ;
    getCollisionTotals() {
        return this.collisionTotals_;
    }
    ;
    getDiffEqSolver() {
        return this.odeSolver_;
    }
    ;
    getJointSmallImpacts() {
        return this.jointSmallImpacts_;
    }
    ;
    getTime() {
        return this.sim_.getTime();
    }
    ;
    getTimeStep() {
        return this.timeStep_;
    }
    ;
    getWayPoints() {
        return this.wayPoints_;
    }
    ;
    jointFlags(collisions) {
        return collisions.map(c => c.bilateral());
    }
    ;
    maxImpulse(collisions) {
        return collisions.reduce((max, c) => {
            const impulse = c.getImpulse();
            return isFinite(impulse) ? Math.max(max, impulse) : max;
        }, 0);
    }
    ;
    minVelocity(collisions) {
        return collisions.reduce((min, c) => {
            const v = c.getVelocity();
            return isFinite(v) ? Math.min(min, v) : min;
        }, Infinity);
    }
    ;
    myPrint(message, ...colors) {
        if (!Util.DEBUG)
            return;
        let args = ['%c' + Util.NF7(this.sim_.getTime()) + '%c ' + message,
            'color:blue', 'color:black'];
        if (colors.length > 0) {
            args = args.concat(colors);
        }
        console.log.apply(console, args);
    }
    ;
    print(wayPoint) {
        if (!Util.DEBUG) {
            return;
        }
        if (!this.wayPoints_.includes(wayPoint)) {
            return;
        }
        let ccount;
        switch (wayPoint) {
            case 0:
                this.myPrint('======== START advance;  timeStep=' + this.totalTimeStep_);
                break;
            case 3:
                this.myPrint('ADVANCE_SIM_START: step(' + Util.NF7(this.currentStep_) + ') to '
                    + Util.NF7(this.sim_.getTime() + this.currentStep_)
                    + ' binarySearch=' + this.binarySearch_
                    + ' nextEstimate=' + Util.NF7(this.nextEstimate_)
                    + ' stuckCount=' + this.stuckCount_);
                break;
            case 4:
                ccount = this.collisions_.reduce((sum, c) => sum + (c.isColliding() ? 1 : 0), 0);
                this.myPrint('ADVANCE_SIM_FAIL couldnt advance to '
                    + Util.NF7(this.sim_.getTime() + this.currentStep_)
                    + ' odeSolver.step found ' + ccount + ' colliding'
                    + ' among ' + this.collisions_.length + ' collisions');
                break;
            case 5:
                ccount = this.collisions_.reduce((sum, c) => sum + (c.isColliding() ? 1 : 0), 0);
                if (ccount > 0) {
                    this.myPrint('ADVANCE_SIM_COLLIDING advanced by ' + Util.NF7(this.currentStep_)
                        + ' but found ' + ccount + ' colliding'
                        + ' binarySearch=' + this.binarySearch_);
                }
                break;
            case 6:
                this.myPrint('ADVANCE_SIM_FINISH ' + this.stats_
                    + ' binarySearch=' + this.binarySearch_);
                break;
            case 7:
                this.printCollisions('POST_COLLISION', false);
                this.myPrint('POST_COLLISION ' + this.stats_);
                break;
            case 8:
                this.printCollisions('PRE_COLLISION', false);
                this.myPrint('PRE_COLLISION ' + this.stats_);
                break;
            case 9:
                this.myPrint('HANDLE_COLLISION_START:'
                    + ' numClose=' + this.numClose_);
                break;
            case 20:
                this.printCollisions('COLLISIONS_TO_HANDLE', false);
                break;
            case 10:
                this.removedCollisions_.forEach(c => this.printCollision(this.sim_.getTime(), 'HANDLE_REMOVE_DISTANT:', c));
                break;
            case 11:
                this.myPrint('HANDLE_COLLISION_SUCCESS'
                    + ' max impulse=' + Util.NF5E(this.maxImpulse(this.collisions_))
                    + ' min velocity=' + Util.NF7E(this.minVelocity(this.collisions_)));
                this.printCollisions2('HANDLE_COLLISION_SUCCESS', 1E-3);
                break;
            case 12:
                this.myPrint('%cHANDLE_COLLISION_FAIL%c '
                    + ' detectedTime_=' + Util.NF7(this.detectedTime_)
                    + ' stuckCount=' + this.stuckCount_, 'background:#f9c', 'color:black');
                this.printCollisions('HANDLE_COLLISION_FAIL', true);
                break;
            case 1:
                this.myPrint('ADVANCED_NO_BACKUP'
                    + ' nextEstimate=' + Util.NF7(this.nextEstimate_)
                    + ' currentStep=' + Util.NF7E(this.currentStep_)
                    + ' imminent=' + this.stats_.numImminent
                    + ' non-collisions=' + (this.collisions_.length - this.stats_.numImminent));
                break;
            case 13:
                this.printCollisions('SMALL_IMPACTS_START', true);
                break;
            case 14:
                this.printCollisions('SMALL_IMPACTS_FINISH', true);
                break;
            case 21:
                this.myPrint('SMALL_IMPACTS'
                    + ' num collisions=' + this.collisions_.length
                    + ' max impulse=' + Util.NF5E(this.maxImpulse(this.collisions_))
                    + ' min velocity=' + Util.NF7E(this.minVelocity(this.collisions_)));
                break;
            case 15:
                this.myPrint('%cBINARY_SEARCH_FAIL%c turning off binary search'
                    + ', binarySteps_=' + this.binarySteps_, 'background:#ffc', 'color:black');
                break;
            case 16:
                this.myPrint('NEXT_STEP_ESTIMATE'
                    + ' nextEstimate_=' + Util.NF7(this.nextEstimate_)
                    + ' currentStep_=' + Util.NF7E(this.currentStep_)
                    + ' numNeedsHandling=' + this.stats_.numNeedsHandling
                    + ' stuckCount=' + this.stuckCount_);
                break;
            case 17:
                this.myPrint('%cNEXT_STEP_BINARY'
                    + ' currentStep_=' + Util.NF7E(this.currentStep_)
                    + '%c detectedTime_=' + Util.NF7(this.detectedTime_)
                    + ' binarySteps_=' + this.binarySteps_
                    + ' numNeedsHandling=' + this.stats_.numNeedsHandling
                    + ' stuckCount_=' + this.stuckCount_, 'background:#ffc', 'color:black');
                break;
            case 22:
                this.myPrint('NEXT_STEP_FULL'
                    + ' currentStep_=' + Util.NF7E(this.currentStep_)
                    + ' totalTimeStep_=' + Util.NF7(this.totalTimeStep_)
                    + ' timeAdvanced_=' + Util.NF7(this.timeAdvanced_)
                    + ' stuckCount_=' + this.stuckCount_);
                break;
            case 26:
                this.myPrint('%cMAYBE_STUCK%c turning on binary search '
                    + ' stuckCount_=' + this.stuckCount_
                    + ' nextEstimate_=' + Util.NF7(this.nextEstimate_), 'background:#f9c', 'color:black');
                break;
            case 23:
                this.myPrint('%cESTIMATE_IN_PAST%c turning on binary search '
                    + ' nextEstimate_=' + Util.NF7(this.nextEstimate_)
                    + ' needsHandling=' + this.stats_.numNeedsHandling, 'background:#f9c', 'color:black');
                break;
            case 25:
                this.myPrint('%cESTIMATE_FAILED%c turning on binary search '
                    + ' nextEstimate_=' + Util.NF7(this.nextEstimate_)
                    + ' needsHandling=' + this.stats_.numNeedsHandling, 'background:#f9c', 'color:black');
                break;
            case 24:
                this.myPrint('%cNO_ESTIMATE%c turning on binary search '
                    + ' nextEstimate_=' + Util.NF7(this.nextEstimate_)
                    + ' needsHandling=' + this.stats_.numNeedsHandling, 'background:#f9c', 'color:black');
                break;
            case 19:
                if (this.collisionCounter_ > 0 || this.backupCount_ > 0) {
                    this.myPrint('**** SUMMARY handled '
                        + this.collisionCounter_ + ' collisions; '
                        + this.backupCount_ + ' backups; '
                        + this.odeSteps_ + ' steps; '
                        + this.collisionTotals_);
                }
                break;
            case 2:
                this.myPrint('=========  FINISH exiting advance '
                    + ' collisions=' + this.collisionTotals_.getCollisions()
                    + ' steps=' + this.collisionTotals_.getSteps());
                break;
            case 18:
                this.myPrint('STUCK collision was not resolved after ' + this.stuckCount_
                    + ' tries');
                this.printCollisions('STUCK', true);
                console.log(this.sim_.getVarsList().printHistory());
                break;
            default:
                Util.assert(false);
        }
    }
    ;
    printCollision(time, msg, c) {
        let style = 'color:black';
        if (c.getVelocity() < 0) {
            if (c.isColliding()) {
                style = 'background:#fc6';
            }
            else if (c.closeEnough(true)) {
                style = 'background:#cf3';
            }
        }
        console.log('%c' + Util.NF7(time) + '%c ' + msg + ' %c' + c, 'color:blue', 'color:black', style);
    }
    ;
    printCollisions(msg, printAll) {
        if (Util.DEBUG) {
            const time = this.sim_.getTime();
            this.collisions_.forEach((c, i) => {
                if (printAll || c.needsHandling() || !c.contact()) {
                    this.printCollision(time, msg + ' [' + i + ']', c);
                }
            });
        }
    }
    ;
    printCollisions2(msg, impulse) {
        if (Util.DEBUG) {
            const time = this.sim_.getTime();
            this.collisions_.forEach((c, i) => {
                if (Math.abs(c.getImpulse()) > impulse) {
                    this.printCollision(time, msg + ' [' + i + ']', c);
                }
            });
        }
    }
    ;
    printJointDistance() {
        const time = this.sim_.getTime();
        if (time - this.printTime_ >= 0.025) {
            this.printTime_ = time;
            const joints = this.collisions_.filter(c => c.bilateral());
            const dists = joints.map(c => c.getDistance());
            this.myPrint(Util.array2string(dists));
        }
    }
    ;
    removeDistant(_allowTiny) {
        let removed = false;
        let i = this.collisions_.length;
        while (i-- > 0) {
            const c = this.collisions_[i];
            if (!c.isTouching()) {
                this.collisions_.splice(i, 1);
                this.removedCollisions_.push(c);
                removed = true;
            }
        }
        return removed;
    }
    ;
    reset() {
        this.sim_.reset();
        this.collisionTotals_.reset();
        this.printTime_ = Number.NEGATIVE_INFINITY;
    }
    ;
    save() {
        this.sim_.saveInitialState();
    }
    ;
    setDebugLevel(debugLevel) {
        switch (debugLevel) {
            case 0:
                this.wayPoints_ = [18];
                Util.assert(this.wayPoints_.length == 1);
                break;
            case 1:
                this.wayPoints_ = [
                    19,
                    18
                ];
                break;
            case 2:
                this.wayPoints_ = [
                    20,
                    10,
                    11,
                    8,
                    7,
                    18
                ];
                break;
            case 3:
                this.wayPoints_ = [
                    4,
                    5,
                    7,
                    8,
                    10,
                    9,
                    11,
                    12,
                    21,
                    13,
                    14,
                    15,
                    16,
                    17,
                    23,
                    25,
                    24,
                    26,
                    18,
                    19
                ];
                break;
            case 4:
                this.wayPoints_ = [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    10,
                    9,
                    11,
                    12,
                    21,
                    13,
                    14,
                    15,
                    16,
                    17,
                    22,
                    23,
                    25,
                    24,
                    26,
                    18,
                    19
                ];
                break;
            case 5:
                this.wayPoints_ = [
                    21
                ];
                break;
            default:
                Util.assert(false);
        }
    }
    ;
    setDebugPaint(fn) {
        if (Util.DEBUG) {
            this.debugPaint_ = fn;
        }
    }
    ;
    setDiffEqSolver(diffEqSolver) {
        this.odeSolver_ = diffEqSolver;
    }
    ;
    setJointSmallImpacts(value) {
        this.jointSmallImpacts_ = value;
    }
    ;
    setTimeStep(timeStep) {
        this.timeStep_ = timeStep;
    }
    ;
    setWayPoints(wayPoints) {
        this.wayPoints_ = wayPoints;
    }
    ;
}
CollisionAdvance.MAX_STUCK_COUNT = 30;
;
;
Util.defineGlobal('lab$model$CollisionAdvance', CollisionAdvance);
