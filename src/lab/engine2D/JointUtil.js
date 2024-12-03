import { Joint } from './Joint.js';
import { Scrim } from './Scrim.js';
import { Vector } from '../util/Vector.js';
import { Util } from '../util/Util.js';
export class JointUtil {
    constructor() {
        throw '';
    }
    ;
    static addSingleFixedJoint(sim, body, attach_body, normalType, normal) {
        return JointUtil.addSingleJoint(sim, Scrim.getScrim(), body.bodyToWorld(attach_body), body, attach_body, normalType, normal);
    }
    ;
    static addSingleJoint(sim, body1, attach1_body, body2, attach2_body, normalType, normal) {
        const j1 = new Joint(body1, attach1_body, body2, attach2_body, normalType, normal);
        sim.addConnector(j1);
        j1.align();
        return j1;
    }
    ;
    static attachFixedPoint(sim, body, attach_body, normalType) {
        JointUtil.attachRigidBody(sim, Scrim.getScrim(), body.bodyToWorld(attach_body), body, attach_body, normalType);
    }
    ;
    static attachRigidBody(sim, body1, attach1_body, body2, attach2_body, normalType) {
        JointUtil.addSingleJoint(sim, body1, attach1_body, body2, attach2_body, normalType, Vector.NORTH);
        JointUtil.addSingleJoint(sim, body1, attach1_body, body2, attach2_body, normalType, Vector.EAST);
    }
    ;
}
Util.defineGlobal('lab$engine2D$JointUtil', JointUtil);
