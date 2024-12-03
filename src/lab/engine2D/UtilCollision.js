import { CornerEdgeCollision } from './CornerEdgeCollision.js';
import { UtilEngine } from './UtilEngine.js';
import { Util } from '../util/Util.js';
export class UtilCollision {
    constructor() {
        throw '';
    }
    ;
    static addCollision(collisions, c2) {
        if (c2 == null) {
            throw '';
        }
        const removeMe = new Array();
        let better = null;
        let shouldAdd = true;
        if (!c2.joint) {
            if (!isFinite(c2.distance)) {
                throw 'distance is NaN ' + c2;
            }
            collisions.forEach(c1 => {
                if (!c2.similarTo(c1)) {
                    return;
                }
                const time1 = c1.getDetectedTime();
                const time2 = c2.getDetectedTime();
                Util.assert(isFinite(time1));
                Util.assert(isFinite(time2));
                if (time1 > time2 + 1e-14) {
                    shouldAdd = false;
                    better = c1;
                    return;
                }
                else if (time2 > time1 + 1e-14) {
                    removeMe.push(c1);
                }
                else {
                    if (c2.distance < c1.distance) {
                        removeMe.push(c1);
                    }
                    else {
                        shouldAdd = false;
                        better = c1;
                    }
                }
            });
        }
        if (removeMe.length > 0) {
            removeMe.forEach(obj => Util.remove(collisions, obj));
        }
        if (shouldAdd) {
            collisions.push(c2);
        }
        return shouldAdd;
    }
    ;
    static checkVertexes(collisions, body1, body2, time) {
        const c = body2.worldToBody(body1.getCentroidWorld());
        let specialNormal = body1.getSpecialNormalWorld();
        if (specialNormal != null) {
            specialNormal = body2.rotateWorldToBody(specialNormal);
            if (Util.DEBUG)
                UtilCollision.specialNormalRotate++;
        }
        body2.getVertexes_().forEach(function checkVertex1(v2) {
            if (body1.nonCollideEdge(v2.getEdge1()) && body1.nonCollideEdge(v2.getEdge2())) {
                return;
            }
            const nowVertex = body1.worldToBody(body2.bodyToWorld(v2.locBody()));
            let oldVertex = nowVertex;
            let travelDistSqr = 0;
            const bodyOld1 = body1.getOldCoords();
            const bodyOld2 = body2.getOldCoords();
            if (bodyOld1 != null && bodyOld2 != null) {
                oldVertex = bodyOld1.worldToBody(bodyOld2.bodyToWorld(v2.locBody()));
                travelDistSqr = nowVertex.distanceSquaredTo(oldVertex);
            }
            else if (bodyOld1 != null || bodyOld2 != null) {
                throw 'problem with old copy in checkVertexes';
            }
            const travelDist = travelDistSqr > 0.01 ? Math.sqrt(travelDistSqr) : 0.1;
            if (specialNormal != null) {
                const dist = v2.locBody().subtract(c).dotProduct(specialNormal);
                const dist2 = body1.getCentroidRadius() + body1.getDistanceTol();
                if (dist > dist2)
                    return;
            }
            else {
                const maxRadius = body1.getCentroidRadius() + body1.getDistanceTol() + travelDist;
                const maxRadiusSqr = maxRadius * maxRadius;
                const dist = v2.locBody().subtract(c).lengthSquared();
                if (dist > maxRadiusSqr) {
                    return;
                }
                else {
                }
            }
            UtilCollision.testCollisionVertex(collisions, body1, v2, nowVertex, oldVertex, travelDist, time);
        });
    }
    ;
    static intersectionPossible(body1, body2, swellage) {
        if (body1.getSpecialNormalWorld() != null) {
            return UtilCollision.intersectionPossibleSpecial(body1, body2, swellage);
        }
        else if (body2.getSpecialNormalWorld() != null) {
            return UtilCollision.intersectionPossibleSpecial(body2, body1, swellage);
        }
        else {
            const dist = body2.getCentroidWorld()
                .subtract(body1.getCentroidWorld())
                .lengthSquared();
            const a = body2.getCentroidRadius() + body1.getCentroidRadius() + swellage;
            return dist < a * a;
        }
    }
    static intersectionPossibleSpecial(poly1, poly2, swellage) {
        const specialNormal = poly1.getSpecialNormalWorld();
        if (specialNormal == null)
            throw '';
        const dist1 = poly2.getCentroidWorld().subtract(poly1.getCentroidWorld())
            .dotProduct(specialNormal);
        const dist2 = poly2.getCentroidRadius() + poly1.getCentroidRadius() + swellage;
        if (Util.DEBUG) {
            UtilCollision.specialNormalRotate++;
        }
        return dist1 < dist2;
    }
    ;
    static makeCollision(collisions, edge, vertex, e_body, p_body, time) {
        const c = new CornerEdgeCollision(vertex, edge);
        const v_edge = vertex.getEdge1();
        if (v_edge == null) {
            throw '';
        }
        const primaryBody = v_edge.getBody();
        const normalBody = edge.getBody();
        c.distance = edge.distanceToLine(p_body);
        const e_world = normalBody.bodyToWorld(e_body);
        c.impact1 = e_world;
        const n_world = normalBody.rotateBodyToWorld(edge.getNormalBody(e_body));
        c.normal = n_world;
        c.radius2 = edge.getCurvature(e_body);
        c.ballNormal = isFinite(c.radius2);
        c.creator = Util.DEBUG ? 'testCollisionVertex' : '';
        c.setDetectedTime(time);
        UtilCollision.addCollision(collisions, c);
    }
    ;
    static printCollisionStatistics() {
        let s = '';
        if (UtilCollision.vertexBodyCollisionTests > 0)
            s += 'vertex/body collisions: ' + UtilCollision.vertexBodyCollisionTests;
        if (UtilCollision.edgeEdgeCollisionTests > 0)
            s += ' edge/edge collisions: ' + UtilCollision.edgeEdgeCollisionTests;
        if (s.length > 0)
            console.log(s);
        if (UtilCollision.specialNormalRotate > 0)
            console.log('special normal rotate: ' + UtilCollision.specialNormalRotate
                + ' hits ' + UtilCollision.specialNormalHits
                + ' misses ' + UtilCollision.specialNormalMisses);
        UtilCollision.vertexBodyCollisionTests = 0;
        UtilCollision.edgeEdgeCollisionTests = 0;
        UtilCollision.specialNormalRotate = 0;
        UtilCollision.specialNormalHits = 0;
        UtilCollision.specialNormalMisses = 0;
    }
    ;
    static subsetCollisions1(superset) {
        let c;
        const subset = [];
        if (superset.length == 0)
            return subset;
        subset.push(superset[0]);
        const subsetBods = [];
        {
            c = subset[0];
            if (isFinite(c.primaryBody.getMass()))
                subsetBods.push(c.primaryBody);
            if (c.normalBody != null && isFinite(c.normalBody.getMass()))
                subsetBods.push(c.normalBody);
        }
        let n;
        do {
            n = subset.length;
            for (let i = 0, len = superset.length; i < len; i++) {
                c = superset[i];
                if (subset.includes(c)) {
                    continue;
                }
                if (subsetBods.includes(c.primaryBody)) {
                    subset.push(c);
                    const moveableNormalBody = isFinite(c.normalBody.getMass());
                    if (moveableNormalBody && !subsetBods.includes(c.normalBody))
                        subsetBods.push(c.normalBody);
                    continue;
                }
                if (subsetBods.includes(c.normalBody)) {
                    subset.push(c);
                    const moveableBody = isFinite(c.primaryBody.getMass());
                    if (moveableBody && !subsetBods.includes(c.primaryBody))
                        subsetBods.push(c.primaryBody);
                    continue;
                }
            }
        } while (n < subset.length);
        return subset;
    }
    ;
    static subsetCollisions2(superset, startC, hybrid, v, minVelocity) {
        let c;
        if (superset.length == 0)
            return [];
        Util.assert(superset.includes(startC));
        const subset = [];
        subset.push(startC);
        const subsetBods = [];
        if (isFinite(startC.primaryBody.getMass()))
            subsetBods.push(startC.primaryBody);
        if (isFinite(startC.normalBody.getMass()))
            subsetBods.push(startC.normalBody);
        let n;
        if (hybrid) {
            for (let i = 0, len = superset.length; i < len; i++) {
                c = superset[i];
                if (subset.includes(c)) {
                    continue;
                }
                if (!c.joint && v[i] < minVelocity) {
                    if (c.primaryBody == startC.primaryBody || c.normalBody == startC.normalBody ||
                        c.primaryBody == startC.normalBody || c.normalBody == startC.primaryBody) {
                        subset.push(c);
                        if (!subsetBods.includes(c.primaryBody))
                            subsetBods.push(c.primaryBody);
                        if (!subsetBods.includes(c.normalBody))
                            subsetBods.push(c.normalBody);
                    }
                }
            }
        }
        do {
            n = subset.length;
            for (let i = 0, len = superset.length; i < len; i++) {
                c = superset[i];
                if (subset.includes(c)) {
                    continue;
                }
                if (subsetBods.includes(c.primaryBody) && c.joint) {
                    subset.push(c);
                    const moveableNormalBody = isFinite(c.normalBody.getMass());
                    if (moveableNormalBody && !subsetBods.includes(c.normalBody))
                        subsetBods.push(c.normalBody);
                    continue;
                }
                if (subsetBods.includes(c.normalBody) && c.joint) {
                    subset.push(c);
                    const moveableBody = isFinite(c.primaryBody.getMass());
                    if (moveableBody && !subsetBods.includes(c.primaryBody))
                        subsetBods.push(c.primaryBody);
                    continue;
                }
            }
        } while (n < subset.length);
        return subset;
    }
    ;
    static testCollisionVertex(collisions, body1, vertex2, v_body, v_body_old, travelDist, time) {
        if (Util.DEBUG) {
            UtilCollision.vertexBodyCollisionTests++;
        }
        const edge2 = vertex2.getEdge1();
        if (edge2 == null) {
            throw Util.DEBUG ? 'vertex2 has no edge: ' + vertex2 : '';
        }
        const body2 = edge2.getBody();
        Util.assert(Util.isObject(body2));
        const distTol = body1.getDistanceTol();
        if (v_body.getX() < body1.getLeftBody() - distTol
            && v_body_old.getX() < body1.getLeftBody()
            || v_body.getX() > body1.getRightBody() + distTol
                && v_body_old.getX() > body1.getRightBody()
            || v_body.getY() < body1.getBottomBody() - distTol
                && v_body_old.getY() < body1.getBottomBody()
            || v_body.getY() > body1.getTopBody() + distTol
                && v_body_old.getY() > body1.getTopBody()) {
            if (Util.DEBUG && body1.probablyPointInside(v_body)) {
                throw 'probablyPointInside: ' + v_body + ' ' + body1;
            }
            return;
        }
        let debugPenetration = false;
        while (true) {
            if (Util.DEBUG && debugPenetration) {
                console.log('*****  PROBABLY POINT INSIDE v_body=' + v_body);
                const p = body2;
                p.printAll();
                console.log('testCollisionVertex ' + body1.getName() + ' ' + p.getName()
                    + ' v: ' + vertex2.getID());
                console.log('vertex2=' + vertex2);
                console.log('v_body=' + v_body);
                console.log('v_body_old=' + v_body_old);
                console.log('travelDist=' + travelDist);
            }
            let edge1 = null;
            let e1_body = null;
            let distance_old = Infinity;
            body1.getEdges().forEach(e1 => {
                if (Util.DEBUG && debugPenetration) {
                    console.log('\n===== test edge ' + e1);
                }
                if (body2.nonCollideEdge(e1)) {
                    return;
                }
                const maxRadius = e1.getCentroidRadius() + distTol + travelDist;
                const maxRadiusSqr = maxRadius * maxRadius;
                if (e1.getCentroidBody().distanceSquaredTo(v_body) > maxRadiusSqr) {
                    if (Util.DEBUG && debugPenetration) {
                        console.log('not in range ' + body2.getName() + ' vertex2=' + vertex2.getID()
                            + ' edge1=' + e1.getIndex());
                        console.log('v_body=' + v_body);
                        console.log('maxRadiusSqr=' + maxRadiusSqr);
                        console.log('e1.centroid_body.distanceSquaredTo(v_body)='
                            + e1.getCentroidBody().distanceSquaredTo(v_body));
                    }
                    return;
                }
                if (UtilCollision.HIGHLIGHT_COLLISION_TESTING && Util.DEBUG) {
                    e1.highlight();
                    vertex2.highlight();
                }
                if (Util.DEBUG && debugPenetration) {
                    console.log('v_body=' + v_body + ' e1=' + e1);
                }
                const r1_array = e1.intersection(v_body, v_body_old);
                if (r1_array == null) {
                    if (Util.DEBUG && debugPenetration) {
                        console.log('!!!!! no intersection found  !!!!!');
                        console.log('v_body=' + v_body + ' v_body_old=' + v_body_old);
                        console.log('v_body.x=' + Util.NFSCI(v_body.getX()));
                        console.log('v_body_old.x=' + Util.NFSCI(v_body_old.getX()));
                        console.log('e1=' + e1);
                    }
                    if (UtilCollision.DISABLE_MIDPOINT_VERTEX_CONTACT && !vertex2.isEndPoint())
                        return;
                    const c = e1.findVertexContact(vertex2, v_body, distTol);
                    if (Util.DEBUG && debugPenetration) {
                        console.log('findVertexContact ' + c);
                    }
                    if (c != null) {
                        Util.assert(c != null);
                        Util.assert(c.primaryBody == body2);
                        Util.assert(c.normalBody == body1);
                        c.setDetectedTime(time);
                        UtilCollision.addCollision(collisions, c);
                    }
                    return;
                }
                Util.assert(v_body != v_body_old);
                r1_array.forEach(r1b => {
                    if (Util.DEBUG && debugPenetration && UtilEngine.debugEngine2D != null) {
                        const t = body1.bodyToWorld(r1b);
                        UtilEngine.debugEngine2D.debugCircle('dot', t, 0.1);
                    }
                    const d = v_body_old.subtract(r1b).length();
                    if (Util.DEBUG && debugPenetration) {
                        console.log('distance_old=' + distance_old + ' d=' + d);
                    }
                    if (d < distance_old) {
                        distance_old = d;
                        e1_body = r1b;
                        edge1 = e1;
                        if (Util.DEBUG && debugPenetration) {
                            console.log('edge1=' + edge1);
                        }
                    }
                });
            });
            if (edge1 != null && e1_body != null) {
                UtilCollision.makeCollision(collisions, edge1, vertex2, e1_body, v_body, time);
                break;
            }
            else {
                if (!Util.DEBUG) {
                    break;
                }
                else {
                    const noSpecialEdge = body1.getSpecialNormalWorld() == null;
                    const probablyInside = noSpecialEdge && body1.probablyPointInside(v_body);
                    if (!probablyInside) {
                        break;
                    }
                    if (debugPenetration) {
                        throw 'probablyPointInside: v_body=' + v_body
                            + '\nvertex2=' + vertex2 + '\nbody1=' + body1 + '\nbody2=' + body2;
                    }
                    debugPenetration = true;
                    console.log('no intersection found;  probablyInside=' + probablyInside);
                }
            }
        }
    }
    ;
}
UtilCollision.edgeEdgeCollisionTests = 0;
UtilCollision.specialNormalHits = 0;
UtilCollision.specialNormalMisses = 0;
UtilCollision.specialNormalRotate = 0;
UtilCollision.vertexBodyCollisionTests = 0;
UtilCollision.DISABLE_MIDPOINT_VERTEX_CONTACT = true;
UtilCollision.DISABLE_EDGE_EDGE = false;
UtilCollision.HIGHLIGHT_COLLISION_TESTING = false;
Util.defineGlobal('lab$engine2D$UtilCollision', UtilCollision);
