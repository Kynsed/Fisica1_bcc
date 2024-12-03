import { Util } from "./Util.js";
const HEX_DIGITS = '0123456789ABCDEF';
export function binaryToHex(binary) {
    if (binary.length % 4 != 0) {
        throw '';
    }
    let s = '';
    let v = 0;
    const n = binary.length;
    for (let i = 0; i < n; i++) {
        v = (2 * v) + (binary[i] === '0' ? 0 : 1);
        if (i % 4 === 3) {
            s = s + HEX_DIGITS[v];
            v = 0;
        }
    }
    return s;
}
;
export function binaryToNum(s) {
    if (s.length != 64) {
        throw 'need 64 binary digits ' + s;
    }
    const sign = s[0] == '0' ? 1 : -1;
    let exp = 0;
    let d = 1;
    for (let i = 11; i > 0; i--) {
        if (s[i] == '1') {
            exp += d;
        }
        d *= 2;
    }
    let frac = 0;
    d = 0.5;
    for (let i = 12; i < 64; i++) {
        if (s[i] == '1')
            frac += d;
        d /= 2;
    }
    if (exp == 0x7ff) {
        if (frac != 0)
            return Number.NaN;
        else
            return sign > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    }
    if (exp == 0) {
        if (frac == 0) {
            return 0;
        }
        else {
            return sign * Math.pow(2, -1022) * frac;
        }
    }
    else {
        return sign * Math.pow(2, exp - 1023) * (1 + frac);
    }
}
;
export function hexToBinary(hex) {
    hex = hex.toUpperCase();
    let s = '';
    for (let i = 0; i < hex.length; i++) {
        let j = HEX_DIGITS.indexOf(hex[i]);
        if (j < 0) {
            throw '';
        }
        let d = 8;
        for (let k = 0; k < 4; k++) {
            if (j >= d) {
                s += '1';
                j -= d;
            }
            else {
                s += '0';
            }
            d /= 2;
        }
    }
    return s;
}
;
export function hexToNum(hex) {
    if (hex.length != 16)
        throw '';
    const s = hexToBinary(hex);
    Util.assert(s.length == 64);
    return binaryToNum(s);
}
;
export function NFHEX(num) {
    if (num != null)
        return numToHex(num);
    else
        return num === null ? 'null' : 'undefined';
}
;
export function numToBinary(x) {
    if (isNaN(x)) {
        return '0' + repeatChar('1', 12) + repeatChar('0', 51);
    }
    const sign = x >= 0 ? 0 : 1;
    let s = sign == 0 ? '0' : '1';
    if (!isFinite(x)) {
        return s + repeatChar('1', 11) + repeatChar('0', 52);
    }
    const absx = Math.abs(x);
    let bit;
    if (absx === 0) {
        bit = 1;
        while (bit++ < 64) {
            s += '0';
        }
        return s;
    }
    let log = Math.floor(Math.LOG2E * Math.log(absx));
    if (log > 1023) {
        log = 1023;
    }
    let num;
    if (log < -1022) {
        s += '00000000000';
        num = absx * Math.pow(2, 1022);
        Util.assert(num > 0 && num < 1);
    }
    else {
        num = absx * Math.pow(2, -log);
        Util.assert(num < 2);
        if (num >= 1) {
            s += numToBits(1023 + log, 11);
            num = num - 1;
        }
        else {
            s += '00000000000';
            num = absx * Math.pow(2, 1022);
        }
    }
    bit = 0;
    while (bit++ < 52) {
        num = 2 * num;
        if (num >= 1) {
            s += '1';
            num = num - 1;
        }
        else {
            s += '0';
        }
    }
    return s;
}
;
function numToBits(num, size) {
    let s = '', bit;
    while (size--) {
        s = (bit = num % 2) + s;
        num = (num - bit) / 2;
    }
    Util.assert(Math.floor(num) == 0);
    return s;
}
;
export function numToHex(x) {
    return binaryToHex(numToBinary(x));
}
;
function repeatChar(str, size) {
    let s = '';
    while (size--) {
        s += str;
    }
    return s;
}
;
