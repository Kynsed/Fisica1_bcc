import { Vector } from "../Vector.js";
import { MutableVector } from "../MutableVector.js";
import { assertEquals, schedule, startTest, assertTrue, assertFalse, assertRoughlyEquals } from "../../../test/TestRig.js";
const groupName = 'MutableVector.';
export default function tests() {
    schedule(testMutableVector);
    schedule(testMutableVectorSimilar);
}
;
function testMutableVector() {
    startTest(groupName + 'testMutableVector');
    const v1 = new MutableVector(20, 30);
    assertEquals(20, v1.getX());
    assertEquals(30, v1.getY());
    assertTrue(v1.equals(new Vector(20, 30)));
    const v2 = new Vector(1, 1);
    v1.add(v2);
    assertEquals(21, v1.getX());
    assertEquals(31, v1.getY());
    const v3 = MutableVector.clone(v2);
    assertEquals(1.0, v3.getX());
    assertEquals(1.0, v3.getY());
    assertTrue(v3.equals(v2));
    assertTrue(v2.equals(v3));
    v3.multiply(2);
    assertEquals(2.0, v3.getX());
    assertEquals(2.0, v3.getY());
    assertFalse(v3.equals(v2));
    assertFalse(v2.equals(v3));
    assertRoughlyEquals(Math.sqrt(8), v3.length(), 1E-15);
    v3.subtract(v2);
    assertEquals(1.0, v3.getX());
    assertEquals(1.0, v3.getY());
    assertRoughlyEquals(v3.length(), v3.distanceTo(Vector.ORIGIN), 1E-15);
    const v6 = v3.normalize();
    assertRoughlyEquals(1.0, v6.length(), 1E-15);
    assertEquals(v6.getX(), v6.getY());
}
;
function testMutableVectorSimilar() {
    startTest(groupName + 'testMutableVectorSimilar');
    const v1 = new MutableVector(2, 3, 4);
    const v2 = new MutableVector(2.01, 3.02, 4.015);
    assertTrue(v1.nearEqual(v2, 0.03));
    assertTrue(v1.nearEqual(v2, 0.01));
    assertFalse(v1.nearEqual(v2, 0.001));
}
;
