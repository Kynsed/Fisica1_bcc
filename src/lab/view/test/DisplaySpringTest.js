import { AffineTransform } from "../../util/AffineTransform.js";
import { CoordMap } from "../CoordMap.js";
import { DisplaySpring } from "../DisplaySpring.js";
import { DoubleRect } from "../../util/DoubleRect.js";
import { PointMass } from "../../model/PointMass.js";
import { ScreenRect } from "../ScreenRect.js";
import { Spring } from "../../model/Spring.js";
import { Vector } from "../../util/Vector.js";
import { assertEquals, schedule, startTest, assertTrue, assertFalse, assertRoughlyEquals } from "../../../test/TestRig.js";
export default function scheduleTests() {
    schedule(testDisplaySpring);
}
;
const groupName = 'DisplaySpringTest.';
function testDisplaySpring() {
    startTest(groupName + 'testDisplaySpring');
    var tol = 1E-14;
    var mockContext = new MockContext2D(tol);
    var mockContext2 = mockContext;
    var screenRect = new ScreenRect(0, 0, 500, 300);
    var simRect = new DoubleRect(-10, -10, 10, 10);
    var map = CoordMap.make(screenRect, simRect, "LEFT", "FULL");
    var p2 = PointMass.makeCircle(1, 'point2');
    p2.setMass(2);
    p2.setPosition(new Vector(-5, 5));
    var p3 = PointMass.makeCircle(1, 'point3');
    p2.setMass(0.5);
    p3.setPosition(new Vector(5, -5));
    var spring1 = new Spring('spring1', p2, Vector.ORIGIN, p3, Vector.ORIGIN, 8, 12);
    var dspring = new DisplaySpring(spring1).setWidth(1.0);
    dspring.setColorCompressed('fuschia');
    dspring.setColorExpanded('gray');
    assertEquals(spring1, dspring.getSimObjects()[0]);
    assertFalse(dspring.contains(new Vector(2, -2)));
    assertTrue(dspring.getPosition().nearEqual(Vector.ORIGIN, tol));
    assertEquals('fuschia', dspring.getColorCompressed());
    assertEquals('gray', dspring.getColorExpanded());
    mockContext2.startPoint = new Vector(75, 75);
    dspring.draw(mockContext, map);
    assertEquals('gray', mockContext.strokeStyle);
    if (mockContext2.lastPoint == null) {
        throw '';
    }
    assertTrue(mockContext2.lastPoint.nearEqual(new Vector(225, 225), 1E-13));
    dspring.setColorCompressed('yellow');
    dspring.setColorExpanded('blue');
    assertEquals('yellow', dspring.getColorCompressed());
    assertEquals('blue', dspring.getColorExpanded());
    p3.setPosition(new Vector(0, 0));
    dspring.draw(mockContext, map);
    assertEquals('yellow', mockContext.strokeStyle);
    assertTrue(mockContext2.lastPoint.nearEqual(new Vector(150, 150), 1E-13));
}
;
class MockContext2D {
    constructor(tol) {
        this.fillStyle = '';
        this.font = '';
        this.lineWidth = 0;
        this.strokeStyle = '';
        this.textAlign = '';
        this.textBaseline = '';
        this.expectRect1 = null;
        this.expectRect2 = null;
        this.startPoint = null;
        this.lastPoint = null;
        this.at = AffineTransform.IDENTITY;
        this.tol = tol;
    }
    ;
    arc(_x, _y, _radius, _startAngle, _endAngle, _counterclockwise) { }
    ;
    beginPath() { }
    ;
    clearRect(_x, _y, _width, _height) { }
    ;
    clip() { }
    ;
    closePath() { }
    ;
    drawImage(_image, _dx, _dy) { }
    ;
    ellipse(_x, _y, _radiusX, _radiusY, _rotation, _startAngle, _endAngle, _counterclockwise) { }
    ;
    fill() { }
    ;
    fillText(_text, _x, _y) { }
    ;
    lineTo(x, y) {
        this.lastPoint = this.at.transform(x, y);
    }
    ;
    measureText(_text) {
        throw 'unimplemented';
    }
    ;
    moveTo(x, y) {
        var pt1 = this.at.transform(x, y);
        if (this.startPoint != null) {
            assertRoughlyEquals(this.startPoint.getX(), pt1.getX(), this.tol);
            assertRoughlyEquals(this.startPoint.getY(), pt1.getY(), this.tol);
        }
    }
    ;
    rect(x, y, w, h) {
        var pt1 = this.at.transform(x, y);
        var pt2 = this.at.transform(x + w, y + h);
        if (this.expectRect1 != null) {
            assertRoughlyEquals(this.expectRect1.getX(), pt1.getX(), this.tol);
            assertRoughlyEquals(this.expectRect1.getY(), pt1.getY(), this.tol);
        }
        if (this.expectRect2 != null) {
            assertRoughlyEquals(this.expectRect2.getX(), pt2.getX(), this.tol);
            assertRoughlyEquals(this.expectRect2.getY(), pt2.getY(), this.tol);
        }
    }
    ;
    restore() {
        this.at = AffineTransform.IDENTITY;
    }
    ;
    save() { }
    ;
    scale(_x, _y) { }
    ;
    setLineDash(_segments) { }
    ;
    setTransform(a, b, c, d, e, f) {
        this.at = new AffineTransform(a, b, c, d, e, f);
    }
    ;
    stroke() { }
    ;
    transform(_a, _b, _c, _d, _e, _f) { }
    ;
    translate(_x, _y) { }
    ;
}
