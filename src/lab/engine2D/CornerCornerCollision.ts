

import { RigidBodyCollision } from './RigidBody.js';
import { Util } from '../util/Util.js';
import { Edge, Vertex } from './RigidBody.js';

/** A {@link RigidBodyCollision} between two corner {@link Vertex}'s.
*/
export class CornerCornerCollision extends RigidBodyCollision {
  /** the vertex of the primary object */
  private vertex: Vertex;
  /** vertex on normal body for a vertex/vertex collision */
  private normalVertex: Vertex;

/**
* @param vertex
* @param normalVertex
*/
constructor(vertex: Vertex, normalVertex: Vertex) {
  const v_edge = vertex.getEdge1();
  const nv_edge = normalVertex.getEdge1();
  if (v_edge == null || nv_edge == null) {
    throw "CornerCornerCollision: null edge; vertex="+vertex
      +"; normalVertex="+normalVertex;
  }
  super(v_edge.getBody(), nv_edge.getBody(), /*joint=*/false);
  this.vertex = vertex;
  this.normalVertex = normalVertex;
};

/** @inheritDoc */
override toString() {
  return super.toString().slice(0, -1)
      +', vertex-ID: '+ this.vertex.getID()
      +', normalVertex-ID: '+ this.normalVertex.getID()
      + '}';
};

/** @inheritDoc */
getClassName(): string {
  return 'CornerCornerCollision';
};

/** @inheritDoc */
override checkConsistent(): void {
  super.checkConsistent();
  Util.assert(this.normalVertex != null);
};

/** @inheritDoc */
hasEdge(_edge: null|Edge): boolean {
  return false;  // no edges involved here, just corners
};

/** @inheritDoc */
hasVertex(v: Vertex): boolean {
  return v == this.vertex || v == this.normalVertex;
};

/** @inheritDoc */
similarTo(c: RigidBodyCollision): boolean {
  if (!c.hasBody(this.primaryBody) || !c.hasBody(this.normalBody)) {
    return false;
  }
  if (c.hasVertex(this.vertex) || c.hasVertex(this.normalVertex)) {
    // both collisions involve same bodies and same vertex
    return true;
  }
  return false;
};

/** @inheritDoc */
override updateCollision(time: number): void {
  Util.assert( this.normalVertex != null );
  const pbw = this.primaryBody.bodyToWorld(this.vertex.locBody());
  const pnb = this.normalBody.worldToBody(pbw);
  this.impact1 = this.normalBody.bodyToWorld(this.normalVertex.locBody());
  this.distance = this.normalVertex.locBody().distanceTo(pnb);
  if (!isFinite(this.distance)) {
    throw '';
  }
  // nw = normal in world coords
  const nv = pnb.subtract(this.normalVertex.locBody()).normalize();
  if (nv == null) {
    throw '';
  }
  this.normal = this.normalBody.rotateBodyToWorld(nv);
  super.updateCollision(time);
};

} // end CornerCornerCollision class
Util.defineGlobal('lab$engine2D$CornerCornerCollision', CornerCornerCollision);
