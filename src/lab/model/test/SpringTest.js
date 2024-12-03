import { Vector } from '../../util/Vector.js';
import { PointMass } from '../PointMass.js';
import { Spring } from '../Spring.js';
import { MutableVector } from '../../util/MutableVector.js';
import { assertEquals, schedule, startTest, assertTrue, assertFalse, assertRoughlyEquals } from "../../../test/TestRig.js";
export default function scheduleTests() {
    schedule(testSpring);
    schedule(testSpringCompressOnly);
}
;
function testSpring() {
    startTest(groupName + 'testSpring');
    const tol = 1E-15;
    const p1 = PointMass.makeCircle(1, 'point1');
    p1.setMass(2);
    p1.setPosition(new Vector(0, 1));
    const p2 = PointMass.makeCircle(1, 'point2');
    p2.setMass(0.5);
    p2.setPosition(new Vector(2, 0));
    {
        const v1 = new Vector(0, -2);
        const fixedPt = PointMass.makeCircle(1, 'fixed');
        fixedPt.setMass(Infinity);
        fixedPt.setPosition(v1);
        const s1 = new Spring('spring1', fixedPt, Vector.ORIGIN, p2, Vector.ORIGIN, 2, 12);
        assertFalse(s1.isMassObject());
        assertEquals(Vector.ORIGIN, s1.getAttach1());
        assertEquals(Vector.ORIGIN, s1.getAttach2());
        assertEquals('SPRING1', s1.getName());
        assertTrue(s1.nameEquals('spring1'));
        assertEquals(2, s1.getRestLength());
        assertEquals(12, s1.getStiffness());
        assertRoughlyEquals(Math.sqrt(8), s1.getLength(), tol);
        const stretch = Math.sqrt(8) - 2;
        assertRoughlyEquals(stretch, s1.getStretch(), tol);
        assertRoughlyEquals(6 * stretch * stretch, s1.getPotentialEnergy(), tol);
        assertTrue(s1.getStartPoint().equals(v1));
        assertTrue(s1.getEndPoint().equals(p2.getPosition()));
        assertTrue(s1.getAttach2().equals(Vector.ORIGIN));
        p2.setPosition(new Vector(1, 0));
        assertEquals(1, s1.getEndPoint().getX());
        assertEquals(0, s1.getEndPoint().getY());
        assertRoughlyEquals(Math.sqrt(5), s1.getLength(), tol);
    }
    {
        const s1 = new Spring('spring1', p1, Vector.ORIGIN, p2, Vector.ORIGIN, 2, 12);
        assertEquals(Vector.ORIGIN, s1.getAttach1());
        assertEquals(0, s1.getStartPoint().getX());
        assertEquals(1, s1.getStartPoint().getY());
        assertRoughlyEquals(Math.sqrt(2), s1.getLength(), tol);
    }
    {
        const s1 = new Spring('spring1', p1, new Vector(0, -1), p2, Vector.ORIGIN, 2, 12);
        assertEquals(0, s1.getStartPoint().getX());
        assertEquals(0, s1.getStartPoint().getY());
    }
    {
        const v2 = new Vector(1, 1);
        const s1 = new Spring('spring1', p1, new Vector(0, -1), p2, v2, 2, 12);
        assertTrue(v2.equals(s1.getAttach2()));
        assertEquals(2, s1.getEndPoint().getX());
        assertEquals(1, s1.getEndPoint().getY());
        assertRoughlyEquals(Math.sqrt(5), s1.getLength(), tol);
    }
    {
        const mv1 = new MutableVector(0, -1);
        const s1 = new Spring('spring1', p1, new Vector(0, -1), p2, mv1, 2, 12);
        assertTrue(mv1.equals(s1.getAttach2()));
        assertEquals(1, s1.getEndPoint().getX());
        assertEquals(-1, s1.getEndPoint().getY());
        assertRoughlyEquals(Math.sqrt(2), s1.getLength(), tol);
    }
}
;
function testSpringCompressOnly() {
    startTest(groupName + 'testSpringCompressOnly');
    const tol = 1E-15;
    const p1 = PointMass.makeCircle(1, 'point1');
    p1.setMass(2);
    p1.setPosition(new Vector(1, 1));
    const p2 = PointMass.makeCircle(1, 'point2');
    p2.setMass(0.5);
    p2.setPosition(new Vector(3, 0));
    {
        const v1 = new Vector(0, 0);
        const fixedPt = PointMass.makeCircle(1, 'fixed');
        fixedPt.setMass(Infinity);
        fixedPt.setPosition(v1);
        const s1 = new Spring('spring1', fixedPt, Vector.ORIGIN, p2, Vector.ORIGIN, 2, 12, true);
        assertEquals(Vector.ORIGIN, s1.getAttach1());
        assertEquals(Vector.ORIGIN, s1.getAttach2());
        assertEquals('SPRING1', s1.getName());
        assertTrue(s1.nameEquals('spring1'));
        assertEquals(2, s1.getRestLength());
        assertEquals(12, s1.getStiffness());
        assertRoughlyEquals(2, s1.getLength(), tol);
        assertRoughlyEquals(0, s1.getStretch(), tol);
        assertRoughlyEquals(0, s1.getPotentialEnergy(), tol);
        assertEquals(0, s1.getStartPoint().getX());
        assertEquals(0, s1.getStartPoint().getY());
        assertEquals(2, s1.getEndPoint().getX());
        assertEquals(0, s1.getEndPoint().getY());
        p2.setPosition(new Vector(2, 2));
        assertRoughlyEquals(2, s1.getLength(), tol);
        assertRoughlyEquals(0, s1.getStretch(), tol);
        assertRoughlyEquals(0, s1.getPotentialEnergy(), tol);
        assertRoughlyEquals(Math.sqrt(2), s1.getEndPoint().getX(), tol);
        assertRoughlyEquals(Math.sqrt(2), s1.getEndPoint().getY(), tol);
        p2.setPosition(new Vector(0, 1));
        assertRoughlyEquals(1, s1.getLength(), tol);
        assertRoughlyEquals(-1, s1.getStretch(), tol);
        assertRoughlyEquals(6, s1.getPotentialEnergy(), tol);
        assertTrue(s1.getEndPoint().equals(p2.getPosition()));
    }
    {
        const s1 = new Spring('spring1', p1, Vector.ORIGIN, p2, Vector.ORIGIN, 2, 12, true);
        assertRoughlyEquals(1, s1.getLength(), tol);
        assertRoughlyEquals(-1, s1.getStretch(), tol);
        assertRoughlyEquals(6, s1.getPotentialEnergy(), tol);
        assertTrue(s1.getEndPoint().equals(p2.getPosition()));
        p2.setPosition(new Vector(-2, -2));
        assertRoughlyEquals(2, s1.getLength(), tol);
        assertRoughlyEquals(0, s1.getStretch(), tol);
        assertRoughlyEquals(0, s1.getPotentialEnergy(), tol);
        assertRoughlyEquals(1 - Math.sqrt(2), s1.getEndPoint().getX(), tol);
        assertRoughlyEquals(1 - Math.sqrt(2), s1.getEndPoint().getY(), tol);
        assertEquals(1, s1.getStartPoint().getX());
        assertEquals(1, s1.getStartPoint().getY());
    }
}
;
const groupName = 'SpringTest.';
