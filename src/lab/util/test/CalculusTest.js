import { adaptQuad } from "../Calculus.js";
import { schedule, startTest, assertRoughlyEquals } from "../../../test/TestRig.js";
export default function test() {
    schedule(testCalculus);
}
;
function myFn(x) {
    return Math.sin(10 / x) * 100 / (x * x);
}
;
function testCalculus() {
    startTest('CalculusTest.testCalculus');
    assertRoughlyEquals(-54.40211, myFn(1), 0.0001);
    assertRoughlyEquals(-1.426014, adaptQuad(myFn, 1, 3, 0.0001), 0.00001);
}
;
