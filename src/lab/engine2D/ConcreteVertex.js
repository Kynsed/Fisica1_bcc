import { UtilEngine } from './UtilEngine.js';
import { Util } from '../util/Util.js';
export class ConcreteVertex {
    constructor(v_body, opt_endPoint, opt_edge) {
        this.edge2_ = null;
        this.id_ = ConcreteVertex.next_vertex_id++;
        this.loc_body_ = v_body;
        this.endPoint_ = opt_endPoint ?? true;
        this.edge_ = opt_edge ?? null;
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', id_: ' + this.id_
            + ', endPoint_: ' + this.endPoint_
            + ', body.name: ' + (this.edge_ == null ? 'null' :
            '"' + this.edge_.getBody().getName() + '"')
            + ', edge_.index: ' + (this.edge_ == null ? '-1' : this.edge_.getIndex())
            + ', edge2_.index: ' + (this.edge2_ == null ? '-1' : this.edge2_.getIndex())
            + '}';
    }
    ;
    toStringShort() {
        return 'ConcreteVertex{loc_body_: ' + this.loc_body_ + '}';
    }
    ;
    getID() {
        return this.id_;
    }
    ;
    isEndPoint() {
        return this.endPoint_;
    }
    ;
    locBody() {
        return this.loc_body_;
    }
    ;
    locBodyX() {
        return this.loc_body_.getX();
    }
    ;
    locBodyY() {
        return this.loc_body_.getY();
    }
    ;
    highlight() {
        if (this.edge_ != null && UtilEngine.debugEngine2D != null) {
            const w1 = this.edge_.getBody().bodyToWorld(this.loc_body_);
            UtilEngine.debugEngine2D.debugCircle('dot', w1, 0.06);
        }
    }
    ;
    getCurvature() {
        let r = Infinity;
        if (this.edge_ != null) {
            r = this.edge_.getCurvature(this.loc_body_);
            if (this.edge2_ != null) {
                const r2 = this.edge2_.getCurvature(this.loc_body_);
                if (Math.abs(r2) < Math.abs(r)) {
                    r = r2;
                }
            }
        }
        return r;
    }
    ;
    getEdge1() {
        if (this.edge_ != null) {
            return this.edge_;
        }
        else {
            throw '';
        }
    }
    ;
    getEdge2() {
        if (this.edge2_ != null) {
            return this.edge2_;
        }
        else if (this.edge_ != null) {
            return this.edge_;
        }
        else {
            throw '';
        }
    }
    ;
    safeGetEdge2() {
        return this.edge2_;
    }
    ;
    setEdge1(edge) {
        if (this.edge_ == null) {
            this.edge_ = edge;
        }
        else {
            throw '';
        }
    }
    ;
    setEdge2(edge) {
        if (this.edge2_ == null) {
            this.edge2_ = edge;
        }
        else {
            throw '';
        }
    }
    ;
}
ConcreteVertex.next_vertex_id = 1;
Util.defineGlobal('lab$engine2D$ConcreteVertex', ConcreteVertex);
