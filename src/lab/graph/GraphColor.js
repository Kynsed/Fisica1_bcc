import { Util } from "../util/Util.js";
;
export function GraphColorChoices() {
    return [
        i18n.AQUA,
        i18n.BLACK,
        i18n.BLUE,
        i18n.FUCHSIA,
        i18n.GRAY,
        i18n.GREEN,
        i18n.LIME,
        i18n.MAROON,
        i18n.NAVY,
        i18n.OLIVE,
        i18n.PURPLE,
        i18n.RED,
        i18n.SILVER,
        i18n.TEAL,
        i18n.WHITE,
        i18n.YELLOW
    ];
}
;
export function GraphColorValues() {
    return ["aqua",
        "black",
        "blue",
        "fuchsia",
        "gray",
        "green",
        "lime",
        "maroon",
        "navy",
        "olive",
        "purple",
        "red",
        "silver",
        "teal",
        "white",
        "yellow"];
}
;
const en_strings = {
    AQUA: 'aqua',
    BLACK: 'black',
    BLUE: 'blue',
    FUCHSIA: 'fuchsia',
    GRAY: 'gray',
    GREEN: 'green',
    LIME: 'lime',
    MAROON: 'maroon',
    NAVY: 'navy',
    OLIVE: 'olive',
    PURPLE: 'purple',
    RED: 'red',
    SILVER: 'silver',
    TEAL: 'teal',
    WHITE: 'white',
    YELLOW: 'yellow'
};
const de_strings = {
    AQUA: 'Aquamarin',
    BLACK: 'Schwarz',
    BLUE: 'Blau',
    FUCHSIA: 'Purpurrot',
    GRAY: 'Grau',
    GREEN: 'Grün',
    LIME: 'Hellgrün',
    MAROON: 'Kastanienbraun',
    NAVY: 'Marineblau',
    OLIVE: 'Olivgrün',
    PURPLE: 'Purpur',
    RED: 'Rot',
    SILVER: 'Silber',
    TEAL: 'Blaugrün',
    WHITE: 'Weiss',
    YELLOW: 'Gelb'
};
const i18n = Util.LOCALE === 'de' ? de_strings : en_strings;
