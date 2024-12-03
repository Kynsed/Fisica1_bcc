import { AbstractSubject } from "../util/AbstractSubject.js";
import { ConcreteMemoList } from "../util/ConcreteMemoList.js";
import { GenericEvent, ParameterNumber, ParameterString } from "../util/Observe.js";
import { SimView } from "./SimView.js";
import { ScreenRect } from "./ScreenRect.js";
import { Util } from "../util/Util.js";
export class LabCanvas extends AbstractSubject {
    constructor(canvas, name) {
        super(name);
        this.simViews_ = [];
        this.focusView_ = null;
        this.alpha_ = 1.0;
        this.background_ = '';
        this.changed_ = true;
        this.counter_ = 0;
        this.debug_ = false;
        this.htmlCanvas_ = canvas;
        this.memoList_ = new ConcreteMemoList();
        canvas.contentEditable = 'false';
        document.body.addEventListener("touchstart", function (e) {
            if (e.target == canvas) {
                e.preventDefault();
            }
        }, { passive: false });
        document.body.addEventListener("touchend", function (e) {
            if (e.target == canvas) {
                e.preventDefault();
            }
        }, { passive: false });
        document.body.addEventListener("touchmove", function (e) {
            if (e.target == canvas) {
                e.preventDefault();
            }
        }, { passive: false });
        this.addParameter(new ParameterNumber(this, LabCanvas.en.WIDTH, LabCanvas.i18n.WIDTH, () => this.getWidth(), a => this.setWidth(a)));
        this.addParameter(new ParameterNumber(this, LabCanvas.en.HEIGHT, LabCanvas.i18n.HEIGHT, () => this.getHeight(), a => this.setHeight(a)));
        this.addParameter(new ParameterNumber(this, LabCanvas.en.ALPHA, LabCanvas.i18n.ALPHA, () => this.getAlpha(), a => this.setAlpha(a)));
        this.addParameter(new ParameterString(this, LabCanvas.en.BACKGROUND, LabCanvas.i18n.BACKGROUND, () => this.getBackground(), a => this.setBackground(a)));
    }
    ;
    toString() {
        return this.toStringShort().slice(0, -1)
            + ', width: ' + this.htmlCanvas_.width
            + ', height: ' + this.htmlCanvas_.height
            + ', background_: "' + this.background_ + '"'
            + ', alpha_: ' + Util.NF5(this.alpha_)
            + ', focusView_: '
            + (this.focusView_ == null ? 'null' : this.focusView_.toStringShort())
            + ', simViews_: ['
            + this.simViews_.map(v => v.toStringShort())
            + '], memoList_: ' + this.memoList_
            + super.toString();
    }
    ;
    getClassName() {
        return 'LabCanvas';
    }
    ;
    addMemo(memorizable) {
        this.memoList_.addMemo(memorizable);
    }
    ;
    addView(view) {
        Util.assert(Util.isObject(view));
        if (this.getWidth() > 0 && this.getHeight() > 0) {
            const sr = new ScreenRect(0, 0, this.getWidth(), this.getHeight());
            view.setScreenRect(sr);
        }
        this.simViews_.push(view);
        this.addMemo(view);
        this.changed_ = true;
        this.broadcast(new GenericEvent(this, LabCanvas.VIEW_ADDED, view));
        this.broadcast(new GenericEvent(this, LabCanvas.VIEW_LIST_MODIFIED));
        if (this.focusView_ == null) {
            this.setFocusView(view);
        }
    }
    ;
    focus() {
        this.htmlCanvas_.focus();
    }
    ;
    getAlpha() {
        return this.alpha_;
    }
    ;
    getBackground() {
        return this.background_;
    }
    ;
    getCanvas() {
        return this.htmlCanvas_;
    }
    ;
    getChanged() {
        let chg = false;
        for (let i = 0, n = this.simViews_.length; i < n; i++) {
            const c = this.simViews_[i].getChanged();
            chg = chg || c;
        }
        if (chg || this.changed_) {
            this.changed_ = false;
            return true;
        }
        return false;
    }
    ;
    getContext() {
        const c = this.htmlCanvas_.getContext('2d');
        if (c === null) {
            throw 'unable to get CanvasRenderingContext2D';
        }
        ;
        return c;
    }
    ;
    getFocusView() {
        return this.focusView_;
    }
    ;
    getHeight() {
        return this.htmlCanvas_.height;
    }
    ;
    getMemos() {
        return this.memoList_.getMemos();
    }
    ;
    getScreenRect() {
        return new ScreenRect(0, 0, this.htmlCanvas_.width, this.htmlCanvas_.height);
    }
    ;
    getViews() {
        return Array.from(this.simViews_);
    }
    ;
    getWidth() {
        return this.htmlCanvas_.width;
    }
    ;
    memorize() {
        this.memoList_.memorize();
    }
    ;
    notifySizeChanged() {
        const r = this.getScreenRect();
        this.simViews_.forEach(view => view.setScreenRect(r));
        this.changed_ = true;
        this.broadcast(new GenericEvent(this, LabCanvas.SIZE_CHANGED));
    }
    ;
    paint() {
        if (this.htmlCanvas_.offsetParent != null) {
            if (this.counter_ > 0) {
                this.counter_--;
            }
            const chg = this.getChanged();
            if (chg || this.counter_ > 0) {
                const context = this.htmlCanvas_.getContext('2d');
                if (context === null) {
                    throw 'unable to get html context';
                }
                context.save();
                try {
                    if (this.background_ != '') {
                        context.globalAlpha = this.alpha_;
                        context.fillStyle = this.background_;
                        context.fillRect(0, 0, this.htmlCanvas_.width, this.htmlCanvas_.height);
                        context.globalAlpha = 1;
                        if (this.alpha_ == 1) {
                            this.counter_ = 0;
                        }
                        else if (chg) {
                            this.counter_ = Math.floor(10 / this.alpha_);
                        }
                    }
                    else {
                        context.clearRect(0, 0, this.htmlCanvas_.width, this.htmlCanvas_.height);
                    }
                    this.simViews_.forEach(view => view.paint(context));
                }
                finally {
                    context.restore();
                }
            }
        }
    }
    ;
    removeMemo(memorizable) {
        this.memoList_.removeMemo(memorizable);
    }
    ;
    removeView(view) {
        if (!(view instanceof SimView))
            throw 'not a SimView ' + view;
        Util.remove(this.simViews_, view);
        this.removeMemo(view);
        if (this.focusView_ == view) {
            this.setFocusView((this.simViews_.length === 0) ? null : this.simViews_[0]);
        }
        this.changed_ = true;
        this.broadcast(new GenericEvent(this, LabCanvas.VIEW_REMOVED, view));
        this.broadcast(new GenericEvent(this, LabCanvas.VIEW_LIST_MODIFIED));
    }
    ;
    setAlpha(value) {
        if (Util.veryDifferent(this.alpha_, value)) {
            if (value <= 0 || value > 1) {
                throw 'alpha must be between 0 and 1';
            }
            this.alpha_ = value;
            if (Util.veryDifferent(value, 1) && this.background_ == '') {
                this.setBackground('white');
            }
            this.changed_ = true;
            this.broadcastParameter(LabCanvas.en.ALPHA);
        }
    }
    ;
    setBackground(value) {
        if (this.background_ != value) {
            this.background_ = value;
            this.changed_ = true;
            this.broadcastParameter(LabCanvas.en.BACKGROUND);
        }
    }
    ;
    setFocusView(view) {
        if (view != null && !this.simViews_.includes(view))
            throw 'cannot set focus to unknown view ' + view;
        if (this.focusView_ != view) {
            if (this.focusView_ != null) {
                this.focusView_.loseFocus();
            }
            this.focusView_ = view;
            if (view != null) {
                view.gainFocus();
            }
            this.changed_ = true;
            this.broadcast(new GenericEvent(this, LabCanvas.FOCUS_VIEW_CHANGED, view));
        }
    }
    ;
    setHeight(value) {
        if (Util.veryDifferent(value, this.htmlCanvas_.height)) {
            this.htmlCanvas_.height = value;
        }
        this.notifySizeChanged();
        this.broadcastParameter(LabCanvas.en.HEIGHT);
    }
    ;
    setScreenRect(sr) {
        if (!(sr instanceof ScreenRect))
            throw 'not a ScreenRect: ' + sr;
        if (sr.getTop() != 0 || sr.getLeft() != 0) {
            throw 'top left must be (0,0), was: ' + sr;
        }
        this.changed_ = true;
        this.setSize(sr.getWidth(), sr.getHeight());
    }
    ;
    setSize(width, height) {
        if (typeof width !== 'number' || width <= 0 || typeof height !== 'number' || height <= 0) {
            throw 'bad size ' + width + ', ' + height;
        }
        this.htmlCanvas_.width = width;
        this.htmlCanvas_.height = height;
        this.notifySizeChanged();
        this.broadcastParameter(LabCanvas.en.WIDTH);
        this.broadcastParameter(LabCanvas.en.HEIGHT);
    }
    ;
    setWidth(value) {
        if (Util.veryDifferent(value, this.htmlCanvas_.width)) {
            this.htmlCanvas_.width = value;
        }
        this.notifySizeChanged();
        this.broadcastParameter(LabCanvas.en.WIDTH);
    }
    ;
}
LabCanvas.FOCUS_VIEW_CHANGED = 'FOCUS_VIEW_CHANGED';
LabCanvas.SIZE_CHANGED = 'SIZE_CHANGED';
LabCanvas.VIEW_LIST_MODIFIED = 'VIEW_LIST_MODIFIED';
LabCanvas.VIEW_ADDED = 'VIEW_ADDED';
LabCanvas.VIEW_REMOVED = 'VIEW_REMOVED';
LabCanvas.en = {
    WIDTH: 'width',
    HEIGHT: 'height',
    ALPHA: 'alpha',
    BACKGROUND: 'background',
};
LabCanvas.de_strings = {
    WIDTH: 'Breite',
    HEIGHT: 'Höhe',
    ALPHA: 'alpha',
    BACKGROUND: 'Hintergrund',
};
LabCanvas.i18n = Util.LOCALE === 'de' ? LabCanvas.de_strings : LabCanvas.en;
;
Util.defineGlobal('lab$view$LabCanvas', LabCanvas);
