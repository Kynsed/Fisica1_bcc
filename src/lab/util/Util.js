;
;
export class Util {
    constructor() {
        throw '';
    }
    ;
    static assert(test, opt_message) {
        if (Util.ASSERTS && !test) {
            if (opt_message) {
                console.log(opt_message);
            }
            throw "assert failed " + (opt_message ? opt_message : '');
        }
    }
    ;
    static array2string(r, nf, separator) {
        nf = nf ?? Util.NF7E;
        if (separator === undefined) {
            separator = ', ';
        }
        const n = r.length;
        let s = '';
        for (let i = 0; i < n; i++) {
            s += (i > 0 ? separator : '') + nf(r[i]);
        }
        return s;
    }
    ;
    static arrayBool2string(r, trueString, falseString) {
        trueString = trueString || 'true';
        falseString = falseString || 'false';
        const n = r.length;
        let s = '';
        for (let i = 0; i < n; i++) {
            s += r[i] ? trueString : falseString;
            if (i < n - 1) {
                s += ', ';
            }
        }
        return s;
    }
    ;
    static colorString3(red, green, blue) {
        let s = '#';
        const colors = [red, green, blue];
        for (let i = 0; i < 3; i++) {
            s += Util.numToHexChar1(colors[i]);
        }
        Util.assert(s.length == 4);
        return s;
    }
    ;
    static colorString6(red, green, blue) {
        let s = '#';
        const colors = [red, green, blue];
        for (let i = 0; i < 3; i++) {
            s += Util.numToHexChar2(colors[i]);
        }
        Util.assert(s.length == 7);
        return s;
    }
    ;
    static createImage(url, width, opt_height) {
        const img = document.createElement('img');
        img.src = url;
        img.width = width;
        img.height = opt_height !== undefined ? opt_height : width;
        return img;
    }
    ;
    static defineGlobal(n, v, opt_write) {
        Object.defineProperty(globalThis, n, {
            value: v,
            writable: opt_write ? true : false,
        });
    }
    ;
    static drop(text, n) {
        if (n >= 0) {
            return text.slice(n);
        }
        else {
            return text.slice(0, text.length + n);
        }
    }
    ;
    static equals(a1, a2) {
        if (a1.length !== a2.length) {
            return false;
        }
        return a1.every((element, index) => element === a2[index]);
    }
    ;
    static forEachRight(a, fnc, opt_this) {
        const len = a.length;
        for (let i = len - 1; i >= 0; i--) {
            fnc.call(opt_this, a[i], i, a);
        }
    }
    ;
    static getElementById(elementId) {
        const e = document.getElementById(elementId);
        if (e === null) {
            throw 'elementId not found: ' + elementId;
        }
        return e;
    }
    ;
    static getViewportSize() {
        let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        return [vw, vh];
    }
    static hypot(a, b) {
        return Math.sqrt(a * a + b * b);
    }
    ;
    static isChrome() {
        const nav = navigator;
        if (nav != null) {
            return nav.userAgent.match(/.*Chrome.*/) != null;
        }
        else {
            return false;
        }
    }
    ;
    static isIPhone() {
        const nav = navigator;
        if (nav != null) {
            return nav.platform == 'iPhone';
        }
        else {
            return false;
        }
    }
    ;
    static isObject(obj) {
        return (typeof obj) == 'object' && obj != null;
    }
    ;
    static limitAngle(angle) {
        if (angle > Math.PI) {
            const n = Math.floor((angle - -Math.PI) / (2 * Math.PI));
            return angle - 2 * Math.PI * n;
        }
        else if (angle < -Math.PI) {
            const n = Math.floor(-(angle - Math.PI) / (2 * Math.PI));
            return angle + 2 * Math.PI * n;
        }
        else {
            return angle;
        }
    }
    ;
    static maybeElementById(elementId) {
        try {
            return document.getElementById(elementId);
        }
        catch (e) {
            return null;
        }
    }
    ;
    static methodsOf(obj) {
        const s = [];
        let proto = Object.getPrototypeOf(obj);
        while (proto) {
            const nms = Object.getOwnPropertyNames(proto);
            for (let i = 0; i < nms.length; i++) {
                let p = nms[i];
                if (p === 'constructor') {
                    continue;
                }
                if (typeof obj[p] === 'function') {
                    s.push(p);
                }
            }
            proto = Object.getPrototypeOf(proto);
            if (proto === null || proto.constructor === Object) {
                break;
            }
        }
        s.sort();
        Util.removeDuplicates(s);
        return s;
    }
    ;
    static nameOf(obj, value) {
        for (let p in obj) {
            if (obj[p] === value) {
                return p;
            }
        }
        return '';
    }
    ;
    static newBooleanArray(n) {
        const a = new Array(n);
        for (let i = 0; i < n; i++) {
            a[i] = false;
        }
        return a;
    }
    ;
    static newNumberArray(n) {
        const a = new Array(n);
        for (let i = 0; i < n; i++) {
            a[i] = 0;
        }
        return a;
    }
    ;
    static NF0(num) {
        if (num != null)
            return num.toFixed(0);
        else
            return num === null ? 'null' : 'undefined';
    }
    ;
    static NF18(num) {
        if (num != null)
            return num.toFixed(18);
        else
            return num === null ? 'null' : 'undefined';
    }
    ;
    static NF1S(num) {
        if (num != null)
            return (num > 0 ? '+' : '') + num.toFixed(1);
        else
            return num === null ? 'null' : 'undefined';
    }
    ;
    static NF2(num) {
        if (num != null)
            return num.toFixed(2);
        else
            return num === null ? 'null' : 'undefined';
    }
    ;
    static NF3(num) {
        if (num != null)
            return num.toFixed(3);
        else
            return num === null ? 'null' : 'undefined';
    }
    ;
    static NF4(num) {
        if (num != null)
            return num.toFixed(4);
        else
            return num === null ? 'null' : 'undefined';
    }
    ;
    static NF5(num) {
        if (num != null)
            return num.toFixed(5);
        else
            return num === null ? 'null' : 'undefined';
    }
    ;
    static NF5E(num) {
        if (num != null) {
            if (Math.abs(num) > 2E-4 || num == 0) {
                return num.toFixed(5);
            }
            else {
                return num.toExponential(5);
            }
        }
        else {
            return num === null ? 'null' : 'undefined';
        }
    }
    ;
    static nf5(num) {
        if (num != null) {
            const s = num.toFixed(5);
            return s.replace(/\.?0+$/, '');
        }
        else {
            return num === null ? 'null' : 'undefined';
        }
    }
    ;
    static NF7(num) {
        if (num != null)
            return num.toFixed(7);
        else
            return num === null ? 'null' : 'undefined';
    }
    ;
    static NF7E(num) {
        if (num != null) {
            if (Math.abs(num) > 2E-6) {
                return num.toFixed(7);
            }
            else {
                return num.toExponential(7);
            }
        }
        else {
            return num === null ? 'null' : 'undefined';
        }
    }
    ;
    static nf7(num) {
        if (num != null) {
            const s = num.toFixed(7);
            return s.replace(/\.?0+$/, '');
        }
        else {
            return num === null ? 'null' : 'undefined';
        }
    }
    ;
    static NF9(num) {
        if (num != null)
            return num.toFixed(9);
        else
            return num === null ? 'null' : 'undefined';
    }
    ;
    static NFE(num) {
        if (num != null)
            return num.toExponential(7);
        else
            return num === null ? 'null' : 'undefined';
    }
    ;
    static NFSCI(num) {
        if (num != null)
            return num.toExponential(17);
        else
            return num === null ? 'null' : 'undefined';
    }
    ;
    static numToHexChar1(n) {
        n = Math.floor(0.5 + 16 * n);
        if (n >= 15)
            return 'f';
        else if (n <= 0)
            return '0';
        else {
            return Util.HEX_DIGITS.charAt(n);
        }
    }
    ;
    static numToHexChar2(n) {
        n = Math.floor(0.5 + 256 * n);
        if (n >= 255)
            return 'ff';
        else if (n <= 0)
            return '00';
        else {
            const i = Math.floor(n / 16);
            const j = n % 16;
            return Util.HEX_DIGITS.charAt(i) + Util.HEX_DIGITS.charAt(j);
        }
    }
    ;
    static prettyPrint(input, level, indent) {
        if (typeof level !== 'number') {
            level = 2;
        }
        if (typeof indent !== 'string') {
            indent = '  ';
        }
        const inp = String(input);
        let out = '';
        let lvl = 0;
        const n = inp.length;
        let ignoreSpace = false;
        const closeList = [];
        let closeSymbol = '';
        next_char: for (let i = 0; i < n; i++) {
            let c = inp.charAt(i);
            if (ignoreSpace) {
                if (c == ' ') {
                    continue;
                }
                else {
                    ignoreSpace = false;
                }
            }
            if (c == '{' || c == '[') {
                lvl++;
                if (lvl <= level) {
                    out += c + '\n';
                    for (let l = 0; l < lvl; l++) {
                        out += indent;
                    }
                    ignoreSpace = true;
                }
                else {
                    out += c;
                }
                closeList.push(closeSymbol);
                closeSymbol = (c == '{') ? '}' : ']';
            }
            else if (c == closeSymbol) {
                if (lvl <= level) {
                    lvl--;
                    out += '\n';
                    for (let l = 0; l < lvl; l++) {
                        out += indent;
                    }
                    out += c;
                }
                else {
                    lvl--;
                    out += c;
                }
                const p = closeList.pop();
                if (p === undefined)
                    throw 'error in  prettyPrint';
                closeSymbol = p;
                if (lvl < 0)
                    throw 'unbalanced ' + closeSymbol + ' at ' + i + ' in ' + input;
            }
            else if (c == '"' || c == '\'') {
                const q = c;
                const k = i;
                out += c;
                while (++i < n) {
                    c = inp.charAt(i);
                    out += c;
                    if (c == q) {
                        continue next_char;
                    }
                }
                throw 'unbalanced quote at ' + k + ' in ' + input;
            }
            else if ((c == ',' || c == ';') && lvl <= level) {
                out += c + '\n';
                for (let l = 0; l < lvl; l++) {
                    out += indent;
                }
                ignoreSpace = true;
            }
            else {
                out += c;
            }
        }
        out = out.replace(/^\s+\n/gm, '');
        return out;
    }
    ;
    static printArray(array, lineLength, format) {
        if (Util.DEBUG) {
            lineLength = lineLength || 80;
            format = format || Util.NF5E;
            let s = '';
            for (let i = 0, len = array.length; i < len; i++) {
                const r = format(array[i]);
                if (s.length + r.length > lineLength) {
                    console.log(s);
                    s = '  ' + r;
                }
                else {
                    s += ' ' + r;
                }
            }
            if (s.length > 0) {
                console.log(s);
            }
        }
    }
    ;
    static printNums5(s, ...nums) {
        for (let i = 0; i < nums.length; i++) {
            const n = nums[i];
            if (typeof n == 'number')
                s += ' ' + Util.NF5(n);
        }
        console.log(s);
    }
    ;
    static propertiesOf(obj, showValues) {
        if (obj === null) {
            return ['null'];
        }
        showValues = showValues || false;
        const s = [];
        for (let p in obj) {
            if (typeof obj[p] === 'function') {
                continue;
            }
            if (showValues) {
                s.push(p + ': ' + obj[p]);
            }
            else {
                s.push(p);
            }
        }
        s.sort();
        return s;
    }
    ;
    static range(n) {
        const array = [];
        let i = 0;
        while (i < n) {
            array.push(i++);
        }
        return array;
    }
    ;
    static remove(arr, myobj) {
        let i;
        const fn = (element) => element === myobj;
        if ((i = arr.findIndex(fn)) >= 0) {
            arr.splice(i, 1);
            return true;
        }
        return false;
    }
    ;
    static removeAll(arr, myobj) {
        let deleted = false;
        Util.forEachRight(arr, (obj, idx) => {
            if (obj === myobj) {
                arr.splice(idx, 1);
                deleted = true;
            }
        });
        return deleted;
    }
    ;
    static removeDuplicates(a) {
        const n = a.length;
        if (n <= 1) {
            return;
        }
        let e = a[0];
        let i = 1;
        let j = 1;
        while (i < n) {
            if (a[i] === e) {
                i++;
                continue;
            }
            e = a[i];
            a[j] = e;
            i++;
            j++;
        }
        a.length = j;
    }
    ;
    static repeat(value, len) {
        const arr = [];
        let i = 0;
        while (i++ < len) {
            arr.push(value);
        }
        return arr;
    }
    ;
    static setErrorHandler() {
        window.onerror = function (msg, url, line, colno, err) {
            const s = msg + '\n' + url + ':' + line + ':' + colno + '\n' + err;
            Util.showErrorAlert(s);
        };
        if (Util.DEBUG) {
            let a = 1;
            try {
                Util.assert(false);
                a = 2;
            }
            catch (e) {
                console.log('asserts are working');
            }
            if (a == 2) {
                throw 'asserts are not working';
            }
        }
        else if (Util.DEBUG) {
            console.log('WARNING: asserts are NOT enabled!');
        }
    }
    ;
    static setImagesDir(images_dir) {
        if (images_dir !== undefined) {
            Util.IMAGES_DIR = images_dir;
        }
        else {
            throw 'images directory not found';
        }
    }
    ;
    static showErrorAlert(s) {
        if (Util.DEBUG) {
            console.log(s);
        }
        if (Util.numErrors++ < Util.maxErrors) {
            alert(s);
        }
    }
    ;
    static systemTime() {
        if (Util.MODERN_CLOCK) {
            return performance.now() * 1E-3;
        }
        else {
            return Date.now() * 1E-3;
        }
    }
    ;
    static take(text, n) {
        if (n == 0) {
            return '';
        }
        else if (n > 0) {
            return text.slice(0, n);
        }
        else {
            return text.slice(text.length + n, text.length);
        }
    }
    ;
    static testFinite(value) {
        if (!isFinite(value)) {
            throw 'not a finite number ' + value;
        }
        return value;
    }
    ;
    static testNumber(value) {
        if (isNaN(value)) {
            throw 'not a number ' + value;
        }
        return value;
    }
    ;
    static toName(text) {
        return text.toUpperCase().replace(/[ -]/g, '_');
    }
    ;
    static uniqueElements(arr) {
        const len = arr.length;
        if (len > 1) {
            const a = arr.slice();
            a.sort();
            let last = a[0];
            for (let i = 1; i < len; i++) {
                if (last == a[i]) {
                    return false;
                }
                last = a[i];
            }
        }
        return true;
    }
    ;
    static validName(text) {
        if (!text.match(/^[A-Z_][A-Z_0-9]*$/)) {
            throw 'not a valid name: ' + text;
        }
        return text;
    }
    ;
    static veryDifferent(arg1, arg2, epsilon, magnitude) {
        epsilon = epsilon || 1E-14;
        if (!(isFinite(arg1) && isFinite(arg2))) {
            throw 'argument is NaN';
        }
        if (epsilon <= 0) {
            throw 'epsilon must be positive ' + epsilon;
        }
        magnitude = magnitude || 1.0;
        if (magnitude <= 0) {
            throw 'magnitude must be positive ' + magnitude;
        }
        const maxArg = Math.max(Math.abs(arg1), Math.abs(arg2));
        const max = maxArg > magnitude ? maxArg : magnitude;
        return Math.abs(arg1 - arg2) > max * epsilon;
    }
    ;
    static zeroArray(arr) {
        const n = arr.length;
        for (let i = 0; i < n; i++) {
            arr[i] = 0;
        }
    }
    ;
}
Util.ASSERTS = true;
Util.COMPILE_TIME = MPL_BUILD_TIME;
Util.DEBUG = true;
Util.HEX_DIGITS = '0123456789abcdef';
Util.IMAGES_DIR = '.';
Util.LOCALE = MPL_LOCALE;
Util.maxErrors = 3;
Util.MAX_INTEGER = Math.pow(2, 53);
Util.MIN_INTEGER = -Math.pow(2, 53);
Util.MODERN_CLOCK = Util.isObject(performance) &&
    typeof performance.now === 'function';
Util.NOT_IMPLEMENTED = 'not implemented';
Util.numErrors = 0;
Util.VERSION = '2.0.0';
Util.NF = Util.nf5;
Util.defineGlobal('lab$util$Util', Util);
