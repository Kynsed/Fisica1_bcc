import { MutableVector } from '../util/MutableVector.js';
import { Util } from '../util/Util.js';
import { Vector } from '../util/Vector.js';
export class UtilEngine {
    constructor() {
        throw '';
    }
    ;
    static square(x) {
        return x * x;
    }
    ;
    static addColumnToMatrix(A, b) {
        const n = A.length;
        if (b.length != n)
            throw '';
        const M = UtilEngine.newEmptyMatrix(n, n + 1);
        for (let i = 0; i < n; i++)
            for (let j = 0; j < n; j++)
                M[i][j] = A[i][j];
        for (let i = 0; i < n; i++)
            M[i][n] = b[i];
        return M;
    }
    ;
    static checkArrayNaN(x) {
        if (Util.DEBUG) {
            let isOK = true;
            for (let i = 0, len = x.length; i < len; i++)
                isOK = isOK && !isNaN(x[i]);
            if (!isOK) {
                UtilEngine.printArray('fail NaN ', x);
                throw 'checkArrayNaN';
            }
        }
    }
    ;
    static colinearity(p) {
        Util.assert(p.length == 3);
        const v1 = Vector.clone(p[1]).subtract(p[0]).normalize();
        const v2 = Vector.clone(p[2]).subtract(p[0]).normalize();
        if (v1 == null || v2 == null)
            return 0;
        else
            return Math.abs(v1.dotProduct(v2));
    }
    ;
    static countBoolean(set, n) {
        let c = 0;
        for (let i = 0; i < n; i++)
            if (set[i])
                c++;
        return c;
    }
    ;
    static distanceToLine(p1, n, p2) {
        let r;
        if (Math.abs(n.getX()) < Vector.TINY_POSITIVE) {
            r = Math.abs(p2.getX() - p1.getX());
        }
        else if (Math.abs(n.getY()) < Vector.TINY_POSITIVE) {
            r = Math.abs(p2.getY() - p1.getY());
        }
        else {
            const k = n.getY() / n.getX();
            const qx = (-p1.getY() + p2.getY() + k * p1.getX() + p2.getX() / k) / (1 / k + k);
            const qy = p1.getY() + k * (qx - p1.getX());
            const dx = p2.getX() - qx;
            const dy = p2.getY() - qy;
            r = Math.sqrt(dx * dx + dy * dy);
        }
        return r;
    }
    ;
    static findMinimumSimplex(p, f, tolerance, info) {
        if (info.length < 2)
            throw Util.DEBUG ? 'info array length < 2' : '';
        if (p.length != 3)
            throw Util.DEBUG ? 'must pass 3 points' : '';
        const v = new Array(3);
        for (let i = 0; i < 3; i++) {
            v[i] = f(p[i]);
        }
        if (v[0] > v[1])
            UtilEngine.swapPointValue(v, p, 0, 1);
        if (v[1] > v[2])
            UtilEngine.swapPointValue(v, p, 1, 2);
        if (v[0] > v[1])
            UtilEngine.swapPointValue(v, p, 0, 1);
        const m = new MutableVector(0, 0);
        const r = new MutableVector(0, 0);
        const e = new MutableVector(0, 0);
        const c1 = new MutableVector(0, 0);
        const c2 = new MutableVector(0, 0);
        const t = new MutableVector(0, 0);
        let counter = 0;
        let md;
        while ((md = UtilEngine.maxDistance(p)) > tolerance) {
            Util.assert(v[0] <= v[1]);
            Util.assert(v[1] <= v[2]);
            counter++;
            if (UtilEngine.debugSimplex_) {
                console.log('iteration ' + counter + ' max dist ' + Util.NF5(md));
                for (let i = 0; i < 3; i++)
                    console.log(i + '. ' + Util.NF5(v[i]) + ' at ' + p[i]);
            }
            if (counter > 10000) {
                if (UtilEngine.debugSimplex_) {
                    const c = UtilEngine.colinearity(p);
                    console.log('FAILURE colinearity = ' + Util.NF5(c) +
                        ' value=' + Util.NF5(v[0]));
                }
                info[0] = counter;
                info[1] = 1;
                return Vector.clone(p[0]);
            }
            m.setToVector(p[0]).add(p[1]).divide(2);
            r.setToVector(m).multiply(2).subtract(p[2]);
            const vr = f(r);
            if (UtilEngine.debugSimplex_)
                console.log('Reflection ' + Util.NF5(vr) + ' at ' + r);
            if (vr < v[1]) {
                if (vr >= v[0]) {
                    if (UtilEngine.debugSimplex_)
                        console.log('Reflection, good but not best ');
                    v[2] = vr;
                    p[2].setToVector(r);
                    UtilEngine.swapPointValue(v, p, 1, 2);
                    continue;
                }
                e.setToVector(r).multiply(2).subtract(m);
                const ve = f(e);
                if (UtilEngine.debugSimplex_)
                    console.log('Expansion ' + Util.NF5(ve) + ' at ' + e);
                if (ve < vr) {
                    if (UtilEngine.debugSimplex_)
                        console.log('Expansion best (better than reflection) ');
                    v[2] = ve;
                    p[2].setToVector(e);
                }
                else {
                    if (UtilEngine.debugSimplex_)
                        console.log('Reflection best (better than expansion) ');
                    v[2] = vr;
                    p[2].setToVector(r);
                }
                UtilEngine.swapPointValue(v, p, 1, 2);
                UtilEngine.swapPointValue(v, p, 0, 1);
                continue;
            }
            c1.setToVector(p[2]).add(m).divide(2);
            const vc1 = f(c1);
            if (UtilEngine.debugSimplex_)
                console.log('Contraction1 ' + Util.NF5(vc1) + ' at ' + c1);
            t.setToVector(p[2].divide(2));
            c2.setToVector(m).multiply(1.5).subtract(t);
            const vc2 = f(c2);
            if (UtilEngine.debugSimplex_)
                console.log('Contraction2 ' + Util.NF5(vc2) + ' at ' + c2);
            if (vc1 < v[2] && vc1 < vc2) {
                if (UtilEngine.debugSimplex_)
                    console.log('Contraction1 better than worst ');
                v[2] = vc1;
                p[2].setToVector(c1);
                if (v[2] < v[1])
                    UtilEngine.swapPointValue(v, p, 1, 2);
                if (v[1] < v[0])
                    UtilEngine.swapPointValue(v, p, 0, 1);
                continue;
            }
            if (vc2 < v[2]) {
                if (UtilEngine.debugSimplex_)
                    console.log('Contraction2 better than worst ');
                v[2] = vc2;
                p[2].setToVector(c2);
                if (v[2] < v[1])
                    UtilEngine.swapPointValue(v, p, 1, 2);
                if (v[1] < v[0])
                    UtilEngine.swapPointValue(v, p, 0, 1);
                continue;
            }
            if (UtilEngine.debugSimplex_)
                console.log('Reduction ');
            p[1].add(p[0]).divide(2);
            p[2].add(p[0]).divide(2);
            v[1] = f(p[1]);
            v[2] = f(p[2]);
            if (UtilEngine.debugSimplex_)
                console.log('Reduction1 ' + Util.NF5(v[1]) + ' at ' + p[1]);
            if (UtilEngine.debugSimplex_)
                console.log('Reduction2 ' + Util.NF5(v[2]) + ' at ' + p[2]);
            if (v[0] > v[1])
                UtilEngine.swapPointValue(v, p, 0, 1);
            if (v[1] > v[2])
                UtilEngine.swapPointValue(v, p, 1, 2);
            if (v[0] > v[1])
                UtilEngine.swapPointValue(v, p, 0, 1);
        }
        if (v[0] > 0.01) {
            if (UtilEngine.debugSimplex_)
                console.log('did not go to zero ' + v[0]);
        }
        info[0] = counter;
        info[1] = 0;
        return Vector.clone(p[0]);
    }
    ;
    static formatArray(r, opt_start, opt_n, opt_nf) {
        const nf = opt_nf || Util.NF5E;
        const start = opt_start || 0;
        if (start >= r.length) {
            throw '';
        }
        const n = opt_n || r.length - start;
        const end = start + n;
        let s = '';
        for (let i = start; i < end; i++) {
            s += '[' + i + ']' + nf(r[i]) + ', ';
        }
        return s;
    }
    ;
    static linesIntersect(p1, p2, p3, p4) {
        let xi, yi, k1, k2;
        let x1 = p1.getX();
        let y1 = p1.getY();
        let x2 = p2.getX();
        let y2 = p2.getY();
        let x3 = p3.getX();
        let y3 = p3.getY();
        let x4 = p4.getX();
        let y4 = p4.getY();
        const parallel_tol = 1E-16;
        const tol = 1E-14;
        let d = x1 > x2 ? x1 : x2;
        if (x3 > d && x4 > d) {
            return null;
        }
        d = x1 < x2 ? x1 : x2;
        if (x3 < d && x4 < d) {
            return null;
        }
        d = y1 > y2 ? y1 : y2;
        if (y3 > d && y4 > d) {
            return null;
        }
        d = y1 < y2 ? y1 : y2;
        if (y3 < d && y4 < d) {
            return null;
        }
        if (Math.abs(x2 - x1) < parallel_tol) {
            if (Math.abs(x4 - x3) < parallel_tol)
                return null;
            k2 = (y4 - y3) / (x4 - x3);
            xi = x1;
            yi = k2 * (xi - x3) + y3;
            if (y2 < y1) {
                d = y1;
                y1 = y2;
                y2 = d;
            }
            if (x2 < x1) {
                d = x1;
                x1 = x2;
                x2 = d;
            }
            if (x4 < x3) {
                d = x3;
                x3 = x4;
                x4 = d;
            }
            if (y4 < y3) {
                d = y3;
                y3 = y4;
                y4 = d;
            }
            if (y1 - tol <= yi && yi <= y2 + tol) {
                if (x3 - tol <= xi && xi <= x4 + tol) {
                    if (y3 - tol <= yi && yi <= y4 + tol) {
                        return new Vector(xi, yi);
                    }
                }
            }
            return null;
        }
        else if (Math.abs(x4 - x3) < parallel_tol) {
            k1 = (y2 - y1) / (x2 - x1);
            xi = x3;
            yi = k1 * (xi - x1) + y1;
            if (y2 < y1) {
                d = y1;
                y1 = y2;
                y2 = d;
            }
            if (x2 < x1) {
                d = x1;
                x1 = x2;
                x2 = d;
            }
            if (x4 < x3) {
                d = x3;
                x3 = x4;
                x4 = d;
            }
            if (y4 < y3) {
                d = y3;
                y3 = y4;
                y4 = d;
            }
            if (x1 - tol <= xi && xi <= x2 + tol) {
                if (y1 - tol <= yi && yi <= y2 + tol) {
                    if (y3 - tol <= yi && yi <= y4 + tol) {
                        return new Vector(xi, yi);
                    }
                }
            }
            return null;
        }
        else {
            k1 = (y2 - y1) / (x2 - x1);
            k2 = (y4 - y3) / (x4 - x3);
            if (Math.abs(k2 - k1) < parallel_tol)
                return null;
            if (Math.abs(k2) < parallel_tol) {
                yi = (y3 + y4) / 2;
                xi = (yi - y1) / k1 + x1;
            }
            else if (Math.abs(k1) < parallel_tol) {
                yi = (y1 + y2) / 2;
                xi = (yi - y3) / k2 + x3;
            }
            else {
                xi = (k2 * x3 - k1 * x1 - y3 + y1) / (k2 - k1);
                yi = k1 * (xi - x1) + y1;
            }
            if (y2 < y1) {
                d = y1;
                y1 = y2;
                y2 = d;
            }
            if (x2 < x1) {
                d = x1;
                x1 = x2;
                x2 = d;
            }
            if (x4 < x3) {
                d = x3;
                x3 = x4;
                x4 = d;
            }
            if (y4 < y3) {
                d = y3;
                y3 = y4;
                y4 = d;
            }
            if (x1 - tol <= xi && xi <= x2 + tol) {
                if (y1 - tol <= yi && yi <= y2 + tol) {
                    if (x3 - tol <= xi && xi <= x4 + tol) {
                        if (y3 - tol <= yi && yi <= y4 + tol) {
                            return new Vector(xi, yi);
                        }
                    }
                }
            }
            return null;
        }
    }
    ;
    static maxDistance(p) {
        Util.assert(p.length == 3);
        let dist = p[0].distanceSquaredTo(p[1]);
        let d = p[0].distanceSquaredTo(p[2]);
        if (d > dist) {
            dist = d;
        }
        d = p[1].distanceSquaredTo(p[2]);
        if (d > dist) {
            dist = d;
        }
        return Math.sqrt(dist);
    }
    ;
    static maxSize(r, n) {
        let max = 0;
        n = n || r.length;
        for (let i = 0; i < n; i++) {
            const v = Math.abs(r[i]);
            if (v > max) {
                max = v;
            }
        }
        return max;
    }
    ;
    static minValue(r, n) {
        let min = Infinity;
        n = n || r.length;
        for (let i = 0; i < n; i++) {
            if (r[i] < min) {
                min = r[i];
            }
        }
        return min;
    }
    ;
    static printArray(s, r, nf, opt_n) {
        if (Util.DEBUG) {
            nf = nf || Util.NF7E;
            opt_n = opt_n || r.length;
            for (let i = 0; i < opt_n; i++) {
                s += ' [' + i + ']=' + nf(r[i]);
            }
            console.log(s);
        }
    }
    ;
    static printArray2(s, r, nf, opt_n) {
        if (Util.DEBUG) {
            nf = nf || Util.NF7E;
            opt_n = opt_n || r.length;
            s += ' ';
            for (let i = 0; i < opt_n; i++) {
                s += nf(r[i]) + ', ';
            }
            console.log(s);
        }
    }
    ;
    static printArray3(s, r, delim) {
        if (Util.DEBUG) {
            for (let i = 0, len = r.length; i < len; i++) {
                let ns;
                const num = r[i];
                if (num !== undefined) {
                    ns = num.toFixed(2);
                    if (ns === '0.00') {
                        ns = '     ';
                    }
                }
                else {
                    ns = 'undef';
                }
                s += ns + delim;
            }
            console.log(s);
        }
    }
    static printArrayIndices(s, r, n) {
        if (Util.DEBUG) {
            s += ' [';
            for (let i = 0; i < n; i++) {
                if (r[i]) {
                    s += i + ', ';
                }
            }
            s += ']';
            console.log(s);
        }
    }
    ;
    static printArrayPermutation(s, r, ncol, nf, opt_n) {
        if (Util.DEBUG) {
            nf = nf || Util.NF7;
            opt_n = opt_n || r.length;
            for (let i = 0; i < opt_n; i++) {
                s += nf(r[ncol[i]]) + ', ';
            }
            console.log(s);
        }
    }
    ;
    static printList(s, list) {
        if (Util.DEBUG) {
            s += ' [';
            for (let i = 0, len = list.length; i < len; i++) {
                s += list[i] + ', ';
            }
            s += ']';
            console.log(s);
        }
    }
    ;
    static printMatrix2(s, m, nf, n) {
        if (Util.DEBUG) {
            nf = nf || Util.NF7E;
            n = n || m.length;
            console.log(s);
            for (let i = 0; i < n; i++)
                UtilEngine.printArray2('', m[i], nf, n);
        }
    }
    static printMatrix3(s, m, nrow) {
        if (Util.DEBUG) {
            console.log(s);
            for (let i = 0, len = m.length; i < len; i++) {
                UtilEngine.printArray3('', m[nrow[i]], ',');
            }
        }
    }
    static printMatrixPermutation(s, m, nrow, ncol, nf, n) {
        if (Util.DEBUG) {
            console.log(s);
            n = n || m.length;
            for (let i = 0; i < n; i++) {
                UtilEngine.printArrayPermutation('', m[nrow[i]], ncol, nf, n + 1);
            }
        }
    }
    ;
    static matrixMultiply(A, x, opt_b) {
        const n = x.length;
        Util.assert(A.length >= n);
        Util.assert(A[0].length >= n);
        Util.assert(!opt_b || opt_b.length >= n);
        const r = new Array(n);
        for (let i = 0; i < n; i++) {
            r[i] = 0;
            for (let j = 0; j < n; j++) {
                r[i] += A[i][j] * x[j];
            }
            if (opt_b) {
                r[i] += -opt_b[i];
            }
        }
        return r;
    }
    ;
    static matrixSolveError(A, x, b) {
        const r = UtilEngine.matrixMultiply(A, x, b);
        return r[UtilEngine.maxIndex(r)];
    }
    ;
    static matrixSolve4(A, x, b, zero_tol) {
        zero_tol = (zero_tol === undefined) ? UtilEngine.MATRIX_SOLVE_ZERO_TOL : zero_tol;
        const M = UtilEngine.addColumnToMatrix(A, b);
        const nrow = new Array(x.length);
        return UtilEngine.matrixSolve3(M, x, zero_tol, nrow);
    }
    ;
    static matrixSolve3(A, x, zero_tol, nrow) {
        const ZERO_TOL2 = 0.1;
        const debug = UtilEngine.MATRIX_SOLVE_DEBUG;
        const n = x.length;
        Util.assert(A.length >= n);
        Util.assert(A[0].length >= n + 1);
        if (Util.DEBUG && debug) {
            console.log('maxtrixSolve3 n=' + n);
        }
        Util.assert(nrow.length >= n);
        const ncol = new Array(n + 1);
        const s = new Array(n);
        for (let i = 0; i < n; i++) {
            nrow[i] = i;
            ncol[i] = i;
            s[i] = 0;
            for (let j = 0; j < n; j++)
                if (Math.abs(A[i][j]) > s[i])
                    s[i] = Math.abs(A[i][j]);
            if (s[i] < UtilEngine.SMALL_POSITIVE) {
                if (Util.DEBUG) {
                    console.log('no unique solution, because row ' + i
                        + ' is zero; n=' + n);
                    UtilEngine.printMatrix2('A', A, Util.NF7, n);
                }
                return i;
            }
        }
        ncol[n] = n;
        let r = 0;
        let loopCtr = 0;
        eliminate: for (let c = 0; c < n; c++) {
            if (Util.DEBUG && loopCtr++ > 2 * n) {
                console.log('matrixSolv3 loopCtr=' + loopCtr + ' c=' + c + ' n=' + n);
            }
            let columnSwaps = 0;
            while (true) {
                let p = r;
                let max = Math.abs(A[nrow[p]][ncol[c]]) / s[nrow[p]];
                for (let j = r + 1; j < n; j++) {
                    let d = Math.abs(A[nrow[j]][ncol[c]]) / s[nrow[j]];
                    if (d > max) {
                        max = d;
                        p = j;
                    }
                }
                if (Math.abs(A[nrow[p]][ncol[c]]) < zero_tol) {
                    if (debug && Util.DEBUG) {
                        console.log('largest scaled entry in column ' + c + ' is small: '
                            + Util.NFE(A[nrow[p]][ncol[c]]));
                    }
                    if (columnSwaps >= (n - 1 - c)) {
                        if (debug && Util.DEBUG) {
                            console.log('columnSwaps=' + columnSwaps + ' >= ' + (n - 1) + ' - ' + c);
                        }
                        break eliminate;
                    }
                    if (debug && Util.DEBUG) {
                        UtilEngine.printArray('before column swap; c=' + c, ncol);
                    }
                    const ncopy = ncol[c];
                    for (let j = c; j < n - 1; j++) {
                        ncol[j] = ncol[j + 1];
                    }
                    ncol[n - 1] = ncopy;
                    columnSwaps++;
                    if (debug && Util.DEBUG) {
                        UtilEngine.printArray('after column swap', ncol);
                    }
                    continue;
                }
                if (nrow[r] != nrow[p]) {
                    const ncopy = nrow[r];
                    nrow[r] = nrow[p];
                    nrow[p] = ncopy;
                }
                for (let j = r + 1; j < n; j++) {
                    let m = A[nrow[j]][ncol[c]] / A[nrow[r]][ncol[c]];
                    for (let k = 0; k < n + 1; k++)
                        A[nrow[j]][ncol[k]] -= m * A[nrow[r]][ncol[k]];
                }
                if (debug && Util.DEBUG) {
                    UtilEngine.printMatrixPermutation('A ' + n, A, nrow, ncol, Util.NFE, n);
                }
                r++;
                columnSwaps = 0;
                break;
            }
        }
        r--;
        if (debug && Util.DEBUG)
            console.log('last row treated: r = ' + r);
        if (r < n - 1) {
            for (let i = r + 1; i < n; i++) {
                if (Math.abs(A[nrow[i]][n]) > ZERO_TOL2) {
                    return nrow[i];
                }
            }
        }
        let c = n - 1;
        let lastC = n;
        while (r >= 0) {
            let lmost = -1;
            for (let k = c; k >= r; k--) {
                if (Math.abs(A[nrow[r]][ncol[k]]) > zero_tol)
                    lmost = k;
            }
            if (lmost != -1 && lmost != c) {
                c = lmost;
                if (debug && Util.DEBUG)
                    console.log('move left in row  r = ' + r + ' to c=' + c
                        + ' A[r,c]=' + Util.NFE(A[nrow[r]][ncol[c]]));
            }
            if (Math.abs(A[nrow[r]][ncol[c]]) < zero_tol) {
                if (debug && Util.DEBUG) {
                    console.log('zero on diagonal move up a row r=' + r + ' c=' + c
                        + ' A[r,c]=' + Util.NFE(A[nrow[r]][ncol[c]]));
                }
                r--;
                continue;
            }
            if (debug && Util.DEBUG) {
                console.log('r=' + r + ' c=' + c + ' A[r,c]=' + Util.NFE(A[nrow[r]][ncol[c]]));
            }
            if (lastC - c > 1) {
                for (let j = c + 1; j < lastC; j++)
                    x[ncol[j]] = 0;
            }
            lastC = c;
            let sum = 0;
            for (let j = c + 1; j < n; j++) {
                sum += A[nrow[r]][ncol[j]] * x[ncol[j]];
            }
            x[ncol[c]] = (A[nrow[r]][n] - sum) / A[nrow[r]][ncol[c]];
            c--;
            r--;
        }
        return -1;
    }
    ;
    static matrixIsSingular(Acc, n, nrow, tolerance) {
        let min = Infinity;
        let max = 0;
        for (let i = 0; i < n; i++) {
            const diag = Math.abs(Acc[nrow[i]][i]);
            if (diag < min)
                min = diag;
            if (diag > max)
                max = diag;
        }
        const condition = max / min;
        const r = Math.abs(min) < tolerance;
        return r;
    }
    ;
    static maxIndex(r) {
        let max = 0;
        let j = -1;
        for (let i = 0, len = r.length; i < len; i++) {
            if (Math.abs(r[i]) > max) {
                max = Math.abs(r[i]);
                j = i;
            }
        }
        return j;
    }
    ;
    static nearness(r1, r2, distTol) {
        if (Number.isNaN(r1) || Number.isNaN(r2))
            throw '';
        let r = -1;
        if (r1 == Infinity) {
            r = r2 > 0 ? r2 : r1;
        }
        else if (r2 == Infinity) {
            r = r1 > 0 ? r1 : r2;
        }
        else if (r1 > 0 && r2 > 0) {
            r = r1 < r2 ? r1 : r2;
        }
        else if (r1 < 0) {
            r = -r1;
        }
        else {
            r = -r2;
        }
        Util.assert(r > 0);
        if (r == Infinity) {
            return distTol;
        }
        else {
            return 2 * r * Math.sqrt(2 * distTol / r);
        }
    }
    ;
    static newEmptyMatrix(n, m) {
        m = m || n;
        const a = new Array(n);
        for (let i = 0; i < n; i++) {
            a[i] = new Float64Array(m);
        }
        return a;
    }
    ;
    static newMatrixFromArray(n, a) {
        if (a.length < n * n)
            throw '';
        const M = UtilEngine.newEmptyMatrix(n);
        let k = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (j < n)
                    M[i][j] = a[k];
                k++;
            }
        }
        return M;
    }
    ;
    static newMatrixFromArray2(n, a) {
        if (a.length < n * (n + 1))
            throw 'a.length=' + a.length + ' n=' + n;
        const M = UtilEngine.newEmptyMatrix(n);
        let k = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n + 1; j++) {
                if (j < n)
                    M[i][j] = a[k];
                k++;
            }
        }
        return M;
    }
    ;
    static swapPointValue(v, p, i, j) {
        const d = v[i];
        v[i] = v[j];
        v[j] = d;
        const q = p[i];
        p[i] = p[j];
        p[j] = q;
    }
    ;
    static vectorAdd(v, u) {
        const n = v.length;
        Util.assert(u.length == n);
        const r = new Array(n);
        for (let i = 0; i < n; i++) {
            r[i] = v[i] + u[i];
        }
        return r;
    }
    ;
    static vectorLength(p) {
        let sum = 0;
        for (let i = 0, len = p.length; i < len; i++) {
            sum += p[i] * p[i];
        }
        return Math.sqrt(sum);
    }
    ;
}
UtilEngine.PROXIMITY_TEST = true;
UtilEngine.debugEngine2D = null;
UtilEngine.SMALL_POSITIVE = 1E-10;
UtilEngine.SMALL_NEGATIVE = -1E-10;
UtilEngine.TOLERANCE = 1E-10;
UtilEngine.MATRIX_SOLVE_ZERO_TOL = 1E-10;
UtilEngine.MATRIX_SOLVE_DEBUG = false;
UtilEngine.debugSimplex_ = false;
Util.defineGlobal('lab$engine2D$UtilEngine', UtilEngine);
