import { Util } from "../Util.js";
import { ParameterNumber } from "../Observe.js";
import { AbstractSubject } from "../AbstractSubject.js";
import { assertEquals, schedule, startTest, assertThrows, assertTrue, assertRoughlyEquals } from "../../../test/TestRig.js";
export default function scheduleTests() {
    schedule(testParameterNumber1);
    schedule(testParameterNumber2);
    schedule(testParameterNumber3);
    schedule(testParameterNumber4);
}
;
const groupName = 'ParameterNumberTest.';
function testParameterNumber1() {
    startTest(groupName + 'testParameterNumber1');
    const mockSubj1 = new MockSubject1();
    assertEquals(0, mockSubj1.getFooness());
    assertEquals(0, mockSubj1.getFooBarness());
    const paramFoo = new ParameterNumber(mockSubj1, MockSubject1.FOONESS, MockSubject1.FOONESS, () => mockSubj1.getFooness(), (a) => mockSubj1.setFooness(a));
    assertEquals('FOONESS', paramFoo.getName());
    assertTrue(paramFoo.nameEquals('fooness'));
    assertEquals(mockSubj1, paramFoo.getSubject());
    assertTrue(paramFoo instanceof ParameterNumber);
    assertEquals(0, paramFoo.getValue());
    assertEquals('0', paramFoo.getAsString());
    assertEquals(undefined, paramFoo.setValue(10));
    assertEquals(10, paramFoo.getValue());
    assertEquals('10', paramFoo.getAsString());
    paramFoo.setValue(parseFloat('3.14159265358979323846'));
    assertEquals(3.14159265358979311600, paramFoo.getValue());
    assertEquals('3.141592653589793', String(paramFoo.getValue()));
    assertRoughlyEquals(Math.PI, paramFoo.getValue(), 1e-15);
    assertEquals(0, paramFoo.getLowerLimit());
    assertEquals(Infinity, paramFoo.getUpperLimit());
    assertThrows(() => paramFoo.setValue(-1));
    assertThrows(() => paramFoo.setLowerLimit(10));
    assertThrows(() => paramFoo.setUpperLimit(1));
    assertEquals(paramFoo, paramFoo.setLowerLimit(-100));
    assertEquals(-100, paramFoo.getLowerLimit());
    assertEquals(undefined, paramFoo.setValue(-10));
    assertEquals(-10, paramFoo.getValue());
    assertEquals(paramFoo, paramFoo.setUpperLimit(0));
    assertEquals(0, paramFoo.getUpperLimit());
    assertThrows(() => paramFoo.setValue(1));
    assertEquals(paramFoo, paramFoo.setLowerLimit(Number.NEGATIVE_INFINITY));
    assertEquals(undefined, paramFoo.setValue(-1e200));
    assertRoughlyEquals(-1.00000000000000013969727991388E200, paramFoo.getValue(), 1E185);
    const paramFooBar = new ParameterNumber(mockSubj1, MockSubject1.FOOBARNESS, MockSubject1.FOOBARNESS, () => mockSubj1.getFooBarness(), (a) => mockSubj1.setFooBarness(a));
    assertEquals(Util.toName(MockSubject1.FOOBARNESS), paramFooBar.getName());
    assertTrue(paramFooBar.nameEquals(MockSubject1.FOOBARNESS));
    assertEquals(mockSubj1, paramFooBar.getSubject());
    assertTrue(paramFooBar instanceof ParameterNumber);
    assertEquals(0, paramFooBar.getValue());
    assertEquals(undefined, paramFooBar.setValue(10));
    assertEquals(10, paramFooBar.getValue());
    paramFoo.setFromString('-7');
    assertEquals(-7, paramFoo.getValue());
    paramFoo.setFromString('-2e-5');
    assertEquals(-2e-5, paramFoo.getValue());
    assertThrows(() => paramFoo.setFromString('foo'));
}
;
function testParameterNumber2() {
    startTest(groupName + 'testParameterNumber2');
    const mockSubj2 = new MockSubject2();
    assertEquals(0, mockSubj2.getFooness());
    assertEquals(0, mockSubj2.getFooBarness());
    const paramFoo = new ParameterNumber(mockSubj2, MockSubject2.FOONESS, MockSubject2.FOONESS, () => mockSubj2.getFooness(), (a) => mockSubj2.setFooness(a));
    mockSubj2.addParameter(paramFoo);
    assertEquals('FOONESS', paramFoo.getName());
    assertEquals(mockSubj2, paramFoo.getSubject());
    assertTrue(paramFoo instanceof ParameterNumber);
    assertEquals(paramFoo, mockSubj2.getParameterNumber(MockSubject2.FOONESS));
    assertThrows(() => mockSubj2.getParameterBoolean(MockSubject2.FOONESS));
    assertEquals(0, paramFoo.getValue());
    assertEquals(undefined, paramFoo.setValue(10));
    assertEquals(10, paramFoo.getValue());
    paramFoo.setValue(parseFloat('3.14159265358979323846'));
    assertEquals(3.14159265358979311600, paramFoo.getValue());
    assertEquals('3.141592653589793', String(paramFoo.getValue()));
    assertRoughlyEquals(Math.PI, paramFoo.getValue(), 1e-15);
    assertEquals(0, paramFoo.getLowerLimit());
    assertEquals(Infinity, paramFoo.getUpperLimit());
    const paramFooBar = new ParameterNumber(mockSubj2, MockSubject2.FOOBARNESS, MockSubject2.FOOBARNESS, () => mockSubj2.getFooBarness(), (a) => mockSubj2.setFooBarness(a));
    mockSubj2.addParameter(paramFooBar);
    assertEquals(Util.toName(MockSubject2.FOOBARNESS), paramFooBar.getName());
    assertEquals(mockSubj2, paramFooBar.getSubject());
    assertTrue(paramFooBar instanceof ParameterNumber);
    assertEquals(0, paramFooBar.getValue());
    assertEquals(undefined, paramFooBar.setValue(10));
    assertEquals(10, paramFooBar.getValue());
    assertEquals(paramFooBar, mockSubj2.getParameterNumber(MockSubject2.FOOBARNESS));
}
;
function testParameterNumber3() {
    startTest(groupName + 'testParameterNumber3');
    const mockSubj3 = new MockSubject3();
    assertEquals(0, mockSubj3.getFooness());
    assertEquals(0, mockSubj3.getFooBarness());
    const paramFoo = new ParameterNumber(mockSubj3, MockSubject3.FOONESS, MockSubject3.FOONESS, () => mockSubj3.getFooness(), (a) => mockSubj3.setFooness(a));
    assertEquals('FOONESS', paramFoo.getName());
    assertEquals(mockSubj3, paramFoo.getSubject());
    assertTrue(paramFoo instanceof ParameterNumber);
    assertEquals(0, paramFoo.getValue());
    assertEquals(undefined, paramFoo.setValue(10));
    assertEquals(10, paramFoo.getValue());
    paramFoo.setValue(parseFloat('3.14159265358979323846'));
    assertEquals('3.141592653589793', String(paramFoo.getValue()));
    assertRoughlyEquals(Math.PI, paramFoo.getValue(), 1e-15);
    assertEquals(0, paramFoo.getLowerLimit());
    assertEquals(Infinity, paramFoo.getUpperLimit());
    const paramFooBar = new ParameterNumber(mockSubj3, MockSubject3.FOOBARNESS, MockSubject3.FOOBARNESS, () => mockSubj3.getFooBarness(), (a) => mockSubj3.setFooBarness(a));
    assertEquals(MockSubject3.FOOBARNESS, paramFooBar.getName());
    assertEquals(mockSubj3, paramFooBar.getSubject());
    assertTrue(paramFooBar instanceof ParameterNumber);
    assertEquals(0, paramFooBar.getValue());
    assertEquals(undefined, paramFooBar.setValue(10));
    assertEquals(10, paramFooBar.getValue());
}
;
function testParameterNumber4() {
    startTest(groupName + 'testParameterNumber4');
    const mockSubj2 = new MockSubject4();
    const pi = Math.PI;
    const e = Math.E;
    const sqrt2 = Math.sqrt(2);
    const paramFooness = new ParameterNumber(mockSubj2, MockSubject4.FOONESS, MockSubject4.FOONESS, () => mockSubj2.getFooness(), (a) => mockSubj2.setFooness(a), ['pi', 'e', 'sqrt(2)'], [pi, e, sqrt2]);
    mockSubj2.addParameter(paramFooness);
    assertEquals(MockSubject4.FOONESS, paramFooness.getName());
    assertEquals(mockSubj2, paramFooness.getSubject());
    assertTrue(paramFooness instanceof ParameterNumber);
    assertRoughlyEquals(0.1, paramFooness.getValue(), 1E-15);
    assertThrows(() => paramFooness.setValue(10));
    assertRoughlyEquals(0.1, paramFooness.getValue(), 1E-15);
    assertEquals(paramFooness, mockSubj2.getParameter(MockSubject4.FOONESS));
    assertEquals(paramFooness, mockSubj2.getParameterNumber(MockSubject4.FOONESS));
    assertThrows(() => mockSubj2.getParameterString(MockSubject4.FOONESS));
    assertThrows(() => mockSubj2.getParameterBoolean(MockSubject4.FOONESS));
    assertEquals(3, paramFooness.getChoices().length);
    assertEquals(3, paramFooness.getValues().length);
    assertEquals('pi', paramFooness.getChoices()[0]);
    assertEquals(pi, Number(paramFooness.getValues()[0]));
    paramFooness.setValue(Number(paramFooness.getValues()[0]));
    assertEquals(pi, paramFooness.getValue());
    assertEquals('e', paramFooness.getChoices()[1]);
    assertEquals(e, Number(paramFooness.getValues()[1]));
    paramFooness.setValue(Number(paramFooness.getValues()[1]));
    assertEquals(e, paramFooness.getValue());
    assertEquals('sqrt(2)', paramFooness.getChoices()[2]);
    assertEquals(sqrt2, Number(paramFooness.getValues()[2]));
    paramFooness.setValue(Number(paramFooness.getValues()[2]));
    assertEquals(sqrt2, paramFooness.getValue());
    const paramFooBar = new ParameterNumber(mockSubj2, MockSubject4.FOOBARNESS, MockSubject4.FOOBARNESS, () => mockSubj2.getFooBarness(), (a) => mockSubj2.setFooBarness(a), ['none', 'some', 'lots'], [0, 5, 1000]);
    mockSubj2.addParameter(paramFooBar);
    assertEquals(MockSubject4.FOOBARNESS, paramFooBar.getName());
    assertEquals(mockSubj2, paramFooBar.getSubject());
    assertTrue(paramFooBar instanceof ParameterNumber);
    assertEquals(1000000, paramFooBar.getValue());
    assertThrows(() => paramFooBar.setValue(10));
    assertEquals(1000000, paramFooBar.getValue());
    assertEquals(paramFooBar, mockSubj2.getParameterNumber(MockSubject4.FOOBARNESS));
    assertThrows(() => mockSubj2.getParameterString(MockSubject4.FOONESS));
    assertThrows(() => mockSubj2.getParameterBoolean(MockSubject4.FOONESS));
    assertEquals(3, paramFooBar.getChoices().length);
    assertEquals(3, paramFooBar.getValues().length);
    assertEquals('none', paramFooBar.getChoices()[0]);
    assertEquals(0, Number(paramFooBar.getValues()[0]));
    paramFooBar.setValue(Number(paramFooBar.getValues()[0]));
    assertEquals(0, paramFooBar.getValue());
    assertEquals('some', paramFooBar.getChoices()[1]);
    assertEquals(5, Number(paramFooBar.getValues()[1]));
    paramFooBar.setValue(Number(paramFooBar.getValues()[1]));
    assertEquals(5, paramFooBar.getValue());
    assertEquals('lots', paramFooBar.getChoices()[2]);
    assertEquals(1000, Number(paramFooBar.getValues()[2]));
    paramFooBar.setValue(Number(paramFooBar.getValues()[2]));
    assertEquals(1000, paramFooBar.getValue());
    const bazChoices = ['red', 'green', 'blue', 'black'];
    const paramBaz = new ParameterNumber(mockSubj2, MockSubject4.BAZ, MockSubject4.BAZ, () => mockSubj2.getBaz(), (a) => mockSubj2.setBaz(a), bazChoices, Util.range(bazChoices.length));
    mockSubj2.addParameter(paramBaz);
    assertEquals(MockSubject4.BAZ, paramBaz.getName());
    assertEquals(mockSubj2, paramBaz.getSubject());
    assertTrue(paramBaz instanceof ParameterNumber);
    assertEquals(0, paramBaz.getValue());
    assertThrows(() => paramBaz.setValue(10));
    assertEquals(0, paramBaz.getValue());
    assertEquals(paramBaz, mockSubj2.getParameterNumber(MockSubject4.BAZ));
    assertThrows(() => mockSubj2.getParameterString(MockSubject4.BAZ));
    assertThrows(() => mockSubj2.getParameterBoolean(MockSubject4.BAZ));
    assertEquals(4, paramBaz.getChoices().length);
    assertEquals(4, paramBaz.getValues().length);
    assertEquals('red', paramBaz.getChoices()[0]);
    assertEquals(0, Number(paramBaz.getValues()[0]));
    paramBaz.setValue(Number(paramBaz.getValues()[0]));
    assertEquals(0, paramBaz.getValue());
    assertEquals('green', paramBaz.getChoices()[1]);
    assertEquals(1, Number(paramBaz.getValues()[1]));
    paramBaz.setValue(Number(paramBaz.getValues()[1]));
    assertEquals(1, paramBaz.getValue());
    assertEquals('blue', paramBaz.getChoices()[2]);
    assertEquals(2, Number(paramBaz.getValues()[2]));
    paramBaz.setValue(Number(paramBaz.getValues()[2]));
    assertEquals(2, paramBaz.getValue());
    assertEquals('black', paramBaz.getChoices()[3]);
    assertEquals(3, Number(paramBaz.getValues()[3]));
    paramBaz.setValue(Number(paramBaz.getValues()[3]));
    assertEquals(3, paramBaz.getValue());
    assertThrows(() => {
        new ParameterNumber(mockSubj2, MockSubject4.FOOBARNESS, MockSubject4.FOOBARNESS, () => mockSubj2.getFooBarness(), (a) => mockSubj2.setFooBarness(a), ['none', 'some', 'lots', 'too many'], [0, 5, 1000]);
    });
}
;
class MockSubject1 {
    constructor() {
        this.fooness_ = 0;
        this.fooBarness_ = 0;
        this.symbol_ = '';
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
    getName() { return ''; }
    ;
    addObserver(observer) { observer === undefined; }
    ;
    removeObserver(observer) { observer === undefined; }
    ;
    getObservers() { return []; }
    ;
    getParameters() { return []; }
    ;
    getParameter(name) { throw name; }
    ;
    getParameterBoolean(name) { throw name; }
    ;
    getParameterNumber(name) { throw name; }
    ;
    getParameterString(name) { throw name; }
    ;
    broadcastParameter(name) { name === undefined; }
    ;
    broadcast(event) { event === undefined; }
    ;
    toStringShort() { return 'MockSubject1'; }
    ;
}
MockSubject1.FOONESS = 'FOONESS';
MockSubject1.FOOBARNESS = 'FOO_BARNESS';
class MockSubject2 extends AbstractSubject {
    constructor() {
        super('MOCK');
        this.fooness_ = 0;
        this.fooBarness_ = 0;
    }
    ;
    getClassName() {
        return 'MockSubject2';
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
}
MockSubject2.FOONESS = 'fooness';
MockSubject2.FOOBARNESS = 'foo-barness';
class MockSubject3 extends AbstractSubject {
    constructor() {
        super('MOCK');
        this.fooness_ = 0;
        this.fooBarness_ = 0;
    }
    ;
    getClassName() {
        return 'MockSubject3';
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
}
MockSubject3.FOONESS = 'FOONESS';
MockSubject3.FOOBARNESS = 'FOO_BARNESS';
class MockSubject4 extends AbstractSubject {
    constructor() {
        super('MOCK');
        this.fooness_ = 0.1;
        this.fooBarness_ = 1000000;
        this.baz_ = 0;
    }
    ;
    getClassName() {
        return 'MockSubject4';
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
    getBaz() {
        return this.baz_;
    }
    ;
    setBaz(value) {
        this.baz_ = value;
    }
    ;
}
MockSubject4.FOONESS = 'FOONESS';
MockSubject4.FOOBARNESS = 'FOO_BARNESS';
MockSubject4.BAZ = 'BAZ';
