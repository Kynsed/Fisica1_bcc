import { CircularEdge } from '../CircularEdge.js';
import { ConcreteVertex } from '../ConcreteVertex.js';
import { Polygon } from '../Polygon.js';
import { Vector } from '../../util/Vector.js';
import { assertEquals, schedule, startTest, assertTrue } from "../../../test/TestRig.js";
export default function scheduleTests() {
    schedule(testCircularEdge1);
}
;
function testCircularEdge1() {
    startTest(groupName + 'testCircularEdge1');
    const vec2 = new Vector(2, 0);
    const vertex2 = new ConcreteVertex(vec2, true);
    const poly1 = new Polygon('test1');
    const vertex1 = new ConcreteVertex(new Vector(0, 2));
    poly1.startPath(vertex1);
    const edge1 = new CircularEdge(poly1, vertex1, vertex2, Vector.ORIGIN, true, true);
    assertEquals(vertex1, edge1.getVertex1());
    assertEquals(vertex2, edge1.getVertex2());
    assertEquals(2.0, edge1.getCurvature(vec2));
    assertTrue(edge1.getNormalBody(vec2).nearEqual(Vector.EAST));
    assertTrue(edge1.getNormalBody(new Vector(0, 2)).equals(Vector.NORTH));
    assertEquals(-2.0, edge1.distanceToPoint(Vector.ORIGIN));
    assertEquals(2.0, edge1.distanceToPoint(new Vector(4, 0)));
    assertEquals(1.0, edge1.distanceToPoint(new Vector(0, 3)));
    assertEquals(0, edge1.getLeftBody());
    assertEquals(2.0, edge1.getRightBody());
    assertEquals(2.0, edge1.getTopBody());
    assertEquals(0, edge1.getBottomBody());
}
;
const groupName = 'CircularEdgeTest.';
