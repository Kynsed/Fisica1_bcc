import { EnergyInfo } from '../EnergySystem.js';
import { assertEquals, schedule, startTest, assertNaN } from "../../../test/TestRig.js";
export default function scheduleTests() {
    schedule(testEnergyInfo1);
}
;
function testEnergyInfo1() {
    startTest(groupName + 'testEnergyInfo1');
    const e1 = new EnergyInfo();
    assertEquals(0, e1.getPotential());
    assertEquals(0, e1.getTranslational());
    assertNaN(e1.getRotational());
    assertNaN(e1.getWorkDone());
    assertNaN(e1.getInitialEnergy());
    assertEquals(0, e1.getTotalEnergy());
    e1.setPotential(3);
    e1.setTranslational(2);
    e1.setRotational(1);
    e1.setWorkDone(5);
    e1.setInitialEnergy(10);
    assertEquals(1, e1.getRotational());
    assertEquals(6, e1.getTotalEnergy());
    assertEquals(5, e1.getWorkDone());
    assertEquals(10, e1.getInitialEnergy());
    const e2 = new EnergyInfo(-10, 2);
    assertEquals(-8, e2.getTotalEnergy());
    const e3 = new EnergyInfo(6, 4, 2);
    assertEquals(12, e3.getTotalEnergy());
    const e4 = new EnergyInfo(6, 4, 2, 100, 200);
    assertEquals(12, e4.getTotalEnergy());
    assertEquals(100, e4.getWorkDone());
    assertEquals(200, e4.getInitialEnergy());
}
;
const groupName = 'EnergyInfoTest.';
