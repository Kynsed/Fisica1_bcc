import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class MouseTracker {
    constructor(dragDispObj, view, loc_sim, drag_body, eventHandler) {
        this.ehDrag_ = false;
        this.dragSimObj_ = null;
        this.dragOffset_ = Vector.ORIGIN;
        if (dragDispObj == null && eventHandler == null) {
            throw '';
        }
        this.dragDispObj_ = dragDispObj;
        this.view_ = view;
        this.eventHandler_ = eventHandler;
        if (dragDispObj != null) {
            const simObjs = dragDispObj.getSimObjects();
            if (simObjs.length > 0) {
                this.dragSimObj_ = simObjs[0];
            }
        }
        this.loc_sim_ = loc_sim;
        this.drag_body_ = drag_body;
        if (dragDispObj !== null) {
            this.dragOffset_ = loc_sim.subtract(dragDispObj.getPosition());
            if (this.dragSimObj_ === null) {
                this.eventHandler_ = null;
            }
        }
    }
    ;
    startDrag(modifiers) {
        if (this.eventHandler_ != null) {
            this.ehDrag_ = this.eventHandler_.startDrag(this.dragSimObj_, this.loc_sim_, this.dragOffset_, this.drag_body_, modifiers);
        }
        else {
            this.ehDrag_ = false;
        }
    }
    ;
    mouseDrag(loc_screen) {
        const map = this.view_.getCoordMap();
        this.loc_sim_ = map.screenToSim(loc_screen);
        if (this.dragDispObj_ != null && (this.dragSimObj_ == null || !this.ehDrag_)) {
            this.dragDispObj_.setPosition(this.loc_sim_.subtract(this.dragOffset_));
        }
        else {
            if (this.eventHandler_ != null && this.ehDrag_) {
                this.eventHandler_.mouseDrag(this.dragSimObj_, this.loc_sim_, this.dragOffset_);
            }
        }
    }
    ;
    finishDrag() {
        if (this.eventHandler_ != null) {
            this.eventHandler_.finishDrag(this.dragSimObj_, this.loc_sim_, this.dragOffset_);
        }
    }
    ;
    static findNearestDragable(labCanvas, start_screen, eventHandler) {
        let dragDispObj = null;
        let view;
        let start_sim;
        let dragPt = null;
        let distance = Infinity;
        const views = labCanvas.getViews();
        searchViews: for (let j = views.length - 1; j >= 0; j--) {
            const v = views[j];
            const map = v.getCoordMap();
            const loc_sim = map.screenToSim(start_screen);
            const objs = v.getDisplayList().toArray();
            searchObjs: for (let i = objs.length - 1; i >= 0; i--) {
                const dispObj = objs[i];
                if (!dispObj.isDragable()) {
                    continue searchObjs;
                }
                const massObjs = dispObj.getMassObjects();
                if (massObjs.length > 1) {
                    continue searchObjs;
                }
                else if (massObjs.length == 0) {
                    if (dispObj.contains(loc_sim)) {
                        dragDispObj = dispObj;
                        view = v;
                        start_sim = loc_sim;
                        dragPt = Vector.ORIGIN;
                        break searchViews;
                    }
                    else {
                        continue searchObjs;
                    }
                }
                else {
                    const massObj = massObjs[0];
                    const dpts = massObj.getDragPoints();
                    for (let k = dpts.length - 1; k >= 0; k--) {
                        const dpt = massObj.bodyToWorld(dpts[k]);
                        const dist = start_screen.distanceTo(map.simToScreen(dpt));
                        if (dist <= distance) {
                            distance = dist;
                            dragDispObj = dispObj;
                            view = v;
                            dragPt = dpts[k];
                            start_sim = loc_sim;
                        }
                    }
                }
            }
        }
        if (dragDispObj == null) {
            const nv = labCanvas.getFocusView();
            if (nv != null) {
                view = nv;
                start_sim = view.getCoordMap().screenToSim(start_screen);
            }
            else {
                return null;
            }
            if (eventHandler == null) {
                return null;
            }
        }
        if (view !== undefined && start_sim !== undefined) {
            return new MouseTracker(dragDispObj, view, start_sim, dragPt, eventHandler);
        }
        return null;
    }
    ;
}
Util.defineGlobal('lab$app$MouseTracker', MouseTracker);
