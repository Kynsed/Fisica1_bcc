import { assertEquals, schedule, startTest, assertTrue, assertFalse, assertRoughlyEquals } from "../../../test/TestRig.js";
import { MockClock } from "../../../test/MockClock.js";
import { Timer } from "../Timer.js";
const groupName = 'TimerTest.';
export default function scheduleTests() {
    schedule(testTimer1);
    schedule(testTimer2);
    schedule(testTimer3);
    schedule(testTimer4);
    schedule(testTimer5);
    schedule(testTimer6);
    schedule(testTimer7);
}
;
function testTimer1() {
    startTest(groupName + 'testTimer1');
    const tol = 1E-14;
    const mockClock = new MockClock();
    let testVar = 0;
    const myTimer = new Timer(true, mockClock);
    myTimer.setCallBack(() => testVar++);
    assertRoughlyEquals(0, myTimer.getPeriod(), 0.001);
    assertFalse(myTimer.isFiring());
    mockClock.tick(1000);
    assertEquals(0, testVar);
    myTimer.startFiring();
    assertTrue(myTimer.isFiring());
    mockClock.tick(1000);
    assertEquals(59, testVar);
    myTimer.stopFiring();
    mockClock.tick(1000);
    assertEquals(59, testVar);
    myTimer.startFiring();
    mockClock.tick(1000);
    assertEquals(118, testVar);
    myTimer.setCallBack(null);
    assertFalse(myTimer.isFiring());
    myTimer.startFiring();
    assertTrue(myTimer.isFiring());
    mockClock.tick(1000);
    assertEquals(118, testVar);
}
;
function testTimer2() {
    startTest(groupName + 'testTimer2');
    const tol = 1E-14;
    const mockClock = new MockClock();
    let testVar = 0;
    const myTimer = new Timer(false, mockClock);
    myTimer.setCallBack(() => testVar++);
    myTimer.setPeriod(0.03);
    mockClock.tick(1000);
    assertEquals(0, testVar);
    myTimer.startFiring();
    mockClock.tick(1000);
    assertEquals(34, testVar);
    myTimer.stopFiring();
    mockClock.tick(1000);
    assertEquals(34, testVar);
    myTimer.startFiring();
    mockClock.tick(1000);
    assertEquals(68, testVar);
}
;
function testTimer3() {
    startTest(groupName + 'testTimer3');
    const tol = 1E-14;
    const mockClock = new MockClock();
    let testVar = 0;
    const myTimer = new Timer(true, mockClock);
    myTimer.setCallBack(() => testVar++);
    myTimer.setPeriod(1 / 30);
    assertRoughlyEquals(1 / 30, myTimer.getPeriod(), 0.001);
    mockClock.tick(1000);
    assertEquals(0, testVar);
    myTimer.startFiring();
    mockClock.tick(1000);
    assertEquals(30, testVar);
    myTimer.stopFiring();
    mockClock.tick(1000);
    assertEquals(30, testVar);
    myTimer.startFiring();
    mockClock.tick(1000);
    assertEquals(60, testVar);
}
;
function testTimer4() {
    startTest(groupName + 'testTimer4');
    const tol = 1E-14;
    const mockClock = new MockClock();
    let testVar = 0;
    const myTimer = new Timer(false, mockClock);
    myTimer.setCallBack(() => testVar++);
    myTimer.setPeriod(1 / 25);
    assertRoughlyEquals(1 / 25, myTimer.getPeriod(), 0.001);
    mockClock.tick(1000);
    assertEquals(0, testVar);
    myTimer.startFiring();
    mockClock.tick(1000);
    assertEquals(26, testVar);
    myTimer.stopFiring();
    mockClock.tick(1000);
    assertEquals(26, testVar);
    myTimer.startFiring();
    mockClock.tick(1000);
    assertEquals(52, testVar);
}
;
function testTimer5() {
    startTest(groupName + 'testTimer5');
    const tol = 1E-14;
    const mockClock = new MockClock();
    let testVar = 0;
    const myTimer = new Timer(false, mockClock);
    myTimer.setCallBack(() => testVar++);
    assertRoughlyEquals(0, myTimer.getPeriod(), 0.001);
    mockClock.tick(1000);
    assertEquals(0, testVar);
    myTimer.startFiring();
    mockClock.tick(1000);
    assertEquals(51, testVar);
    myTimer.stopFiring();
    mockClock.tick(1000);
    assertEquals(51, testVar);
    myTimer.startFiring();
    mockClock.tick(1000);
    assertEquals(102, testVar);
}
;
function testTimer6() {
    startTest(groupName + 'testTimer6');
    const tol = 1E-14;
    const mockClock = new MockClock();
    let testVar = 0;
    const myTimer = new Timer(true, mockClock);
    myTimer.setCallBack(() => testVar++);
    myTimer.setPeriod(1 / 40);
    assertRoughlyEquals(1 / 40, myTimer.getPeriod(), 0.001);
    mockClock.tick(1000);
    assertEquals(0, testVar);
    myTimer.startFiring();
    mockClock.tick(1000);
    assertEquals(41, testVar);
    myTimer.stopFiring();
    mockClock.tick(1000);
    assertEquals(41, testVar);
    myTimer.startFiring();
    mockClock.tick(1000);
    assertEquals(82, testVar);
}
;
function testTimer7() {
    startTest(groupName + 'testTimer7');
    const tol = 1E-14;
    const mockClock = new MockClock();
    let testVar = 0;
    const myTimer = new Timer(undefined, mockClock);
    myTimer.setCallBack(() => testVar++);
    myTimer.setPeriod(1 / 40);
    assertRoughlyEquals(1 / 40, myTimer.getPeriod(), 0.001);
    mockClock.tick(1000);
    assertEquals(0, testVar);
    myTimer.startFiring();
    mockClock.tick(1000);
    assertEquals(41, testVar);
    myTimer.stopFiring();
    mockClock.tick(1000);
    assertEquals(41, testVar);
    myTimer.startFiring();
    mockClock.tick(1000);
    assertEquals(82, testVar);
}
;