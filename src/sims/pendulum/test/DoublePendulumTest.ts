// Copyright 2016 Erik Neumann.  All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ConcreteLine } from '../../../lab/model/ConcreteLine.js';
import { DoublePendulumSim } from '../DoublePendulumSim.js';
import { EnergyInfo } from '../../../lab/model/EnergySystem.js';
import { GenericEvent } from '../../../lab/util/Observe.js';
import { Observer } from '../../../lab/util/Observe.js';
import { ParameterBoolean } from '../../../lab/util/Observe.js';
import { ParameterNumber } from '../../../lab/util/Observe.js';
import { ParameterString } from '../../../lab/util/Observe.js';
import { PointMass } from '../../../lab/model/PointMass.js';
import { SimObject } from '../../../lab/model/SimObject.js';
import { SimpleAdvance } from '../../../lab/model/SimpleAdvance.js';
import { Subject, SubjectEvent } from '../../../lab/util/Observe.js';
import { Util } from '../../../lab/util/Util.js';

import { assertEquals, schedule, startTest, assertThrows,
    assertTrue, assertFalse, assertRoughlyEquals }
    from "../../../test/TestRig.js";

const groupName = 'DoublePendulumTest.';

export default function scheduleTests() {
  schedule(testDoublePendulum);
};

function testDoublePendulum() {
  startTest(groupName+'testDoublePendulum');
  const tol = 1E-15;
  const sim = new DoublePendulumSim();
  const simList = sim.getSimList();
  const simpleAdv = new SimpleAdvance(sim);

  // confirm rods and masses exist
  const bob1 = simList.getPointMass('bob1');
  assertTrue(bob1 instanceof PointMass);
  const bob2 = simList.getPointMass('bob2');
  assertTrue(bob2 instanceof PointMass);
  const rod1 = simList.getConcreteLine('rod1');
  assertTrue(rod1 instanceof ConcreteLine);
  const rod2 = simList.getConcreteLine('rod2');
  assertTrue(rod2 instanceof ConcreteLine);

  // confirm parameters exist
  const rod1LengthParam = sim.getParameterNumber(DoublePendulumSim.en.ROD_1_LENGTH);
  assertEquals('ROD_1_LENGTH', Util.toName(DoublePendulumSim.en.ROD_1_LENGTH));
  assertTrue(rod1LengthParam.nameEquals(DoublePendulumSim.en.ROD_1_LENGTH));
  assertEquals(Util.toName(DoublePendulumSim.en.ROD_1_LENGTH),
      rod1LengthParam.getName());
  assertEquals(1.0, rod1LengthParam.getValue());
  const rod2LengthParam = sim.getParameterNumber(DoublePendulumSim.en.ROD_2_LENGTH);
  assertEquals(Util.toName(DoublePendulumSim.en.ROD_2_LENGTH),
      rod2LengthParam.getName());
  assertEquals(1.0, rod2LengthParam.getValue());
  const mass1Param = sim.getParameterNumber(DoublePendulumSim.en.MASS_1);
  assertEquals(Util.toName(DoublePendulumSim.en.MASS_1), mass1Param.getName());
  assertEquals(2.0, mass1Param.getValue());
  const mass2Param = sim.getParameterNumber(DoublePendulumSim.en.MASS_2);
  assertEquals(Util.toName(DoublePendulumSim.en.MASS_2), mass2Param.getName());
  assertEquals(2.0, mass2Param.getValue());
  const gravityParam = sim.getParameterNumber(DoublePendulumSim.en.GRAVITY);
  assertEquals(Util.toName(DoublePendulumSim.en.GRAVITY),
      gravityParam.getName());
  assertEquals(9.8, gravityParam.getValue());

  const mockObsvr1 = new MockObserver1(sim);
  assertEquals(0, mockObsvr1.numEvents);
  assertEquals(0, mockObsvr1.numBooleans);
  assertEquals(0, mockObsvr1.numDoubles);
  assertEquals(0, mockObsvr1.numStrings);
  // add the observer to the subject
  sim.addObserver(mockObsvr1);
  // there should be only this one observer
  const obsvrs = sim.getObservers();
  assertEquals(1, obsvrs.length);
  assertTrue(obsvrs.includes(mockObsvr1));

  assertEquals(1.0, sim.getRod1Length());
  sim.setRod1Length(1.2);
  assertEquals(1.2, sim.getRod1Length());
  assertEquals(1, mockObsvr1.numDoubles);
  assertEquals(1.0, sim.getRod2Length());
  sim.setRod2Length(0.9);
  assertEquals(0.9, sim.getRod2Length());
  assertEquals(2, mockObsvr1.numDoubles);
  assertEquals(2.0, sim.getMass1());
  sim.setMass1(1.0);
  assertEquals(1.0, sim.getMass1());
  assertEquals(3, mockObsvr1.numDoubles);
  assertEquals(2.0, sim.getMass2());
  sim.setMass2(1.2);
  assertEquals(1.2, sim.getMass2());
  assertEquals(4, mockObsvr1.numDoubles);
  assertEquals(9.8, sim.getGravity());
  sim.setGravity(5.0);
  assertEquals(5.0, sim.getGravity());
  assertEquals(5, mockObsvr1.numDoubles);
  sim.restState();
  {
    const ei = sim.getEnergyInfo();
    assertEquals(0, ei.getPotential());
    assertEquals(0, ei.getTranslational());
    assertEquals(0, ei.getTotalEnergy());
  }
  sim.getVarsList().setValue(0, Math.PI/8);
  sim.saveInitialState();

  const expect = [
    [ 0.39177, -0.07457, 0.00115, 0.09186 ],
    [ 0.38897, -0.14902, 0.00459, 0.18354 ],
    [ 0.38432, -0.22321, 0.01032, 0.27484 ],
    [ 0.37781, -0.29694, 0.01833, 0.36545 ],
    [ 0.36948, -0.36994, 0.02859, 0.45490 ],
    [ 0.35933, -0.44182, 0.04106, 0.54255 ],
    [ 0.34740, -0.51206, 0.05569, 0.62746 ],
    [ 0.33374, -0.57996, 0.07240, 0.70839 ],
    [ 0.31843, -0.64463, 0.09106, 0.78374 ],
    [ 0.30155, -0.70497, 0.11152, 0.85156 ]
  ];

  // step to time zero to ensure energy is updated
  simpleAdv.advance(0);
  {
    const ei = sim.getEnergyInfo();
    assertEquals(1.004790170851014, ei.getPotential());
    assertEquals(0, ei.getTranslational());
    assertEquals(ei.getPotential(), ei.getTotalEnergy());
  }
  // step forward in time
  const timeStep = 0.025;
  let time = 0;
  for (let i=0; i<10; i++) {
    simpleAdv.advance(timeStep);
    time += timeStep;
    assertRoughlyEquals(time, sim.getTime(), tol);
    const vars = sim.getVarsList().getValues(/*computed=*/true);
    // check expected values
    for (let j=0; j<4; j++) {
      assertRoughlyEquals(expect[i][j], vars[j], 2E-5);
    }
    // check that energy is constant
    assertRoughlyEquals(1.0047901623242046, vars[8], 2E-5);
    //console.log('time='+Util.NF5(sim.getVarsList().getTime()));
    //Util.printArray(sim.getVarsList().getValues(/*computed=*/true));
  }

  sim.setPEOffset(99 - sim.getEnergyInfo().getPotential());
  {
    const ei = sim.getEnergyInfo();
    assertEquals(99, ei.getPotential());
    assertRoughlyEquals(0.37563230349452903, ei.getTranslational(), 1e-10);
  }
};

/**  Observer that counts number of times that parameters are changed or events fire.
*/
class MockObserver1 implements Observer {
    sim: Subject;
    numEvents: number = 0;
    numBooleans: number = 0;
    numDoubles: number = 0;
    numStrings: number = 0;

  /**
  * @param sim
  */
  constructor(sim: Subject) {
    this.sim = sim;
  };

  /** @inheritDoc */
  observe(event: SubjectEvent): void {
    if (event instanceof GenericEvent) {
      this.numEvents++;
      assertEquals(this.sim, event.getSubject());
    } else if (event instanceof ParameterBoolean) {
      this.numBooleans++;
      assertEquals(this.sim, event.getSubject());
      const val = event.getValue();
      assertTrue(typeof val === 'boolean');
    } else if (event instanceof ParameterNumber) {
      this.numDoubles++;
      assertEquals(this.sim, event.getSubject());
      const val = event.getValue();
      assertTrue(typeof val === 'number');
    } else if (event instanceof ParameterString) {
      this.numStrings++;
      assertEquals(this.sim, event.getSubject());
      assertTrue(typeof event.getValue() === 'string');
    }
  };

  /** @inheritDoc */
  toStringShort() {
    return 'MockObserver1';
  };
} // end class

