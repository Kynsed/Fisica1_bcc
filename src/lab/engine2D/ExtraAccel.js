import { Util } from "../util/Util.js";
;
export function ExtraAccelValues() {
    return [
        "none",
        "velocity",
        "velocity_and_distance",
        "velocity_joints",
        "velocity_and_distance_joints",
    ];
}
;
export function ExtraAccelChoices() {
    return [
        i18n.NONE,
        i18n.VELOCITY,
        i18n.VELOCITY_AND_DISTANCE,
        i18n.VELOCITY_JOINTS,
        i18n.VELOCITY_AND_DISTANCE_JOINTS,
    ];
}
;
const en_strings = {
    NONE: 'none',
    VELOCITY: 'velocity',
    VELOCITY_AND_DISTANCE: 'velocity+distance',
    VELOCITY_JOINTS: 'velocity (also joints)',
    VELOCITY_AND_DISTANCE_JOINTS: 'velocity+distance (also joints)'
};
const de_strings = {
    NONE: 'keine',
    VELOCITY: 'Geschwindigkeit',
    VELOCITY_AND_DISTANCE: 'Geschwindigkeit+Entfernung',
    VELOCITY_JOINTS: 'Geschwindigkeit (auch Verbindungsglied)',
    VELOCITY_AND_DISTANCE_JOINTS: 'Geschwindigkeit+Entfernung (auch Verbindungsglied)'
};
const i18n = Util.LOCALE === 'de' ? de_strings : en_strings;
