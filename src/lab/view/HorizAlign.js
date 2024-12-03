import { Util } from "../util/Util.js";
;
export function HorizAlignValues() {
    return [
        "LEFT",
        "MIDDLE",
        "RIGHT",
        "FULL",
        "VALUE"
    ];
}
;
export function HorizAlignChoices() {
    return [
        i18n.LEFT,
        i18n.MIDDLE,
        i18n.RIGHT,
        i18n.FULL,
        i18n.VALUE,
    ];
}
;
const en_strings = {
    LEFT: 'left',
    MIDDLE: 'middle',
    RIGHT: 'right',
    FULL: 'full',
    VALUE: 'value'
};
const de_strings = {
    LEFT: 'links',
    MIDDLE: 'mitte',
    RIGHT: 'rechts',
    FULL: 'voll',
    VALUE: 'Wert'
};
const i18n = Util.LOCALE === 'de' ? de_strings : en_strings;
