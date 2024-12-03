import { AffineTransform } from "../util/AffineTransform.js";
import { DoubleRect } from "../util/DoubleRect.js";
import { ScreenRect } from "./ScreenRect.js";
import { Util } from "../util/Util.js";
import { Vector } from "../util/Vector.js";
export class CoordMap {
    constructor(screen_left, screen_bottom, sim_left, sim_bottom, pixel_per_unit_x, pixel_per_unit_y) {
        this.screen_left_ = Util.testFinite(screen_left);
        this.screen_bottom_ = Util.testFinite(screen_bottom);
        this.sim_left_ = Util.testFinite(sim_left);
        this.sim_bottom_ = Util.testFinite(sim_bottom);
        this.pixel_per_unit_x_ = Util.testFinite(pixel_per_unit_x);
        this.pixel_per_unit_y_ = Util.testFinite(pixel_per_unit_y);
        let at = AffineTransform.IDENTITY;
        at = at.translate(this.screen_left_, this.screen_bottom_);
        at = at.scale(this.pixel_per_unit_x_, -this.pixel_per_unit_y_);
        at = at.translate(-this.sim_left_, -this.sim_bottom_);
        this.transform_ = at;
    }
    ;
    toString() {
        return 'CoordMap{screen_left_: ' + Util.NF(this.screen_left_)
            + ', screen_bottom_: ' + Util.NF(this.screen_bottom_)
            + ', sim_left_: ' + Util.NF(this.sim_left_)
            + ', sim_bottom_: ' + Util.NF(this.sim_bottom_)
            + ', pixels_per_unit_x_: ' + Util.NF(this.pixel_per_unit_x_)
            + ', pixels_per_unit_y_: ' + Util.NF(this.pixel_per_unit_y_)
            + (this.transform_ != null ? ', transform: ' + this.transform_ : '')
            + '}';
    }
    ;
    static make(screenRect, simRect, horizAlign, verticalAlign, aspectRatio) {
        horizAlign = horizAlign || "MIDDLE";
        verticalAlign = verticalAlign || "MIDDLE";
        aspectRatio = aspectRatio || 1.0;
        if (aspectRatio < CoordMap.MIN_SIZE || !isFinite(aspectRatio)) {
            throw 'bad aspectRatio ' + aspectRatio;
        }
        const simLeft = simRect.getLeft();
        const simBottom = simRect.getBottom();
        const sim_width = simRect.getRight() - simLeft;
        const sim_height = simRect.getTop() - simBottom;
        if (sim_width < CoordMap.MIN_SIZE || sim_height < CoordMap.MIN_SIZE) {
            throw 'simRect cannot be empty ' + simRect;
        }
        const screen_top = screenRect.getTop();
        const screen_left = screenRect.getLeft();
        const screen_width = screenRect.getWidth();
        const screen_height = screenRect.getHeight();
        let offset_x = 0;
        let offset_y = 0;
        let pixel_per_unit_x = 0;
        let pixel_per_unit_y = 0;
        if (horizAlign == "FULL") {
            pixel_per_unit_x = screen_width / sim_width;
            offset_x = 0;
        }
        if (verticalAlign == "FULL") {
            pixel_per_unit_y = screen_height / sim_height;
            offset_y = 0;
        }
        if (horizAlign != "FULL" || verticalAlign != "FULL") {
            let horizFull;
            if (horizAlign == "FULL") {
                pixel_per_unit_y = pixel_per_unit_x * aspectRatio;
                horizFull = true;
            }
            else if (verticalAlign == "FULL") {
                pixel_per_unit_x = pixel_per_unit_y / aspectRatio;
                horizFull = false;
            }
            else {
                pixel_per_unit_x = screen_width / sim_width;
                pixel_per_unit_y = pixel_per_unit_x * aspectRatio;
                horizFull = true;
                const ideal_height = Math.floor(0.5 + pixel_per_unit_y * sim_height);
                if (screen_height < ideal_height) {
                    pixel_per_unit_y = screen_height / sim_height;
                    pixel_per_unit_x = pixel_per_unit_y / aspectRatio;
                    horizFull = false;
                }
            }
            if (!horizFull) {
                Util.assert(horizAlign != "FULL");
                offset_y = 0;
                const ideal_width = Math.floor(0.5 + sim_width * pixel_per_unit_x);
                switch (horizAlign) {
                    case "LEFT":
                        offset_x = 0;
                        break;
                    case "MIDDLE":
                        offset_x = (screen_width - ideal_width) / 2;
                        break;
                    case "RIGHT":
                        offset_x = screen_width - ideal_width;
                        break;
                    default: throw 'unsupported alignment ' + horizAlign;
                }
            }
            else {
                Util.assert(verticalAlign != "FULL");
                offset_x = 0;
                const ideal_height = Math.floor(0.5 + sim_height * pixel_per_unit_y);
                switch (verticalAlign) {
                    case "BOTTOM":
                        offset_y = 0;
                        break;
                    case "MIDDLE":
                        offset_y = (screen_height - ideal_height) / 2;
                        break;
                    case "TOP":
                        offset_y = screen_height - ideal_height;
                        break;
                    default: throw 'unsupported alignment ' + verticalAlign;
                }
            }
        }
        const coordMap = new CoordMap(screen_left, screen_top + screen_height, simLeft - offset_x / pixel_per_unit_x, simBottom - offset_y / pixel_per_unit_y, pixel_per_unit_x, pixel_per_unit_y);
        return coordMap;
    }
    ;
    getAffineTransform() {
        return this.transform_;
    }
    ;
    getScaleX() {
        return this.pixel_per_unit_x_;
    }
    ;
    getScaleY() {
        return this.pixel_per_unit_y_;
    }
    ;
    screenToSim(scr_x, scr_y) {
        let sx, sy;
        if (typeof scr_x === 'number') {
            sx = scr_x;
            sy = scr_y;
        }
        else {
            const v = scr_x;
            sy = v.getY();
            sx = v.getX();
        }
        if (typeof sx !== 'number' || typeof sy !== 'number') {
            throw '';
        }
        return new Vector(this.screenToSimX(sx), this.screenToSimY(sy));
    }
    ;
    screenToSimRect(rect) {
        return new DoubleRect(this.screenToSimX(rect.getLeft()), this.screenToSimY(rect.getTop() + rect.getHeight()), this.screenToSimX(rect.getLeft() + rect.getWidth()), this.screenToSimY(rect.getTop()));
    }
    ;
    screenToSimScaleX(scr_x) {
        return scr_x / this.pixel_per_unit_x_;
    }
    ;
    screenToSimScaleY(scr_y) {
        return scr_y / this.pixel_per_unit_y_;
    }
    ;
    screenToSimX(scr_x) {
        return this.sim_left_ + (scr_x - this.screen_left_) / this.pixel_per_unit_x_;
    }
    ;
    screenToSimY(scr_y) {
        return this.sim_bottom_ + (this.screen_bottom_ - scr_y) / this.pixel_per_unit_y_;
    }
    ;
    simToScreen(p_sim) {
        return new Vector(this.simToScreenX(p_sim.getX()), this.simToScreenY(p_sim.getY()));
    }
    ;
    simToScreenRect(r) {
        return new ScreenRect(this.simToScreenX(r.getLeft()), this.simToScreenY(r.getTop()), this.simToScreenScaleX(r.getWidth()), this.simToScreenScaleY(r.getHeight()));
    }
    ;
    simToScreenScaleX(length_x) {
        return length_x * this.pixel_per_unit_x_;
    }
    ;
    simToScreenScaleY(length_y) {
        return length_y * this.pixel_per_unit_y_;
    }
    ;
    simToScreenX(sim_x) {
        return this.screen_left_ + (sim_x - this.sim_left_) * this.pixel_per_unit_x_;
    }
    ;
    simToScreenY(sim_y) {
        return this.screen_bottom_ - (sim_y - this.sim_bottom_) * this.pixel_per_unit_y_;
    }
    ;
}
CoordMap.MIN_SIZE = 1E-15;
;
Util.defineGlobal('lab$view$CoordMap', CoordMap);
