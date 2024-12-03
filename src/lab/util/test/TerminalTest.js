import { Util } from "../Util.js";
import { Terminal } from "../Terminal.js";
import { assertEquals, schedule, startTest, assertTrue, assertRoughlyEquals, assertNotNull, assertUndefined, assertElementsEquals } from "../../../test/TestRig.js";
import { EasyScriptParser } from "../EasyScriptParser.js";
export default function scheduleTests() {
    schedule(testTerminal1);
    schedule(testTerminal2);
    schedule(testTerminal3);
    schedule(testTerminal6);
    schedule(testTerminal8);
}
;
const groupName = 'TerminalTest.';
function testTerminal1() {
    startTest(groupName + 'testTerminal1');
    const output_elem = document.createElement('textarea');
    const input_elem = document.createElement('input');
    input_elem.type = 'text';
    const t = new Terminal(input_elem, output_elem);
    Util.defineGlobal('terminal', t, true);
    Util.assert(t === window.terminal);
    t.clear();
    Terminal.stdRegex(t);
    assertEquals(4, t.eval('2+2'));
    assertEquals('> 2+2\n4\n', output_elem.value);
    assertEquals('lab$util$DoubleRect', t.expand('DoubleRect'));
    let txt = 'replace this DoubleRect "but not this DoubleRect " and  "also not this \\\"DoubleRect\\\""';
    let exp = 'replace this lab$util$DoubleRect "but not this DoubleRect " and  "also not this \\\"DoubleRect\\\""';
    assertEquals(exp, t.expand(txt));
    txt = " this Vector is OK 'but not this Vector' and also 'don\\\'t process \"this Vector\"' and dont get confused by \"that 'Vector over there'\" or \"this 3\\\" Vector here\"";
    exp = " this lab$util$Vector is OK 'but not this Vector' and also 'don\\\'t process \"this Vector\"' and dont get confused by \"that 'Vector over there'\" or \"this 3\\\" Vector here\"";
    assertEquals(exp, t.expand(txt));
    t.eval('z.a = 1;');
    output_elem.value = '';
    t.eval('z.a');
    assertEquals('> z.a\n1\n', output_elem.value);
    assertTrue(t.eval('Util.toName("foo;")=="FOO;"'));
    assertEquals(6, t.eval('{1;2;3+3}'));
    assertEquals(3, t.eval('{1;{2;3}}'));
    assertEquals('foo;bar', t.eval('"baz";"foo;"+"bar"'));
    assertEquals('foo"bar', t.eval('"baz";"foo\\""+"bar"'));
    assertEquals(3, t.vars().length);
    assertEquals('parser', t.vars()[0]);
    Util.defineGlobal('foobar', '_FOOBAR_', true);
    t.addToVars('foobar');
    Util.defineGlobal('baz', '_BAZ_', true);
    t.addToVars('baz');
    assertEquals(5, t.vars().length);
    assertElementsEquals(['baz', 'foobar', 'parser', 'result', 'z'], t.vars());
    assertEquals('_FOOBAR_', t.eval('foobar'));
    assertEquals('_FOOBAR_', window.foobar);
    assertEquals('_BAZ_', t.eval('baz'));
    assertEquals('_BAZ_', window.baz);
    assertEquals('_BAZ__FOOBAR_', t.eval('baz += foobar'));
    assertEquals('_BAZ__FOOBAR_', t.eval('baz'));
    assertEquals('_BAZ__FOOBAR_', window.baz);
    window.foobar = 'barfoo';
    assertEquals('barfoo', t.eval('foobar'));
    window.foobar = undefined;
    window.baz = undefined;
    window.terminal = undefined;
}
;
function testTerminal2() {
    startTest(groupName + 'testTerminal2');
    const output_elem = document.createElement('textarea');
    const input_elem = document.createElement('input');
    input_elem.type = 'text';
    window.terminal = new Terminal(input_elem, output_elem);
    const t = window.terminal;
    Terminal.stdRegex(t);
    const easyScript = new EasyScriptParser([]);
    easyScript.saveStart();
    t.setParser(easyScript);
    assertEquals(4, t.eval('2+2', true));
    assertEquals(4, t.eval('result', true));
    let out = output_elem.value;
    assertUndefined(t.eval('result', false));
    assertEquals(6, t.eval('3+3;result', false));
    assertUndefined(t.eval('result', false));
    assertEquals(out, output_elem.value);
    assertEquals(4, t.eval('result', true));
    out = output_elem.value;
    assertUndefined(t.eval('  ', false));
    assertUndefined(t.eval(' \t ', false));
    assertUndefined(t.eval('\t', false));
    assertUndefined(t.eval('\n', false));
    assertUndefined(t.eval(' \n ', false));
    assertUndefined(t.eval(' \t \n ', false));
    assertEquals(out, output_elem.value);
    assertEquals('window', t.eval('"window"', false));
    assertEquals('foobar_', t.eval('"foo"+"bar_"', false));
    assertEquals('Eval', t.eval('"myEval".slice(2,6)', false));
    assertEquals('foobar_', t.eval('"foobar_"', false));
    assertEquals(out, output_elem.value);
    assertEquals(window, t.eval('self', false));
    assertEquals(8, t.eval('Util.range(12)[8]', false));
    assertElementsEquals([2, 7], t.eval('z.a=[2, 7]', false));
    assertElementsEquals([-2, 1.7], t.eval('[-2, 1.7]', false));
    let r = 0;
    const afterFn = () => r++;
    t.setAfterEval(afterFn);
    assertEquals(5, t.eval('2+3', true));
    assertEquals(1, r);
    assertEquals(7, t.eval('4+3', false));
    assertEquals(1, r);
    assertEquals(21, t.eval('7*3', true));
    assertEquals(2, r);
    assertEquals(4, t.eval('eval("2+2")', false));
}
;
function testTerminal3() {
    startTest(groupName + 'testTerminal3');
    const output_elem = document.createElement('textarea');
    const input_elem = document.createElement('input');
    input_elem.type = 'text';
    window.terminal = new Terminal(input_elem, output_elem);
    const t = window.terminal;
    Terminal.stdRegex(t);
    assertEquals(4, t.eval('2+2'));
    assertEquals(3, t.eval('var foo=3'));
    assertEquals(3, t.eval('foo'));
    assertEquals(3, t.eval('z.foo'));
    assertEquals(4, t.vars().length);
    assertElementsEquals(['foo', 'parser', 'result', 'z'], t.vars());
    assertEquals(7, t.eval('foo=7'));
    assertEquals(7, t.eval('foo'));
    assertEquals(7, t.eval('z.foo'));
    assertEquals(4, t.eval('let bar=4'));
    assertEquals(5, t.vars().length);
    assertElementsEquals(['bar', 'foo', 'parser', 'result', 'z'], t.vars());
    assertEquals(28, t.eval('foo*bar'));
    assertEquals(42, t.eval('var a=6; var b=7; a*b'));
    assertElementsEquals(['a', 'b', 'bar', 'foo', 'parser', 'result', 'z'], t.vars());
    assertEquals(7, t.vars().length);
    assertEquals(6, t.eval('a'));
    assertEquals(7, t.eval('b'));
    assertEquals(5, t.eval('var b=5'));
    assertEquals(30, t.eval('a*b'));
    t.setVerbose(true);
    output_elem.value = '';
    assertEquals(2, t.eval('1;2'));
    assertEquals('> 1;\n' +
        '>> 1;\n' +
        '> 2\n' +
        '>> 2\n' +
        '2\n', output_elem.value);
    output_elem.value = '';
    assertEquals(2, t.eval('1//com;ment\n2'));
    assertEquals('> 1//com;ment\n' +
        '>> 1//com;ment\n' +
        '> 2\n' +
        '>> 2\n' +
        '2\n', output_elem.value);
    output_elem.value = '';
    assertEquals(5, t.eval('var b =/* new Vector */5'));
    assertEquals('> var b =/* new Vector */5\n' +
        '>> terminal.z.b =/* new lab$util$Vector */5\n' +
        '5\n', output_elem.value);
    output_elem.value = '';
    assertEquals(3, t.eval('3//5; new Vector(1,1)'));
    assertEquals('> 3//5; new Vector(1,1)\n' +
        '>> 3//5; new lab$util$Vector(1,1)\n' +
        '3\n', output_elem.value);
    output_elem.value = '';
    assertEquals(5, t.eval('3 //foo; new Vector(1,1)\n5'));
    assertEquals('> 3 //foo; new Vector(1,1)\n' +
        '>> 3 //terminal.z.foo; new lab$util$Vector(1,1)\n' +
        '> 5\n' +
        '>> 5\n' +
        '5\n', output_elem.value);
    assertUndefined(t.eval('123/*foo*/456', true, false));
    assertNotNull(t.getError().match(/.*SyntaxError.*/i));
    t.setVerbose(false);
    assertEquals(30, t.eval('5 * /* multi \n line comment*/ 6'));
    assertEquals(30, t.eval('5 * \n 6'));
    assertEquals(6, t.eval('5 \n 6'));
    assertEquals(99, t.eval('const foobar2=99'));
    assertEquals(99, t.eval('foobar2'));
    assertEquals(99, t.eval('z.foobar2'));
}
;
function testTerminal6() {
    startTest(groupName + 'testTerminal6');
    window.terminal = new Terminal(null, null);
    const t = window.terminal;
    Terminal.stdRegex(t);
    assertEquals(4, t.eval('2+2'));
    assertEquals(4, t.eval('result'));
    t.eval('var a');
    assertEquals(3, t.eval('eval("1+1;a=result")+1'));
    assertEquals(3, t.eval('result'));
    assertEquals(2, t.eval('a'));
}
;
function testTerminal8() {
    startTest(groupName + 'testTerminal8');
    window.terminal = new Terminal(null, null);
    const t = window.terminal;
    Terminal.stdRegex(t);
    assertEquals(4, t.eval('2+2'));
    assertEquals('lab$util$DoubleRect', t.expand('DoubleRect'));
    let txt = 'SIM_VARS.foo=1.00;';
    let r = t.eval('"' + txt + '".match(/SIM_VARS.*;/)');
    assertEquals(txt, r[0]);
    txt = 'foo\'bar';
    r = t.eval('"' + txt + '".match(/.*\'.*/)');
    assertEquals(txt, r[0]);
    assertRoughlyEquals(0.5, t.eval('(1/8) + (3/8)'), 1E-10);
    assertRoughlyEquals(0.5, t.eval('(1\t/8)+ (3 /8)'), 1E-10);
    assertRoughlyEquals(3 / 8, t.eval('(1/8);(3/8)'), 1E-10);
    assertRoughlyEquals(3 / 8, t.eval('(1\t/8);(3 /8)'), 1E-10);
    assertUndefined(t.eval('foo"bar', true, false));
    assertNotNull(t.getError().match(/.*SyntaxError.*/i));
    assertUndefined(t.eval('\'incomplete string', true, false));
    assertNotNull(t.getError().match(/.*SyntaxError.*/i));
    txt = 'foo/bar';
    r = t.eval('"' + txt + '".match(/.*\\/.*/)');
    assertEquals(txt, r[0]);
    r = t.eval('"' + txt + '".match(/.*[/].*/)');
    assertEquals(txt, r[0]);
}
;
