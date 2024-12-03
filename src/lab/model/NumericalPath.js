import { AbstractSimObject } from './SimObject.js';
import { DoubleRect } from '../util/DoubleRect.js';
import { PathPoint } from './PathPoint.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
;
export class NumericalPath extends AbstractSimObject {
    constructor(path, opt_tableLength) {
        super(path.getName());
        this.plen = 0;
        this.bounds = DoubleRect.EMPTY_RECT;
        this.tableLength_ = opt_tableLength || NumericalPath.DATA_POINTS;
        this.xvals = Util.newNumberArray(this.tableLength_);
        this.yvals = Util.newNumberArray(this.tableLength_);
        this.pvals = Util.newNumberArray(this.tableLength_);
        this.dxvals = Util.newNumberArray(this.tableLength_);
        this.dyvals = Util.newNumberArray(this.tableLength_);
        this.nxVals = Util.newNumberArray(this.tableLength_);
        this.nyVals = Util.newNumberArray(this.tableLength_);
        this.nxpVals = Util.newNumberArray(this.tableLength_);
        this.nypVals = Util.newNumberArray(this.tableLength_);
        this.closedLoop = path.isClosedLoop();
        this.make_table(path);
        Util.assert(this.pvals[0] < this.pvals[this.pvals.length - 1]);
        Util.assert(NumericalPath.isMonotonic(this.pvals));
        this.x_monotonic = NumericalPath.isMonotonic(this.xvals);
        this.startPoint_ = new PathPoint(this.getStartPValue());
        this.endPoint_ = new PathPoint(this.getFinishPValue());
        this.map_p_to_slope(this.startPoint_);
        this.map_p_to_slope(this.endPoint_);
    }
    ;
    toString() {
        return super.toString().slice(0, -1)
            + ', length: ' + Util.NF5(this.getLength())
            + ', closedLoop: ' + this.closedLoop
            + ', bounds: ' + this.bounds
            + '}';
    }
    ;
    getClassName() {
        return 'NumericalPath';
    }
    ;
    static binarySearch(arr, x) {
        let i_int, min, max;
        const n_int = arr.length;
        if (n_int < 2) {
            throw 'array must have more than one element';
        }
        const dir = arr[0] < arr[n_int - 1];
        i_int = Math.floor(n_int / 2);
        if (dir) {
            min = 0;
            max = n_int - 1;
        }
        else {
            min = n_int - 1;
            max = 0;
        }
        if (dir) {
            if (x < arr[0]) {
                return -1;
            }
            if (x >= arr[n_int - 1]) {
                return n_int;
            }
        }
        else {
            if (x < arr[n_int - 1]) {
                return n_int;
            }
            if (x >= arr[0]) {
                return -1;
            }
        }
        while (Math.abs(max - min) > 1) {
            if (arr[i_int] <= x) {
                if (dir) {
                    min = i_int;
                }
                else {
                    max = i_int;
                }
            }
            else {
                if (dir) {
                    max = i_int;
                }
                else {
                    min = i_int;
                }
            }
            if (dir) {
                i_int = min + Math.floor((max - min) / 2);
            }
            else {
                i_int = max + Math.floor((min - max) / 2);
            }
        }
        if (dir) {
            Util.assert(arr[i_int] <= x && x < arr[i_int + 1], ' i=' + i_int + ' x=' + x + ' not between ' + arr[i_int] + ' and ' + arr[i_int + 1]);
        }
        else {
            Util.assert(arr[i_int + 1] <= x && x < arr[i_int], ' i=' + i_int + ' x=' + x + ' not between ' + arr[i_int] + ' and ' + arr[i_int + 1]);
        }
        return i_int;
    }
    ;
    deriv3(yy, k, type) {
        Util.assert(k >= 0);
        Util.assert(k <= this.tableLength_ - 3);
        const x0 = this.pvals[k];
        const x1 = this.pvals[k + 1];
        const x2 = this.pvals[k + 2];
        let xj;
        switch (type) {
            case 0:
                xj = x0;
                break;
            case 1:
                xj = x1;
                break;
            case 2:
                xj = x2;
                break;
            default: throw '';
        }
        let r = yy[k] * (2 * xj - x1 - x2) / ((x0 - x1) * (x0 - x2));
        r += yy[k + 1] * (2 * xj - x0 - x2) / ((x1 - x0) * (x1 - x2));
        r += yy[k + 2] * (2 * xj - x0 - x1) / ((x2 - x0) * (x2 - x1));
        return r;
    }
    ;
    distanceSquared(point, i) {
        const xd = point.getX() - this.xvals[i];
        const yd = point.getY() - this.yvals[i];
        return xd * xd + yd * yd;
    }
    ;
    distanceSquared2(point, p, k) {
        const xp = NumericalPath.interp4(this.pvals, this.xvals, p, k - 1, this.closedLoop);
        const yp = NumericalPath.interp4(this.pvals, this.yvals, p, k - 1, this.closedLoop);
        const xd = point.getX() - xp;
        const yd = point.getY() - yp;
        return xd * xd + yd * yd;
    }
    ;
    findNearestGlobal(point) {
        const ppt = new PathPoint();
        const x = point.getX();
        const y = point.getY();
        let best_len = Infinity;
        for (let i = 0; i < this.tableLength_; i++) {
            const xd = x - this.xvals[i];
            const yd = y - this.yvals[i];
            const len = xd * xd + yd * yd;
            if (len < best_len) {
                best_len = len;
                ppt.x = this.xvals[i];
                ppt.y = this.yvals[i];
                ppt.p = this.pvals[i];
                ppt.idx = i;
            }
        }
        return ppt;
    }
    ;
    findNearestLocal(target, ppt) {
        let k_int = this.modk(ppt.idx);
        let dk_int = Math.floor(this.tableLength_ / 20);
        let d = this.plen / 20;
        let p = this.pvals[k_int];
        let ctr = 0;
        do {
            let y0, y1, y2;
            if (dk_int > 1) {
                p = this.pvals[k_int];
                y0 = this.distanceSquared(target, this.modk(k_int - dk_int));
                y1 = this.distanceSquared(target, k_int);
                y2 = this.distanceSquared(target, this.modk(k_int + dk_int));
            }
            else {
                const p0 = this.mod_p(p - d);
                y0 = this.distanceSquared2(target, p0, this.linearSearch(p0, k_int));
                y1 = this.distanceSquared2(target, p, k_int);
                const p2 = this.mod_p(p + d);
                y2 = this.distanceSquared2(target, p2, this.linearSearch(p2, k_int));
            }
            if (ctr > 1000 && Util.DEBUG) {
                console.log(ctr
                    + ' y0=' + Util.NF5(y0)
                    + ' y1=' + Util.NF5(y1)
                    + ' y2=' + Util.NF5(y2)
                    + ' p=' + Util.NF5(p)
                    + ' d=' + Util.NF7(d)
                    + ' dk=' + dk_int
                    + ' k=' + k_int);
            }
            if (y0 < y1 && y0 < y2) {
                if (dk_int > 1) {
                    k_int = this.modk(k_int - dk_int);
                    p = this.pvals[k_int];
                }
                else {
                    p = this.mod_p(p - d);
                    k_int = this.linearSearch(p, k_int);
                }
            }
            else if (y2 < y1) {
                Util.assert(y2 < y0);
                if (dk_int > 1) {
                    k_int = this.modk(k_int + dk_int);
                    p = this.pvals[k_int];
                }
                else {
                    p = this.mod_p(p + d);
                    k_int = this.linearSearch(p, k_int);
                }
            }
            else {
                if (dk_int > 1) {
                    dk_int = Math.floor(dk_int / 2);
                    Util.assert(dk_int >= 1);
                    if (dk_int == 1) {
                        d = this.tableSpacing(k_int);
                    }
                }
                else {
                    Util.assert(dk_int == 1);
                    d = d / 2;
                }
            }
            ctr++;
        } while (dk_int > 1 || d > 1E-6);
        if (this.closedLoop) {
            const oldp = ppt.p;
            const oldmodp = this.mod_p(ppt.p);
            if (oldmodp < this.plen / 6 && p > 5 * this.plen / 6) {
                const diff = ((p - this.plen) - oldmodp);
                ppt.p = ppt.p + diff;
            }
            else if (p < this.plen / 6 && oldmodp > 5 * this.plen / 6) {
                const diff = ((p + this.plen) - oldmodp);
                ppt.p = ppt.p + diff;
            }
            else {
                ppt.p = ppt.p + (p - oldmodp);
            }
        }
        else {
            ppt.p = p;
        }
        ppt.idx = k_int;
    }
    findPointByDistance(p1, p2, x) {
        const ppt = this.findNearestGlobal(p1);
        this.findNearestLocal(p1, ppt);
        const p1p = ppt.p;
        this.findNearestLocal(p2, ppt);
        let p2p = ppt.p;
        p2 = this.map_p_to_vector(p2p);
        let dist = p1.distanceTo(p2);
        if (dist < 1E-6) {
            p2p = p1p + x;
            p2 = this.map_p_to_vector(p2p);
            dist = p1.distanceTo(p2);
        }
        let err = dist - x;
        const sign = p2p > p1p ? 1 : -1;
        while (Math.abs(err) > 1e-10) {
            p2p = p1p + (x / dist) * (p2p - p1p);
            p2 = this.map_p_to_vector(p2p);
            dist = p1.distanceTo(p2);
            err = dist - x;
        }
        return p2;
    }
    getBoundsWorld() {
        return this.bounds;
    }
    ;
    getFinishPValue() {
        return this.pvals[this.pvals.length - 1];
    }
    ;
    getIterator(numPoints) {
        return new PointsIterator(this, numPoints);
    }
    ;
    getLength() {
        return this.getFinishPValue() - this.getStartPValue();
    }
    ;
    getSequence() {
        return 0;
    }
    ;
    getStartPValue() {
        return this.pvals[0];
    }
    ;
    getTableLength() {
        return this.tableLength_;
    }
    ;
    static interp4(xx, yy, x, k, _closedLoop) {
        const n = xx.length;
        if (yy.length != n) {
            throw '';
        }
        let i = k;
        if (i > n - 4) {
            i = n - 4;
        }
        else if (i < 0) {
            i = 0;
        }
        if (Util.DEBUG) {
            if (i > 0 && i < n - 4) {
                Util.assert(xx[i + 1] <= x && x < xx[i + 2]);
            }
        }
        let c1, c2, c3, c4;
        c1 = yy[i + 0];
        c2 = (yy[i + 1] - c1) / (xx[i + 1] - xx[i + 0]);
        c3 = (yy[i + 2] - (c1 + c2 * (xx[i + 2] - xx[i + 0]))) / ((xx[i + 2] - xx[i + 0]) * (xx[i + 2] - xx[i + 1]));
        c4 = yy[i + 3] - (c1 + c2 * (xx[i + 3] - xx[i + 0]) + c3 * (xx[i + 3] - xx[i + 0]) * (xx[i + 3] - xx[i + 1]));
        c4 = c4 / ((xx[i + 3] - xx[i + 0]) * (xx[i + 3] - xx[i + 1]) * (xx[i + 3] - xx[i + 2]));
        return ((c4 * (x - xx[i + 2]) + c3) * (x - xx[i + 1]) + c2) * (x - xx[i + 0]) + c1;
    }
    ;
    isClosedLoop() {
        return this.closedLoop;
    }
    ;
    static isMonotonic(arr) {
        const n_int = arr.length;
        if (n_int < 2) {
            throw 'array must have more than one element';
        }
        const dir = arr[0] < arr[n_int - 1];
        for (let i = 1; i < n_int; i++) {
            if (dir) {
                if (arr[i - 1] > arr[i]) {
                    return false;
                }
            }
            else {
                if (arr[i - 1] < arr[i]) {
                    return false;
                }
            }
        }
        return true;
    }
    ;
    limit_p(p) {
        if (this.closedLoop) {
            return this.mod_p(p);
        }
        else {
            if (p < this.pvals[0]) {
                p = this.pvals[0];
            }
            else if (p > this.pvals[this.tableLength_ - 1]) {
                p = this.pvals[this.tableLength_ - 1];
            }
            return p;
        }
    }
    ;
    linearSearch(p, k) {
        let j = k;
        if (j > this.tableLength_ - 2) {
            j = this.tableLength_ - 2;
        }
        if (j < 0) {
            j = 0;
        }
        if (Math.abs(this.pvals[j] - p) > this.plen / 20) {
            if (Util.DEBUG) {
                console.log('use binary not linear search ' + Util.NF5(p)
                    + ' ' + Util.NF5(this.pvals[j]));
            }
            j = NumericalPath.binarySearch(this.pvals, p);
        }
        else {
            while (true) {
                if (this.pvals[j] <= p && p < this.pvals[j + 1]) {
                    break;
                }
                if (p < this.pvals[j]) {
                    if (j > 0) {
                        j = j - 1;
                    }
                    else {
                        break;
                    }
                }
                else {
                    if (j < this.tableLength_ - 2) {
                        j = j + 1;
                    }
                    else {
                        break;
                    }
                }
            }
        }
        if (Util.DEBUG && j < this.tableLength_ - 2) {
            Util.assert(this.pvals[j] <= p && p < this.pvals[j + 1]);
        }
        return j;
    }
    ;
    make_table(path) {
        const tLow = path.getStartTValue();
        const tHigh = path.getFinishTValue();
        if (NumericalPath.debug && Util.DEBUG) {
            console.log('make_table ' + this.getName());
        }
        {
            const delta = (tHigh - tLow) / (this.tableLength_ - 1);
            let t = tLow;
            let p = 0;
            this.pvals[0] = 0;
            let x1, x2, y1, y2;
            x1 = x2 = this.xvals[0] = path.x_func(t);
            y1 = y2 = this.yvals[0] = path.y_func(t);
            for (let i = 1; i < this.tableLength_; i++) {
                t += delta;
                this.xvals[i] = path.x_func(t);
                this.yvals[i] = path.y_func(t);
                const dx = this.xvals[i] - this.xvals[i - 1];
                const dy = this.yvals[i] - this.yvals[i - 1];
                p += Math.sqrt(dx * dx + dy * dy);
                this.pvals[i] = p;
                if (this.xvals[i] < x1) {
                    x1 = this.xvals[i];
                }
                if (this.xvals[i] > x2) {
                    x2 = this.xvals[i];
                }
                if (this.yvals[i] < y1) {
                    y1 = this.yvals[i];
                }
                if (this.yvals[i] > y2) {
                    y2 = this.yvals[i];
                }
            }
            this.bounds = new DoubleRect(x1, y1, x2, y2);
            this.plen = this.pvals[this.tableLength_ - 1] - this.pvals[0];
        }
        for (let i = 0; i < this.tableLength_; i++) {
            if (i == 0) {
                this.dxvals[0] = this.deriv3(this.xvals, 0, 0);
                this.dyvals[0] = this.deriv3(this.yvals, 0, 0);
            }
            else if (i == this.tableLength_ - 1) {
                this.dxvals[i] = this.deriv3(this.xvals, i - 2, 2);
                this.dyvals[i] = this.deriv3(this.yvals, i - 2, 2);
            }
            else {
                this.dxvals[i] = this.deriv3(this.xvals, i - 1, 1);
                this.dyvals[i] = this.deriv3(this.yvals, i - 1, 1);
            }
            if (Math.abs(this.dxvals[i]) < 1E-16) {
                this.nxVals[i] = this.dyvals[i] < 0 ? 1.0 : -1.0;
                this.nyVals[i] = 0.0;
            }
            else if (Math.abs(this.dyvals[i]) < 1E-16) {
                this.nxVals[i] = 0.0;
                this.nyVals[i] = this.dxvals[i] > 0 ? 1.0 : -1.0;
            }
            else {
                const q = -this.dxvals[i] / this.dyvals[i];
                Util.assert(isFinite(q));
                const q2 = Math.sqrt(1 + q * q);
                this.nxVals[i] = 1.0 / q2;
                this.nyVals[i] = q / q2;
                const direction = this.dxvals[i] > 0 ? 1 : -1;
                if (direction * q < 0) {
                    this.nxVals[i] = -this.nxVals[i];
                    this.nyVals[i] = -this.nyVals[i];
                }
            }
        }
        for (let i = 0; i < this.tableLength_; i++) {
            if (i == 0) {
                this.nxpVals[0] = this.deriv3(this.nxVals, 0, 0);
                this.nypVals[0] = this.deriv3(this.nyVals, 0, 0);
            }
            else if (i == this.tableLength_ - 1) {
                this.nxpVals[i] = this.deriv3(this.nxVals, i - 2, 2);
                this.nypVals[i] = this.deriv3(this.nyVals, i - 2, 2);
            }
            else {
                this.nxpVals[i] = this.deriv3(this.nxVals, i - 1, 1);
                this.nypVals[i] = this.deriv3(this.nyVals, i - 1, 1);
            }
        }
        if (Util.DEBUG && this.closedLoop) {
            console.log('WARNING:  derivative of normal not calculated at loop point');
        }
    }
    ;
    map_p_to_index(p) {
        let k = NumericalPath.binarySearch(this.pvals, p);
        if (k < 0) {
            k = 0;
        }
        if (k > this.tableLength_ - 1) {
            k = this.tableLength_ - 1;
        }
        Util.assert(this.pvals[k] <= p || k == 0);
        return k;
    }
    ;
    map_p_to_vector(p) {
        return new Vector(this.map_p_to_x(p), this.map_p_to_y(p));
    }
    ;
    map_p_to_x(p) {
        p = this.mod_p(p);
        const k = NumericalPath.binarySearch(this.pvals, p);
        return NumericalPath.interp4(this.pvals, this.xvals, p, k - 1, this.closedLoop);
    }
    ;
    map_p_to_y(p) {
        p = this.mod_p(p);
        const k = NumericalPath.binarySearch(this.pvals, p);
        return NumericalPath.interp4(this.pvals, this.yvals, p, k - 1, this.closedLoop);
    }
    ;
    map_x_to_p(x) {
        if (!this.x_monotonic) {
            throw 'x is not monotonic';
        }
        const k = NumericalPath.binarySearch(this.xvals, x);
        return NumericalPath.interp4(this.xvals, this.pvals, x, k - 1, this.closedLoop);
    }
    ;
    map_x_to_y(x) {
        if (!this.x_monotonic) {
            throw 'x is not monotonic';
        }
        const k = NumericalPath.binarySearch(this.xvals, x);
        return NumericalPath.interp4(this.xvals, this.yvals, x, k - 1, this.closedLoop);
    }
    ;
    map_x_to_y_p(ppt) {
        if (!this.x_monotonic) {
            throw 'x is not monotonic';
        }
        const k = NumericalPath.binarySearch(this.xvals, ppt.x);
        ppt.y = NumericalPath.interp4(this.xvals, this.yvals, ppt.x, k - 1, this.closedLoop);
        ppt.p = NumericalPath.interp4(this.xvals, this.pvals, ppt.x, k - 1, this.closedLoop);
    }
    ;
    mod_p(p) {
        if (this.closedLoop) {
            if (p < 0 || p > this.plen) {
                p = p - this.plen * Math.floor(p / this.plen);
            }
        }
        return p;
    }
    ;
    modk(k) {
        let r = k;
        if (this.closedLoop) {
            while (r < 0) {
                r += this.tableLength_;
            }
            while (r >= this.tableLength_) {
                r -= this.tableLength_;
            }
        }
        else {
            if (r < 0) {
                r = 0;
            }
            else if (r >= this.tableLength_) {
                r = this.tableLength_ - 1;
            }
        }
        Util.assert(r > -1);
        Util.assert(r < this.tableLength_);
        return r;
    }
    ;
    map_p_to_slope(ppt) {
        const saveP = ppt.p;
        const nowP = this.mod_p(ppt.p);
        let k = ppt.idx;
        if (k < 0 || k > this.tableLength_ - 2 || this.pvals[k] > nowP ||
            this.pvals[k + 1] <= nowP) {
            const k0 = k;
            ppt.idx = k = NumericalPath.binarySearch(this.pvals, nowP);
        }
        if (k < 0) {
            k = 0;
        }
        if (k >= this.tableLength_ - 1) {
            k = this.tableLength_ - 2;
        }
        if (Util.DEBUG && k > 0 && k < this.tableLength_ - 2) {
            Util.assert(this.pvals[k] <= nowP && nowP < this.pvals[k + 1]);
        }
        if (!this.closedLoop) {
            if (nowP < this.getStartPValue()) {
                ppt.copyFrom(this.startPoint_);
                ppt.p = nowP;
                ppt.idx = k;
                const m = ppt.slope;
                ppt.x = this.startPoint_.x + (nowP - this.getStartPValue()) / Math.sqrt(1 + m * m);
                ppt.y = this.startPoint_.y + m * (ppt.x - this.startPoint_.x);
                return;
            }
            else if (nowP > this.getFinishPValue()) {
                ppt.copyFrom(this.endPoint_);
                ppt.p = nowP;
                ppt.idx = k;
                const m = ppt.slope;
                ppt.x = this.endPoint_.x + (nowP - this.getFinishPValue()) / Math.sqrt(1 + m * m);
                ppt.y = this.endPoint_.y + m * (ppt.x - this.endPoint_.x);
                return;
            }
        }
        ppt.x = NumericalPath.interp4(this.pvals, this.xvals, nowP, k - 1, this.closedLoop);
        ppt.y = NumericalPath.interp4(this.pvals, this.yvals, nowP, k - 1, this.closedLoop);
        ppt.dydp = NumericalPath.interp4(this.pvals, this.dyvals, nowP, k - 1, this.closedLoop);
        ppt.dxdp = NumericalPath.interp4(this.pvals, this.dxvals, nowP, k - 1, this.closedLoop);
        if (Math.abs(ppt.dxdp) < 1E-12) {
            ppt.dxdp = 0;
            if (ppt.dydp > 0) {
                ppt.direction = 1;
                ppt.slope = ppt.radius = Infinity;
                ppt.slopeX = 0;
                ppt.slopeY = 1;
                ppt.normalX = -1;
                ppt.normalY = 0;
            }
            else {
                ppt.direction = -1;
                ppt.slope = ppt.radius = Number.NEGATIVE_INFINITY;
                ppt.slopeX = 0;
                ppt.slopeY = -1;
                ppt.normalX = 1;
                ppt.normalY = 0;
            }
            Util.assert(!isNaN(ppt.slope));
        }
        else {
            ppt.direction = ppt.dxdp > 0 ? 1 : -1;
            ppt.slope = ppt.dydp / ppt.dxdp;
            Util.assert(!isNaN(ppt.slope));
            const s2 = Math.sqrt(1 + ppt.slope * ppt.slope);
            ppt.slopeX = 1.0 / s2;
            ppt.slopeY = ppt.slope / s2;
            if (ppt.direction == -1) {
                ppt.slopeX = -ppt.slopeX;
                ppt.slopeY = -ppt.slopeY;
            }
            Util.assert(!isNaN(ppt.slope));
            if (Math.abs(ppt.slope) > 1E-12) {
                const ns = -1 / ppt.slope;
                const ns2 = Math.sqrt(1 + ns * ns);
                ppt.normalX = 1.0 / ns2;
                ppt.normalY = ns / ns2;
                if (ppt.direction * ppt.slope > 0) {
                    ppt.normalX = -ppt.normalX;
                    ppt.normalY = -ppt.normalY;
                }
            }
            else {
                ppt.normalX = 0;
                ppt.normalY = ppt.direction > 0 ? 1 : -1;
            }
        }
        ppt.normalXdp = NumericalPath.interp4(this.pvals, this.nxpVals, nowP, k - 1, this.closedLoop);
        ppt.normalYdp = NumericalPath.interp4(this.pvals, this.nypVals, nowP, k - 1, this.closedLoop);
        if (ppt.radius_flag) {
            if ((k < 2) || (k > this.tableLength_ - 4)) {
                ppt.radius = Infinity;
            }
            else {
                const dx = this.xvals[k] - this.xvals[k - 2];
                const dy = this.yvals[k] - this.yvals[k - 2];
                const b1 = dy / dx;
                const p1 = this.pvals[k - 1];
                const dx2 = this.xvals[k + 3] - this.xvals[k + 1];
                const dy2 = this.yvals[k + 3] - this.yvals[k + 1];
                const b2 = dy2 / dx2;
                const p2 = this.pvals[k + 2];
                ppt.radius = (p2 - p1) / (Math.atan(b2) - Math.atan(b1));
                if (isNaN(ppt.radius) || !isFinite(ppt.slope)) {
                    ppt.radius = ppt.slope > 0 ? Infinity :
                        Number.NEGATIVE_INFINITY;
                }
            }
        }
        Util.assert(ppt.p == saveP);
    }
    ;
    printTable() {
        if (Util.DEBUG) {
            for (let i = 0; i < this.tableLength_; i++) {
                this.printPoint(i);
            }
        }
    }
    ;
    printPoint(i) {
        if (Util.DEBUG) {
            let s = 'p=' + Util.NF5(this.pvals[i]);
            s += ' x=' + Util.NF5(this.xvals[i])
                + ' y=' + Util.NF5(this.yvals[i])
                + ' dx=' + Util.NF5(this.dxvals[i])
                + ' dy=' + Util.NF5(this.dyvals[i]);
            console.log(s);
        }
    }
    ;
    tableSpacing(k) {
        let j;
        if (this.closedLoop) {
            j = this.modk(k - 1);
            return this.pvals[this.modk(j + 2)] - this.pvals[j];
        }
        else {
            j = this.modk(k);
            let j2;
            if (j == 0) {
                j = 0;
                j2 = j + 2;
            }
            else if (j == this.tableLength_ - 1) {
                j = this.tableLength_ - 3;
                j2 = j + 2;
            }
            else {
                j = j - 1;
                j2 = j + 2;
            }
            return this.pvals[j2] - this.pvals[j];
        }
    }
    ;
}
NumericalPath.DATA_POINTS = 9000;
NumericalPath.debug = false;
export class PointsIterator {
    constructor(path, numberOfPoints) {
        this.idx_ = -1;
        numberOfPoints = Math.min(numberOfPoints, path.getTableLength());
        this.path_ = path;
        const p_first = path.getStartPValue();
        const p_final = path.getFinishPValue();
        if (p_final <= p_first) {
            throw 'path data is out of order';
        }
        this.delta_ = (p_final - p_first) / numberOfPoints;
    }
    ;
    nextPoint(point) {
        const n = this.path_.getTableLength();
        if (this.idx_ >= n - 1) {
            return false;
        }
        if (this.idx_ < 0) {
            this.idx_ = 0;
        }
        else {
            const p_prev = this.path_.pvals[this.idx_];
            do {
                this.idx_++;
                if (this.idx_ > n - 1) {
                    this.idx_ = n - 1;
                    break;
                }
            } while (this.path_.pvals[this.idx_] - p_prev < this.delta_);
        }
        point.setTo(this.path_.xvals[this.idx_], this.path_.yvals[this.idx_], 0);
        return true;
    }
    ;
}
Util.defineGlobal('lab$model$NumericalPath', NumericalPath);
