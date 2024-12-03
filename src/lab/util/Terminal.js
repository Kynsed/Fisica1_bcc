import { Util } from "./Util.js";
;
export class Terminal {
    constructor(term_input, term_output) {
        this.afterEvalFn_ = undefined;
        this.changeFn_ = undefined;
        this.hasAlerted_ = false;
        this.history_ = [];
        this.histIndex_ = -1;
        this.verbose_ = false;
        this.regexs_ = [];
        this.result = undefined;
        this.resultStack_ = [];
        this.z = {};
        this.parser = null;
        this.vars_ = '';
        this.evalCalls_ = 0;
        this.prompt_ = '> ';
        this.term_input_ = term_input;
        if (term_input) {
            term_input.spellcheck = false;
            this.keyDownFn_ = this.handleKey.bind(this);
            term_input.addEventListener('keydown', this.keyDownFn_, false);
        }
        this.term_output_ = term_output;
        if (term_output) {
            term_output.spellcheck = false;
        }
        this.addRegex('eval', 'terminal.', false);
        this.println(Terminal.version());
    }
    ;
    toString() {
        return 'Terminal{history.length: ' + this.history_.length
            + ', regexs_.length: ' + this.regexs_.length
            + ', verbose_: ' + this.verbose_
            + ', parser: ' + (this.parser != null ? this.parser.toStringShort() : 'null')
            + '}';
    }
    ;
    addRegex(names, prefix, opt_addToVars, opt_prepend) {
        const addToVars = opt_addToVars ?? true;
        if (names.length == 0) {
            throw '';
        }
        if (addToVars) {
            const nms = names.split('|');
            const vrs = this.vars_.split('|');
            nms.forEach(nm => {
                if (!vrs.includes(nm)) {
                    this.vars_ += (this.vars_.length > 0 ? '|' : '') + nm;
                }
            });
        }
        const regex = new RegExp('(^|[^\\w.$])(' + names + ')\\b', 'g');
        const replace = '$1' + prefix + '$2';
        return this.addRegex2(regex, replace, opt_prepend);
    }
    ;
    addRegex2(regex, replace, opt_prepend) {
        const re = {
            regex: regex,
            replace: replace
        };
        if (!this.hasRegex(re)) {
            if (opt_prepend) {
                this.regexs_.unshift(re);
            }
            else {
                this.regexs_.push(re);
            }
            return true;
        }
        return false;
    }
    ;
    addToVars(name) {
        this.vars_ += (this.vars_.length > 0 ? '|' : '') + name;
    }
    ;
    alertOnce(msg) {
        if (!this.hasAlerted_) {
            this.hasAlerted_ = true;
            alert(msg);
        }
        else {
            console.log(msg);
        }
    }
    ;
    clear() {
        if (this.term_output_) {
            this.term_output_.value = '';
        }
    }
    ;
    commands() {
        if (this.term_output_) {
            let t = this.term_output_.value.split('\n');
            t = t.map(e => e.trim());
            t = t.filter((e) => e.length > 2 && e.substr(0, 2) == '> '
                && !e.match(/^> (terminal|this).(remember|commands)\(\s*\);?$/));
            t = t.map(e => e.substr(2));
            return t;
        }
        else {
            return [];
        }
    }
    ;
    destroy() {
        if (this.keyDownFn_ && this.term_input_) {
            this.term_input_.removeEventListener('keydown', this.keyDownFn_, false);
        }
        if (this.changeFn_ && this.term_input_) {
            this.term_input_.removeEventListener('change', this.changeFn_, true);
        }
    }
    ;
    static encodeURIComponent(str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16));
    }
    eval(script, output = true, showAlert = true) {
        script = script.trim();
        if (script.match(/^\s*$/)) {
            return undefined;
        }
        this.evalCalls_++;
        if (this.evalCalls_ > 1) {
            output = false;
        }
        if (output) {
            Util.assert(this.evalCalls_ == 1);
            Util.assert(this.resultStack_.length == 0);
            this.history_.unshift(script);
            this.histIndex_ = -1;
        }
        else {
            this.resultStack_.push(this.result);
            this.result = undefined;
        }
        const prompt = this.prompt_;
        try {
            let cmds = ['', script];
            while (cmds = this.splitAtSemicolon(cmds[1]), cmds[0]) {
                const cmd = cmds[0].trim();
                if (cmd.length == 0) {
                    continue;
                }
                execute_cmd: {
                    if (output) {
                        this.println(prompt + cmd);
                    }
                    if (cmd.match(/^\s*\/\/.*/)) {
                        continue;
                    }
                    if (this.parser != null) {
                        const parseResult = this.parser.parse(cmd);
                        if (parseResult !== undefined) {
                            this.result = parseResult;
                            break execute_cmd;
                        }
                    }
                    const expScript = this.expand(cmd);
                    if (output && this.verbose_) {
                        this.println(prompt.trim() + prompt + expScript);
                    }
                    try {
                        this.result = (0, eval)('"use strict";' + expScript);
                    }
                    catch (ex) {
                        throw `${ex} in script "${expScript}"`;
                    }
                }
            }
            if (output && this.result !== undefined && script.slice(-1) != ';') {
                this.println(String(this.result));
            }
            if (output && this.afterEvalFn_ !== undefined) {
                this.afterEvalFn_();
            }
            this.error = '';
        }
        catch (ex) {
            this.error = String(ex);
            if (output) {
                this.result = undefined;
                this.println(String(ex));
            }
            else {
                this.result = this.resultStack_.pop();
            }
            if (showAlert) {
                Util.showErrorAlert(String(ex));
                if (this.afterErrorFn !== undefined) {
                    this.afterErrorFn();
                }
            }
        }
        this.evalCalls_--;
        if (output) {
            this.scrollDown();
            return this.result;
        }
        else {
            const r = this.result;
            this.result = this.resultStack_.pop();
            return r;
        }
    }
    ;
    expand(script) {
        let c = this.replaceVar(script);
        let exp = '';
        let count = 0;
        while (c) {
            if (++count > 10000) {
                throw 'Terminal.expand';
            }
            let a = c.match(/^[^'"/]+/);
            if (a !== null) {
                let e = a[0];
                c = c.slice(e.length);
                e = this.regexs_.reduce((cmd, rp) => cmd.replace(rp.regex, rp.replace), e);
                exp += e;
                if (c.length == 0) {
                    break;
                }
            }
            if (exp.match(/.*[=(][ ]*$/)) {
                a = c.match(/^\/[^*/](\\\/|[^\\/])*\//);
                if (a !== null) {
                    const e = a[0];
                    c = c.slice(e.length);
                    exp += e;
                    continue;
                }
            }
            if (c.length > 0 && c[0] == '/') {
                exp += '/';
                c = c.slice(1);
                continue;
            }
            a = c.match(/^"(\\.|[^\\"])*"/);
            if (a !== null) {
                const e = a[0];
                c = c.slice(e.length);
                exp += e;
                continue;
            }
            if (c.length > 0 && c[0] == '"') {
                exp += '"';
                c = c.slice(1);
                continue;
            }
            a = c.match(/^'(\\.|[^\\'])*'/);
            if (a !== null) {
                const e = a[0];
                c = c.slice(e.length);
                exp += e;
                continue;
            }
            if (c.length > 0 && c[0] == '\'') {
                exp += '\'';
                c = c.slice(1);
                continue;
            }
        }
        return exp;
    }
    ;
    focus() {
        if (this.term_input_) {
            this.term_input_.focus();
        }
    }
    ;
    getError() {
        return this.error;
    }
    ;
    handleKey(e) {
        if (e.type !== 'keydown') {
            return;
        }
        const evt = e;
        if (this.term_input_ && this.term_output_) {
            if (evt.metaKey && evt.key === "k") {
                this.term_output_.value = '';
                evt.preventDefault();
            }
            else if (evt.key === "ArrowUp" || evt.key === "ArrowDown") {
                if (this.histIndex_ == -1 && this.term_input_.value != '') {
                    this.history_.unshift(this.term_input_.value);
                    this.histIndex_ = 0;
                }
                if (evt.key === "ArrowUp") {
                    if (this.histIndex_ < this.history_.length - 1) {
                        this.histIndex_++;
                        this.term_input_.value = this.history_[this.histIndex_];
                    }
                }
                else if (evt.key === "ArrowDown") {
                    if (this.histIndex_ > 0) {
                        this.histIndex_--;
                        this.term_input_.value = this.history_[this.histIndex_];
                    }
                    else {
                        this.histIndex_ = -1;
                        this.term_input_.value = '';
                    }
                }
                evt.preventDefault();
            }
            else if (evt.key === "Enter") {
                this.eval(this.term_input_.value, true, false);
            }
        }
    }
    ;
    hasRegex(q) {
        const regex = q.regex.toString();
        const replace = q.replace;
        return this.regexs_.some((r) => r.replace == replace &&
            r.regex.toString() == regex);
    }
    ;
    inputCallback(_evt) {
        if (this.term_input_) {
            this.eval(this.term_input_.value, true, false);
        }
    }
    ;
    parseURL() {
        if (this.parser != null) {
            this.parser.saveStart();
        }
        const loc = window.location.href;
        const queryIdx = loc.indexOf('?');
        if (queryIdx > -1) {
            let cmd = loc.slice(queryIdx + 1);
            cmd = decodeURIComponent(cmd);
            this.eval(cmd, true, true);
            return true;
        }
        return false;
    }
    ;
    println(text) {
        if (this.term_output_) {
            this.term_output_.value += text + '\n';
            this.scrollDown();
        }
    }
    ;
    replaceVar(script) {
        const m = script.match(/^\s*(var|let|const)\s+(\w[\w_\d]*)(.*)/);
        if (m) {
            Util.assert(m.length >= 4);
            const varName = m[2];
            this.addRegex(varName, 'z.', true, true);
            return m[2] + m[3];
        }
        return script;
    }
    ;
    scrollDown() {
        if (this.term_input_ && this.term_output_) {
            this.term_output_.scrollTop = this.term_output_.scrollHeight
                - this.term_output_.offsetHeight;
            this.term_input_.value = '';
        }
    }
    ;
    setAfterEval(afterEvalFn) {
        this.afterEvalFn_ = afterEvalFn;
    }
    ;
    setParser(parser) {
        this.parser = parser;
        parser.addCommand('vars', () => String(this.vars()), 'lists available variables');
    }
    ;
    setPrompt(prompt) {
        this.prompt_ = String(prompt);
    }
    ;
    setVerbose(expand) {
        this.verbose_ = expand;
    }
    ;
    splitAtSemicolon(text) {
        let level = 0;
        let lastNonSpace = '';
        let lastChar = '';
        let nextChar = '';
        let c = '';
        let commentMode = false;
        let regexMode = false;
        let quoteMode = false;
        let quoteChar = '';
        let i, n;
        for (i = 0, n = text.length; i < n; i++) {
            lastChar = c;
            if (c != ' ' && c != '\t' && c != '\n') {
                lastNonSpace = c;
            }
            c = text[i];
            nextChar = i + 1 < n ? text[i + 1] : '\0';
            if (commentMode) {
                if (c == '\n') {
                    commentMode = false;
                    if (level == 0) {
                        break;
                    }
                }
            }
            else if (regexMode) {
                if (c == '/' && lastChar != '\\') {
                    regexMode = false;
                }
            }
            else if (quoteMode) {
                if (c == quoteChar && lastChar != '\\') {
                    quoteMode = false;
                    quoteChar = '';
                }
            }
            else {
                if (c == '/') {
                    if (nextChar == '/') {
                        commentMode = true;
                    }
                    else if (nextChar != '*' &&
                        lastNonSpace && (lastNonSpace == '=' || lastNonSpace == '(')) {
                        regexMode = true;
                    }
                }
                else if (c == '"' || c == '\'') {
                    quoteMode = true;
                    quoteChar = c;
                }
                else if (c == ';' && level == 0) {
                    break;
                }
                else if (c == '{') {
                    level++;
                }
                else if (c == '}') {
                    level--;
                }
            }
        }
        return [text.slice(0, i + 1), text.slice(i + 1)];
    }
    ;
    static stdRegex(terminal) {
        terminal.addRegex('methodsOf|propertiesOf|prettyPrint', 'Util.', false);
        terminal.addRegex('println', 'terminal.', false);
        terminal.addRegex('getParameter|getSubject', 'terminal.parser.', false);
        terminal.addRegex('result|z|parser', 'terminal.', true);
        terminal.addRegex('AffineTransform|CircularList|Clock|ClockTask'
            + '|DoubleRect|EasyScriptParser|GenericEvent|GenericMemo|GenericObserver'
            + '|MutableVector|ParameterBoolean|ParameterNumber|ParameterString'
            + '|RandomLCG|Terminal|Timer|Util|Vector', 'lab$$util$$', false);
        terminal.addRegex('NF0|NF2|NF1S|NF3|NF5|NF5E|nf5|nf7|NF7|NF7E|NF9|NFE|NFSCI', 'Util.', false);
        terminal.addRegex('CollisionAdvance|ConcreteVariable|ConcreteLine|ConstantForceLaw'
            + '|CoordType|DampingLaw|EulersMethod|Force|FunctionVariable'
            + '|GravityLaw|Gravity2Law|MassObject|ModifiedEuler'
            + '|NumericalPath|ParametricPath|OvalPath|PointMass'
            + '|RungeKutta|ShapeType|SimList|SimpleAdvance|Spring|VarsList', 'lab$$model$$', false);
        terminal.addRegex('CoordMap|DisplayClock|DisplayConnector|DisplayLine|DisplayList'
            + '|DisplayPath|DisplayShape|DisplayRope|DisplaySpring|DisplayText'
            + '|DrawingMode|DrawingStyle|HorizAlign|LabCanvas|SimView|DisplayArc'
            + '|ScreenRect|SimView|VerticalAlign', 'lab$$view$$', false);
        terminal.addRegex('CircularEdge|CollisionHandling|ConcreteVertex|ContactSim'
            + '|EdgeRange|ExtraAccel|ImpulseSim|Joint|JointUtil|PathJoint|Polygon'
            + '|RigidBodyCollision|RigidBodySim|Rope|Scrim|Shapes|StraightEdge'
            + '|ThrusterSet|Vertex|Walls', 'lab$$engine2D$$', false);
        terminal.addRegex('AutoScale|DisplayGraph|GraphColor|GraphLine|EnergyBarGraph'
            + '|GraphStyle|DisplayAxes|VarsHistory', 'lab$$graph$$', false);
        terminal.addRegex('EventHandler|MouseTracker|RigidBodyEventHandler'
            + '|SimController|SimRunner|ViewPanner', 'lab$$app$$', false);
        terminal.addRegex('ButtonControl|CheckBoxControl|CheckBoxControlBase|ChoiceControl'
            + '|ChoiceControlBase|LabelControl|NumericControl|NumericControlBase'
            + '|SliderControl|TextControl|TextControlBase|ToggleControl', 'lab$$controls$$', false);
    }
    ;
    vars() {
        const v = this.vars_.split('|');
        v.sort();
        return v;
    }
    ;
    static version() {
        return 'myPhysicsLab version ' + Util.VERSION + ', '
            + 'compiled on ' + Util.COMPILE_TIME + '.';
    }
}
Util.defineGlobal('lab$util$Terminal', Terminal);
