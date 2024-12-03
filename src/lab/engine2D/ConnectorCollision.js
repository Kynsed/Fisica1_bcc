import { RigidBodyCollision } from './RigidBody.js';
import { Util } from '../util/Util.js';
export class ConnectorCollision extends RigidBodyCollision {
    constructor(body, normalBody, theConnector, joint) {
        super(body, normalBody, joint);
        this.theConnector_ = theConnector;
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', theConnector_=' + this.theConnector_ + '}';
    }
    ;
    getClassName() {
        return 'ConnectorCollision';
    }
    ;
    checkConsistent() {
        super.checkConsistent();
        Util.assert(this.impact2 != null);
        if (this.normal_dt != null) {
            Util.assert(this.ballNormal);
        }
    }
    ;
    getConnector() {
        return this.theConnector_;
    }
    ;
    hasEdge(_edge) {
        return false;
    }
    ;
    hasVertex(_v) {
        return false;
    }
    ;
    similarTo(_c) {
        return false;
    }
    ;
    updateCollision(time) {
        this.theConnector_.updateCollision(this);
        super.updateCollision(time);
    }
    ;
}
Util.defineGlobal('lab$engine2D$ConnectorCollision', ConnectorCollision);
