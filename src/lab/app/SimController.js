import { DoubleRect } from '../util/DoubleRect.js';
import { MouseTracker } from './MouseTracker.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class SimController {
    constructor(labCanvas, eventHandler, panModifiers) {
        this.enablePanning_ = false;
        this.panModifiers_ = {};
        this.mouseDrag_ = false;
        this.mouseTracker_ = null;
        this.myViewPanner_ = null;
        this.touchStartFn_ = undefined;
        this.touchMoveFn_ = undefined;
        this.touchEndFn_ = undefined;
        this.debug_ = false;
        this.labCanvas_ = labCanvas;
        this.eventHandler_ = eventHandler || null;
        if (panModifiers === undefined) {
            panModifiers = { shift: true };
        }
        if (panModifiers) {
            this.enablePanning_ = true;
            this.panModifiers_ = panModifiers;
        }
        this.mouseDownFn_ = this.mouseDown.bind(this);
        labCanvas.getCanvas().addEventListener('mousedown', this.mouseDownFn_);
        this.mouseMoveFn_ = this.mouseMove.bind(this);
        document.addEventListener('mousemove', this.mouseMoveFn_);
        this.mouseUpFn_ = this.mouseUp.bind(this);
        document.addEventListener('mouseup', this.mouseUpFn_);
        this.keyDownFn_ = this.keyPressed.bind(this);
        document.addEventListener('keydown', this.keyDownFn_);
        this.keyUpFn_ = this.keyReleased.bind(this);
        document.addEventListener('keyup', this.keyUpFn_);
        this.touchStartFn_ = this.touchStart.bind(this);
        document.addEventListener('touchstart', this.touchStartFn_);
        this.touchMoveFn_ = this.touchMove.bind(this);
        document.addEventListener('touchmove', this.touchMoveFn_);
        this.touchEndFn_ = this.touchEnd.bind(this);
        document.addEventListener('touchend', this.touchEndFn_);
    }
    ;
    destroy() {
        if (this.mouseDownFn_)
            this.labCanvas_.getCanvas().removeEventListener('mousedown', this.mouseDownFn_);
        if (this.mouseMoveFn_)
            document.removeEventListener('mousemove', this.mouseMoveFn_);
        if (this.mouseUpFn_)
            document.removeEventListener('mouseup', this.mouseUpFn_);
        if (this.keyDownFn_)
            document.removeEventListener('keydown', this.keyDownFn_);
        if (this.keyUpFn_)
            document.removeEventListener('keyup', this.keyUpFn_);
        if (this.touchStartFn_)
            document.removeEventListener('touchstart', this.touchStartFn_);
        if (this.touchMoveFn_)
            document.removeEventListener('touchmove', this.touchMoveFn_);
        if (this.touchEndFn_)
            document.removeEventListener('touchend', this.touchEndFn_);
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', labCanvas_: ' + this.labCanvas_.toStringShort()
            + ', enablePanning_: ' + this.enablePanning_
            + ', panModifiers_: ' + SimController.modifiersToString(this.panModifiers_)
            + '}';
    }
    ;
    toStringShort() {
        return 'SimController{eventHandler_: '
            + (this.eventHandler_ != null ? this.eventHandler_.toStringShort() : 'null')
            + '}';
    }
    ;
    notifyError(_error) {
        if (this.mouseDrag_) {
            this.finishDrag();
        }
    }
    ;
    mouseDown(evt) {
        const modifiers = {
            control: evt.ctrlKey,
            meta: evt.metaKey,
            shift: evt.shiftKey,
            alt: evt.altKey
        };
        this.doMouseDown(modifiers, evt.clientX, evt.clientY);
    }
    ;
    doMouseDown(modifiers, mouseX, mouseY) {
        this.labCanvas_.focus();
        this.mouseDrag_ = true;
        const start_screen = this.eventToScreen(mouseX, mouseY);
        if (this.enablePanning_ &&
            SimController.modifiersEqual(this.panModifiers_, modifiers)) {
            const view = this.labCanvas_.getFocusView();
            if (view != null) {
                this.myViewPanner_ = new ViewPanner(view, start_screen);
                this.myViewPanner_.mouseDrag(start_screen);
            }
        }
        else {
            this.mouseTracker_ = MouseTracker.findNearestDragable(this.labCanvas_, start_screen, this.eventHandler_);
            if (this.mouseTracker_ != null) {
                this.mouseTracker_.startDrag(modifiers);
            }
        }
    }
    ;
    eventToScreen(mouseX, mouseY) {
        const cvs = this.labCanvas_.getCanvas();
        const r = cvs.getBoundingClientRect();
        const p = new Vector(mouseX - r.left, mouseY - r.top);
        const stretch = cvs.offsetWidth / this.labCanvas_.getWidth();
        return p.divide(stretch);
    }
    ;
    mouseMove(evt) {
        this.doMouseMove(evt.clientX, evt.clientY);
    }
    ;
    doMouseMove(mouseX, mouseY) {
        const cvs = this.labCanvas_.getCanvas();
        if (cvs.offsetParent == null) {
            return;
        }
        const loc_screen = this.eventToScreen(mouseX, mouseY);
        if (this.myViewPanner_ != null) {
            this.myViewPanner_.mouseDrag(loc_screen);
        }
        else if (this.mouseTracker_ != null) {
            this.mouseTracker_.mouseDrag(loc_screen);
        }
    }
    ;
    mouseUp(_evt) {
        const cvs = this.labCanvas_.getCanvas();
        if (cvs.offsetParent == null) {
            return;
        }
        this.finishDrag();
    }
    ;
    finishDrag() {
        if (this.myViewPanner_ != null) {
            this.myViewPanner_.finishDrag();
        }
        else if (this.mouseTracker_ != null) {
            this.mouseTracker_.finishDrag();
        }
        this.mouseTracker_ = null;
        this.myViewPanner_ = null;
        this.mouseDrag_ = false;
    }
    ;
    getEventHandler() {
        return this.eventHandler_;
    }
    ;
    getPanModifiers() {
        return this.enablePanning_ ? this.panModifiers_ : null;
    }
    ;
    keyPressed(evt) {
        if (evt.target == this.labCanvas_.getCanvas() || evt.target == document.body) {
            if (this.eventHandler_ != null) {
                if (Util.DEBUG && this.debug_) {
                    console.log('keyPressed ' + Util.propertiesOf(evt, true));
                }
                const modifiers = {
                    control: evt.ctrlKey,
                    meta: evt.metaKey,
                    shift: evt.shiftKey,
                    alt: evt.altKey
                };
                this.eventHandler_.handleKeyEvent(evt, true, modifiers);
            }
        }
    }
    ;
    keyReleased(evt) {
        if (evt.target == this.labCanvas_.getCanvas() || evt.target == document.body) {
            if (this.eventHandler_ != null) {
                if (Util.DEBUG && this.debug_) {
                    console.log('keyReleased ' + Util.propertiesOf(evt, true));
                }
                const modifiers = {
                    control: evt.ctrlKey,
                    meta: evt.metaKey,
                    shift: evt.shiftKey,
                    alt: evt.altKey
                };
                this.eventHandler_.handleKeyEvent(evt, false, modifiers);
            }
        }
        ;
    }
    ;
    setEventHandler(eventHandler) {
        this.eventHandler_ = eventHandler;
    }
    ;
    setPanModifiers(panModifiers) {
        if (panModifiers === null || panModifiers === undefined) {
            this.enablePanning_ = false;
            this.panModifiers_ = {};
        }
        else {
            this.enablePanning_ = true;
            this.panModifiers_ = panModifiers;
        }
    }
    ;
    touchStart(evt) {
        if (evt.target == this.labCanvas_.getCanvas()) {
            const touches = evt.touches;
            if (touches && touches.length == 1) {
                const modifiers = {
                    control: false,
                    meta: false,
                    shift: false,
                    alt: false
                };
                this.doMouseDown(modifiers, touches[0].clientX, touches[0].clientY);
            }
            else {
                this.finishDrag();
            }
        }
    }
    ;
    touchMove(evt) {
        const touches = evt != null ? evt.touches : [];
        if (this.mouseDrag_ && touches && touches.length == 1) {
            this.doMouseMove(touches[0].clientX, touches[0].clientY);
        }
        else {
            this.finishDrag();
        }
    }
    ;
    touchEnd(_evt) {
        if (this.mouseDrag_) {
            this.finishDrag();
        }
    }
    ;
    static modifiersToString(modifiers) {
        let s = '';
        if (modifiers.control)
            s += 'control';
        if (modifiers.alt)
            s += (s.length > 0 ? '+' : '') + 'alt';
        if (modifiers.meta)
            s += (s.length > 0 ? '+' : '') + 'meta';
        if (modifiers.shift)
            s += (s.length > 0 ? '+' : '') + 'shift';
        return s;
    }
    ;
    static modifiersEqual(m1, m2) {
        return (!!m1.control == !!m2.control)
            && (!!m1.meta == !!m2.meta)
            && (!!m1.shift == !!m2.shift)
            && (!!m1.alt == !!m2.alt);
    }
    ;
}
Util.defineGlobal('lab$app$SimController', SimController);
export class ViewPanner {
    constructor(view, start_screen) {
        this.view_ = view;
        this.panMap_ = view.getCoordMap();
        const sr = view.getSimRect();
        this.center_screen_ = this.panMap_.simToScreen(sr.getCenter());
        this.start_screen_ = start_screen;
    }
    ;
    mouseDrag(loc_screen) {
        const offset = this.start_screen_.subtract(loc_screen);
        const center = this.panMap_.screenToSim(this.center_screen_.add(offset));
        const sr = this.view_.getSimRect();
        const dr = DoubleRect.makeCentered(center, sr.getWidth(), sr.getHeight());
        this.view_.setSimRect(dr);
    }
    ;
    finishDrag() { }
    ;
}
Util.defineGlobal('lab$app$ViewPanner', ViewPanner);
