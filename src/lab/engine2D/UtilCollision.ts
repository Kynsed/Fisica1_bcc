
import { CornerEdgeCollision } from './CornerEdgeCollision.js';
import { RigidBody, Edge, Vertex } from './RigidBody.js';
import { RigidBodyCollision } from './RigidBody.js';
import { UtilEngine } from './UtilEngine.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';

/** Static class that provides utility methods for calculating collision information.
*/
export class UtilCollision {

constructor() {
  throw '';
};

/** Adds the given collision only if it there is not already a deeper collision
between the same bodies and same edges very close by. This helps prevent having
duplicate collisions (or contacts), which helps the process of solving for contact
forces or collision impulses with ComputeForces.

When a vertex collides into an edge, we need to see if there is a more accurate
edge/edge collision to be used instead of the vertex/edge collision. For endpoint
Vertexes, this involves testing both edges on either side of the vertex.

One way to look at this addCollision function is that you are defining an equality
test between collisions, along with an ordering. A pair of collisions have to be
approximately equal, and then we take the better of the two. If this were transitive,
then you needn't worry about the case of 3 nearly equal collisions. Because you add
collisions one at a time, you would always have only one of the 3 in the list at any
time.

But collisions aren't really transitive because of the nearness criteria. Suppose
there are 3 collisions, A, B, and C. A is near B, and B is near C. But A is not be
'near' C. As an example, suppose there are two 'decorated' midpoint Vertexes, A and C,
on a curved edge. Suppose the distance between A and C is 0.11 and the nearness
criteria is 0.1. So they are considered not near and both are added to the list. Now
we add B, the edge/edge collision between A and C. It is near both A and C. To ensure
that both A and C are removed, we need to go thru the entire list, allowing B to kick
out every collision it is near to.

Even if the collision we are adding is rejected, we should still go thru the
entire list. In the above example, again suppose that A and C are on the list but not
near each other. But this time, A is the deepest collision, followed by B, with C
being the shallowest. So `A > B > C` (where > means 'deeper'). We try to add B, but
because `A > B`, we reject B. If we stop there, then C will still be on the list. If we
continue, we find that `B > C` and also reject C. If we don't go thru the entire list
this way, then the ordering of the list determines the final result: in one ordering
of the list, C survives in another ordering it is rejected.

Therefore, we always go thru the entire list, even when the collision we are
considering has been shown to be shallower than a nearby collision. (Although this is
probably very rare, and not devastating if it slipped through).

Joints are a special case, they should always be added, never removed.

@param collisions the list of collisions, to search and possibly add to
@param c2 the RigidBodyCollision to possibly add to the list
@return true if the collision was added
*/
static addCollision(collisions: RigidBodyCollision[], c2: RigidBodyCollision): boolean {
  if (c2==null) {
    throw '';
  }
  const removeMe = new Array();
  let better = null; // it is a RigidBodyCollision
  let shouldAdd = true;
  if (!c2.joint) {
    if (!isFinite(c2.distance)) {
      throw 'distance is NaN '+c2;
    }
    collisions.forEach(c1 => {
      if (!c2.similarTo(c1)) {
        return;
      }
      // Prevent adding a “static” collision which has worse info about expected
      // collision time when there is a “dynamic” collision that was found to be
      // penetrating the object in the future.
      // A typical case is to have a penetrating collision, and then after
      // backup we find similar collision 'statically' before penetration.
      // The first one has better estimate of velocity, so prefer that one.
      const time1 = c1.getDetectedTime();
      const time2 = c2.getDetectedTime();
      Util.assert(isFinite(time1));
      Util.assert(isFinite(time2));
      if (time1 > time2 + 1e-14) {
        // Prefer the collision that was detected later
        shouldAdd = false;
        better = c1;
        return;
      } else if (time2 > time1 + 1e-14) {
        // Prefer the collision that was detected later
        removeMe.push(c1);
      } else {
        // the collisions have same detected time
        // Prefer the deeper of the two collisions, or shallower of two contacts.
        if (c2.distance < c1.distance) {
          removeMe.push(c1);
        } else {
          shouldAdd = false;
          better = c1;
        }
      }
    }); // forEach
  }
  if (removeMe.length > 0) {
    /*if (1 == 0 && Util.DEBUG) {
      if (removeMe.length > 1)
        console.log('**** removeMe.length='+removeMe.length);
      removeMe.forEach(c => console.log('---- addCollision removing '+c));
    }*/
    removeMe.forEach(obj => Util.remove(collisions, obj));
  }
  if (shouldAdd) {
    collisions.push(c2);
    /*if (1 == 0 && Util.DEBUG && removeMe.length > 0) {
      console.log('++++ addCollision adding '+c2);
    }*/
  } /*else {
    if (1 == 0 && Util.DEBUG) {
      console.log("---- addCollision didn't add "+c2);
      console.log('++++ addCollision already had '+better);
    }
  }*/
  return shouldAdd;
};

/** Checks for collision of each vertex of body2 with edges of body1.
@param collisions  the list of
    collisions to add to
@param body1 the RigidBody whose edges are checked
@param body2 the RigidBody whose Vertexes are checked
@param time current simulation time
*/
static checkVertexes(collisions: RigidBodyCollision[], body1: RigidBody, body2: RigidBody, time: number) {
  // get centroid of body1 in body coords of body2.
  const c = body2.worldToBody(body1.getCentroidWorld());
  let specialNormal = body1.getSpecialNormalWorld();
  if (specialNormal != null) {
    specialNormal = body2.rotateWorldToBody(specialNormal);
    if (Util.DEBUG)
      UtilCollision.specialNormalRotate++;
  }
  body2.getVertexes_().forEach(function checkVertex1(v2) {
    // skip if body1 doesn't collide with both edges connected to vertex
    if (body1.nonCollideEdge(v2.getEdge1()) && body1.nonCollideEdge(v2.getEdge2())) {
      return;
    }
    // get position of Vertex v2 in body1 coords
    const nowVertex = body1.worldToBody(body2.bodyToWorld(v2.locBody()));
    let oldVertex = nowVertex;
    let travelDistSqr = 0;
    const bodyOld1 = body1.getOldCoords();
    const bodyOld2 = body2.getOldCoords();
    // either both should be null or both should be non-null
    if (bodyOld1 != null && bodyOld2 != null) {
      // get old position of Vertex v2 in old-body1 coords
      oldVertex = bodyOld1.worldToBody(bodyOld2.bodyToWorld(v2.locBody()));
      // We try to avoid computationally expensive sqrt function by working
      // with square of distance.
      travelDistSqr = nowVertex.distanceSquaredTo(oldVertex);
    } else if (bodyOld1 != null || bodyOld2 != null) {
      throw 'problem with old copy in checkVertexes';
    }
    // In many/most cases the travel distance is small,
    // so we can avoid computationally expensive sqrt()
    // by substituting 0.1 for travel distance in that case.
    // **TO DO** use a parameter here instead of 0.1, because 'small' depends on sim.
    const travelDist = travelDistSqr > 0.01 ? Math.sqrt(travelDistSqr) : 0.1;
    // Set travelDist = 0 here to turn off the proximity test below; this is
    // useful for devising tests where an object passes thru another object
    // in a single time step; see for example SpeedTest.
    //travelDist = 0;  // Keep for Testing;
    //checkPrint2(v, body2, body1);
    if (specialNormal != null) {
      // **TO DO**: why does this calculation not include travel distance?
      // For special edge (walls) we look only at the normal distance to that edge.
      // ? to do? seems like don't need special max radius, just need a negative
      // normal distance (or less than distance tol) and then you have a collision;
      // for positive normal distance (more than distance tol) can't have collision!
      const dist = v2.locBody().subtract(c).dotProduct(specialNormal);
      const dist2 = body1.getCentroidRadius() + body1.getDistanceTol();
      if (dist > dist2)
        return;
    } else {
      // Proximity test:  The vertex has moved by travelDist in the last time step,
      // as seen from body1 (relative to body coords of body1).
      // body1 is enclosed by a circle of maxRadius about its centroid.
      // If the vertex collided with the a point on periphery of body1,
      // the furthest the vertex can be from the centroid is:
      //    maxRadius + travelDist
      const maxRadius = body1.getCentroidRadius() + body1.getDistanceTol() +  travelDist;
      const maxRadiusSqr = maxRadius * maxRadius;
      const dist = v2.locBody().subtract(c).lengthSquared();
      if (dist > maxRadiusSqr) {
        //console.log('not proximate '+dist+' '+maxRadiusSqr+' '+travelDist);
        return;
      } else {
        //console.log('too close '+dist+' '+maxRadiusSqr+' '+travelDist);
      }
    }
    UtilCollision.testCollisionVertex(collisions, body1, v2,
        nowVertex, oldVertex, travelDist, time);
  }); // forEach
};

/** Performs a rough proximity test: are the bodies close enough that their proximity
circles overlap? Returns `false` when there can be no intersection between the two
RigidBody bounding rectangles. Returns `true` when an intersection between the
two bodies is possible.

Further checks are needed besides this rough check to determine if there really is
intersection of the two bodies. The bounding rectangle can be increased in size by the
`swellage` amount.
@param body1  the first body to check for intersection with
@param body2  the second body to check for intersection with
@param swellage  amount to increase the bounding rectangle sizes
@return false if there can be no intersection between the two bodies.
*/
static intersectionPossible(body1: RigidBody, body2: RigidBody, swellage: number): boolean {
  if (body1.getSpecialNormalWorld() != null) {
    return UtilCollision.intersectionPossibleSpecial(body1, body2, swellage);
  } else if (body2.getSpecialNormalWorld() != null) {
    return UtilCollision.intersectionPossibleSpecial(body2, body1, swellage);
  } else {
    // regular proximity test
    const dist = body2.getCentroidWorld()
                  .subtract(body1.getCentroidWorld())
                  .lengthSquared();
    const a = body2.getCentroidRadius() + body1.getCentroidRadius() + swellage;
    return dist < a*a;
  }
}

/** special edge proximity test:  look at only the component of the
distance that is normal to the edge.
@param poly1  the first body to check for intersection with
@param poly2  the second body to check for intersection with
@param swellage  amount to increase the bounding rectangle sizes
@return false if there can be no intersection between the two bodies.
*/
static intersectionPossibleSpecial(poly1: RigidBody, poly2: RigidBody, swellage: number): boolean {
  const specialNormal = poly1.getSpecialNormalWorld();
  if (specialNormal == null)
    throw '';
  const dist1 = poly2.getCentroidWorld().subtract(poly1.getCentroidWorld())
                .dotProduct(specialNormal);
  // use the special maximum radius for this test
  const dist2 = poly2.getCentroidRadius() + poly1.getCentroidRadius() + swellage;
  if (Util.DEBUG) {
    UtilCollision.specialNormalRotate++;
  }
  return dist1 < dist2;
};

/**
@param collisions  the list of collisions to add to
@param edge
@param vertex
@param e_body
@param p_body
@param time current simulation time
*/
private static makeCollision(collisions: RigidBodyCollision[], edge: Edge, vertex: Vertex, e_body: Vector, p_body: Vector, time: number) {
  const c = new CornerEdgeCollision(vertex, edge);
  const v_edge = vertex.getEdge1();
  if (v_edge == null) {
    throw '';
  }
  const primaryBody = v_edge.getBody();
  const normalBody = edge.getBody();
  c.distance = edge.distanceToLine(p_body);
  // How this can happen:  if body2 is a circle, it could be that the old and new
  // corner points are within the square bounding box, but outside of the circle.
  // ERN Feb 21 2011:  I think this is no longer possible, because the edge intersection
  // method must return an actual intersection.
  // ERN May 18 2012: (the above is wrong) this CAN happen when a vertex
  // is in the contact zone but
  // it is moving too quickly to be a contact.
  // MAY 19 2012:  ALLOW POSITIVE OR ZERO DISTANCE COLLISION.
  // See test:  StraightStraightTest.one_block.
  /*if (1 == 0 && c.distance > 0)
    return;
  */
  // ERN Feb 15 2011:  use the intersection point on the edge instead of the corner
  // e_world = edge intersection point in world coords
  const e_world = normalBody.bodyToWorld(e_body);
  c.impact1 = e_world;
  // n_world = normal in world coords
  const n_world = normalBody.rotateBodyToWorld(edge.getNormalBody(e_body));
  c.normal = n_world;
  c.radius2 = edge.getCurvature(e_body);
  c.ballNormal = isFinite(c.radius2);
  c.creator = Util.DEBUG ? 'testCollisionVertex' : '';
  /*if (1 == 0 && Util.DEBUG)
    console.log('UtilCollision.testCollisionVertex '+c);
  */
  c.setDetectedTime(time);
  UtilCollision.addCollision(collisions, c);
};

/** Prints statistics about number of collisions and contacts of various types that
occurred.
*/
static printCollisionStatistics(): void {
  let s = '';
  if (UtilCollision.vertexBodyCollisionTests > 0)
    s += 'vertex/body collisions: ' + UtilCollision.vertexBodyCollisionTests;
  if (UtilCollision.edgeEdgeCollisionTests > 0)
    s += ' edge/edge collisions: ' + UtilCollision.edgeEdgeCollisionTests;
  if (s.length > 0)
    console.log(s);
  if (UtilCollision.specialNormalRotate > 0)
    console.log(
      'special normal rotate: ' + UtilCollision.specialNormalRotate
      +' hits '+ UtilCollision.specialNormalHits
      +' misses '+ UtilCollision.specialNormalMisses
      );
  UtilCollision.vertexBodyCollisionTests = 0;
  UtilCollision.edgeEdgeCollisionTests = 0;
  UtilCollision.specialNormalRotate = 0;
  UtilCollision.specialNormalHits = 0;
  UtilCollision.specialNormalMisses = 0;
};

/** Returns a subset of collisions such that all the collisions in the set are are
connected. Two collisions are connected when they have a common moveable (finite mass)
body. The subset will be such that you can go from one collision to any other
collision via neighboring connected collisions.
@param superset the set of
    collisions to examine
@return a subset of collisions
    such that all the collisions in the set are connected by moveable bodies
*/
static subsetCollisions1(superset: RigidBodyCollision[]): RigidBodyCollision[] {
  let c;
  const subset: RigidBodyCollision[] = [];
  if (superset.length == 0)
    return subset;
  subset.push(superset[0]);
  // subsetBods = the moveable bodies in the subset of collisions
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
    for (let i=0, len=superset.length; i<len; i++) {
      c = superset[i];
      if (subset.includes(c)) {
        // This collision already in the subset
        continue;
      }
      if (subsetBods.includes(c.primaryBody)) {
        // This collision involves a body in subsetBods, so add it to the subset
        // and add its other body to subsetBods.
        subset.push(c);
        const moveableNormalBody = isFinite(c.normalBody.getMass());
        if (moveableNormalBody && !subsetBods.includes(c.normalBody))
            subsetBods.push(c.normalBody);
        continue;
      }
      if (subsetBods.includes(c.normalBody)) {
        // This collision involves a body in subsetBods, so add it to the subset
        // and add its other body to subsetBods.
        subset.push(c);
        const moveableBody = isFinite(c.primaryBody.getMass());
        if (moveableBody && !subsetBods.includes(c.primaryBody))
          subsetBods.push(c.primaryBody);
        continue;
      }
    }
  } while (n < subset.length);  // while the subset size is increasing
  /*if (0 == 1 && Util.DEBUG) {
    console.log('subsetCollisions1:  super='+superset.length
      +' sub='+subset.length+' bods='+subsetBods.length);
    for (let i=0, len=subset.length; i<len; i++) {
      console.log('in subset: '+subset[i]);
    }
  }*/
  return subset;
};

