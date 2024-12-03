import { AbstractSubject } from '../util/AbstractSubject.js';
import { FunctionVariable } from '../model/FunctionVariable.js';
import { ConcreteLine } from '../model/ConcreteLine.js';
import { DampingLaw } from '../model/DampingLaw.js';
import { EnergyInfo } from '../model/EnergySystem.js';
import { GenericEvent, ParameterBoolean, ParameterNumber } from '../util/Observe.js';
import { GravityLaw } from '../model/GravityLaw.js';
import { PointMass } from '../model/PointMass.js';
import { Scrim } from './Scrim.js';
import { SimList } from '../model/SimList.js';
import { Util } from '../util/Util.js';
import { UtilEngine } from './UtilEngine.js';
import { VarsList } from '../model/VarsList.js';
const TIME = 0;
const KE = 1;
const PE = 2;
const TE = 3;
export class RigidBodySim extends AbstractSubject {
    constructor(opt_name) {
        super(opt_name || 'SIM');
        this.bods_ = [];
        this.showForces_ = false;
        this.forceLaws_ = [];
        this.simRect_ = null;
        this.simList_ = new SimList();
        this.initialState_ = null;
        this.recentState_ = null;
        this.potentialOffset_ = 0;
        this.terminal_ = null;
        const var_names = [
            VarsList.en.TIME,
            EnergyInfo.en.KINETIC_ENERGY,
            EnergyInfo.en.POTENTIAL_ENERGY,
            EnergyInfo.en.TOTAL_ENERGY
        ];
        const i18n_names = [
            VarsList.i18n.TIME,
            EnergyInfo.i18n.KINETIC_ENERGY,
            EnergyInfo.i18n.POTENTIAL_ENERGY,
            EnergyInfo.i18n.TOTAL_ENERGY
        ];
        this.varsList_ = new VarsList(var_names, i18n_names, this.getName() + '_VARS');
        this.getVarsList().setComputed(KE, PE, TE);
        UtilEngine.debugEngine2D = this;
        this.addParameter(new ParameterBoolean(this, RigidBodySim.en.SHOW_FORCES, RigidBodySim.i18n.SHOW_FORCES, () => this.getShowForces(), a => this.setShowForces(a)));
        let pn = new ParameterNumber(this, EnergyInfo.en.PE_OFFSET, EnergyInfo.i18n.PE_OFFSET, () => this.getPEOffset(), a => this.setPEOffset(a));
        pn.setLowerLimit(Number.NEGATIVE_INFINITY);
        pn.setSignifDigits(5);
        this.addParameter(pn);
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1) + this.toString_();
    }
    ;
    toString_() {
        return ', showForces_: ' + this.showForces_
            + ', potentialOffset_: ' + Util.NF(this.potentialOffset_)
            + ', varsList_: ' + this.varsList_.toStringShort()
            + ', forceLaws_: ['
            + this.forceLaws_.map(f => f.toStringShort())
            + '], bods_: ['
            + this.bods_.map(b => b.toStringShort())
            + ']'
            + super.toString();
    }
    ;
    toStringShort() {
        return super.toStringShort().slice(0, -1)
            + ', bods_.length: ' + this.bods_.length + '}';
    }
    ;
    getClassName() {
        return 'RigidBodySim';
    }
    ;
    getSimList() {
        return this.simList_;
    }
    ;
    getVarsList() {
        return this.varsList_;
    }
    ;
    getTime() {
        return this.varsList_.getTime();
    }
    ;
    getShowForces() {
        return this.showForces_;
    }
    ;
    setShowForces(value) {
        this.showForces_ = value;
        this.broadcastParameter(RigidBodySim.en.SHOW_FORCES);
    }
    ;
    getSimRect() {
        return this.simRect_;
    }
    ;
    setSimRect(rect) {
        this.simRect_ = rect;
    }
    ;
    formatVars() {
        const v = this.varsList_.getValues(true);
        return this.bods_.reduce((str, b) => str + (str != '' ? '\n' : '') + UtilEngine.formatArray(v, b.getVarsIndex(), 6), '');
    }
    ;
    reset() {
        if (this.initialState_ != null &&
            this.initialState_.length == this.varsList_.numVariables()) {
            this.varsList_.setValues(this.initialState_);
        }
        this.bods_.forEach(b => b.eraseOldCoords());
        this.getSimList().removeTemporary(Infinity);
        this.modifyObjects();
        this.broadcast(new GenericEvent(this, 'RESET'));
    }
    ;
    saveInitialState() {
        this.initialState_ = this.varsList_.getValues();
        this.broadcast(new GenericEvent(this, 'INITIAL_STATE_SAVED'));
    }
    ;
    cleanSlate() {
        this.getSimList().clear();
        this.clearForceLaws();
        const nv = this.varsList_.numVariables();
        if (nv > 4) {
            this.varsList_.deleteVariables(4, nv - 4);
        }
        this.varsList_.setTime(0);
        this.bods_.forEach(b => b.setVarsIndex(-1));
        this.bods_ = [];
        this.simRect_ = null;
        this.potentialOffset_ = 0;
    }
    ;
    saveState() {
        this.recentState_ = this.varsList_.getValues();
        this.bods_.forEach(b => b.saveOldCoords());
    }
    ;
    restoreState() {
        if (this.recentState_ != null) {
            this.varsList_.setValues(this.recentState_, true);
        }
        this.bods_.forEach(b => b.eraseOldCoords());
    }
    ;
    addBody(body) {
        if (body instanceof Scrim)
            return;
        if (!this.bods_.includes(body)) {
            const idx = this.varsList_.addVariable(new FunctionVariable(this.varsList_, body.getVarName(0, false), body.getVarName(0, true), () => body.getPosition().getX(), x => body.setPositionX(x)));
            this.varsList_.addVariable(new FunctionVariable(this.varsList_, body.getVarName(1, false), body.getVarName(1, true), () => body.getVelocity().getX(), x => body.setVelocityX(x)));
            this.varsList_.addVariable(new FunctionVariable(this.varsList_, body.getVarName(2, false), body.getVarName(2, true), () => body.getPosition().getY(), y => body.setPositionY(y)));
            this.varsList_.addVariable(new FunctionVariable(this.varsList_, body.getVarName(3, false), body.getVarName(3, true), () => body.getVelocity().getY(), y => body.setVelocityY(y)));
            this.varsList_.addVariable(new FunctionVariable(this.varsList_, body.getVarName(4, false), body.getVarName(4, true), () => body.getAngle(), a => body.setAngle(a)));
            this.varsList_.addVariable(new FunctionVariable(this.varsList_, body.getVarName(5, false), body.getVarName(5, true), () => body.getAngularVelocity(), a => body.setAngularVelocity(a)));
            body.setVarsIndex(idx);
            this.bods_.push(body);
            this.getSimList().add(body);
        }
        this.bods_.forEach(b => b.eraseOldCoords());
    }
    ;
    removeBody(body) {
        if (this.bods_.includes(body)) {
            this.varsList_.deleteVariables(body.getVarsIndex(), 6);
            Util.remove(this.bods_, body);
            body.setVarsIndex(-1);
        }
        this.getSimList().remove(body);
        this.getVarsList().incrSequence(KE, PE, TE);
    }
    ;
    getBodies() {
        return Array.from(this.bods_);
    }
    ;
    getBody(numOrName) {
        let bod;
        if (typeof numOrName === 'string') {
            const bodName = Util.toName(numOrName);
            bod = this.bods_.find(body => body.getName() == bodName);
        }
        else {
            const bodNum = numOrName;
            if (bodNum < this.bods_.length && bodNum >= 0) {
                bod = this.bods_[bodNum];
            }
        }
        if (bod === undefined)
            throw 'no body ' + numOrName;
        return bod;
    }
    ;
    modifyObjects() {
        const va = this.varsList_;
        const einfo = this.getEnergyInfo();
        va.setValue(KE, einfo.getTranslational() + einfo.getRotational(), true);
        va.setValue(PE, einfo.getPotential(), true);
        va.setValue(TE, einfo.getTotalEnergy(), true);
    }
    ;
    addForceLaw(forceLaw) {
        const sameLaw = this.forceLaws_.find(f => {
            if (forceLaw instanceof DampingLaw) {
                return f instanceof DampingLaw;
            }
            else if (forceLaw instanceof GravityLaw) {
                return f instanceof GravityLaw;
            }
            else {
                return false;
            }
        });
        if (sameLaw !== undefined) {
            throw 'cannot add DampingLaw or GravityLaw twice ' + sameLaw;
        }
        if (!this.forceLaws_.includes(forceLaw)) {
            this.forceLaws_.push(forceLaw);
        }
        this.getVarsList().incrSequence(KE, PE, TE);
    }
    ;
    removeForceLaw(forceLaw) {
        forceLaw.disconnect();
        this.getVarsList().incrSequence(KE, PE, TE);
        return Util.remove(this.forceLaws_, forceLaw);
    }
    ;
    clearForceLaws() {
        Util.forEachRight(this.forceLaws_, fl => this.removeForceLaw(fl));
        this.getVarsList().incrSequence(KE, PE, TE);
    }
    ;
    getForceLaws() {
        return Array.from(this.forceLaws_);
    }
    ;
    getEnergyInfo() {
        let pe = 0;
        let re = 0;
        let te = 0;
        this.bods_.forEach(b => {
            if (isFinite(b.getMass())) {
                re += b.rotationalEnergy();
                te += b.translationalEnergy();
            }
        });
        this.forceLaws_.forEach(fl => pe += fl.getPotentialEnergy());
        return new EnergyInfo(pe + this.potentialOffset_, te, re);
    }
    ;
    getPEOffset() {
        return this.potentialOffset_;
    }
    setPEOffset(value) {
        this.potentialOffset_ = value;
        this.getVarsList().incrSequence(PE, TE);
        this.broadcastParameter(EnergyInfo.en.PE_OFFSET);
    }
    ;
    setTerminal(terminal) {
        this.terminal_ = terminal;
    }
    evaluate(vars, change, _timeStep) {
        this.varsList_.setValues(vars, true);
        this.bods_.forEach(body => {
            const idx = body.getVarsIndex();
            if (idx < 0)
                return;
            const mass = body.getMass();
            if (mass == Infinity) {
                for (let k = 0; k < 6; k++) {
                    change[idx + k] = 0;
                }
            }
            else {
                change[idx + 0] = vars[idx + 1];
                change[idx + 2] = vars[idx + 3];
                change[idx + 4] = vars[idx + 5];
                change[idx + 1] = 0;
                change[idx + 3] = 0;
                change[idx + 5] = 0;
            }
        });
        this.forceLaws_.forEach(fl => {
            const forces = fl.calculateForces();
            forces.forEach(f => this.applyForce(change, f));
        });
        change[TIME] = 1;
        return null;
    }
    ;
    applyForce(change, force) {
        const body = force.getBody();
        if (!this.bods_.includes(body)) {
            return;
        }
        const idx = body.getVarsIndex();
        if (idx < 0) {
            return;
        }
        const forceDir = force.getVector();
        const forceLoc = force.getStartPoint();
        const mass = body.getMass();
        change[idx + 1] += forceDir.getX() / mass;
        change[idx + 3] += forceDir.getY() / mass;
        const rx = forceLoc.getX() - body.getPosition().getX();
        const ry = forceLoc.getY() - body.getPosition().getY();
        change[idx + 5] += (rx * forceDir.getY() - ry * forceDir.getX()) /
            body.momentAboutCM();
        const torque = force.getTorque();
        if (torque != 0) {
            change[idx + 5] += torque / body.momentAboutCM();
        }
        if (this.showForces_) {
            force.setExpireTime(this.getTime());
            this.getSimList().add(force);
        }
    }
    ;
    debugLine(name, pa, pb, expireTime) {
        expireTime = expireTime ?? this.getTime();
        const v = new ConcreteLine(name, pa, pb);
        v.setExpireTime(expireTime);
        this.getSimList().add(v);
    }
    ;
    debugCircle(name, center, radius, expireTime) {
        expireTime = expireTime ?? this.getTime() + 0.05;
        const width = Math.max(0.02, Math.abs(2 * radius));
        const m = PointMass.makeCircle(width, name);
        m.setMass(0);
        m.setPosition(center);
        m.setExpireTime(expireTime);
        this.getSimList().add(m);
    }
    ;
    myPrint(message, ...colors) {
        if (!Util.DEBUG)
            return;
        let args = ['%c' + Util.NF7(this.getTime()) + '%c ' + message,
            'color:blue', 'color:black'];
        if (colors.length > 0) {
            args = args.concat(colors);
        }
        console.log.apply(console, args);
    }
    ;
    setElasticity(value) {
        if (this.bods_.length == 0) {
            throw 'setElasticity: no bodies';
        }
        this.bods_.forEach(body => body.setElasticity(value));
        this.broadcast(new GenericEvent(this, RigidBodySim.ELASTICITY_SET, value));
    }
    ;
}
RigidBodySim.ELASTICITY_SET = 'ELASTICITY_SET';
RigidBodySim.en = {
    COLLISION_HANDLING: 'collision method',
    COLLISION_ACCURACY: 'collision accuracy',
    DISTANCE_TOL: 'distance tolerance',
    EXTRA_ACCEL: 'extra accel',
    RANDOM_SEED: 'random seed',
    SHOW_FORCES: 'show forces',
    SHOW_COLLISIONS: 'show collisions',
    VELOCITY_TOL: 'velocity tolerance'
};
RigidBodySim.de_strings = {
    COLLISION_HANDLING: 'Kollisionsmethode',
    COLLISION_ACCURACY: 'Kollisionsgenauigkeit',
    DISTANCE_TOL: 'Distanztoleranz',
    EXTRA_ACCEL: 'extra Beschleunigung',
    RANDOM_SEED: 'Zufallskern',
    SHOW_FORCES: 'Kräfte anzeigen',
    SHOW_COLLISIONS: 'Kollisionen anzeigen',
    VELOCITY_TOL: 'Geschwindigkeitstoleranz'
};
RigidBodySim.i18n = Util.LOCALE === 'de' ? RigidBodySim.de_strings : RigidBodySim.en;
Util.defineGlobal('lab$engine2D$RigidBodySim', RigidBodySim);
