import { Util } from '../util/Util.js';
;
export function DrawingModeChoices() {
    return [i18n.DOTS,
        i18n.LINES];
}
;
export function DrawingModeValues() {
    return ["dots",
        "lines"];
}
;
const en_strings = {
    DOTS: 'Dots',
    LINES: 'Lines'
};
const de_strings = {
    DOTS: 'Punkte',
    LINES: 'Linien'
};
const i18n = Util.LOCALE === 'de' ? de_strings : en_strings;
