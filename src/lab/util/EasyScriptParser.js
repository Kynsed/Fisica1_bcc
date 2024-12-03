import { Util } from "./Util.js";
import { Terminal } from "./Terminal.js";
export class EasyScriptParser {
    constructor(subjects, dependent) {
        this.initialNonDependent_ = [];
        this.initialDependent_ = [];
        this.allSubjParamNames_ = [];
        this.allParamNames_ = [];
        this.allSubjects_ = [];
        this.unique_ = [];
        this.commandNames_ = [];
        this.commandFns_ = [];
        this.commandHelp_ = [];
        EasyScriptParser.checkUniqueNames(subjects);
        this.subjects_ = subjects;
        this.dependent_ = Array.isArray(dependent) ? dependent : [];
        let fnc = (s, idx, a) => {
            if (this.dependent_.includes(s)) {
                a.splice(idx, 1);
            }
        };
        Util.forEachRight(this.subjects_, fnc);
        this.subjects_ = this.subjects_.concat(this.dependent_);
        this.addCommand('url', () => this.scriptURL(), 'prints URL with script to recreate current state');
        this.addCommand('script', () => this.script(), 'prints script to recreate current state');
        this.addCommand('values', () => Util.prettyPrint(this.values()), 'shows available parameters and their current values');
        this.addCommand('names', () => Util.prettyPrint(this.names().join(';')), 'shows available parameter names (format is SUBJECT.PARAMETER)');
        this.addCommand('help', () => this.help(), 'prints this help text');
        this.update();
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', subjects_: ['
            + this.subjects_.map(s => s.toStringShort())
            + ']}';
    }
    ;
    toStringShort() {
        return 'EasyScriptParser{subjects_.length: ' + this.subjects_.length + '}';
    }
    ;
    addCommand(commandName, commandFnc, helpText) {
        this.commandNames_.push(commandName);
        this.commandFns_.push(commandFnc);
        this.commandHelp_.push(helpText);
    }
    ;
    static checkUniqueNames(subjects) {
        const names = [];
        subjects.forEach(subj => {
            const nm = subj.getName();
            if (names.includes(nm)) {
                throw 'duplicate Subject name: ' + nm;
            }
            ;
            names.push(nm);
        });
    }
    ;
    getParameter(fullName) {
        fullName = Util.toName(fullName);
        const n = fullName.split('.');
        let subjectName = '';
        let paramName = '';
        if (n.length == 1) {
            subjectName = '';
            paramName = n[0];
        }
        else if (n.length == 2) {
            subjectName = n[0];
            paramName = n[1];
        }
        else {
            return null;
        }
        let idx;
        if (subjectName == '') {
            const count = this.allParamNames_.reduce((accum, p) => accum + (p == paramName ? 1 : 0), 0);
            if (count > 1) {
                throw 'multiple Subjects have Parameter ' + paramName;
            }
            idx = this.allParamNames_.indexOf(paramName);
        }
        else {
            idx = this.allSubjParamNames_.indexOf(fullName);
        }
        return idx > -1 ? this.allSubjects_[idx].getParameter(paramName) : null;
    }
    ;
    getSubject(name) {
        const subjectName = Util.toName(name);
        let s = this.subjects_.find(s => s.getName() == subjectName);
        if (s === undefined)
            return null;
        else
            return s;
    }
    ;
    getSubjects() {
        return Array.from(this.subjects_);
    }
    ;
    help() {
        let s = Terminal.version() + '\n';
        s += 'Use the "values" command to see what can be set and the syntax.\n\n';
        s += 'command-K            clear Terminal window\n';
        s += 'arrow up/down        retrieve previous or next command\n';
        s += 'getParameter(name)   see "names" command, returns the named Parameter\n';
        s += 'getSubject(name)     see "names" command, returns the named Subject\n';
        s += 'propertiesOf(app)    shows properties of that object\n';
        s += 'methodsOf(app)       shows methods defined on that object\n';
        s += 'prettyPrint(app)     prints the object nicely\n';
        s += 'prettyPrint(app, 3)  prints the object, expanding 3 levels of sub-objects\n';
        s += 'println(1+2)         prints to the Terminal window\n';
        s += 'result               the result of the previous command\n';
        for (let i = 0, len = this.commandNames_.length; i < len; i++) {
            let cn = this.commandNames_[i];
            while (cn.length < 20) {
                cn += ' ';
            }
            s += cn + ' ' + this.commandHelp_[i] + '\n';
        }
        return s;
    }
    ;
    names() {
        return Array.from(this.allSubjParamNames_);
    }
    ;
    namesAndValues(dependent, includeComputed, fullName) {
        dependent = dependent == true;
        const allParams = this.allSubjects_.map((s, idx) => s.getParameter(this.allParamNames_[idx]));
        let params = allParams;
        if (!includeComputed) {
            params = params.filter(p => !p.isComputed());
        }
        params = params.filter(p => this.dependent_.includes(p.getSubject()) == dependent, this);
        const re = /^[a-zA-Z0-9_]+$/;
        const s = params.map(p => {
            const paramName = Util.toName(p.getName());
            const idx = allParams.indexOf(p);
            if (idx < 0)
                throw 'EasyScript error ' + p;
            let v = p.getValue();
            if (typeof v === 'string' && !re.test(v)) {
                v = '"' + v + '"';
            }
            if (!fullName && this.unique_[idx]) {
                return paramName + '=' + v;
            }
            else {
                const subjName = Util.toName(p.getSubject().getName());
                return subjName + '.' + paramName + '=' + v;
            }
        });
        return s.length > 0 ? s.join(';') + ';' : '';
    }
    ;
    parse(script) {
        if (script.slice(-1) == ';') {
            script = script.slice(0, script.length - 1);
        }
        for (let i = 0, len = this.commandNames_.length; i < len; i++) {
            if (script.toLowerCase() == this.commandNames_[i]) {
                return this.commandFns_[i]();
            }
        }
        const a = script.split('=');
        const fullName = Util.toName(a[0].trim());
        const param = this.getParameter(fullName);
        if (param == null || a.length > 2) {
            return undefined;
        }
        if (a.length == 2) {
            let value;
            try {
                value = EasyScriptParser.unquote(a[1].trim());
                param.setFromString(value);
            }
            catch (ex) {
                throw ex + ' while setting value "' + value + '" on parameter ' + fullName;
            }
        }
        return param.getValue();
    }
    ;
    saveStart() {
        this.initialNonDependent_ = this.namesAndValues(false).split(';');
        this.initialDependent_ = this.namesAndValues(true).split(';');
    }
    ;
    script() {
        let ar = this.namesAndValues(false).split(';');
        ar = ar.concat(this.namesAndValues(true).split(';'));
        const initSettings = this.initialNonDependent_.concat(this.initialDependent_);
        let fnc = function (s, idx, arr_) {
            if (initSettings.includes(s)) {
                arr_.splice(idx, 1);
            }
        };
        Util.forEachRight(ar, fnc);
        return ar.join(';') + (ar.length > 0 ? ';' : '');
    }
    ;
    scriptURL() {
        const u = window.location.href.replace(/\.html\?.*$/, '.html');
        return u + '?' + Terminal.encodeURIComponent(this.script());
    }
    ;
    static unquote(text) {
        if (text.length < 2) {
            return text;
        }
        const firstChar = text.charAt(0);
        const lastChar = text.charAt(text.length - 1);
        if (firstChar == lastChar && (firstChar == '"' || firstChar == '\'')) {
            let r = '';
            for (let i = 1, n = text.length - 1; i < n; i++) {
                let c = text[i];
                if (c == '\\') {
                    i++;
                    if (i < n) {
                        c = text[i];
                        switch (c) {
                            case '0':
                                r += '\0';
                                break;
                            case 'b':
                                r += '\b';
                                break;
                            case 't':
                                r += '\t';
                                break;
                            case 'n':
                                r += '\n';
                                break;
                            case 'v':
                                r += '\v';
                                break;
                            case 'f':
                                r += '\f';
                                break;
                            case 'r':
                                r += '\r';
                                break;
                            case '"':
                                r += '"';
                                break;
                            case '\'':
                                r += '\'';
                                break;
                            case '\\':
                                r += '\\';
                                break;
                            default: r += '\\' + c;
                        }
                    }
                    else {
                        r += c;
                    }
                }
                else {
                    r += c;
                }
            }
            return r;
        }
        return text;
    }
    ;
    update() {
        const params = this.subjects_.reduce(function (accum, subj) {
            const s_params = subj.getParameters().filter(p => p.getName() != 'DELETED');
            return accum.concat(s_params);
        }, []);
        this.allSubjects_ = params.map(p => p.getSubject());
        this.allParamNames_ = params.map(p => Util.toName(p.getName()));
        this.allSubjParamNames_ = params.map(p => Util.toName(p.getSubject().getName() + '.' + p.getName()));
        let count = function (arr, fnc) {
            return arr.reduce((accum, p) => accum + (fnc(p) ? 1 : 0), 0);
        };
        this.unique_ = this.allParamNames_.map((p) => 1 == count(this.allParamNames_, (q) => q == p));
        this.initialDependent_ = this.namesAndValues(true).split(';');
    }
    ;
    values() {
        return this.namesAndValues(false, true, true) + this.namesAndValues(true, true, true);
    }
    ;
}
EasyScriptParser.en = {
    URL_SCRIPT: 'share',
    PROMPT_URL: 'Press command-C to copy this URL to the clipboard, it will replicate this simulation with current parameters.',
    WARN_URL_2048: 'WARNING: URL is longer than 2048 characters.'
};
EasyScriptParser.de_strings = {
    URL_SCRIPT: 'mitteilen',
    PROMPT_URL: 'Drücken Sie command-C um diesen URL in die Zwischenablage zu kopieren, dies beinhaltet die eingegebenen Parameter.',
    WARN_URL_2048: 'Achtung: URL is länger als 2048 Zeichen.'
};
EasyScriptParser.i18n = Util.LOCALE === 'de' ? EasyScriptParser.de_strings : EasyScriptParser.en;
