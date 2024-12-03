import { AffineTransform } from '../util/AffineTransform.js';
import { DoubleRect } from '../util/DoubleRect.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class Scrim {
    constructor() { }
    ;
    static getScrim() {
        return Scrim.singleton;
    }
    ;
    toString() {
        return 'Scrim{}';
    }
    ;
    toStringShort() {
        return 'Scrim{}';
    }
    ;
    addNonCollide(_bodies) {
    }
    ;
    alignTo(_p_body, _p_world, _opt_angle) {
        throw '';
    }
    ;
    bodyToWorld(p_body) {
        return Vector.clone(p_body);
    }
    ;
    bodyToWorldTransform() {
        return AffineTransform.IDENTITY;
    }
    ;
    checkCollision(_c, _body, _time) {
    }
    ;
    createCanvasPath(context) {
        context.beginPath();
        context.closePath();
    }
    ;
    doesNotCollide(_body) {
        return true;
    }
    ;
    eraseOldCoords() {
    }
    ;
    getAccuracy() {
        return 0;
    }
    ;
    getAngle() {
        return 0;
    }
    ;
    getAngularVelocity() {
        return 0;
    }
    ;
    getBottomBody() {
        return Number.NEGATIVE_INFINITY;
    }
    ;
    getBottomWorld() {
        return Number.NEGATIVE_INFINITY;
    }
    ;
    getBoundsBody() {
        return new DoubleRect(this.getLeftBody(), this.getBottomBody(), this.getRightBody(), this.getTopBody());
    }
    ;
    getBoundsWorld() {
        return this.getBoundsBody();
    }
    ;
    getCenterOfMass() {
        return Vector.ORIGIN;
    }
    ;
    getCentroidBody() {
        return Vector.ORIGIN;
    }
    ;
    getCentroidRadius() {
        return Infinity;
    }
    ;
    getCentroidWorld() {
        return Vector.ORIGIN;
    }
    ;
    getChanged() {
        return false;
    }
    ;
    getDistanceTol() {
        return 0;
    }
    ;
    getDragPoints() {
        return [];
    }
    ;
    getEdges() {
        return [];
    }
    ;
    getElasticity() {
        return 1;
    }
    ;
    getExpireTime() {
        return Infinity;
    }
    ;
    getHeight() {
        return Infinity;
    }
    ;
    getKineticEnergy() {
        return 0;
    }
    ;
    getLeftBody() {
        return Number.NEGATIVE_INFINITY;
    }
    ;
    getLeftWorld() {
        return Number.NEGATIVE_INFINITY;
    }
    ;
    getMass() {
        return Infinity;
    }
    ;
    getName(_opt_localized) {
        return 'SCRIM';
    }
    ;
    getMinHeight() {
        return Infinity;
    }
    ;
    getOldCoords() {
        return null;
    }
    ;
    getPosition() {
        return Vector.ORIGIN;
    }
    ;
    getRightBody() {
        return Infinity;
    }
    ;
    getRightWorld() {
        return Infinity;
    }
    ;
    getTopBody() {
        return Infinity;
    }
    ;
    getSpecialNormalWorld() {
        return null;
    }
    ;
    getTopWorld() {
        return Infinity;
    }
    ;
    getVarName(_index, _localized) {
        throw '';
    }
    ;
    getVarsIndex() {
        return -1;
    }
    ;
    getVelocity(_p_body) {
        return Vector.ORIGIN;
    }
    ;
    getVelocityTol() {
        return 0;
    }
    ;
    getVertexes_() {
        return [];
    }
    ;
    getVerticesBody() {
        return [];
    }
    ;
    getWidth() {
        return Infinity;
    }
    ;
    getZeroEnergyLevel() {
        return null;
    }
    ;
    isMassObject() {
        return true;
    }
    ;
    momentAboutCM() {
        return Infinity;
    }
    ;
    momentum() {
        const r = new Array(3);
        r[0] = r[1] = r[2] = Infinity;
        return r;
    }
    ;
    nameEquals(name) {
        return this.getName() == Util.toName(name);
    }
    ;
    nonCollideEdge(edge) {
        return edge === null;
    }
    ;
    printAll() {
    }
    ;
    probablyPointInside(_p_body) {
        return true;
    }
    ;
    removeNonCollide(_bodies) {
    }
    ;
    rotateBodyToWorld(v_body) {
        return Vector.clone(v_body);
    }
    ;
    rotateWorldToBody(v_world) {
        return Vector.clone(v_world);
    }
    ;
    rotationalEnergy() {
        return 0;
    }
    ;
    saveOldCoords() {
    }
    ;
    setAccuracy(_value) {
    }
    ;
    setAngle(_angle) {
    }
    ;
    setAngularVelocity(_angular_velocity) {
    }
    ;
    setCenterOfMass(_center) {
    }
    ;
    setChanged() {
    }
    ;
    setDistanceTol(_value) {
    }
    ;
    setDragPoints(_dragPts) {
    }
    ;
    setElasticity(_value) {
    }
    ;
    setExpireTime(_time) {
    }
    ;
    setMass(_mass) {
        throw '';
    }
    ;
    setMinHeight(_minHeight) {
    }
    ;
    setMomentAboutCM(_moment) {
    }
    ;
    setPosition(loc_world, angle) {
        if (loc_world.getX() != 0 || loc_world.getY() != 0) {
            throw '';
        }
        if (angle !== undefined && angle != 0) {
            throw '';
        }
    }
    ;
    setPositionX(_value) {
        throw '';
    }
    ;
    setPositionY(_value) {
        throw '';
    }
    ;
    setVarsIndex(_index) {
        throw '';
    }
    ;
    setVelocity(velocity_world, angular_velocity) {
        if (velocity_world.getX() != 0 || velocity_world.getY() != 0) {
            throw '';
        }
        if (angular_velocity !== undefined && angular_velocity != 0) {
            throw '';
        }
    }
    ;
    setVelocityX(_value) {
        throw '';
    }
    ;
    setVelocityY(_value) {
        throw '';
    }
    ;
    setVelocityTol(_value) {
    }
    ;
    setZeroEnergyLevel(_height) {
    }
    ;
    similar(_obj, _opt_tolerance) {
        return false;
    }
    ;
    translationalEnergy() {
        return 0;
    }
    ;
    worldToBody(p_world) {
        return Vector.clone(p_world);
    }
    ;
}
Scrim.singleton = new Scrim();
Util.defineGlobal('lab$engine2D$Scrim', Scrim);
