import { AffineTransform } from "../../util/AffineTransform.js";
import { CoordMap } from "../CoordMap.js";
import { DisplayShape } from "../DisplayShape.js";
import { DoubleRect } from "../../util/DoubleRect.js";
import { PointMass } from "../../model/PointMass.js";
import { ScreenRect } from "../ScreenRect.js";
import { Vector } from "../../util/Vector.js";
import { assertEquals, schedule, startTest, assertTrue, assertFalse, assertRoughlyEquals } from "../../../test/TestRig.js";
export default function scheduleTests() {
    schedule(testDisplayShape);
}
;
const groupName = 'DisplayShapeTest.';
function testDisplayShape() {
    startTest(groupName + 'testDisplayShape');
    var tol = 1E-14;
    var mockContext = new MockContext2D(tol);
    var mockContext2 = mockContext;
    var screenRect = new ScreenRect(0, 0, 500, 300);
    var simRect = new DoubleRect(-10, -10, 10, 10);
    var map = CoordMap.make(screenRect, simRect, "LEFT", "FULL");
    var point1 = PointMass.makeRectangle(2, 1.6);
    point1.setPosition(new Vector(2, -2));
    var shape1 = new DisplayShape(point1);
    shape1.setFillStyle('orange');
    assertEquals(point1, shape1.getSimObjects()[0]);
    assertTrue(shape1.contains(new Vector(2, -2)));
    assertFalse(shape1.contains(Vector.ORIGIN));
    assertTrue(shape1.getPosition().nearEqual(new Vector(2, -2), tol));
    assertEquals('orange', shape1.getFillStyle());
    assertTrue(shape1.isDragable());
    mockContext2.expectRect1 = map.simToScreen(new Vector(1, -2.8));
    mockContext2.expectRect2 = map.simToScreen(new Vector(3, -1.2));
    shape1.draw(mockContext, map);
    assertEquals('orange', mockContext.fillStyle);
    shape1.setDragable(false);
    assertFalse(shape1.isDragable());
    shape1.setFillStyle('blue');
    assertEquals('blue', shape1.getFillStyle());
    point1.setPosition(new Vector(1, 1));
    assertTrue(shape1.getPosition().nearEqual(new Vector(1, 1), tol));
    mockContext2.expectRect1 = map.simToScreen(new Vector(0, 0.2));
    mockContext2.expectRect2 = map.simToScreen(new Vector(2, 1.8));
    shape1.draw(mockContext, map);
    assertEquals('blue', mockContext.fillStyle);
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
