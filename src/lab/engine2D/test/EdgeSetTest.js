import { EdgeRange, EdgeGroup } from '../EdgeSet.js';
import { Shapes } from '../Shapes.js';
import { schedule, startTest, assertTrue } from "../../../test/TestRig.js";
export default function scheduleTests() {
    schedule(testEdgeSet1);
}
;
function testEdgeSet1() {
    startTest(groupName + 'testEdgeSet1');
    const body1 = Shapes.makeBlock(1, 1);
    const body2 = Shapes.makeBall(0.5);
    const body3 = Shapes.makeHexagon(0.5);
    const edgeGroup = new EdgeGroup(EdgeRange.fromRigidBody(body1));
    edgeGroup.add(EdgeRange.fromRigidBody(body2));
    body3.setNonCollideEdge(edgeGroup);
    const b2 = body2.getEdges();
    for (let j = 0; j < b2.length; j++) {
        assertTrue(body3.nonCollideEdge(b2[j]));
    }
    const b1 = body1.getEdges();
    for (let j = 0; j < b1.length; j++) {
        assertTrue(body3.nonCollideEdge(b1[j]));
    }
}
;
const groupName = 'EdgeSetTest.';
