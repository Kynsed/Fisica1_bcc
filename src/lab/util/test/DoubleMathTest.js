import * as DoubleMath from "../DoubleMath.js";
import { Util } from "../Util.js";
import { assertEquals, schedule, startTest, assertTrue } from "../../../test/TestRig.js";
const groupName = 'DoubleMathTest.';
export default function scheduleTests() {
    schedule(testDoubleMath);
}
;
function testDoubleMath() {
    startTest(groupName + 'testDoubleMath');
    let n, s;
    assertEquals(s = '3FF0000000000000', DoubleMath.numToHex(n = 1));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = '3FF0000000000001', DoubleMath.numToHex(n = 1.0000000000000002));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = '3FF0000000000002', DoubleMath.numToHex(n = 1.0000000000000004));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = '4000000000000000', DoubleMath.numToHex(n = 2));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = 'C000000000000000', DoubleMath.numToHex(n = -2));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = '3FF999999999999A', DoubleMath.numToHex(n = 1.6));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = 'BFF999999999999A', DoubleMath.numToHex(n = -1.6));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = '4099000000000000', DoubleMath.numToHex(n = 1600));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = 'C099000000000000', DoubleMath.numToHex(n = -1600));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = '3F24F8B588E368F1', DoubleMath.numToHex(n = 0.00016));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = 'BF24F8B588E368F1', DoubleMath.numToHex(n = -0.00016));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = '0000002F201D49FB', DoubleMath.numToHex(n = 1e-312));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = '8000002F201D49FB', DoubleMath.numToHex(n = -1e-312));
    assertEquals(n, DoubleMath.hexToNum(s));
    n = Math.pow(2, -1074);
    assertEquals(s = '0000000000000001', DoubleMath.numToHex(n));
    assertEquals(n, DoubleMath.hexToNum(s));
    n = 2.22507385850720088902458687609E-308;
    assertEquals(s = '000FFFFFFFFFFFFF', DoubleMath.numToHex(n));
    assertEquals(n, DoubleMath.hexToNum(s));
    n = Math.pow(2, -1022);
    assertEquals(s = '0010000000000000', DoubleMath.numToHex(n));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = '0000000000000001', DoubleMath.numToHex(n = Number.MIN_VALUE));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = '7FEFFFFFFFFFFFFF', DoubleMath.numToHex(n = Number.MAX_VALUE));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = '0000000000000000', DoubleMath.numToHex(n = 0));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = '3FD5555555555555', DoubleMath.numToHex(n = 1.0 / 3.0));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = '7FF8000000000000', DoubleMath.numToHex(n = Number.NaN));
    assertTrue(isNaN(DoubleMath.hexToNum(s)));
    assertEquals(s = '7FF0000000000000', DoubleMath.numToHex(n = Number.POSITIVE_INFINITY));
    assertEquals(n, DoubleMath.hexToNum(s));
    assertEquals(s = 'FFF0000000000000', DoubleMath.numToHex(n = Number.NEGATIVE_INFINITY));
    assertEquals(n, DoubleMath.hexToNum(s));
    const angle = DoubleMath.hexToNum(s = 'BFFE4A7FE8F6B56D');
    assertEquals(s, DoubleMath.numToHex(angle));
    const cos = Math.cos(angle);
    if (Util.isIPhone()) {
        assertEquals('BFD4470BB84303C8', DoubleMath.numToHex(cos));
    }
    else {
        assertEquals('BFD4470BB84303C9', DoubleMath.numToHex(cos));
    }
}
;
