import { Util } from '../util/Util.js';
;
export class CollisionTotals {
    constructor() {
        this.searches_ = 0;
        this.impulses_ = 0;
        this.collisions_ = 0;
        this.steps_ = 0;
        this.backups_ = 0;
    }
    ;
    toString() {
        return 'CollisionTotals{searches: ' + this.searches_
            + ', impulses: ' + this.impulses_
            + ', collisions: ' + this.collisions_
            + ', steps: ' + this.steps_
            + ', backups: ' + this.backups_
            + '}';
    }
    ;
    addBackups(backups) {
        this.backups_ += backups;
    }
    ;
    addCollisions(collisions) {
        this.collisions_ += collisions;
    }
    ;
    addImpulses(impulses) {
        this.impulses_ += impulses;
    }
    ;
    addSearches(searches) {
        this.searches_ += searches;
    }
    ;
    addSteps(steps) {
        this.steps_ += steps;
    }
    ;
    getBackups() {
        return this.backups_;
    }
    ;
    getCollisions() {
        return this.collisions_;
    }
    ;
    getImpulses() {
        return this.impulses_;
    }
    ;
    getSearches() {
        return this.searches_;
    }
    ;
    getSteps() {
        return this.steps_;
    }
    ;
    reset() {
        this.impulses_ = 0;
        this.collisions_ = 0;
        this.steps_ = 0;
        this.searches_ = 0;
        this.backups_ = 0;
    }
    ;
}
Util.defineGlobal('lab$model$CollisionTotals', CollisionTotals);
export class CollisionStats {
    constructor() {
        this.numCollisions = 0;
        this.numJoints = 0;
        this.numContacts = 0;
        this.numNonContact = 0;
        this.numNeedsHandling = 0;
        this.numImminent = 0;
        this.minDistance = Infinity;
        this.estTime = Infinity;
        this.detectedTime = Infinity;
    }
    ;
    toString() {
        let s = 'CollisionStats{collisions: ' + this.numCollisions;
        if (this.numCollisions > 0) {
            s += ', estTime: ' + Util.NF7(this.estTime)
                + ', detectedTime: ' + Util.NF7(this.detectedTime)
                + ', needsHandling: ' + this.numNeedsHandling
                + ', minDistance: ' + Util.NF7(this.minDistance)
                + ', nonContact: ' + this.numNonContact
                + ', imminent: ' + this.numImminent
                + ', joints: ' + this.numJoints
                + ', contacts: ' + this.numContacts;
        }
        return s + '}';
    }
    ;
    clear() {
        this.numCollisions = 0;
        this.numJoints = 0;
        this.numContacts = 0;
        this.numNonContact = 0;
        this.numNeedsHandling = 0;
        this.numImminent = 0;
        this.minDistance = Infinity;
        this.estTime = Infinity;
        this.detectedTime = Infinity;
    }
    ;
    update(collisions) {
        const infinity = Infinity;
        this.clear();
        this.numCollisions = collisions.length;
        collisions.forEach(c => {
            if (c.bilateral()) {
                this.numJoints++;
            }
            else if (c.contact()) {
                this.numContacts++;
            }
            if (!c.contact()) {
                this.numNonContact++;
            }
            if (c.needsHandling()) {
                this.numNeedsHandling++;
                if (c.getDetectedTime() < this.detectedTime)
                    this.detectedTime = c.getDetectedTime();
            }
            if ((c.needsHandling() || !c.contact()) && c.getVelocity() < 0) {
                this.numImminent++;
                const dist = c.getDistance();
                if (!isFinite(dist)) {
                    throw 'distance is NaN ' + c;
                }
                if (dist < this.minDistance) {
                    this.minDistance = dist;
                }
                if (!isNaN(this.estTime)) {
                    const t = c.getEstimatedTime();
                    if (isNaN(t)) {
                        this.estTime = NaN;
                    }
                    else if (t < this.estTime) {
                        this.estTime = t;
                    }
                }
            }
        });
        if (this.estTime == infinity) {
            this.estTime = NaN;
        }
        if (this.detectedTime == infinity) {
            this.detectedTime = NaN;
        }
    }
    ;
}
Util.defineGlobal('lab$model$CollisionStats', CollisionStats);
