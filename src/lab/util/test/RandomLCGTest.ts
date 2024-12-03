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

import { RandomLCG } from "../Random.js";
import { Util } from "../Util.js";
import { assertEquals, schedule, startTest, assertThrows,
    assertTrue, assertFalse, assertRoughlyEquals }
    from "../../../test/TestRig.js";

const groupName = 'RandomLCGTest.';

export default function scheduleTests() {
  schedule(testRandom1);
  schedule(testRandom2);
};

function testRandom1() {
  startTest(groupName+'testRandom1');

  const exp = [1013904223, 1196435762, 3519870697, 2868466484, 1649599747, 2670642822,
  1476291629, 2748932008, 2180890343, 2498801434, 3421909937, 3167820124, 2636375307,
  3801544430, 28987765, 2210837584, 3039689583, 1338634754, 1649346937, 2768872580,
  2254235155, 2326606934, 1719328701, 1061592568, 53332215, 1140036074, 4224358465,
  2629538988, 1946028059, 573775550, 1473591045, 95141024, 1592739711, 1618554578,
  4257218569, 2685635028, 2617994019, 740185638, 4194465613, 2426187848, 967350023,
  366635194, 2557108433, 3503432700, 353185579, 706247310, 408928405, 1855199472,
  1263785871, 2223693730, 594074265, 684458788, 3868161075, 1929325558, 166605533,
  2640352920, 1798252823, 2071081866, 171871585, 2087307084, 698505787, 3647212126,
  634580517, 1956956480, 2017242015, 1181484146, 1221761321, 3441954932, 962199875,
  571258310, 3352760941, 3763818728, 1371701031, 1288172122, 2012225009, 3960962716,
  4082010443, 1249037870, 3840393141, 3947023760, 3754607535, 2143919426, 1774599097,
  1818014148, 136057427, 2672030614, 798365181, 2575687480, 732141879, 2569577770,
  1449661057, 3853535724, 1541586011, 2732705278, 3432461637, 320021984, 2287935423,
  697346578, 2555167305, 2262755092];

  const r1 = new RandomLCG(0);
  for (let i = 0; i<100; i++) {
    const r = r1.nextInt();
    assertEquals(exp[i], r);
  }
};

function testRandom2() {
  startTest(groupName+'testRandom2');

  const exp = [99, 56, 96, 26, 34, 96, 61, 2, 51, 37, 90, 26, 76, 69, 44, 57, 97, 32,
  50, 83, 53, 86, 99, 11, 66, 93, 8, 36, 94, 73, 13, 9, 64, 1, 99, 60, 15, 49, 75,
  14, 63, 2, 49, 13, 68, 3, 63, 38, 65, 89, 97, 91, 79, 39, 47, 75, 57, 45, 41, 92,
  62, 68, 36, 42, 37, 44, 25, 86, 14, 60, 45, 26, 30, 2, 50, 90, 92, 53, 7, 41, 76,
  91, 21, 47, 74, 17, 1, 80, 10, 7, 18, 17, 99, 75, 22, 87, 14, 90, 10, 68];

  const r1 = new RandomLCG(99999);
  for (let i = 0; i<100; i++) {
    const r = r1.nextRange(100);
    assertEquals(exp[i], r);
  }
  assertThrows(() => r1.setSeed(-1));
  assertThrows(() => r1.setSeed(r1.getModulus()));
  assertThrows(() => r1.setSeed(0.1));
};
