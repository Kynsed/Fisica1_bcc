import { ConcreteVertex } from '../ConcreteVertex.js';
import { Vector } from '../../util/Vector.js';
import { assertEquals, schedule, startTest, assertTrue } from "../../../test/TestRig.js";
export default function scheduleTests() {
    schedule(testVertex1);
}
;
function testVertex1() {
    startTest(groupName + 'testVertex1');
    const vec1 = new Vector(2, 1);
    const vertex1 = new ConcreteVertex(vec1, true);
    assertEquals(vec1, vertex1.locBody());
    assertTrue(vertex1.isEndPoint());
}
;
const groupName = 'VertexTest.';
