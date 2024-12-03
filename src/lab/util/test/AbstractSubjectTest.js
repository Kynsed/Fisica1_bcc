import { GenericEvent, ParameterBoolean, ParameterNumber, ParameterString } from "../Observe.js";
import { AbstractSubject } from "../AbstractSubject.js";
import { assertEquals, schedule, startTest, assertThrows, assertTrue, assertFalse } from "../../../test/TestRig.js";
export default function scheduleTests() {
    schedule(testAbstractSubject1);
}
;
const groupName = 'AbstractSubjectTest.';
function testAbstractSubject1() {
    startTest(groupName + 'testAbstractSubject1');
    const mockSubj1 = new MockSubject1();
    assertEquals(0, mockSubj1.getFooness());
    assertFalse(mockSubj1.getFooBarness());
    assertEquals('corge', mockSubj1.getQux());
    const paramFoo = new ParameterNumber(mockSubj1, FOONESS, FOONESS, () => mockSubj1.getFooness(), (a) => mockSubj1.setFooness(a));
    mockSubj1.addParameter(paramFoo);
    assertEquals(0, paramFoo.getValue());
    const paramFooBar = new ParameterBoolean(mockSubj1, FOOBARNESS, FOOBARNESS, () => mockSubj1.getFooBarness(), (a) => mockSubj1.setFooBarness(a));
    mockSubj1.addParameter(paramFooBar);
    assertFalse(paramFooBar.getValue());
    const paramQux = new ParameterString(mockSubj1, QUX, QUX, () => mockSubj1.getQux(), (a) => mockSubj1.setQux(a));
    mockSubj1.addParameter(paramQux);
    assertEquals('corge', paramQux.getValue());
    assertEquals(paramFoo, mockSubj1.getParameter(FOONESS));
    assertEquals(paramFoo, mockSubj1.getParameterNumber(FOONESS));
    assertThrows(() => mockSubj1.getParameterBoolean(FOONESS));
    assertThrows(() => mockSubj1.getParameterString(FOONESS));
    assertEquals(paramFooBar, mockSubj1.getParameter(FOOBARNESS));
    assertEquals(paramFooBar, mockSubj1.getParameterBoolean(FOOBARNESS));
    assertThrows(() => mockSubj1.getParameterNumber(FOOBARNESS));
    assertThrows(() => mockSubj1.getParameterString(FOOBARNESS));
    assertEquals(paramQux, mockSubj1.getParameter(QUX));
    assertEquals(paramQux, mockSubj1.getParameterString(QUX));
    assertThrows(() => mockSubj1.getParameterNumber(QUX));
    assertThrows(() => mockSubj1.getParameterBoolean(QUX));
    assertThrows(() => mockSubj1.getParameter('BLARG'));
    assertThrows(() => mockSubj1.getParameterNumber('BLARG'));
    const params = mockSubj1.getParameters();
    assertEquals(3, params.length);
    assertTrue(params.includes(paramFoo));
    assertTrue(params.includes(paramFooBar));
    assertTrue(params.includes(paramQux));
    const mockObsvr1 = new MockObserver1(mockSubj1);
    assertEquals(0, mockObsvr1.numEvents);
    assertEquals(0, mockObsvr1.numBooleans);
    assertEquals(0, mockObsvr1.numDoubles);
    assertEquals(0, mockObsvr1.numStrings);
    mockSubj1.addObserver(mockObsvr1);
    const obsvrs = mockSubj1.getObservers();
    assertEquals(1, obsvrs.length);
    assertTrue(obsvrs.includes(mockObsvr1));
    const event1 = new GenericEvent(mockSubj1, 'fooEvent');
    event1.getSubject().broadcast(event1);
    assertEquals(1, mockObsvr1.numEvents);
    mockSubj1.broadcast(event1);
    assertEquals(2, mockObsvr1.numEvents);
    paramFoo.getSubject().broadcast(paramFoo);
    assertEquals(1, mockObsvr1.numDoubles);
    mockSubj1.broadcastParameter(FOOBARNESS);
    assertEquals(1, mockObsvr1.numBooleans);
    paramFooBar.setValue(!paramFooBar.getValue());
    paramFooBar.getSubject().broadcast(paramFooBar);
    assertEquals(2, mockObsvr1.numBooleans);
    paramFooBar.setValue(!paramFooBar.getValue());
    mockSubj1.broadcast(paramFooBar);
    assertEquals(3, mockObsvr1.numBooleans);
    mockSubj1.broadcast(paramQux);
    assertEquals(1, mockObsvr1.numStrings);
    paramQux.setValue('grault');
    paramQux.getSubject().broadcast(paramQux);
    assertEquals(2, mockObsvr1.numStrings);
    paramQux.setValue('blarg');
    mockSubj1.broadcastParameter(QUX);
    assertEquals(3, mockObsvr1.numStrings);
    mockSubj1.removeObserver(mockObsvr1);
    assertEquals(0, mockSubj1.getObservers().length);
    mockSubj1.broadcastParameter(FOOBARNESS);
    assertEquals(3, mockObsvr1.numBooleans);
    const mockObsvr2 = new MockObserver2(mockSubj1);
    mockSubj1.addObserver(mockObsvr2);
    mockSubj1.addObserver(mockObsvr1);
    assertEquals(2, mockSubj1.getObservers().length);
    paramFoo.getSubject().broadcast(paramFoo);
    assertEquals(1, mockObsvr2.numDoubles);
    assertEquals(2, mockObsvr1.numDoubles);
    mockSubj1.broadcastParameter(FOOBARNESS);
    assertEquals(1, mockObsvr2.numBooleans);
    assertEquals(4, mockObsvr1.numBooleans);
    const obsvrs2 = mockSubj1.getObservers();
    assertEquals(1, obsvrs2.length);
    assertFalse(obsvrs.includes(mockObsvr2));
    assertTrue(obsvrs.includes(mockObsvr1));
}
;
class MockSubject1 extends AbstractSubject {
    constructor() {
        super('MOCK');
        this.fooness_ = 0;
        this.fooBarness_ = false;
        this.qux_ = 'corge';
    }
    ;
    getClassName() {
        return 'MockSubject1';
    }
    ;
    getFooness() {
        return this.fooness_;
    }
    ;
    setFooness(value) {
        this.fooness_ = value;
    }
    ;
    getFooBarness() {
        return this.fooBarness_;
    }
    ;
    setFooBarness(value) {
        this.fooBarness_ = value;
    }
    ;
    getQux() {
        return this.qux_;
    }
    ;
    setQux(value) {
        this.qux_ = value;
    }
    ;
}
const FOONESS = 'FOONESS';
const FOOBARNESS = 'FOO_BARNESS';
const QUX = 'QUX';
class MockObserver1 {
    constructor(mockSubj1) {
        this.numEvents = 0;
        this.numBooleans = 0;
        this.numDoubles = 0;
        this.numStrings = 0;
        this.mockSubj1 = mockSubj1;
    }
    ;
    observe(event) {
        if (event instanceof GenericEvent) {
            this.numEvents++;
            assertEquals('FOOEVENT', event.getName());
            assertTrue(event.nameEquals('fooevent'));
            assertTrue(event instanceof GenericEvent);
            assertEquals(this.mockSubj1, event.getSubject());
        }
        else if (event instanceof ParameterBoolean) {
            this.numBooleans++;
            assertEquals('FOO_BARNESS', event.getName());
            assertTrue(event.nameEquals('foo-barness'));
            assertTrue(event instanceof ParameterBoolean);
            assertEquals(this.mockSubj1, event.getSubject());
            var bval = event.getValue();
            assertTrue(typeof bval === 'boolean');
        }
        else if (event instanceof ParameterNumber) {
            this.numDoubles++;
            assertEquals('FOONESS', event.getName());
            assertTrue(event.nameEquals('fooness'));
            assertTrue(event instanceof ParameterNumber);
            assertEquals(this.mockSubj1, event.getSubject());
            var nval = event.getValue();
            assertTrue(typeof nval === 'number');
        }
        else if (event instanceof ParameterString) {
            this.numStrings++;
            assertEquals('QUX', event.getName());
            assertTrue(event.nameEquals('qux'));
            assertTrue(event instanceof ParameterString);
            assertEquals(this.mockSubj1, event.getSubject());
            assertTrue(typeof event.getValue() === 'string');
        }
    }
    ;
    toStringShort() {
        return 'MockObserver1';
    }
    ;
}
class MockObserver2 {
    constructor(mockSubj1) {
        this.numEvents = 0;
        this.numBooleans = 0;
        this.numDoubles = 0;
        this.numStrings = 0;
        this.mockSubj1 = mockSubj1;
    }
    ;
    observe(event) {
        if (event instanceof GenericEvent) {
            this.numEvents++;
            assertEquals('FOOEVENT', event.getName());
            assertTrue(event.nameEquals('fooevent'));
            assertTrue(event instanceof GenericEvent);
            assertEquals(this.mockSubj1, event.getSubject());
        }
        else if (event instanceof ParameterBoolean) {
            this.mockSubj1.removeObserver(this);
            this.numBooleans++;
            assertEquals('FOO_BARNESS', event.getName());
            assertTrue(event.nameEquals('foo-barness'));
            assertTrue(event instanceof ParameterBoolean);
            assertEquals(this.mockSubj1, event.getSubject());
            var bval = event.getValue();
            assertTrue(typeof bval === 'boolean');
        }
        else if (event instanceof ParameterNumber) {
            this.numDoubles++;
            assertEquals('FOONESS', event.getName());
            assertTrue(event.nameEquals('fooness'));
            assertTrue(event instanceof ParameterNumber);
            assertEquals(this.mockSubj1, event.getSubject());
            var nval = event.getValue();
            assertTrue(typeof nval === 'number');
        }
        else if (event instanceof ParameterString) {
            this.numStrings++;
            assertEquals('QUX', event.getName());
            assertTrue(event.nameEquals('qux'));
            assertTrue(event instanceof ParameterString);
            assertEquals(this.mockSubj1, event.getSubject());
            assertTrue(typeof event.getValue() === 'string');
        }
    }
    ;
    toStringShort() {
        return 'MockObserver2';
    }
    ;
}
