import { ParameterBoolean } from "../Observe.js";
import { AbstractSubject } from "../AbstractSubject.js";
import { assertEquals, schedule, startTest, assertThrows, assertTrue, assertFalse } from "../../../test/TestRig.js";
export default function scheduleTests() {
    schedule(testParameterBoolean1);
}
;
const groupName = 'ParameterBooleanTest.';
function testParameterBoolean1() {
    startTest(groupName + 'testParameterBoolean1');
    const mockSubj1 = new MockSubject1();
    assertFalse(mockSubj1.getFooness());
    assertTrue(mockSubj1.getFooBarness());
    const paramFoo = new ParameterBoolean(mockSubj1, MockSubject1.FOONESS, MockSubject1.FOONESS, () => mockSubj1.getFooness(), a => mockSubj1.setFooness(a));
    mockSubj1.addParameter(paramFoo);
    assertEquals('FOONESS', paramFoo.getName());
    assertTrue(paramFoo.nameEquals('fooness'));
    assertEquals(mockSubj1, paramFoo.getSubject());
    assertTrue(paramFoo instanceof ParameterBoolean);
    assertEquals(paramFoo, mockSubj1.getParameterBoolean(MockSubject1.FOONESS));
    assertFalse(paramFoo.getValue());
    assertEquals('false', paramFoo.getAsString());
    assertEquals(undefined, paramFoo.setValue(true));
    assertTrue(paramFoo.getValue());
    assertEquals('true', paramFoo.getAsString());
    paramFoo.setValue(false);
    assertFalse(paramFoo.getValue());
    assertEquals(0, paramFoo.getValues().length);
    assertEquals(0, paramFoo.getChoices().length);
    paramFoo.setFromString('true');
    assertTrue(paramFoo.getValue());
    paramFoo.setFromString('false');
    assertFalse(paramFoo.getValue());
    const paramFooBar = new ParameterBoolean(mockSubj1, MockSubject1.FOOBARNESS, MockSubject1.FOOBARNESS, () => mockSubj1.getFooBarness(), a => mockSubj1.setFooBarness(a), ['on', 'off'], [true, false]);
    mockSubj1.addParameter(paramFooBar);
    assertEquals(MockSubject1.FOOBARNESS, paramFooBar.getName());
    assertEquals(mockSubj1, paramFooBar.getSubject());
    assertTrue(paramFooBar instanceof ParameterBoolean);
    assertEquals(paramFooBar, mockSubj1.getParameterBoolean(MockSubject1.FOOBARNESS));
    assertTrue(paramFooBar.getValue());
    assertEquals(undefined, paramFooBar.setValue(false));
    assertFalse(paramFooBar.getValue());
    paramFooBar.setValue(true);
    assertTrue(paramFooBar.getValue());
    assertEquals('on', paramFooBar.getChoices()[0]);
    assertEquals('true', paramFooBar.getValues()[0]);
    paramFooBar.setValue(paramFooBar.getValues()[0] == 'true');
    assertTrue(paramFooBar.getValue());
    assertEquals('off', paramFooBar.getChoices()[1]);
    assertEquals('false', paramFooBar.getValues()[1]);
    paramFooBar.setValue(paramFooBar.getValues()[1] == 'true');
    assertFalse(paramFooBar.getValue());
    mockSubj1.removeParameter(paramFoo);
    assertThrows(() => mockSubj1.getParameterBoolean(MockSubject1.FOONESS));
    mockSubj1.removeParameter(paramFooBar);
    assertThrows(() => mockSubj1.getParameterBoolean(MockSubject1.FOOBARNESS));
}
;
class MockSubject1 extends AbstractSubject {
    constructor() {
        super('MOCK');
        this.fooness_ = false;
        this.fooBarness_ = true;
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
}
MockSubject1.FOONESS = 'FOONESS';
MockSubject1.FOOBARNESS = 'FOO_BARNESS';
