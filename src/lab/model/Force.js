import { AbstractSimObject } from "./SimObject.js";
import { DoubleRect } from "../util/DoubleRect.js";
import { Util } from "../util/Util.js";
export class Force extends AbstractSimObject {
    constructor(name, body, location, locationCoordType, direction, directionCoordType, opt_torque) {
        super(name);
        this.contactDistance = 0;
        this.contactTolerance = 0;
        this.body_ = body;
        this.location_ = location;
        this.direction_ = direction;
        this.locationCoordType_ = locationCoordType;
        this.directionCoordType_ = directionCoordType;
        this.torque_ = opt_torque === undefined ? 0 : opt_torque;
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', body: "' + this.body_.getName() + '"'
            + ', location: ' + this.location_
            + ', direction: ' + this.direction_
            + ', locationCoordType: ' + this.locationCoordType_
            + ', directionCoordType: ' + this.directionCoordType_
            + ', torque: ' + Util.NF5E(this.torque_)
            + '}';
    }
    ;
    getClassName() {
        return 'Force';
    }
    ;
    getBody() {
        return this.body_;
    }
    ;
    getBoundsWorld() {
        return DoubleRect.make(this.getStartPoint(), this.getEndPoint());
    }
    ;
    getEndPoint() {
        return this.getStartPoint().add(this.getVector());
    }
    ;
    getStartPoint() {
        return this.locationCoordType_ == 0 ?
            this.body_.bodyToWorld(this.location_) : this.location_;
    }
    ;
    getTorque() {
        return this.torque_;
    }
    ;
    getVector() {
        return this.directionCoordType_ == 0 ?
            this.body_.rotateBodyToWorld(this.direction_) : this.direction_;
    }
    ;
    similar(obj, opt_tolerance) {
        if (!(obj instanceof Force)) {
            return false;
        }
        if (obj.getName() != this.getName()) {
            return false;
        }
        const f = obj;
        if (!this.getStartPoint().nearEqual(f.getStartPoint(), opt_tolerance)) {
            return false;
        }
        return this.getVector().nearEqual(f.getVector(), opt_tolerance);
    }
    ;
}
Util.defineGlobal('lab$model$Force', Force);
