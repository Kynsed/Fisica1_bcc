import { Util } from '../util/Util.js';
;
export class EdgeRange {
    constructor(body, beginIdx, endIdx) {
        if (endIdx < beginIdx) {
            throw '';
        }
        const n = body.getEdges().length;
        if (beginIdx < 0 || beginIdx >= n) {
            throw '';
        }
        if (endIdx < 0 || endIdx >= n) {
            throw '';
        }
        this.body_ = body;
        this.beginIdx_ = beginIdx;
        this.endIdx_ = endIdx;
    }
    ;
    toString() {
        return 'EdgeRange{beginIdx_: ' + this.beginIdx_
            + ', endIdx_: ' + this.endIdx_
            + ', body_: ' + this.body_.toStringShort()
            + '}';
    }
    ;
    static fromEdge(edge) {
        let beginIdx = edge.getIndex();
        while (true) {
            const prevEdge = edge.getVertex1().getEdge1();
            const prevIdx = prevEdge.getIndex();
            if (prevIdx < beginIdx) {
                beginIdx = prevIdx;
                edge = prevEdge;
            }
            else {
                break;
            }
        }
        const endIdx = edge.getVertex1().getEdge1().getIndex();
        return new EdgeRange(edge.getBody(), beginIdx, endIdx);
    }
    ;
    static fromRigidBody(body) {
        return new EdgeRange(body, 0, body.getEdges().length - 1);
    }
    ;
    contains(edge) {
        if (edge.getBody() != this.body_) {
            return false;
        }
        const idx = edge.getIndex();
        return idx >= this.beginIdx_ && idx <= this.endIdx_;
    }
    ;
}
Util.defineGlobal('lab$engine2D$EdgeRange', EdgeRange);
export class EdgeGroup {
    constructor(opt_edgeRange) {
        this.ranges_ = [];
        if (opt_edgeRange !== undefined) {
            this.ranges_.push(opt_edgeRange);
        }
    }
    ;
    toString() {
        return 'EdgeGroup{ranges_.length: ' + this.ranges_.length + '}';
    }
    ;
    add(edgeRange) {
        if (!this.ranges_.includes(edgeRange)) {
            this.ranges_.push(edgeRange);
        }
    }
    ;
    contains(edge) {
        for (let i = 0, len = this.ranges_.length; i < len; i++) {
            if (this.ranges_[i].contains(edge)) {
                return true;
            }
        }
        return false;
    }
    ;
    remove(edgeRange) {
        Util.remove(this.ranges_, edgeRange);
    }
    ;
}
Util.defineGlobal('lab$engine2D$EdgeGroup', EdgeGroup);
