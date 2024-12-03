import { UtilEngine } from './UtilEngine.js';
import { Util } from '../util/Util.js';
export class ComputeForces {
    constructor(name, pRNG) {
        this.order = [];
        this.preOrder = [];
        this.nextContactPolicy = 4;
        this.name_ = name;
        this.pRNG = pRNG;
    }
    setNextContactPolicy(nextContactPolicy, preOrder) {
        if (nextContactPolicy == 3) {
            if (Array.isArray(preOrder)) {
                this.preOrder = preOrder;
            }
            else {
                throw 'no preOrder specified';
            }
        }
        else {
            this.preOrder.length = 0;
        }
        this.nextContactPolicy = nextContactPolicy;
    }
    getNextContactPolicy() {
        return this.nextContactPolicy;
    }
    getOrder() {
        return Array.from(this.order);
    }
    compute_forces(A, f, b, joint, debugCF, time, tolerance) {
        const n = b.length;
        if (A.length != n || A[0].length != n || f.length != n || b.length != n ||
            joint.length != n) {
            throw 'wrong length of input array';
        }
        if (n == 1) {
            f[0] = (joint[0] || b[0] < 0) ? -b[0] / A[0][0] : 0;
            return -1;
        }
        const SMALL_POSITIVE = 1E-10;
        const WARNINGS = true;
        const DEFER_SINGULAR = true;
        const SINGULAR_MATRIX_LIMIT = 2E-3;
        let aMatrix = [];
        const a = Util.newNumberArray(n);
        const C = Util.newBooleanArray(n);
        const NC = Util.newBooleanArray(n);
        const R = Util.newBooleanArray(n);
        const reRejects = [];
        const delta_a = Util.newNumberArray(n);
        const delta_f = Util.newNumberArray(n);
        const zeroSteps = Util.newBooleanArray(n);
        const states = [];
        const accels = [];
        let stepSize = 0;
        for (let i = 0; i < n; i++) {
            f[i] = 0;
            a[i] = b[i];
            NC[i] = false;
            C[i] = false;
            R[i] = false;
        }
        const print = (s) => {
            if (Util.DEBUG) {
                console.log(this.name_ + ' ' + Util.NF4(time) + ' ' + s);
            }
        };
        const printEverything = (s, printMatrix) => {
            if (Util.DEBUG) {
                print('printEverything ' + s);
                console.log('seed=' + this.pRNG.getSeed());
                UtilEngine.printArray('f', f, Util.NFE, n);
                UtilEngine.printArray('a', a, Util.NFSCI, n);
                UtilEngine.printArray('delta_f', delta_f, Util.NFE, n);
                UtilEngine.printArray('delta_a', delta_a, Util.NFE, n);
                UtilEngine.printArrayIndices('joint', joint, n);
                UtilEngine.printArrayIndices('C', C, n);
                UtilEngine.printArrayIndices('NC', NC, n);
                UtilEngine.printArrayIndices('R', R, n);
                UtilEngine.printList('reRejects', reRejects);
                {
                    const p = new Array(n);
                    for (let i = 0; i < n; i++) {
                        p[i] = !C[i] && !NC[i] && !R[i];
                    }
                    UtilEngine.printArrayIndices('not treated', p, n);
                }
                if (printMatrix) {
                    UtilEngine.printMatrix2('A ' + A.length + 'x' + A[0].length, A, Util.NFSCI);
                    UtilEngine.printArray('b', b, Util.NFSCI, n);
                }
            }
        };
        const printContact = (s, allInfo, j, d, loopCtr) => {
            if (Util.DEBUG) {
                s = s + ' j=' + j + ' N=' + n + ' step=' + Util.NFE(stepSize);
                if (allInfo || C[j]) {
                    s += ' C[' + j + ']=' + C[j]
                        + ' f[' + j + ']=' + Util.NFE(f[j])
                        + ' delta_f[' + j + ']=' + Util.NFE(delta_f[j]);
                }
                if (allInfo || NC[j]) {
                    s += ' NC[' + j + ']=' + NC[j]
                        + ' a[' + j + ']=' + Util.NFE(a[j])
                        + ' delta_a[' + j + ']=' + Util.NFE(delta_a[j]);
                }
                if (d >= 0) {
                    s += ' d=' + d + ' a[d]=' + Util.NFE(a[d]);
                }
                if (loopCtr >= 0) {
                    s += ' loopCtr=' + loopCtr;
                }
                print(s);
            }
        };
        const resizeMatrix = (N) => {
            if (aMatrix.length < N) {
                N = 10 * (2 + N / 10);
                aMatrix = new Array(N);
                for (let i = 0; i < N; i++) {
                    aMatrix[i] = new Float64Array(N + 1);
                }
            }
            return aMatrix;
        };
        const checkLoop = (d) => {
            const sumAccelSquare = (accel, joint, n) => {
                let r = 0;
                for (let i = 0; i < n; i++) {
                    if (joint[i] || accel[i] < 0) {
                        r += accel[i] * accel[i];
                    }
                }
                return r;
            };
            if (Util.DEBUG) {
                for (let i = 0; i < n; i++) {
                    if (C[i])
                        Util.assert(!NC[i] && !R[i]);
                    if (NC[i])
                        Util.assert(!C[i] && !R[i]);
                    if (R[i])
                        Util.assert(!C[i] && !NC[i]);
                }
            }
            for (let i = 0; i < n; i++) {
                if (!C[i] && !NC[i] && !R[i]) {
                    if (debugCF) {
                        print('contact not yet treated i=' + i);
                    }
                    return false;
                }
            }
            if (Util.DEBUG && debugCF) {
                print('checkLoop states.length=' + states.length);
            }
            const state = [];
            for (let i = 0; i < n; i++) {
                state.push(C[i] ? 1 : (NC[i] ? 2 : 3));
            }
            state.push(d);
            if (Util.DEBUG && debugCF) {
                UtilEngine.printList('checkLoop state', state);
            }
            let duplicateState = false;
            for (let i = 0, len = states.length; i < len; i++) {
                if (Util.DEBUG && debugCF) {
                    UtilEngine.printList('state', state);
                }
                if (Util.equals(state, states[i])) {
                    if (Util.DEBUG && WARNINGS) {
                        const accelOld = accels[i];
                        const accelMin = UtilEngine.minValue(accels);
                        print('num states=' + states.length
                            + ' now accel=' + Util.NFE(sumAccelSquare(a, joint, n))
                            + ' prev accel=' + Util.NFE(accelOld)
                            + ' min accel=' + Util.NFE(accelMin));
                        UtilEngine.printList('state', state);
                        console.log('checkLoop detected same state');
                    }
                    duplicateState = true;
                }
            }
            if (!duplicateState) {
                states.push(state);
                accels.push(sumAccelSquare(a, joint, n));
            }
            if (duplicateState && Util.DEBUG && WARNINGS) {
                UtilEngine.printList('now state', state);
                states.map(s => UtilEngine.printList('old state', s));
                UtilEngine.printList('accels', accels);
            }
            return duplicateState;
        };
        const nextContactHybrid = () => {
            let j = -1;
            const rand = this.pRNG.randomInts(n);
            for (let k = 0; k < n; k++) {
                let i = rand[k];
                if (joint[i] && !C[i] && !NC[i] && !R[i]) {
                    return i;
                }
            }
            let minAccel = Infinity;
            j = -1;
            for (let i = 0; i < n; i++) {
                if (!joint[i] && !C[i] && !NC[i] && !R[i]) {
                    if (a[i] < minAccel) {
                        minAccel = a[i];
                        j = i;
                    }
                }
            }
            if (j > -1) {
                return j;
            }
            return nextReject();
        };
        const nextContactMinAccel = () => {
            let maxAccel = -1;
            let j = -1;
            for (let i = 0; i < n; i++) {
                if (joint[i] && !C[i] && !NC[i] && !R[i]) {
                    if (Math.abs(a[i]) > maxAccel) {
                        maxAccel = Math.abs(a[i]);
                        j = i;
                    }
                }
            }
            if (j > -1) {
                return j;
            }
            let minAccel = Infinity;
            j = -1;
            for (let i = 0; i < n; i++) {
                if (!joint[i] && !C[i] && !NC[i] && !R[i]) {
                    if (a[i] < minAccel) {
                        minAccel = a[i];
                        j = i;
                    }
                }
            }
            if (j > -1) {
                return j;
            }
            return nextReject();
        };
        const nextContactRandom = () => {
            const rand = this.pRNG.randomInts(n);
            for (let k = 0; k < n; k++) {
                let i = rand[k];
                if (joint[i] && !C[i] && !NC[i] && !R[i]) {
                    return i;
                }
            }
            for (let k = 0; k < n; k++) {
                let i = rand[k];
                if (!joint[i] && !C[i] && !NC[i] && !R[i]) {
                    return i;
                }
            }
            return nextReject();
        };
        const nextContactOrdered = () => {
            const np = this.preOrder.length;
            for (let k = 0; k < np; k++) {
                let i = this.preOrder[k];
                if (joint[i] && !C[i] && !NC[i] && !R[i]) {
                    return i;
                }
            }
            for (let k = 0; k < np; k++) {
                let i = this.preOrder[k];
                if (!joint[i] && !C[i] && !NC[i] && !R[i]) {
                    return i;
                }
            }
            return nextReject();
        };
        const nextReject = () => {
            let maxAccel = 0.0;
            let j = -1;
            for (let i = 0; i < n; i++) {
                if (R[i] && !reRejects.includes(i)) {
                    if (!joint[i] && a[i] < -maxAccel || joint[i]
                        && Math.abs(a[i]) > maxAccel) {
                        maxAccel = Math.abs(a[i]);
                        j = i;
                    }
                }
            }
            if (j > -1 && maxAccel > 100 * SMALL_POSITIVE) {
                return j;
            }
            return -1;
        };
        const checkAccel = (tolerance) => {
            if (WARNINGS && Util.DEBUG) {
                for (let i = 0; i < n; i++) {
                    if ((C[i] || joint[i]) && Math.abs(a[i]) > SMALL_POSITIVE) {
                        print('=======  accel s/b zero a[' + i + ']='
                            + Util.NFE(a[i]) + ' tol=' + Util.NFE(SMALL_POSITIVE));
                    }
                    if ((NC[i] && !joint[i]) && a[i] < -SMALL_POSITIVE) {
                        print('========  accel s/b non-negative a[' + i + ']='
                            + Util.NFE(a[i]) + ' tol=' + Util.NFE(-SMALL_POSITIVE));
                    }
                    if (NC[i] && Math.abs(f[i]) > SMALL_POSITIVE) {
                        print('========  force s/b zero at NC f[' + i + ']='
                            + Util.NFE(f[i]) + ' tol=' + Util.NFE(SMALL_POSITIVE));
                    }
                }
            }
            if (!ComputeForces.checkForceAccel(tolerance, f, a, joint)) {
                if (WARNINGS && Util.DEBUG) {
                    print('checkForceAccel FAILED with tolerance=' + Util.NFE(tolerance));
                    UtilEngine.printArray('force', f, Util.NFE, n);
                    UtilEngine.printArray('accel', a, Util.NFE, n);
                }
                return false;
            }
            return true;
        };
        const maxStep = (d) => {
            let s = Infinity;
            if (joint[d] && a[d] > 0) {
                s = Number.NEGATIVE_INFINITY;
            }
            let j = -1;
            Util.assert(!C[d] && !NC[d]);
            if (joint[d]) {
                j = d;
                s = -a[d] / delta_a[d];
            }
            else if (delta_a[d] > 0) {
                Util.assert(a[d] < -SMALL_POSITIVE);
                j = d;
                s = -a[d] / delta_a[d];
            }
            else {
            }
            if (debugCF && Util.DEBUG) {
                print('maxStep start with d=' + d + ' j=' + j + ' s=' + Util.NFE(s));
            }
            const sign = s > 0 ? 1 : -1;
            for (let i = 0; i < n; i++) {
                if (!joint[i] && C[i] && delta_f[i] * sign < -1E-14) {
                    let sPrime = -f[i] / delta_f[i];
                    if (sPrime * sign < 0) {
                        if (Math.abs(f[i]) > 2 * SMALL_POSITIVE) {
                            debugCF = true;
                        }
                        if (debugCF && Util.DEBUG) {
                            print('opposite step(1) i=' + i
                                + ' ' + Util.NFE(sPrime)
                                + ' delta_f[i]=' + Util.NFE(delta_f[i])
                                + ' f[i]=' + Util.NFE(f[i]));
                        }
                        sPrime = 0;
                    }
                    if (debugCF && Util.DEBUG) {
                        print('C[' + i + '] sPrime=' + Util.NFE(sPrime));
                    }
                    if (sPrime * sign < s * sign) {
                        s = sPrime;
                        j = i;
                    }
                }
            }
            for (let i = 0; i < n; i++) {
                if (NC[i] && (!joint[i] && delta_a[i] * sign < -1E-14
                    || joint[i] && Math.abs(delta_a[i] * sign) > 1E-14)) {
                    let sPrime = -a[i] / delta_a[i];
                    if (sPrime * sign < 0) {
                        if (Math.abs(a[i]) > 2 * SMALL_POSITIVE) {
                            debugCF = true;
                            printContact('opposite step(2)', true, i, d, -1);
                        }
                        if (debugCF && Util.DEBUG) {
                            print('opposite step(2) i=' + i
                                + ' sPrime=' + Util.NFE(sPrime)
                                + ' delta_a[i]=' + Util.NFE(delta_a[i])
                                + ' a[i]=' + Util.NFE(a[i]));
                        }
                        sPrime = 0;
                    }
                    if (debugCF && Util.DEBUG) {
                        print('NC[' + i + '] sPrime=' + Util.NFE(sPrime));
                    }
                    if (sPrime * sign < s * sign) {
                        s = sPrime;
                        j = i;
                    }
                }
            }
            if (debugCF && Util.DEBUG) {
                print('maxStep end with j=' + j + ' d=' + d + ' s=' + Util.NFE(s));
            }
            stepSize = s;
            return j;
        };
        const fdirection = (d) => {
            for (let i = 0; i < n; i++) {
                delta_f[i] = 0;
            }
            delta_f[d] = 1;
            Util.assert(!C[d]);
            const c = UtilEngine.countBoolean(C, n);
            if (c > 0) {
                const Acc = resizeMatrix(c);
                for (let i = 0, p = 0; i < n; i++) {
                    if (C[i]) {
                        for (let j = 0, q = 0; j < n; j++)
                            if (C[j]) {
                                Acc[p][q] = A[i][j];
                                q++;
                            }
                        Acc[p][c] = -A[i][d];
                        p++;
                    }
                }
                const x = Util.newNumberArray(c);
                const nrow = Util.newNumberArray(c);
                const error = UtilEngine.matrixSolve3(Acc, x, 1E-9, nrow);
                if (WARNINGS && Util.DEBUG) {
                    const singular = UtilEngine.matrixIsSingular(Acc, c, nrow, SINGULAR_MATRIX_LIMIT);
                    if (singular) {
                        print('Acc is singular in fdirection d=' + d);
                    }
                }
                if (error != -1) {
                    Util.assert(false);
                    return -999999;
                }
                for (let i = 0, p = 0; i < n; i++) {
                    if (C[i]) {
                        delta_f[i] = x[p++];
                    }
                }
            }
            for (let i = 0; i < n; i++) {
                delta_a[i] = 0;
                for (let j = 0; j < n; j++) {
                    delta_a[i] += A[i][j] * delta_f[j];
                }
            }
            return -1;
        };
        const wouldBeSingular1 = (d) => {
            Util.assert(!C[d]);
            const c = 1 + UtilEngine.countBoolean(C, n);
            const Acc = resizeMatrix(c);
            for (let i = 0, p = 0; i < n; i++) {
                if (C[i] || i == d) {
                    for (let j = 0, q = 0; j < n; j++) {
                        if (C[j] || j == d) {
                            Acc[p][q] = A[i][j];
                            q++;
                        }
                    }
                    Acc[p][c] = 1;
                    p++;
                }
            }
            const nrow = Util.newNumberArray(c);
            const x = Util.newNumberArray(c);
            const tolerance = 1E-9;
            const error = UtilEngine.matrixSolve3(Acc, x, tolerance, nrow);
            const isSingular = UtilEngine.matrixIsSingular(Acc, c, nrow, SINGULAR_MATRIX_LIMIT);
            if (debugCF && Util.DEBUG && (1 == 1 || isSingular)) {
                const ncol = new Array(c + 1);
                for (let i = 0; i < c + 1; i++) {
                    ncol[i] = i;
                }
                UtilEngine.printMatrixPermutation('Acc ' + c + 'x' + (c + 1), Acc, nrow, ncol, Util.NF7, c);
            }
            return isSingular;
        };
        const wouldBeSingular2 = (d, e) => {
            Util.assert(!C[d] && !C[e]);
            const c = 2 + UtilEngine.countBoolean(C, n);
            const Acc = resizeMatrix(c);
            for (let i = 0, p = 0; i < n; i++) {
                if (C[i] || i == d || i == e) {
                    for (let j = 0, q = 0; j < n; j++)
                        if (C[j] || j == d || j == e) {
                            Acc[p][q] = A[i][j];
                            q++;
                        }
                    Acc[p][c] = 1;
                    p++;
                }
            }
            const nrow = Util.newNumberArray(c);
            const x = Util.newNumberArray(c);
            const tolerance = 1E-9;
            const error = UtilEngine.matrixSolve3(Acc, x, tolerance, nrow);
            const isSingular = UtilEngine.matrixIsSingular(Acc, c, nrow, SINGULAR_MATRIX_LIMIT);
            if (debugCF && Util.DEBUG && isSingular) {
                const ncol = new Array(c + 1);
                for (let i = 0; i < c + 1; i++) {
                    ncol[i] = i;
                }
                UtilEngine.printMatrixPermutation('Acc ' + c + 'x' + (c + 1), Acc, nrow, ncol, Util.NF7, c);
            }
            return isSingular;
        };
        const drive_to_zero = (d) => {
            Util.assert(n <= f.length);
            Util.assert(!C[d]);
            Util.assert(!NC[d]);
            if (debugCF && Util.DEBUG) {
                print('drive_to_zero d=' + d + ' a[' + d + ']=' + Util.NFE(a[d])
                    + ' joint=' + joint[d] + ' N=' + n);
            }
            if (!joint[d] && a[d] >= -SMALL_POSITIVE
                || joint[d] && Math.abs(a[d]) <= SMALL_POSITIVE) {
                NC[d] = true;
                return -1;
            }
            if (DEFER_SINGULAR) {
                if (wouldBeSingular1(d)) {
                    if (!R[d]) {
                        if (Util.DEBUG && debugCF) {
                            print('SINGULAR MATRIX(1) DEFER d=' + d
                                + ' f[d]=' + Util.NFE(f[d])
                                + ' a[d]=' + Util.NFE(a[d]));
                        }
                        return d;
                    }
                    else {
                        if (Util.DEBUG && debugCF) {
                            print('SINGULAR MATRIX(1) IN REJECTS d=' + d
                                + ' a[d]=' + Util.NFE(a[d]));
                        }
                    }
                }
            }
            for (let i = 0; i < n; i++) {
                delta_a[i] = 0;
                delta_f[i] = 0;
                zeroSteps[i] = false;
            }
            let accelTol = SMALL_POSITIVE;
            let loopCtr = 0;
            while (!joint[d] && a[d] < -accelTol ||
                joint[d] && Math.abs(a[d]) > accelTol) {
                if (debugCF && Util.DEBUG) {
                    const accDsingular = wouldBeSingular1(d);
                    print('Acc+d would be ' + (accDsingular ? '' : 'non-') + 'singular, d=' + d);
                }
                const error = fdirection(d);
                if (error != -1)
                    return error;
                if (debugCF && Util.DEBUG) {
                    printEverything('drive_to_zero after fdirection, d=' + d);
                }
                if (WARNINGS && Util.DEBUG) {
                    for (let i = 0; i < n; i++) {
                        if (C[i] && Math.abs(delta_a[i]) > SMALL_POSITIVE) {
                            print('should be zero ' + ' delta_a[' + i + ']=' + Util.NFE(delta_a[i]));
                        }
                        if (C[i] && Math.abs(delta_f[i]) > 1E6) {
                            print('very large force ' + ' delta_f[' + i + ']=' + Util.NFE(delta_f[i]));
                        }
                    }
                }
                const j = maxStep(d);
                if (j < 0 || Math.abs(stepSize) > 1E5) {
                    if (WARNINGS && Util.DEBUG) {
                        if (j > -1) {
                            print('HUGE STEP j=' + j + ' d=' + d + ' stepSize=' + Util.NFE(stepSize));
                        }
                        else {
                            print('maxStep:  no step possible d=' + d);
                        }
                    }
                    if (Math.abs(f[d]) < SMALL_POSITIVE) {
                        return d;
                    }
                    else {
                        if (Math.abs(a[d]) < 1E-5) {
                            accelTol = 1.1 * Math.abs(a[d]);
                            continue;
                        }
                        if (Util.DEBUG) {
                            printEverything('maxStep failed but f[d]>0, d=' + d + ' j=' + j, false);
                        }
                        return -2;
                    }
                }
                Util.assert(j > -1);
                if (debugCF && Util.DEBUG) {
                    printContact(' maxStep', false, j, d, loopCtr);
                }
                if (Math.abs(stepSize) < 1E-12) {
                    if (debugCF && Util.DEBUG) {
                        printContact(' ZERO STEP', false, j, d, loopCtr);
                    }
                    if (zeroSteps[j]) {
                        if (WARNINGS && Util.DEBUG) {
                            print('FLIP-FLOP DEFER j=' + j
                                + ' f[j]=' + Util.NFE(f[j])
                                + ' a[j]=' + Util.NFE(a[j])
                                + ' while driving d=' + d + ' N=' + n);
                        }
                        Util.assert(Math.abs(f[j]) < 10 * SMALL_POSITIVE);
                        C[j] = false;
                        NC[j] = false;
                        R[j] = true;
                    }
                    zeroSteps[j] = true;
                }
                for (let i = 0; i < n; i++) {
                    f[i] += stepSize * delta_f[i];
                    a[i] += stepSize * delta_a[i];
                }
                if (loopCtr++ > 10 * n) {
                    if (Util.DEBUG) {
                        debugCF = true;
                        print('drive_to_zero() loopCtr=' + loopCtr + ' d=' + d + ' a[d]=' + a[d]);
                    }
                    else if (loopCtr > 1000 * n) {
                        throw 'drive_to_zero() loopCtr=' + loopCtr + ' d=' + d + ' a[d]=' + a[d];
                    }
                }
                if (DEFER_SINGULAR && NC[j]) {
                    Util.assert(Math.abs(f[j]) < SMALL_POSITIVE);
                    if (wouldBeSingular2(d, j)) {
                        if (!R[j]) {
                            if (debugCF && Util.DEBUG) {
                                print('SINGULAR MATRIX(2) DEFER NC j=' + j
                                    + ' f[j]=' + Util.NFE(f[j]) + ' a[j]=' + Util.NFE(a[j]));
                            }
                            C[j] = false;
                            NC[j] = false;
                            R[j] = true;
                            continue;
                        }
                        else {
                            if (WARNINGS && Util.DEBUG) {
                                print('SINGULAR MATRIX(2) IN REJECTS NC j=' + j
                                    + ' a[j]=' + Util.NFE(a[j]));
                            }
                        }
                    }
                }
                if (C[j]) {
                    Util.assert(Math.abs(f[j]) <= SMALL_POSITIVE);
                    if (Math.abs(a[j]) > SMALL_POSITIVE) {
                        if (Math.abs(f[j]) > 10 * SMALL_POSITIVE) {
                            const s = 'moving C to NC but f[j]=' + Util.NFE(f[j]);
                            if (Util.DEBUG) {
                                printEverything(s);
                            }
                            else {
                                throw s;
                            }
                        }
                        if (WARNINGS && Util.DEBUG) {
                            printContact(' redo C', false, j, d, loopCtr);
                        }
                        C[j] = false;
                        NC[j] = false;
                        R[j] = true;
                    }
                    else {
                        C[j] = false;
                        NC[j] = true;
                        Util.assert(!R[j]);
                    }
                }
                else if (NC[j]) {
                    Util.assert(Math.abs(a[j]) <= SMALL_POSITIVE);
                    if (Math.abs(f[j]) > SMALL_POSITIVE) {
                        if (Math.abs(a[j]) > 10 * SMALL_POSITIVE) {
                            print('WARNING moving NC to C but a[j]=' + Util.NFE(a[j]));
                        }
                        if (WARNINGS && Util.DEBUG) {
                            printContact(' redo NC', false, j, d, loopCtr);
                        }
                        C[j] = false;
                        NC[j] = false;
                        R[j] = true;
                    }
                    else {
                        C[j] = true;
                        NC[j] = false;
                        Util.assert(!R[j]);
                    }
                }
                else if (j == d) {
                }
                else {
                    Util.assert(R[j]);
                }
            }
            C[d] = Math.abs(f[d]) > SMALL_POSITIVE;
            NC[d] = !C[d];
            Util.assert((Math.abs(f[d]) > SMALL_POSITIVE && C[d])
                || (Math.abs(f[d]) <= SMALL_POSITIVE && NC[d]));
            if (debugCF && Util.DEBUG) {
                print('drive_to_zero finish d=' + d
                    + ' a[' + d + ']=' + Util.NFE(a[d]));
                printEverything('drive_to_zero finish');
            }
            return -1;
        };
        let solved = 0;
        let loopCtr = 0;
        if (Util.DEBUG) {
            this.order = [];
        }
        if (Util.DEBUG && debugCF) {
            if (this.preOrder.length > 0) {
                UtilEngine.printList('preOrder ', this.preOrder);
            }
            printEverything('compute_forces start', true);
        }
        while (true) {
            loopCtr++;
            let d = -1;
            switch (this.nextContactPolicy) {
                case 4:
                    d = nextContactHybrid();
                    break;
                case 1:
                    d = nextContactMinAccel();
                    break;
                case 2:
                    d = nextContactRandom();
                    break;
                case 3:
                    d = nextContactOrdered();
                    break;
                default: throw '';
            }
            if (Util.DEBUG && debugCF) {
                print('--------- in compute_forces, d=' + d
                    + ' loopCtr=' + loopCtr + ' --------------');
            }
            if (d < 0) {
                break;
            }
            if (R[d]) {
                reRejects.push(d);
            }
            if (checkLoop(d)) {
                if (Util.DEBUG && WARNINGS) {
                    print('checkLoop STOP');
                }
                break;
            }
            if (Util.DEBUG) {
                this.order.push(d);
            }
            if (Util.DEBUG && loopCtr > 2 * n) {
                debugCF = true;
                printEverything('compute_forces loopCtr= ' + loopCtr + ' d=' + d, false);
            }
            const error = drive_to_zero(d);
            if (Util.DEBUG && debugCF) {
                print('drive_to_zero returned ' +
                    (error == -1 ? 'OK' : error) + ' d=' + d + ' N=' + n);
            }
            if (error > -1) {
                Util.assert(error < n);
                C[error] = false;
                NC[error] = false;
                R[error] = true;
                if (Util.DEBUG) {
                    this.order.push(error == 0 ? -9999 : -error);
                }
            }
            else if (error < -1) {
                if (Util.DEBUG && WARNINGS) {
                    print('compute_forces general error ' + error);
                }
                return error;
            }
            else {
                Util.assert(error == -1);
                reRejects.length = 0;
                if (R[d]) {
                    if (Util.DEBUG && debugCF) {
                        printContact(' deferral solved ', true, d, -1, -1);
                    }
                    solved++;
                    R[d] = false;
                }
            }
        }
        if (Util.DEBUG && debugCF && solved > 0) {
            if (solved > 0) {
                print('compute_forces rejects solved ' + solved);
            }
            printEverything('end of compute_forces');
        }
        if (tolerance !== undefined) {
            if (!checkAccel(tolerance)) {
                return -2;
            }
        }
        return -1;
    }
    static maxAccel(accel, joint, n) {
        let r = 0;
        for (let i = 0; i < n; i++) {
            if (joint[i] || !joint[i] && accel[i] < 0) {
                if (Math.abs(accel[i]) > r)
                    r = Math.abs(accel[i]);
            }
        }
        return r;
    }
    static checkForceAccel(tolerance, force, accel, joint) {
        if (Util.DEBUG) {
            UtilEngine.checkArrayNaN(accel);
            UtilEngine.checkArrayNaN(force);
        }
        if (accel.length < force.length) {
            throw '';
        }
        let r = true;
        for (let i = 0; i < force.length; i++) {
            if (joint[i] || Math.abs(force[i]) > 1E-10) {
                if (Math.abs(accel[i]) > tolerance) {
                    r = false;
                    if (Util.DEBUG) {
                        console.log('checkForceAccel i=' + i
                            + ' accel[i]=' + Util.NFE(accel[i])
                            + ' force[i]=' + Util.NFE(force[i]));
                    }
                }
            }
            else {
                if (accel[i] < -tolerance) {
                    r = false;
                    if (Util.DEBUG) {
                        console.log('checkForceAccel i=' + i
                            + ' accel[i]=' + Util.NFE(accel[i])
                            + ' force[i]=' + Util.NFE(force[i]));
                    }
                }
            }
        }
        return r;
    }
    ;
}
Util.defineGlobal('lab$engine2D$ComputeForces', ComputeForces);
