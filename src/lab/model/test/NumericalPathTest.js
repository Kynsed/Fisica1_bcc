import { NumericalPath } from '../NumericalPath.js';
import { PathPoint } from '../PathPoint.js';
import { CirclePath } from '../../../sims/roller/CirclePath.js';
import { CustomPath } from '../../../sims/roller/CustomPath.js';
import { FlatPath } from '../../../sims/roller/FlatPath.js';
import { OvalPath } from '../../../sims/roller/OvalPath.js';
import { Vector } from '../../util/Vector.js';
import { assertEquals, schedule, startTest, assertThrows, assertFalse, assertRoughlyEquals } from "../../../test/TestRig.js";
export default function scheduleTests() {
    schedule(testNumericalPath1);
    schedule(testNumericalPath2);
    schedule(testNumericalPath3);
    schedule(testNumericalPath4);
}
;
function testNumericalPath1() {
    startTest(groupName + 'testNumericalPath1');
    const tol = 1E-6;
    const tol2 = 1E-4;
    const r = 3;
    const path = new NumericalPath(new CirclePath(r));
    assertFalse(path.isMassObject());
    const startP = path.getStartPValue();
    assertEquals(0, startP);
    const finishP = path.getFinishPValue();
    assertRoughlyEquals(6 * Math.PI, finishP, 1E-6);
    const n = 1000;
    const pp = new PathPoint(0, true);
    const delta = (finishP - startP) / n;
    for (let i = 0; i <= n; i++) {
        pp.p = startP + delta * i;
        const theta = pp.p / r - 3 * Math.PI / 2;
        path.map_p_to_slope(pp);
        assertRoughlyEquals(r * Math.cos(theta), pp.x, tol);
        assertRoughlyEquals(r * Math.sin(theta), pp.y, tol);
        assertRoughlyEquals(-Math.sin(theta), pp.dxdp, tol);
        assertRoughlyEquals(Math.cos(theta), pp.dydp, tol);
        assertRoughlyEquals(-Math.cos(theta), pp.normalX, tol);
        assertRoughlyEquals(-Math.sin(theta), pp.normalY, tol);
        assertRoughlyEquals(Math.sin(theta) / r, pp.normalXdp, tol);
        assertRoughlyEquals(-Math.cos(theta) / r, pp.normalYdp, tol);
        if (isFinite(pp.radius)) {
            assertRoughlyEquals(r, pp.radius, tol);
        }
        const k = -1 / Math.tan(theta);
        if (Math.abs(k) < 1E6) {
            assertRoughlyEquals(k, pp.slope, Math.max(tol2, Math.abs(k) * tol2));
        }
    }
    ;
    const index = path.map_p_to_index(-1);
    assertEquals(0, index);
    pp.idx = 0;
    const clickPoint = new Vector(3.1, 0);
    path.findNearestLocal(clickPoint, pp);
    const tol3 = 1e-6;
    assertRoughlyEquals((3 / 2) * Math.PI * r, pp.p, tol3);
    path.map_p_to_slope(pp);
    assertRoughlyEquals(r, pp.x, tol3);
    assertRoughlyEquals(0, pp.y, tol3);
    const pp2 = path.findNearestGlobal(clickPoint);
    const tol4 = 0.01;
    assertRoughlyEquals((3 / 2) * Math.PI * r, pp2.p, tol4);
    path.map_p_to_slope(pp2);
    assertRoughlyEquals(r, pp2.x, tol4);
    assertRoughlyEquals(0, pp2.y, tol4);
    assertThrows(() => path.map_x_to_p(1));
    assertThrows(() => path.map_x_to_y(0));
    pp2.x = 1;
    assertThrows(() => path.map_x_to_y_p(pp2));
}
;
function testNumericalPath2() {
    startTest(groupName + 'testNumericalPath2');
    const tol = 1E-6;
    const tol2 = 1E-4;
    const invsinh = (x) => Math.log(x + Math.sqrt(x * x + 1));
    const parabola = new CustomPath(-1, 1);
    parabola.setXEquation('t');
    parabola.setYEquation('t*t');
    const path = new NumericalPath(parabola);
    assertFalse(path.isMassObject());
    const startP = path.getStartPValue();
    assertEquals(0, startP);
    const fp = Math.sqrt(5) + (invsinh(2) - invsinh(-2)) / 4;
    const finishP = path.getFinishPValue();
    assertRoughlyEquals(fp, finishP, tol);
    const n = 1000;
    const pp = new PathPoint(0, true);
    const delta = (finishP - startP) / n;
    for (let i = 0; i <= n; i++) {
        pp.p = startP + delta * i;
        path.map_p_to_slope(pp);
        const x2 = pp.x * pp.x;
        let myp = 2 * Math.sqrt(5) + invsinh(2 * pp.x) - invsinh(-2);
        const sqrt4x2 = Math.sqrt(1 + 4 * x2);
        myp += 2 * pp.x * sqrt4x2;
        myp = myp / 4;
        assertRoughlyEquals(myp, pp.p, tol);
        assertRoughlyEquals(x2, pp.y, tol);
        assertRoughlyEquals(-2 * pp.x / sqrt4x2, pp.normalX, tol);
        assertRoughlyEquals(1 / sqrt4x2, pp.normalY, tol);
        assertRoughlyEquals(1 / sqrt4x2, pp.dxdp, tol);
        assertRoughlyEquals(2 * pp.x / sqrt4x2, pp.dydp, tol);
        const d1 = 4 * x2 + 1;
        const exp = (-2 + 8 * x2 / d1) / d1;
        assertRoughlyEquals((-2 + 8 * x2 / d1) / d1, pp.normalXdp, tol2);
        assertRoughlyEquals(-4 * pp.x / (d1 * d1), pp.normalYdp, tol2);
        assertRoughlyEquals(2 * pp.x, pp.slope, tol);
        if (i > 0 && i < n) {
            assertRoughlyEquals(Math.pow(1 + 4 * pp.x * pp.x, 3 / 2) / 2, pp.radius, 0.002);
        }
    }
    ;
    {
        const p = path.getStartPValue() - Math.sqrt(5);
        const pp = new PathPoint(p);
        path.map_p_to_slope(pp);
        assertRoughlyEquals(p, pp.p, tol);
        assertRoughlyEquals(-2, pp.x, tol);
        assertRoughlyEquals(3, pp.y, tol);
        assertRoughlyEquals(-2, pp.slope, tol);
    }
    {
        const p = path.getFinishPValue() + Math.sqrt(5);
        const pp = new PathPoint(p);
        path.map_p_to_slope(pp);
        assertRoughlyEquals(p, pp.p, tol);
        assertRoughlyEquals(2, pp.x, tol);
        assertRoughlyEquals(3, pp.y, tol);
        assertRoughlyEquals(2, pp.slope, tol);
    }
}
;
function testNumericalPath3() {
    startTest(groupName + 'testNumericalPath3');
    const tol = 1E-6;
    const tol2 = 1E-5;
    const path = new NumericalPath(new OvalPath());
    const pp = new PathPoint(0, true);
    pp.p = 1 + Math.PI / 2;
    path.map_p_to_slope(pp);
    assertRoughlyEquals(-1, pp.x, tol);
    assertRoughlyEquals(1, pp.y, tol);
    assertRoughlyEquals(0, pp.dxdp, tol);
    assertRoughlyEquals(-1, pp.dydp, tol);
    assertRoughlyEquals(1, pp.normalX, tol);
    assertRoughlyEquals(0, pp.normalY, tol);
    assertRoughlyEquals(0, pp.normalXdp, tol);
    assertRoughlyEquals(0, pp.normalYdp, tol);
    assertEquals(Number.NEGATIVE_INFINITY, pp.slope);
    assertEquals(Number.NEGATIVE_INFINITY, pp.radius);
    assertEquals(0, pp.slopeX);
    assertEquals(-1, pp.slopeY);
    pp.p = 3 + 3 * Math.PI / 2;
    path.map_p_to_slope(pp);
    assertRoughlyEquals(1, pp.x, tol);
    assertRoughlyEquals(1, pp.y, tol);
    assertRoughlyEquals(0, pp.dxdp, tol);
    assertRoughlyEquals(1, pp.dydp, tol);
    assertRoughlyEquals(-1, pp.normalX, tol);
    assertRoughlyEquals(0, pp.normalY, tol);
    assertRoughlyEquals(0, pp.normalXdp, tol);
    assertRoughlyEquals(0, pp.normalYdp, tol);
    assertEquals(Number.POSITIVE_INFINITY, pp.slope);
    assertEquals(Number.POSITIVE_INFINITY, pp.radius);
    assertEquals(0, pp.slopeX);
    assertEquals(1, pp.slopeY);
}
;
function testNumericalPath4() {
    startTest(groupName + 'testNumericalPath4');
    const tol = 1E-6;
    const tol2 = 1E-5;
    const path = new NumericalPath(new FlatPath());
    const pp = new PathPoint(0, true);
    pp.p = 5;
    path.map_p_to_slope(pp);
    assertRoughlyEquals(0, pp.x, tol);
    assertRoughlyEquals(0, pp.y, tol);
    assertRoughlyEquals(1, pp.dxdp, tol);
    assertRoughlyEquals(0, pp.dydp, tol);
    assertEquals(0, pp.slope);
    assertEquals(1, pp.slopeX);
    assertEquals(0, pp.slopeY);
    assertEquals(Number.POSITIVE_INFINITY, pp.radius);
    assertRoughlyEquals(0, pp.normalX, tol);
    assertRoughlyEquals(1, pp.normalY, tol);
    assertRoughlyEquals(0, pp.normalXdp, tol);
    assertRoughlyEquals(0, pp.normalYdp, tol);
    let p2 = path.findPointByDistance(Vector.ORIGIN, new Vector(3, 1), 2);
    assertRoughlyEquals(2, p2.getX(), tol);
    assertRoughlyEquals(0, p2.getY(), tol);
}
;
const groupName = 'NumericalPathTest.';
