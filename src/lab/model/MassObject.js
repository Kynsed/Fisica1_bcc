import { AbstractSimObject } from "./SimObject.js";
import { AffineTransform } from "../util/AffineTransform.js";
import { DoubleRect } from "../util/DoubleRect.js";
import { Util } from "../util/Util.js";
import { Vector } from "../util/Vector.js";
;
export class AbstractMassObject extends AbstractSimObject {
    constructor(opt_name, opt_localName) {
        super(opt_name, opt_localName);
        this.mass_ = 1;
        this.loc_world_ = Vector.ORIGIN;
        this.angle_ = 0;
        this.sinAngle_ = 0.0;
        this.cosAngle_ = 1.0;
        this.velocity_ = Vector.ORIGIN;
        this.angular_velocity_ = 0;
        this.cm_body_ = Vector.ORIGIN;
        this.zeroEnergyLevel_ = null;
        this.dragPts_ = [Vector.ORIGIN];
        this.moment_ = 0;
        this.minHeight_ = NaN;
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', mass_: ' + Util.NF(this.mass_)
            + ', loc_world_: ' + this.loc_world_
            + ', angle_: ' + this.angle_
            + ', velocity_: ' + this.velocity_
            + ', angular_velocity_: ' + Util.NF(this.angular_velocity_)
            + ', cm_body_: ' + this.cm_body_
            + ', zeroEnergyLevel_: ' + Util.NF(this.zeroEnergyLevel_)
            + ', moment_: ' + Util.NF(this.moment_)
            + ', dragPts_: ['
            + this.dragPts_.map(p => p.toString())
            + ']'
            + '}';
    }
    ;
    alignTo(p_body, p_world, opt_angle) {
        const angle = (opt_angle === undefined) ? this.angle_ : opt_angle;
        const rx = p_body.getX() - this.cm_body_.getX();
        const ry = p_body.getY() - this.cm_body_.getY();
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        this.setPosition(new Vector(p_world.getX() - (rx * cos - ry * sin), p_world.getY() - (rx * sin + ry * cos)), angle);
    }
    ;
    bodyToWorld(p_body) {
        const rx = p_body.getX() - this.cm_body_.getX();
        const ry = p_body.getY() - this.cm_body_.getY();
        const vx = this.loc_world_.getX() + (rx * this.cosAngle_ - ry * this.sinAngle_);
        const vy = this.loc_world_.getY() + (rx * this.sinAngle_ + ry * this.cosAngle_);
        return new Vector(vx, vy);
    }
    ;
    bodyToWorldTransform() {
        let at = new AffineTransform(1, 0, 0, 1, this.loc_world_.getX(), this.loc_world_.getY());
        at = at.rotate(this.angle_);
        return at.translate(-this.cm_body_.getX(), -this.cm_body_.getY());
    }
    ;
    getAngle() {
        return this.angle_;
    }
    ;
    getAngularVelocity() {
        return this.angular_velocity_;
    }
    ;
    getBottomWorld() {
        let min = Infinity;
        this.getVerticesBody().forEach(v => {
            const p = this.bodyToWorld(v);
            if (p.getY() < min) {
                min = p.getY();
            }
        });
        return min;
    }
    ;
    getBoundsBody() {
        return new DoubleRect(this.getLeftBody(), this.getBottomBody(), this.getRightBody(), this.getTopBody());
    }
    ;
    getBoundsWorld() {
        return new DoubleRect(this.getLeftWorld(), this.getBottomWorld(), this.getRightWorld(), this.getTopWorld());
    }
    ;
    getCenterOfMass() {
        return this.cm_body_;
    }
    ;
    getCentroidWorld() {
        return this.bodyToWorld(this.getCentroidBody());
    }
    ;
    getDragPoints() {
        return Array.from(this.dragPts_);
    }
    ;
    getHeight() {
        return this.getTopBody() - this.getBottomBody();
    }
    ;
    getKineticEnergy() {
        return this.translationalEnergy() + this.rotationalEnergy();
    }
    ;
    getLeftWorld() {
        let min = Infinity;
        this.getVerticesBody().forEach(v => {
            const p = this.bodyToWorld(v);
            if (p.getX() < min) {
                min = p.getX();
            }
        });
        return min;
    }
    ;
    getMass() {
        return this.mass_;
    }
    ;
    getPosition() {
        return this.loc_world_;
    }
    ;
    getRightWorld() {
        let max = Number.NEGATIVE_INFINITY;
        this.getVerticesBody().forEach(v => {
            const p = this.bodyToWorld(v);
            if (p.getX() > max) {
                max = p.getX();
            }
        });
        return max;
    }
    ;
    getTopWorld() {
        let max = Number.NEGATIVE_INFINITY;
        this.getVerticesBody().forEach(v => {
            const p = this.bodyToWorld(v);
            if (p.getY() > max) {
                max = p.getY();
            }
        });
        return max;
    }
    ;
    getWidth() {
        return this.getRightBody() - this.getLeftBody();
    }
    ;
    getVelocity(p_body) {
        if (p_body !== undefined) {
            const r = this.rotateBodyToWorld(Vector.clone(p_body).subtract(this.cm_body_));
            return new Vector(this.velocity_.getX() - r.getY() * this.angular_velocity_, this.velocity_.getY() + r.getX() * this.angular_velocity_);
        }
        else {
            return this.velocity_;
        }
    }
    ;
    getZeroEnergyLevel() {
        return this.zeroEnergyLevel_;
    }
    ;
    isMassObject() {
        return true;
    }
    ;
    momentAboutCM() {
        return this.mass_ * this.moment_;
    }
    ;
    momentum() {
        const result = new Array(3);
        result[0] = this.mass_ * this.velocity_.getX();
        result[1] = this.mass_ * this.velocity_.getY();
        result[2] = this.momentAboutCM() * this.angular_velocity_
            + this.mass_ * (this.loc_world_.getX() * this.velocity_.getY()
                - this.loc_world_.getY() * this.velocity_.getX());
        return result;
    }
    ;
    rotateBodyToWorld(v_body) {
        return Vector.clone(v_body).rotate(this.cosAngle_, this.sinAngle_);
    }
    ;
    rotateWorldToBody(v_world) {
        return Vector.clone(v_world).rotate(this.cosAngle_, -this.sinAngle_);
    }
    ;
    rotationalEnergy() {
        return 0.5 * this.momentAboutCM() * this.angular_velocity_ * this.angular_velocity_;
    }
    ;
    setAngle(angle) {
        this.setPosition(this.loc_world_, angle);
    }
    ;
    setAngularVelocity(angular_velocity) {
        if (!isFinite(angular_velocity)) {
            throw 'angular velocity must be finite ' + angular_velocity;
        }
        this.angular_velocity_ = angular_velocity;
        this.setChanged();
    }
    ;
    setCenterOfMass(center) {
        this.cm_body_ = Vector.clone(center);
        this.minHeight_ = NaN;
        this.setChanged();
    }
    ;
    setDragPoints(dragPts) {
        this.dragPts_ = dragPts.map(gv => Vector.clone(gv));
        this.setChanged();
    }
    ;
    setMass(mass) {
        if (mass <= 0 || typeof mass !== 'number') {
            throw 'mass must be positive ' + mass;
        }
        this.mass_ = mass;
        this.setChanged();
    }
    ;
    setMinHeight(minHeight) {
        this.minHeight_ = minHeight;
    }
    ;
    setMomentAboutCM(moment) {
        this.moment_ = moment;
        this.setChanged();
    }
    ;
    setPosition(loc_world, angle) {
        this.loc_world_ = Vector.clone(loc_world);
        if (angle !== undefined && this.angle_ != angle) {
            this.angle_ = angle;
            this.sinAngle_ = Math.sin(angle);
            this.cosAngle_ = Math.cos(angle);
        }
        this.setChanged();
    }
    ;
    setPositionX(value) {
        this.setPosition(new Vector(value, this.loc_world_.getY()));
    }
    ;
    setPositionY(value) {
        this.setPosition(new Vector(this.loc_world_.getX(), value));
    }
    ;
    setVelocity(velocity_world, angular_velocity) {
        this.velocity_ = Vector.clone(velocity_world);
        if (angular_velocity !== undefined) {
            this.setAngularVelocity(angular_velocity);
        }
        this.setChanged();
    }
    ;
    setVelocityX(value) {
        this.setVelocity(new Vector(value, this.velocity_.getY()));
    }
    ;
    setVelocityY(value) {
        this.setVelocity(new Vector(this.velocity_.getX(), value));
    }
    ;
    setZeroEnergyLevel(height) {
        this.zeroEnergyLevel_ = height ?? this.loc_world_.getY();
        this.setChanged();
    }
    ;
    translationalEnergy() {
        return 0.5 * this.mass_ * this.velocity_.lengthSquared();
    }
    ;
    worldToBody(p_world) {
        const rx = p_world.getX() - this.loc_world_.getX();
        const ry = p_world.getY() - this.loc_world_.getY();
        const sin = -this.sinAngle_;
        const cos = this.cosAngle_;
        const vx = this.cm_body_.getX() + (rx * cos - ry * sin);
        const vy = this.cm_body_.getY() + (rx * sin + ry * cos);
        return new Vector(vx, vy);
    }
    ;
}
Util.defineGlobal('lab$model$AbstractMassObject', AbstractMassObject);