/** Given a set of collisions and a starting collision in that set, returns the subset
of collisions that are connected by joints to the moveable bodies in the starting
collision. The subset will be such that you can go from one collision to any other
collision via neighboring connected collisions.
@param superset the set of collisions to examine
@param startC  the starting collision in the superset
@param hybrid  include collisions involving either body in startC
@param v array of velocity of each collision
@param minVelocity for hybrid collision handling, only include collisions
    that have more negative velocity than this minimum.
@return a subset of collisions
    such that all the collisions in the set are connected via joints to the moveable
    bodies of the starting collision.
*/
static subsetCollisions2(superset: RigidBodyCollision[], startC: RigidBodyCollision, hybrid: boolean, v: number[], minVelocity: number): RigidBodyCollision[] {
  let c;
  if (superset.length == 0)
    return [];
  Util.assert(superset.includes(startC));
  const subset = [];
  subset.push(startC);
  // subsetBods = the moveable bodies in the subset of collisions
  const subsetBods = [];
  if (isFinite(startC.primaryBody.getMass()))
    subsetBods.push(startC.primaryBody);
  if (isFinite(startC.normalBody.getMass()))
    subsetBods.push(startC.normalBody);
  let n;
  if (hybrid) {
    // Add all non-joint non-contact collisions involving either body of startC.
    for (let i=0, len=superset.length; i<len; i++) {
      c = superset[i];
      if (subset.includes(c)) {
        // This collision already in the subset
        continue;
      }
      if (!c.joint && v[i] < minVelocity) {
        if (c.primaryBody == startC.primaryBody || c.normalBody == startC.normalBody ||
          c.primaryBody == startC.normalBody || c.normalBody == startC.primaryBody)   {
          subset.push(c);
          if (!subsetBods.includes(c.primaryBody))
            subsetBods.push(c.primaryBody);
          if (!subsetBods.includes(c.normalBody))
            subsetBods.push(c.normalBody);
        }
      }
    }
  }
  //console.log('startC '+startC);
  //UtilEngine.printList('subset', subset);
  //UtilEngine.printList('subsetBods', subsetBods);
  // Add to subset all joint collisions connected to the bodies of subsetBods
  // via other joints.
  do {
    n = subset.length;
    for (let i=0, len=superset.length; i<len; i++) {
      c = superset[i];
      if (subset.includes(c)) {
        // This collision already in the subset
        continue;
      }
      if (subsetBods.includes(c.primaryBody) && c.joint) {
        // This collision is a joint and involves a body in subsetBods,
        // so add it to the subset and add its other body to subsetBods.
        subset.push(c);
        const moveableNormalBody = isFinite(c.normalBody.getMass());
        if (moveableNormalBody && !subsetBods.includes(c.normalBody))
            subsetBods.push(c.normalBody);
        continue;
      }
      if (subsetBods.includes(c.normalBody) && c.joint) {
        // This collision is a joint and involves a body in subsetBods,
        // so add it to the subset and add its other body to subsetBods.
        subset.push(c);
        const moveableBody = isFinite(c.primaryBody.getMass());
        if (moveableBody && !subsetBods.includes(c.primaryBody))
          subsetBods.push(c.primaryBody);
        continue;
      }
    }
  } while (n < subset.length);  // while the subset size is increasing
  /*if (0 == 1 && Util.DEBUG) {
    console.log('subsetCollisions2:  super='+superset.length
      +' sub='+subset.length+' bods='+subsetBods.length);
    for (let i=0, len=subset.length; i<len; i++) {
      console.log('subset '+subset[i]);
    }
  }*/
  return subset;
};

