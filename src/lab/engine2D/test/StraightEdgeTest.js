import { ConcreteVertex } from '../ConcreteVertex.js';
import { Polygon } from '../Polygon.js';
import { StraightEdge } from '../StraightEdge.js';
import { Vector } from '../../util/Vector.js';
import { assertEquals, schedule, startTest } from "../../../test/TestRig.js";
export default function scheduleTests() {
    schedule(testStraightEdge1);
}
;
function testStraightEdge1() {
    startTest(groupName + 'testStraightEdge1');
    const poly1 = new Polygon('test1');
    const vertex1 = new ConcreteVertex(new Vector(0, 0));
    const vertex2 = new ConcreteVertex(new Vector(1, 2), true);
    poly1.startPath(vertex1);
    const edge1 = new StraightEdge(poly1, vertex1, vertex2, true);
    assertEquals(vertex1, edge1.getVertex1());
    assertEquals(vertex2, edge1.getVertex2());
}
;
const groupName = 'StraightEdgeTest.';
