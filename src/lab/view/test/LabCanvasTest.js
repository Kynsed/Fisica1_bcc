import { AffineTransform } from "../../util/AffineTransform.js";
import { DisplayShape } from "../DisplayShape.js";
import { DisplaySpring } from "../DisplaySpring.js";
import { DoubleRect } from "../../util/DoubleRect.js";
import { GenericEvent, ParameterBoolean, ParameterNumber, ParameterString } from "../../util/Observe.js";
import { LabCanvas } from "../LabCanvas.js";
import { PointMass } from "../../model/PointMass.js";
import { ScreenRect } from "../ScreenRect.js";
import { SimView } from "../SimView.js";
import { Spring } from "../../model/Spring.js";
import { Vector } from "../../util/Vector.js";
import { assertEquals, schedule, startTest, assertThrows, assertTrue, assertRoughlyEquals, assertNotNull } from "../../../test/TestRig.js";
export default function scheduleTests() {
    schedule(testLabCanvas1);
    schedule(testLabCanvas2);
}
;
const groupName = 'LabCanvasTest.';
function testLabCanvas1() {
    startTest(groupName + 'testLabCanvas1');
    var tol = 1E-14;
    var simRect1 = new DoubleRect(-5, -5, 5, 5);
    var simView1 = new SimView('simView1', simRect1);
    var displayList1 = simView1.getDisplayList();
    simView1.setHorizAlign("LEFT");
    simView1.setVerticalAlign("FULL");
    var mockViewObsvr1 = new MockViewObserver();
    simView1.addObserver(mockViewObsvr1);
    assertTrue(simView1.getSimRect().equals(simRect1));
    assertEquals(0, mockViewObsvr1.numScreenRectEvents);
    var point1 = PointMass.makeSquare(1);
    var v1 = new Vector(2.5, 0);
    point1.setPosition(v1);
    var shape1 = new DisplayShape(point1);
    shape1.setFillStyle('orange');
    var fixedPt = PointMass.makeSquare(1);
    fixedPt.setMass(Infinity);
    fixedPt.setPosition(new Vector(-1, 0));
    displayList1.add(shape1);
    const mockCanvas = new MockCanvas(tol);
    var labCanvas = new LabCanvas(mockCanvas, 'lc1');
    var mockLCObsvr = new MockLCObserver();
    labCanvas.addObserver(mockLCObsvr);
    assertEquals('LC1', labCanvas.getName());
    assertEquals(mockCanvas, labCanvas.getCanvas());
    labCanvas.addView(simView1);
    assertEquals(1, mockLCObsvr.numListModifiedEvents);
    assertEquals(1, mockLCObsvr.numFocusChangedEvents);
    assertEquals(0, mockViewObsvr1.numScreenRectEvents);
    assertEquals(simView1, labCanvas.getFocusView());
    assertEquals(simView1, labCanvas.getViews()[0]);
    assertEquals(1, labCanvas.getViews().length);
    assertEquals(0, labCanvas.getViews().indexOf(simView1));
    labCanvas.setSize(500, 300);
    assertEquals(500, labCanvas.getWidth());
    assertEquals(300, labCanvas.getHeight());
    assertEquals(1, mockViewObsvr1.numScreenRectEvents);
    assertEquals(500, simView1.getScreenRect().getWidth());
    assertEquals(300, simView1.getScreenRect().getHeight());
    var map = simView1.getCoordMap();
    var mockContext = labCanvas.getCanvas().getContext('2d');
    if (mockContext === null) {
        throw '';
    }
    var mockContext2 = mockContext;
    mockContext2.expectRect1 = map.simToScreen(new Vector(2, -0.5));
    mockContext2.expectRect2 = map.simToScreen(new Vector(3, 0.5));
    mockContext2.startPoint = map.simToScreen(new Vector(-1, 0));
    labCanvas.paint();
    assertEquals('orange', mockContext.fillStyle);
    var simRect2 = new DoubleRect(-2, -2, 2, 2);
    var simView2 = new SimView('simView2', simRect2);
    var mockViewObsvr2 = new MockViewObserver();
    simView2.addObserver(mockViewObsvr2);
    assertEquals(-1, labCanvas.getViews().indexOf(simView2));
    labCanvas.addView(simView2);
    assertEquals(2, mockLCObsvr.numListModifiedEvents);
    assertEquals(1, mockViewObsvr2.numScreenRectEvents);
    assertTrue(simView2.getScreenRect().equals(new ScreenRect(0, 0, 500, 300)));
    assertEquals(simView1, labCanvas.getFocusView());
    assertEquals(simView2, labCanvas.getViews()[1]);
    assertEquals(2, labCanvas.getViews().length);
    assertEquals(1, labCanvas.getViews().indexOf(simView2));
    assertThrows(() => labCanvas.setFocusView(new SimView('unknown', simRect2)));
    labCanvas.setFocusView(simView2);
    assertEquals(2, mockLCObsvr.numFocusChangedEvents);
    assertEquals(simView2, labCanvas.getFocusView());
    labCanvas.setFocusView(simView1);
    assertEquals(3, mockLCObsvr.numFocusChangedEvents);
    assertEquals(simView1, labCanvas.getFocusView());
    labCanvas.removeView(simView1);
    assertEquals(1, mockLCObsvr.numViewRemovedEvents);
    assertEquals(3, mockLCObsvr.numListModifiedEvents);
    assertEquals(4, mockLCObsvr.numFocusChangedEvents);
    assertEquals(simView2, labCanvas.getFocusView());
    assertEquals(simView2, labCanvas.getViews()[0]);
    assertEquals(1, labCanvas.getViews().length);
    assertEquals(0, labCanvas.getViews().indexOf(simView2));
    assertThrows(() => labCanvas.setSize(0, 0));
    assertThrows(() => labCanvas.setSize(100, 0));
    assertThrows(() => labCanvas.setSize(0, 100));
    assertThrows(() => labCanvas.setSize(100, -1));
    assertThrows(() => labCanvas.setSize(-1, 100));
}
;
function testLabCanvas2() {
    startTest(groupName + 'testLabCanvas2');
    var tol = 1E-14;
    var simRect1 = new DoubleRect(-5, -5, 5, 5);
    var simView1 = new SimView('simView1', simRect1);
    var displayList1 = simView1.getDisplayList();
    simView1.setHorizAlign("LEFT");
    simView1.setVerticalAlign("FULL");
    var mockViewObsvr1 = new MockViewObserver();
    simView1.addObserver(mockViewObsvr1);
    assertTrue(simView1.getSimRect().equals(simRect1));
    assertEquals(0, mockViewObsvr1.numScreenRectEvents);
    var point1 = PointMass.makeSquare(1);
    var v1 = new Vector(2.5, 0);
    point1.setPosition(v1);
    var shape1 = new DisplayShape(point1);
    shape1.setFillStyle('orange');
    var fixedPt = PointMass.makeSquare(1);
    fixedPt.setMass(Infinity);
    fixedPt.setPosition(new Vector(-1, 0));
    var spring1 = new Spring('spring1', fixedPt, Vector.ORIGIN, point1, Vector.ORIGIN, 2, 12);
    var dspring1 = new DisplaySpring(spring1);
    dspring1.setWidth(1.0);
    dspring1.setColorCompressed('red');
    dspring1.setColorExpanded('green');
    dspring1.setDrawMode(DisplaySpring.STRAIGHT);
    displayList1.add(shape1);
    displayList1.add(dspring1);
    const mockCanvas = new MockCanvas(tol);
    var labCanvas = new LabCanvas(mockCanvas, 'lc1');
    var mockLCObsvr = new MockLCObserver();
    labCanvas.addObserver(mockLCObsvr);
    assertEquals('LC1', labCanvas.getName());
    assertEquals(mockCanvas, labCanvas.getCanvas());
    labCanvas.addView(simView1);
    assertEquals(1, mockLCObsvr.numListModifiedEvents);
    assertEquals(1, mockLCObsvr.numFocusChangedEvents);
    assertEquals(0, mockViewObsvr1.numScreenRectEvents);
    assertEquals(simView1, labCanvas.getFocusView());
    assertEquals(simView1, labCanvas.getViews()[0]);
    assertEquals(1, labCanvas.getViews().length);
    assertEquals(0, labCanvas.getViews().indexOf(simView1));
    labCanvas.setSize(500, 300);
    assertEquals(500, labCanvas.getWidth());
    assertEquals(300, labCanvas.getHeight());
    assertEquals(1, mockViewObsvr1.numScreenRectEvents);
    assertEquals(500, simView1.getScreenRect().getWidth());
    assertEquals(300, simView1.getScreenRect().getHeight());
    var map = simView1.getCoordMap();
    assertTrue(spring1.getStartPoint().nearEqual(new Vector(-1, 0), 1e-8));
    assertTrue(map.simToScreen(spring1.getStartPoint()).nearEqual(new Vector(120, 150), 1e-8));
    var mockContext = labCanvas.getCanvas().getContext('2d');
    var mockContext2 = mockContext;
    assertNotNull(mockContext);
    mockContext2.expectRect1 = map.simToScreen(new Vector(2, -0.5));
    mockContext2.expectRect2 = map.simToScreen(new Vector(3, 0.5));
    mockContext2.startPoint = map.simToScreen(new Vector(-1, 0));
    labCanvas.paint();
    assertEquals('orange', mockContext.fillStyle);
    if (mockContext2.lastPoint === null) {
        throw 'lastPoint null';
    }
    assertTrue(mockContext2.lastPoint.nearEqual(map.simToScreen(v1)));
    assertEquals('green', mockContext.strokeStyle);
    var simRect2 = new DoubleRect(-2, -2, 2, 2);
    var simView2 = new SimView('simView2', simRect2);
    var mockViewObsvr2 = new MockViewObserver();
    simView2.addObserver(mockViewObsvr2);
    assertEquals(-1, labCanvas.getViews().indexOf(simView2));
    labCanvas.addView(simView2);
    assertEquals(2, mockLCObsvr.numListModifiedEvents);
    assertEquals(1, mockViewObsvr2.numScreenRectEvents);
    assertTrue(simView2.getScreenRect().equals(new ScreenRect(0, 0, 500, 300)));
    assertEquals(simView1, labCanvas.getFocusView());
    assertEquals(simView2, labCanvas.getViews()[1]);
    assertEquals(2, labCanvas.getViews().length);
    assertEquals(1, labCanvas.getViews().indexOf(simView2));
    assertThrows(() => labCanvas.setFocusView(new SimView('unknown', simRect2)));
    labCanvas.setFocusView(simView2);
    assertEquals(2, mockLCObsvr.numFocusChangedEvents);
    assertEquals(simView2, labCanvas.getFocusView());
    labCanvas.setFocusView(simView1);
    assertEquals(3, mockLCObsvr.numFocusChangedEvents);
    assertEquals(simView1, labCanvas.getFocusView());
    labCanvas.removeView(simView1);
    assertEquals(1, mockLCObsvr.numViewRemovedEvents);
    assertEquals(3, mockLCObsvr.numListModifiedEvents);
    assertEquals(4, mockLCObsvr.numFocusChangedEvents);
    assertEquals(simView2, labCanvas.getFocusView());
    assertEquals(simView2, labCanvas.getViews()[0]);
    assertEquals(1, labCanvas.getViews().length);
    assertEquals(0, labCanvas.getViews().indexOf(simView2));
    assertThrows(() => labCanvas.setSize(0, 0));
    assertThrows(() => labCanvas.setSize(100, 0));
    assertThrows(() => labCanvas.setSize(0, 100));
    assertThrows(() => labCanvas.setSize(100, -1));
    assertThrows(() => labCanvas.setSize(-1, 100));
}
;
class MockLCObserver {
    constructor() {
        this.numEvents = 0;
        this.numListModifiedEvents = 0;
        this.numFocusChangedEvents = 0;
        this.numViewRemovedEvents = 0;
        this.numBooleans = 0;
        this.numDoubles = 0;
        this.numStrings = 0;
    }
    ;
    observe(event) {
        if (event instanceof GenericEvent) {
            this.numEvents++;
            if (event.nameEquals(LabCanvas.VIEW_LIST_MODIFIED)) {
                this.numListModifiedEvents++;
            }
            else if (event.nameEquals(LabCanvas.FOCUS_VIEW_CHANGED)) {
                this.numFocusChangedEvents++;
            }
            else if (event.nameEquals(LabCanvas.VIEW_REMOVED)) {
                this.numViewRemovedEvents++;
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
        return 'MockLCObserver';
    }
    ;
}
class MockViewObserver {
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
        return 'MockViewObserver';
    }
    ;
}
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
class MockCanvas {
    constructor(tol) {
        this.width = 0;
        this.height = 0;
        this.offsetParent = { a: "foobar" };
        this.tol = tol;
        this.mockContext_ = new MockContext2D(tol);
    }
    ;
    getContext(contextId) {
        assertEquals('2d', contextId);
        return this.mockContext_;
    }
}
;
