import { Shapes } from './Shapes.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class Walls {
    constructor() {
        throw '';
    }
    ;
    static make(sim, width, height, opt_thickness, opt_center) {
        const center = opt_center ?? Vector.ORIGIN;
        const thickness = opt_thickness ?? 1;
        let zel = 0;
        const walls = [];
        for (let i = 0; i < 4; i++) {
            let bodyi = null;
            switch (i) {
                case 0:
                    bodyi = Shapes.makeWall(width + 2 * thickness, thickness, Shapes.TOP_EDGE, Walls.en.WALL_BOTTOM, Walls.i18n.WALL_BOTTOM);
                    bodyi.setPosition(new Vector(center.getX(), center.getY() - height / 2 - thickness / 2), 0);
                    zel = bodyi.getTopWorld();
                    break;
                case 1:
                    bodyi = Shapes.makeWall(thickness, height + 2 * thickness, Shapes.LEFT_EDGE, Walls.en.WALL_RIGHT, Walls.i18n.WALL_RIGHT);
                    bodyi.setPosition(new Vector(center.getX() + width / 2 + thickness / 2, center.getY()), 0);
                    break;
                case 2:
                    bodyi = Shapes.makeWall(width + 2 * thickness, thickness, Shapes.BOTTOM_EDGE, Walls.en.WALL_TOP, Walls.i18n.WALL_TOP);
                    bodyi.setPosition(new Vector(center.getX(), center.getY() + height / 2 + thickness / 2), 0);
                    break;
                case 3:
                    bodyi = Shapes.makeWall(thickness, height + 2 * thickness, Shapes.RIGHT_EDGE, Walls.en.WALL_LEFT, Walls.i18n.WALL_LEFT);
                    bodyi.setPosition(new Vector(center.getX() - width / 2 - thickness / 2, center.getY()), 0);
                    break;
            }
            if (bodyi != null) {
                bodyi.setMass(Infinity);
                bodyi.setElasticity(1.0);
                walls.push(bodyi);
                sim.addBody(bodyi);
            }
        }
        for (let i = 0; i < walls.length; i++) {
            walls[i].addNonCollide(walls);
        }
        return zel;
    }
    ;
    static make2(sim, rect, opt_thickness) {
        return Walls.make(sim, rect.getWidth(), rect.getHeight(), opt_thickness, rect.getCenter());
    }
    ;
}
Walls.en = {
    WALL_BOTTOM: 'wall bottom',
    WALL_RIGHT: 'wall right',
    WALL_LEFT: 'wall left',
    WALL_TOP: 'wall top'
};
Walls.de_strings = {
    WALL_BOTTOM: 'Wand unten',
    WALL_RIGHT: 'Wand rechts',
    WALL_LEFT: 'Wand links',
    WALL_TOP: 'Wand oben'
};
Walls.i18n = Util.LOCALE === 'de' ? Walls.de_strings : Walls.en;
Util.defineGlobal('lab$engine2D$Walls', Walls);
