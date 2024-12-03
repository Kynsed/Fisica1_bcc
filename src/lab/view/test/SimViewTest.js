import { AffineTransform } from "../../util/AffineTransform.js";
import { DisplayShape } from "../DisplayShape.js";
import { DisplaySpring } from "../DisplaySpring.js";
import { DoubleRect } from "../../util/DoubleRect.js";
import { GenericEvent, GenericObserver, ParameterBoolean, ParameterNumber, ParameterString } from "../../util/Observe.js";
import { PointMass } from "../../model/PointMass.js";
import { ScreenRect } from "../ScreenRect.js";
import { SimView } from "../SimView.js";
import { Spring } from "../../model/Spring.js";
import { Vector } from "../../util/Vector.js";
import { assertEquals, schedule, startTest, assertThrows, assertTrue, assertFalse, assertRoughlyEquals } from "../../../test/TestRig.js";
export default function scheduleTests() {
    schedule(testSimView1);
    schedule(testSimView2);
}
;
const groupName = 'SimViewTest.';
function testSimView1() {
    startTest(groupName + 'testSimView1');
    var tol = 1E-14;
    var mockContext = new MockContext2D(tol);
    var mockContext2 = mockContext;
    var screenRect = new ScreenRect(0, 0, 500, 300);
    var simRect1 = new DoubleRect(-5, -5, 5, 5);
    var simView1 = new SimView('view1', simRect1);
    var displayList1 = simView1.getDisplayList();
    simView1.setHorizAlign("LEFT");
    simView1.setVerticalAlign("FULL");
    var mockObsvr1 = new MockObserver();
    simView1.addObserver(mockObsvr1);
    assertTrue(simView1.getSimRect().equals(simRect1));
    simView1.setScreenRect(screenRect);
    assertTrue(simView1.getScreenRect().equals(screenRect));
    assertEquals(1, mockObsvr1.numScreenRectEvents);
    assertEquals('VIEW1', simView1.getName());
    var map = simView1.getCoordMap();
    var point1 = PointMass.makeSquare(1);
    var v1 = new Vector(2.5, 0);
    point1.setPosition(v1);
    var shape1 = new DisplayShape(point1);
    shape1.setFillStyle('orange');
    var fixedPt = PointMass.makeSquare(1);
    fixedPt.setMass(Infinity);
    fixedPt.setPosition(new Vector(-1, 0));
    assertTrue(v1 instanceof Vector);
    displayList1.add(shape1);
    assertTrue(displayList1.contains(shape1));
    assertEquals(1, displayList1.toArray().length);
    assertTrue(displayList1.toArray().includes(shape1));
    assertEquals(shape1, displayList1.find(point1));
    mockContext2.expectRect1 = map.simToScreen(new Vector(2, -0.5));
    mockContext2.expectRect2 = map.simToScreen(new Vector(3, 0.5));
    mockContext2.startPoint = map.simToScreen(new Vector(-1, 0));
    simView1.paint(mockContext);
    assertEquals('orange', mockContext.fillStyle);
    var simRect2 = new DoubleRect(-2, -2, 2, 2);
    var simView2 = new SimView('simView2', simRect2);
    var mockObsvr2 = new MockObserver();
    simView2.addObserver(mockObsvr2);
    assertTrue(simView2.getSimRect().equals(simRect2));
    simView2.setScreenRect(screenRect);
    assertEquals(1, mockObsvr2.numScreenRectEvents);
    assertTrue(simView2.getScreenRect().equals(screenRect));
    var matcher = new GenericObserver(simView1, evt => {
        if (evt.nameEquals(SimView.SIM_RECT_CHANGED)) {
            simView2.setSimRect(simView1.getSimRect());
        }
    }, 'match simRect');
    assertEquals(0, mockObsvr1.numSimRectEvents);
    assertEquals(0, mockObsvr2.numSimRectEvents);
    simRect1 = new DoubleRect(-15, -15, 15, 15);
    simView1.setSimRect(simRect1);
    assertEquals(1, mockObsvr1.numSimRectEvents);
    assertEquals(1, mockObsvr2.numSimRectEvents);
    assertTrue(simView1.getSimRect().equals(simRect1));
    assertEquals(simView1.getSimRect().getLeft(), simView2.getSimRect().getLeft());
    assertEquals(simView1.getSimRect().getRight(), simView2.getSimRect().getRight());
    assertEquals(simView1.getSimRect().getBottom(), simView2.getSimRect().getBottom());
    assertEquals(simView1.getSimRect().getTop(), simView2.getSimRect().getTop());
    matcher.disconnect();
    assertEquals(1, mockObsvr2.numSimRectEvents);
    simRect2 = simView2.getSimRect();
    assertTrue(simRect2.equals(simView1.getSimRect()));
    simRect1 = new DoubleRect(-30, -30, 30, 30);
    simView1.setSimRect(simRect1);
    assertEquals(2, mockObsvr1.numSimRectEvents);
    assertEquals(1, mockObsvr2.numSimRectEvents);
    assertTrue(simView1.getSimRect().equals(simRect1));
    assertTrue(simView2.getSimRect().equals(simRect2));
    assertEquals("LEFT", simView1.getHorizAlign());
    simView1.setHorizAlign("RIGHT");
    assertEquals("RIGHT", simView1.getHorizAlign());
    assertEquals("FULL", simView1.getVerticalAlign());
    simView1.setVerticalAlign("BOTTOM");
    assertEquals("BOTTOM", simView1.getVerticalAlign());
    assertEquals(1.0, simView1.getAspectRatio());
    simView1.setAspectRatio(1.5);
    assertRoughlyEquals(1.5, simView1.getAspectRatio(), 1E-15);
    assertThrows(() => simView1.setHorizAlign('foo'));
    assertThrows(() => simView1.setVerticalAlign('bar'));
    displayList1.remove(shape1);
    assertFalse(displayList1.contains(shape1));
    assertEquals(0, displayList1.toArray().length);
    assertFalse(displayList1.toArray().includes(shape1));
    assertThrows(() => new SimView('badView', DoubleRect.EMPTY_RECT));
}
;
function testSimView2() {
    startTest(groupName + 'testSimView2');
    var tol = 1E-14;
    var mockContext = new MockContext2D(tol);
    var mockContext2 = mockContext;
    var screenRect = new ScreenRect(0, 0, 500, 300);
    var simRect1 = new DoubleRect(-5, -5, 5, 5);
    var simView1 = new SimView('view1', simRect1);
    var displayList1 = simView1.getDisplayList();
    simView1.setHorizAlign("LEFT");
    simView1.setVerticalAlign("FULL");
    var mockObsvr1 = new MockObserver();
    simView1.addObserver(mockObsvr1);
    assertTrue(simView1.getSimRect().equals(simRect1));
    simView1.setScreenRect(screenRect);
    assertTrue(simView1.getScreenRect().equals(screenRect));
    assertEquals(1, mockObsvr1.numScreenRectEvents);
    assertEquals('VIEW1', simView1.getName());
    var map = simView1.getCoordMap();
    var point1 = PointMass.makeSquare(1);
    var v1 = new Vector(2.5, 0);
    point1.setPosition(v1);
    var shape1 = new DisplayShape(point1);
    shape1.setFillStyle('orange');
    var fixedPt = PointMass.makeSquare(1);
    fixedPt.setMass(Infinity);
    fixedPt.setPosition(new Vector(-1, 0));
    var spring1 = new Spring('spring1', fixedPt, Vector.ORIGIN, point1, Vector.ORIGIN, 2, 12);
    var dspring1 = new DisplaySpring(spring1).setWidth(1.0);
    dspring1.setColorCompressed('red');
    dspring1.setColorExpanded('green');
    assertTrue(v1 instanceof Vector);
    displayList1.add(shape1);
    displayList1.add(dspring1);
    assertTrue(displayList1.contains(shape1));
    assertTrue(displayList1.contains(dspring1));
    assertEquals(2, displayList1.toArray().length);
    assertTrue(displayList1.toArray().includes(shape1));
    assertTrue(displayList1.toArray().includes(dspring1));
    assertEquals(shape1, displayList1.find(point1));
    assertEquals(dspring1, displayList1.find(spring1));
    mockContext2.expectRect1 = map.simToScreen(new Vector(2, -0.5));
    mockContext2.expectRect2 = map.simToScreen(new Vector(3, 0.5));
    mockContext2.startPoint = map.simToScreen(new Vector(-1, 0));
    simView1.paint(mockContext);
    assertEquals('orange', mockContext.fillStyle);
    if (mockContext2.lastPoint === null) {
        throw 'lastPoint null';
    }
    assertTrue(mockContext2.lastPoint.nearEqual(map.simToScreen(v1)));
    assertEquals('green', mockContext.strokeStyle);
    var simRect2 = new DoubleRect(-2, -2, 2, 2);
    var simView2 = new SimView('simView2', simRect2);
    var mockObsvr2 = new MockObserver();
    simView2.addObserver(mockObsvr2);
    assertTrue(simView2.getSimRect().equals(simRect2));
    simView2.setScreenRect(screenRect);
    assertEquals(1, mockObsvr2.numScreenRectEvents);
    assertTrue(simView2.getScreenRect().equals(screenRect));
    var matcher = new GenericObserver(simView1, evt => {
        if (evt.nameEquals(SimView.SIM_RECT_CHANGED)) {
            simView2.setSimRect(simView1.getSimRect());
        }
    }, 'match simRect');
    assertEquals(0, mockObsvr1.numSimRectEvents);
    assertEquals(0, mockObsvr2.numSimRectEvents);
    simRect1 = new DoubleRect(-15, -15, 15, 15);
    simView1.setSimRect(simRect1);
    assertEquals(1, mockObsvr1.numSimRectEvents);
    assertEquals(1, mockObsvr2.numSimRectEvents);
    assertTrue(simView1.getSimRect().equals(simRect1));
    assertEquals(simView1.getSimRect().getLeft(), simView2.getSimRect().getLeft());
    assertEquals(simView1.getSimRect().getRight(), simView2.getSimRect().getRight());
    assertEquals(simView1.getSimRect().getBottom(), simView2.getSimRect().getBottom());
    assertEquals(simView1.getSimRect().getTop(), simView2.getSimRect().getTop());
    matcher.disconnect();
    assertEquals(1, mockObsvr2.numSimRectEvents);
    simRect2 = simView2.getSimRect();
    assertTrue(simRect2.equals(simView1.getSimRect()));
    simRect1 = new DoubleRect(-30, -30, 30, 30);
    simView1.setSimRect(simRect1);
    assertEquals(2, mockObsvr1.numSimRectEvents);
    assertEquals(1, mockObsvr2.numSimRectEvents);
    assertTrue(simView1.getSimRect().equals(simRect1));
    assertTrue(simView2.getSimRect().equals(simRect2));
    assertEquals("LEFT", simView1.getHorizAlign());
    simView1.setHorizAlign("RIGHT");
    assertEquals("RIGHT", simView1.getHorizAlign());
    assertEquals("FULL", simView1.getVerticalAlign());
    simView1.setVerticalAlign("BOTTOM");
    assertEquals("BOTTOM", simView1.getVerticalAlign());
    assertEquals(1.0, simView1.getAspectRatio());
    simView1.setAspectRatio(1.5);
    assertRoughlyEquals(1.5, simView1.getAspectRatio(), 1E-15);
    assertThrows(() => simView1.setHorizAlign('foo'));
    assertThrows(() => simView1.setVerticalAlign('bar'));
    displayList1.remove(shape1);
    assertFalse(displayList1.contains(shape1));
    assertEquals(1, displayList1.toArray().length);
    assertFalse(displayList1.toArray().includes(shape1));
    displayList1.removeAll();
    assertFalse(displayList1.contains(dspring1));
    assertEquals(0, displayList1.toArray().length);
    assertFalse(displayList1.toArray().includes(dspring1));
    assertThrows(() => new SimView('badView', DoubleRect.EMPTY_RECT));
}
;
class MockObserver {
    constructor() {
        this.numEvents = 0;
        this.numScreenRectEvents = 0;
        this.numSimRectEvents = 0;
        this.numBooleans = 0;
        this.numDoubles = 0;
        this.numStrings = 0;
    }
    ;
    observe(event) {
        if (event instanceof GenericEvent) {
            this.numEvents++;
            if (event.nameEquals(SimView.SCREEN_RECT_CHANGED)) {
                this.numScreenRectEvents++;
            }
            else if (event.nameEquals(SimView.SIM_RECT_CHANGED)) {
                this.numSimRectEvents++;
            }
        }
        else if (event instanceof ParameterBoolean) {
            this.numBooleans++;
        }
        else if (event instanceof ParameterNumber) {
            this.numDoubles++;
        }
        else if (event instanceof ParameterString) {
            this.numStrings++;
        }
    }
    ;
    toStringShort() {
        return 'MockObserver';
    }
    ;
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
;
