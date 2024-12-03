import { Vector } from "../Vector.js";
import { MutableVector } from "../MutableVector.js";
import { assertEquals, schedule, startTest, assertThrows, assertTrue, assertFalse, assertRoughlyEquals } from "../../../test/TestRig.js";
const groupName = 'VectorTest.';
export default function vectorTests() {
    schedule(testVector);
    schedule(testVectorSimilar);
    schedule(testVectorMath);
}
;
function testVector() {
    startTest(groupName + 'testVector');
    const v1 = new Vector(2.1, 3.2);
    assertEquals(2.1, v1.getX());
    assertEquals(3.2, v1.getY());
    const v2 = new Vector(1, 1);
    assertRoughlyEquals(Math.sqrt(2), v2.length(), 1E-15);
    assertEquals(1.0, v2.getX());
    assertEquals(1.0, v2.getY());
    assertTrue(v2.equals(new MutableVector(1, 1)));
    const v3 = v1.add(v2);
    assertEquals(3.1, v3.getX());
    assertEquals(4.2, v3.getY());
    const v4 = v2.multiply(2);
    assertEquals(2.0, v4.getX());
    assertRoughlyEquals(Math.sqrt(8), v4.length(), 1E-15);
    const v5 = v4.subtract(v4);
    assertEquals(0.0, v5.getX());
    assertEquals(0.0, v5.getY());
    assertTrue(v5.equals(Vector.ORIGIN));
    assertRoughlyEquals(v4.length(), v4.distanceTo(Vector.ORIGIN), 1E-15);
    const v6 = v4.normalize();
    assertRoughlyEquals(1.0, v6.length(), 1E-15);
    assertEquals(v6.getX(), v6.getY());
    const v7 = Vector.clone(v6);
    assertTrue(v7.equals(v6));
    assertTrue(v6.equals(v7));
    assertThrows(() => new Vector(NaN, NaN));
    assertThrows(() => new Vector(1, NaN));
    assertThrows(() => new Vector(NaN, 1));
}
;
function testVectorSimilar() {
    startTest(groupName + 'testVectorSimilar');
    const v1 = new Vector(2, 3);
    const v2 = new Vector(2.01, 3.02);
    assertTrue(v1.nearEqual(v2, 0.01));
    assertFalse(v1.nearEqual(v2, 0.003));
    assertFalse(v1.nearEqual(v2));
}
;
function testVectorMath() {
    startTest(groupName + 'testVectorMath');
    const v1 = new Vector(2, 3);
    const v2 = new Vector(1, 1);
    assertRoughlyEquals(5, v1.dotProduct(v2), 1E-15);
}
;
