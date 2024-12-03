import { Util } from "../util/Util.js";
;
export function VerticalAlignValues() {
    return [
        "TOP",
        "MIDDLE",
        "BOTTOM",
        "FULL",
        "VALUE",
    ];
}
;
export function VerticalAlignChoices() {
    return [
        i18n.TOP,
        i18n.MIDDLE,
        i18n.BOTTOM,
        i18n.FULL,
        i18n.VALUE,
    ];
}
;
const en_strings = {
    TOP: 'top',
    MIDDLE: 'middle',
    BOTTOM: 'bottom',
    FULL: 'full',
    VALUE: 'value'
};
const de_strings = {
    TOP: 'oben',
    MIDDLE: 'mitte',
    BOTTOM: 'unten',
    FULL: 'voll',
    VALUE: 'Wert'
};
const i18n = Util.LOCALE === 'de' ? de_strings : en_strings;
