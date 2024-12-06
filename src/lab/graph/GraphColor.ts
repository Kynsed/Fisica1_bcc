

import { Util } from "../util/Util.js"

/** GraphColor enum, used to present a set of colors for user to choose from for
setting the color of a {@link lab/graph/GraphLine.GraphLine | GraphLine}.
*/
export const enum GraphColor {
  AQUA = 'aqua',
  BLACK = 'black',
  BLUE = 'blue',
  FUCHSIA = 'fuchsia',
  GRAY = 'gray',
  GREEN = 'green',
  LIME = 'lime',
  MAROON = 'maroon',
  NAVY = 'navy',
  OLIVE = 'olive',
  PURPLE = 'purple',
  RED = 'red',
  SILVER = 'silver',
  TEAL = 'teal',
  WHITE = 'white',
  YELLOW = 'yellow'
};

/** returns array of all GraphColor enums translated to localized strings. */
export function GraphColorChoices(): string[] {
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
    i18n.YELLOW ];
};

/** returns array of all GraphColor values */
export function GraphColorValues(): GraphColor[] {
  return [ GraphColor.AQUA,
    GraphColor.BLACK,
    GraphColor.BLUE,
    GraphColor.FUCHSIA,
    GraphColor.GRAY,
    GraphColor.GREEN,
    GraphColor.LIME,
    GraphColor.MAROON,
    GraphColor.NAVY,
    GraphColor.OLIVE,
    GraphColor.PURPLE,
    GraphColor.RED,
    GraphColor.SILVER,
    GraphColor.TEAL,
    GraphColor.WHITE,
    GraphColor.YELLOW ];
};

type i18n_strings = {
  AQUA: string,
  BLACK: string,
  BLUE: string,
  FUCHSIA: string,
  GRAY: string,
  GREEN: string,
  LIME: string,
  MAROON: string,
  NAVY: string,
  OLIVE: string,
  PURPLE: string,
  RED: string,
  SILVER: string,
  TEAL: string,
  WHITE: string,
  YELLOW: string
}

const en_strings: i18n_strings = {
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

const de_strings: i18n_strings = {
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

//Util.defineGlobal('lab$graph$GraphColor', GraphColor);