/** Tests for collision or contact of a RigidBody with a Vertex.  If a collision
or contact is found, adds a new
{@link RigidBodyCollision} to the list of collisions.

**TO DO**  there may be opportunities to save computing time by calculating
distance squared instead of distance, and selecting the proper distance
from among those that got calculated (instead of recalculating the distance
yet again when making the collision record).

@param collisions  the list of collisions to add to
@param body1 the RigidBody whose edges we are checking for collisions
@param vertex2 the Vertex of body2
@param v_body  the current position of vertex2 in body coords of body1
@param v_body_old the position of vertex2 at the last time step in body
    coords of body1, see
    {@link lab/engine2D/Polygon.Polygon.saveOldCoords | Polygon.saveOldCoords}
@param travelDist  the distance between v_body and v_body_old
@param time current simulation time
*/
private static testCollisionVertex(collisions: RigidBodyCollision[], body1: RigidBody, vertex2: Vertex, v_body: Vector, v_body_old: Vector, travelDist: number, time: number) {
  if (Util.DEBUG) {
    UtilCollision.vertexBodyCollisionTests++;
  }
  const edge2 = vertex2.getEdge1();
  if (edge2 == null) {
    throw Util.DEBUG ? 'vertex2 has no edge: '+vertex2 : '';
  }
  // type needed for NTI?
  const body2 = edge2.getBody();
  Util.assert(Util.isObject(body2));
  // v_body = point of impact in body1's body coords
  // v_body_old = old location of point of impact, at time before the current time
  //              step, in 'old body coords', the body1 coords at that time
  // NOTE: keep in mind that a corner C of polygon A could cross the corner of
  // polygon B and both the new and old positions of C would be outside of B, yet
  // there should have been a collision. This can result in interpenetration of
  // objects, with edges crossing, but corners all outside of the other's object.
  // Proximity check:  both new and old corner out of body1 bounding box, on same side
  const distTol = body1.getDistanceTol();
  if (v_body.getX() < body1.getLeftBody() - distTol
        && v_body_old.getX() < body1.getLeftBody()
    || v_body.getX() > body1.getRightBody()+ distTol
        && v_body_old.getX() > body1.getRightBody()
    || v_body.getY() < body1.getBottomBody()- distTol
        && v_body_old.getY() < body1.getBottomBody()
     || v_body.getY() > body1.getTopBody()+ distTol
        && v_body_old.getY() > body1.getTopBody()  )
  {
    /*if (1 == 0 && Util.DEBUG) {
       if (isFinite(body1.getMass()))
         console.log('*** proximity fail v_body='+v_body
                            +' v_body_old='+v_body_old+' body1='+body1);
    }*/
    if (Util.DEBUG && body1.probablyPointInside(v_body)) {
      // sanity check
      throw 'probablyPointInside: '+v_body+' '+body1;
    }
    // no possible collision
    return;
  }
  let debugPenetration = false;
  // This loop is to turn on lots of debugging code during a second pass
  // in the rare case that the bodies are intersecting but we found no collision.
  while (true)   {
    if (Util.DEBUG && debugPenetration) {
      console.log('*****  PROBABLY POINT INSIDE v_body='+v_body);
      // show what Vertexes are being tested
      // type cast needed for NTI?
      const p = body2;
      p.printAll();
      console.log('testCollisionVertex '+body1.getName()+' '+p.getName()
          +' v: '+vertex2.getID());
      console.log('vertex2='+vertex2);
      console.log('v_body='+v_body);
      console.log('v_body_old='+v_body_old);
      console.log('travelDist='+travelDist);
    }
    // edge1 = edge on body1 where we found a collision with vertex2
    let edge1: Edge|null = null;
    // e1_body = intersection point on edge1 in body1 coords
    let e1_body: Vector|null = null;
    // distance from starting corner position to the edge intersection
    // distance from old corner to intersection pt
    let distance_old = Infinity;
    // A corner might pass through multiple edges of an object;
    // we look for the first edge that it passes through.
    body1.getEdges().forEach(e1 => {
      //checkPrint('test edge ', body2, vertex2, e1, v_body);
      if (Util.DEBUG && debugPenetration) {
        console.log('\n===== test edge '+e1);
      }
      if (body2.nonCollideEdge(e1)) {
        return;  // continue to next edge
      }
      // Proximity test:  The vertex2 has moved by travelDist in the last time step.
      // The edge is enclosed by a circle of maxRadius about its centroid.
      // If the vertex2 collided with the a point on periphery of edge,
      // the furthest the vertex2 can be from the centroid is:
      //    maxRadius + travelDist
      // NOTE:  it is unclear if this is really a win; if it is only avoiding the
      // StraightEdge intersection test, then maybe not a win.
      const maxRadius = e1.getCentroidRadius() + distTol + travelDist;
      const maxRadiusSqr = maxRadius * maxRadius;
      if (e1.getCentroidBody().distanceSquaredTo(v_body) > maxRadiusSqr) {
        if (Util.DEBUG && debugPenetration) {
          console.log('not in range '+body2.getName()+' vertex2='+vertex2.getID()
              +' edge1='+e1.getIndex());
          console.log('v_body='+v_body);
          console.log('maxRadiusSqr='+maxRadiusSqr);
          console.log('e1.centroid_body.distanceSquaredTo(v_body)='
              +e1.getCentroidBody().distanceSquaredTo(v_body));
        }
        //checkPrint('not in range, convex ', body2, vertex2, e, v_body);
        return;  // continue to next edge
      }
      if (UtilCollision.HIGHLIGHT_COLLISION_TESTING && Util.DEBUG) {
        e1.highlight();
        vertex2.highlight();
      }
      // Find intersection point(s) of the line from v_body_old (old vertex2 position)
      // to v_body (current vertex2 position) with this edge e1.
      // There can be zero, one or two points of intersection in r1_array,
      // (for example, the line of travel of a vertex could pass thru a circle
      // in two points).
      if (Util.DEBUG && debugPenetration) {
        console.log('v_body='+v_body+' e1='+e1);
      }
      const r1_array = e1.intersection(v_body, v_body_old);
      if (r1_array == null) {
        if (Util.DEBUG && debugPenetration) {
          console.log('!!!!! no intersection found  !!!!!');
          console.log('v_body='+v_body+' v_body_old='+v_body_old);
          console.log('v_body.x='+Util.NFSCI(v_body.getX()));
          console.log('v_body_old.x='+Util.NFSCI(v_body_old.getX()));
          console.log('e1='+e1);
        }
        // There is no collision of vertex2 with this edge e1; next check for contact
        //checkPrint('no intersection found', body2, vertex2, e1, v_body);
        // If its a midpoint vertex (not an end point), then ignore it entirely;
        // the edge/edge contact will deal with this contact.
        if (UtilCollision.DISABLE_MIDPOINT_VERTEX_CONTACT && !vertex2.isEndPoint())
          return;  // continue to next edge
        const c = e1.findVertexContact(vertex2, v_body, distTol);
        if (Util.DEBUG && debugPenetration) {
          console.log('findVertexContact '+c);
        }
        if (c != null) {
          Util.assert(c != null);
          Util.assert(c.primaryBody == body2);
          Util.assert(c.normalBody == body1);
          c.setDetectedTime(time);
          UtilCollision.addCollision(collisions, c);
        }
        return;  // continue to next edge
      }
      Util.assert(v_body != v_body_old);
      /*if (0 == 1 && Util.DEBUG) {
        console.log('r1_array[0]='+r1_array[0]);
      }*/
      //checkPrint('intersection found', body2, vertex2, e, v_body);
      // A vertex could pass thru several edges, but we want only the first edge
      // that it passed thru.
      // When we find a closer intersection point to the old vertex2 position
      // we choose that edge.
      r1_array.forEach(r1b => {
        // r1b = intersection point on edge, in body1 coords
        if (Util.DEBUG && debugPenetration && UtilEngine.debugEngine2D != null) {
          const t = body1.bodyToWorld(r1b);
          UtilEngine.debugEngine2D.debugCircle('dot', t, 0.1);
        }
        // **TO DO**  use distance squared instead -- its faster!
        const d = v_body_old.subtract(r1b).length();
        if (Util.DEBUG && debugPenetration) {
          console.log('distance_old='+distance_old+' d='+d);
        }
        if (d < distance_old) {
          distance_old = d;
          e1_body = r1b;
          edge1 = e1;
          if (Util.DEBUG && debugPenetration) {
            console.log('edge1='+edge1);
          }
        }
      }); // forEach in r1_array
    }); // end of forEach in body1.getEdges()
    // We have found the edge on body1 that the corner of body2 passed thru.
    if (edge1 != null && e1_body != null) {
      // the type-casting is only needed when NOT using NTI compiler option.
      UtilCollision.makeCollision(collisions,
          edge1 as Edge, vertex2,
          e1_body as Vector, v_body, time);
      break;
    } else {
      if (!Util.DEBUG) {
        break;
      } else {
        // No intersection was found.
        // NOTE: we ignore if there is a 'special edge' on this polygon,
        // because it is then a wall and there are likely edges with zero max radius,
        // so are inactive for collisions, so a vertex can reach the inside by going
        // thru those inactive edges.
        // An example is in PileConfig.makeDoubleVPit where two walls overlap,
        // and a vertex collision would not be detected on one wall, but would be
        // detected on the other wall.  So we need to ignore the 'corner is inside'
        // situation and trust that the other overlapping wall will generate a
        // collision.
        // history: Jan 18 2014:  add back the check for special edge which was
        // removed on May 27 2013.

        // both bodies must be Polygon's, because Scrim doesn't collide with anything
        // Util.assert(body1 instanceof Polygon);
        const noSpecialEdge = body1.getSpecialNormalWorld() == null;

        // note May 9 2016: If you make an EdgeRange or EdgeGroup such that two
        // polygons cannot collide, this Error will still occur when the polygons
        // are overlapping. Use RigidBody.addNonCollide instead in that case.
        // (Alternatively, we could disable all these checks somehow, perhaps
        // with an option setting on ImpulseSim).

        // Check whether the point is inside the polygon.
        const probablyInside = noSpecialEdge && body1.probablyPointInside(v_body);
        // If no penetration, then not finding an intersection is OK, so done.
        if (!probablyInside) {
          break;
        }
        // At end of second pass throw an error
        if (debugPenetration) {
          throw 'probablyPointInside: v_body='+v_body
                +'\nvertex2='+vertex2+'\nbody1='+body1+'\nbody2='+body2;
        }
        // There is penetration, but no intersection/collision found -- trouble!
        // Go back thru the above code a second time and print debug info.
        debugPenetration = true;
        console.log('no intersection found;  probablyInside='+probablyInside);
      }
    }
  }
};

// track frequency of various events for performance tuning
/** number of times that an edge-edge collision test occurred*/
static edgeEdgeCollisionTests = 0;

/** Number of times that special normal was requested when it was already calculated.*/
static specialNormalHits = 0;

/** Number of times that special normal was requested when it was not yet calculated.*/
static specialNormalMisses = 0;

/** Number of times the `specialNormal` was rotated to world coords.*/
static specialNormalRotate = 0;

/** number of times that `testCollisionVertex` was called.*/
static vertexBodyCollisionTests = 0;

/** true means don't generate contacts from midpoint Vertexes. */
static readonly DISABLE_MIDPOINT_VERTEX_CONTACT = true;

/** disables all edge/edge contacts and collisions. */
static readonly DISABLE_EDGE_EDGE = false;

/** highlight edges and Vertexes being tested for collisions or contacts */
static readonly HIGHLIGHT_COLLISION_TESTING = false;

} // end UtilCollision class

Util.defineGlobal('lab$engine2D$UtilCollision', UtilCollision);
