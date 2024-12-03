import { Force } from '../model/Force.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class ThrusterSet {
    constructor(numThrusters, body, magnitude) {
        this.rigidBody_ = body;
        this.magnitude_ = magnitude;
        this.locations_body_ = Util.repeat(Vector.ORIGIN, numThrusters);
        this.directions_body_ = Util.repeat(Vector.ORIGIN, numThrusters);
        this.active_ = Util.repeat(false, numThrusters);
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', thrusters: ' + this.active_.length
            + ', magnitude: ' + Util.NF(this.magnitude_)
            + ', locations_body: ' + this.locations_body_
            + ', directions_body: ' + this.directions_body_
            + ', active:[' + this.active_ + ']'
            + '}';
    }
    ;
    toStringShort() {
        return 'ThrusterSet{rigidBody_: "' + this.rigidBody_.getName() + '"}';
    }
    ;
    anyActive() {
        for (let i = 0; i < this.active_.length; i++) {
            if (this.active_[i])
                return true;
        }
        return false;
    }
    ;
    calculateForces() {
        const forces = [];
        for (let k = 0; k < this.active_.length; k++) {
            if (this.active_[k]) {
                const v_world = this.rigidBody_.rotateBodyToWorld(this.getDirectionBody(k));
                const p_world = this.rigidBody_.bodyToWorld(this.getLocationBody(k));
                const f = new Force('thruster' + k, this.rigidBody_, p_world, 1, v_world, 1);
                forces.push(f);
            }
        }
        return forces;
    }
    ;
    disconnect() {
    }
    ;
    getActive(index) {
        return this.active_[index];
    }
    ;
    getBodies() {
        return [this.rigidBody_];
    }
    ;
    getDirectionBody(index) {
        if (index < 0 || index >= this.directions_body_.length)
            throw '';
        return this.directions_body_[index].multiply(this.magnitude_);
    }
    ;
    getLocationBody(index) {
        if (index < 0 || index >= this.locations_body_.length)
            throw '';
        return this.locations_body_[index];
    }
    ;
    getMagnitude() {
        return this.magnitude_;
    }
    ;
    getPotentialEnergy() {
        return 0;
    }
    ;
    setActive(index, active) {
        this.active_[index] = active;
        return this;
    }
    ;
    setMagnitude(magnitude) {
        this.magnitude_ = magnitude;
        return this;
    }
    ;
    setThruster(index, location_body, direction_body) {
        if (index < 0 || index >= this.locations_body_.length)
            throw '';
        this.locations_body_[index] = location_body;
        this.directions_body_[index] = direction_body;
    }
    ;
}
Util.defineGlobal('lab$engine2D$ThrusterSet', ThrusterSet);
