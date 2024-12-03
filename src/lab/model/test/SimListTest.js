import { Vector } from '../../util/Vector.js';
import { ConcreteLine } from '../ConcreteLine.js';
import { PointMass, ShapeType } from '../PointMass.js';
import { Spring } from '../Spring.js';
import { SimList } from '../SimList.js';
import { assertEquals, schedule, startTest, assertThrows, assertTrue, assertFalse, assertNull } from "../../../test/TestRig.js";
export default function scheduleTests() {
    schedule(testSimList);
    schedule(testSimListThrows);
}
;
function testSimList() {
    startTest(groupName + 'testSimList');
    const myMockObserver = new MockObserver1();
    const p1 = PointMass.makeCircle(1, 'point1');
    p1.setPosition(new Vector(2, -2));
    const p2 = PointMass.makeCircle(1, 'point2');
    p2.setPosition(new Vector(2.01, -2.02));
    const l1 = new ConcreteLine('line1');
    l1.setStartPoint(new Vector(2, 0));
    l1.setEndPoint(new Vector(0, 2));
    l1.setExpireTime(3);
    const l2 = new ConcreteLine('line2');
    l2.setStartPoint(new Vector(2.01, 0.01));
    l2.setEndPoint(new Vector(0.02, 2.02));
    l2.setExpireTime(3);
    const l3 = new ConcreteLine('line3');
    l3.setStartPoint(new Vector(2.01, 0.01));
    l3.setEndPoint(new Vector(0.02, 2.02));
    l3.setExpireTime(3);
    const l4 = new ConcreteLine('line4');
    l4.setStartPoint(new Vector(20, 20));
    l4.setEndPoint(new Vector(40, 40));
    l4.setExpireTime(3);
    const s1 = new Spring('spring1', p1, Vector.ORIGIN, p2, Vector.ORIGIN, 2, 12);
    const r1 = PointMass.makeRectangle(3, 2, 'rect1');
    r1.setMass(2);
    const simList = new SimList();
    assertEquals(0.1, simList.getTolerance());
    assertEquals(0, simList.length());
    simList.addObserver(myMockObserver);
    simList.add(p1);
    assertEquals(1, simList.length());
    simList.add(p2);
    assertEquals(2, simList.length());
    simList.add(l3, s1);
    assertEquals(4, simList.length());
    simList.add(r1);
    assertEquals(5, simList.length());
    assertTrue(l1.similar(l3, 0.1));
    assertEquals(l3, simList.getSimilar(l1));
    simList.add(l1);
    assertEquals(5, simList.length());
    assertFalse(simList.contains(l3));
    assertEquals(p1, simList.get(0));
    assertEquals(p2, simList.get(1));
    assertEquals(s1, simList.get(2));
    assertEquals(r1, simList.get(3));
    assertEquals(l1, simList.get(4));
    assertEquals(0, simList.indexOf(p1));
    assertEquals(1, simList.indexOf(p2));
    assertEquals(2, simList.indexOf(s1));
    assertEquals(3, simList.indexOf(r1));
    assertEquals(4, simList.indexOf(l1));
    assertTrue(simList.contains(p1));
    assertTrue(simList.contains(p2));
    assertTrue(simList.contains(l1));
    assertTrue(simList.contains(s1));
    assertTrue(simList.contains(r1));
    assertEquals(p1, simList.get('point1'));
    assertEquals(p1, simList.getPointMass('point1'));
    assertEquals(p2, simList.get('point2'));
    assertEquals(p2, simList.getPointMass('point2'));
    assertEquals(l1, simList.get('line1'));
    assertEquals(l1, simList.getConcreteLine('line1'));
    assertEquals(s1, simList.get('spring1'));
    assertEquals(s1, simList.getSpring('spring1'));
    assertEquals(r1, simList.get('rect1'));
    assertEquals(r1, simList.getPointMass('rect1'));
    assertEquals(l1, simList.getSimilar(l2, 0.05));
    assertNull(simList.getSimilar(l2, 0.01));
    assertEquals(2, myMockObserver.numPoints);
    assertEquals(1, myMockObserver.numLines);
    assertEquals(1, myMockObserver.numSprings);
    assertEquals(1, myMockObserver.numRectangles);
    simList.removeObserver(myMockObserver);
    simList.add(l4);
    assertEquals(1, myMockObserver.numLines);
    simList.remove(l4);
    assertEquals(1, myMockObserver.numLines);
    simList.addObserver(myMockObserver);
    simList.add(l4);
    assertTrue(simList.contains(l4));
    assertEquals(2, myMockObserver.numLines);
    simList.removeTemporary(10);
    assertFalse(simList.contains(l4));
    assertThrows(() => simList.get('line4'));
    assertEquals(0, myMockObserver.numLines);
    simList.clear();
    assertEquals(0, simList.toArray().length);
    assertEquals(0, myMockObserver.numPoints);
    assertEquals(0, myMockObserver.numLines);
    assertEquals(0, myMockObserver.numSprings);
    assertEquals(0, myMockObserver.numRectangles);
}
;
function testSimListThrows() {
    startTest(groupName + 'testSimListThrows');
    const simList = new SimList();
    const e = assertThrows(() => simList.add(null));
    assertTrue(typeof e === 'string');
    assertEquals('cannot add invalid SimObject', e);
    const p1 = new PointMass('point1');
    simList.add(p1);
    assertEquals(p1, simList.get('point1'));
    assertEquals(p1, simList.getPointMass('point1'));
    assertThrows(() => simList.getSpring('point1'));
    assertThrows(() => simList.getConcreteLine('point1'));
    assertThrows(() => simList.get(p1));
    assertThrows(() => simList.get([0]));
    assertThrows(() => simList.get(true));
}
;
const groupName = 'SimListTest.';
export class MockObserver1 {
    constructor() {
        this.numPoints = 0;
        this.numRectangles = 0;
        this.numLines = 0;
        this.numSprings = 0;
    }
    ;
    observe(event) {
        const obj = event.getValue();
        if (event.nameEquals(SimList.OBJECT_ADDED)) {
            if (obj instanceof Spring) {
                this.numSprings++;
            }
            else if (obj instanceof PointMass) {
                const pm = obj;
                if (pm.getShape() == ShapeType.OVAL) {
                    this.numPoints++;
                }
                else if (pm.getShape() == ShapeType.RECTANGLE) {
                    this.numRectangles++;
                }
            }
            else if (obj instanceof ConcreteLine) {
                this.numLines++;
            }
        }
        else if (event.nameEquals(SimList.OBJECT_REMOVED)) {
            if (obj instanceof Spring) {
                this.numSprings--;
            }
            else if (obj instanceof PointMass) {
                const pm = obj;
                if (pm.getShape() == ShapeType.OVAL) {
                    this.numPoints--;
                }
                else if (pm.getShape() == ShapeType.RECTANGLE) {
                    this.numRectangles--;
                }
            }
            else if (obj instanceof ConcreteLine) {
                this.numLines--;
            }
        }
    }
    ;
    toStringShort() {
        return 'MockObserver1';
    }
    ;
}
