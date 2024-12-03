import { Util } from "./Util.js";
export class RandomLCG {
    constructor(seed) {
        seed = Math.floor(Math.abs(seed)) % RandomLCG.m;
        this.seed_ = seed;
        RandomLCG.checkSeed(this.seed_);
        Util.assert((RandomLCG.m - 1) * RandomLCG.a + RandomLCG.c < Math.pow(2, 53));
    }
    ;
    toString() {
        return 'RandomLCG{seed: ' + this.seed_ + '}';
    }
    ;
    static checkSeed(seed) {
        const err = 'random seed must be ';
        if (seed < 0) {
            throw err + '0 or greater ' + seed;
        }
        if (seed >= RandomLCG.m) {
            throw err + 'less than ' + RandomLCG.m + ' was ' + seed;
        }
        if (seed != Math.floor(seed)) {
            throw err + 'an integer ' + seed;
        }
    }
    ;
    getModulus() {
        return RandomLCG.m;
    }
    ;
    getSeed() {
        return this.seed_;
    }
    ;
    nextFloat() {
        const x = this.nextInt_();
        if (RandomLCG.DEBUG_RANDOM) {
            console.log(' ' + x);
        }
        return x / (RandomLCG.m - 1);
    }
    ;
    nextInt() {
        const x = this.nextInt_();
        if (RandomLCG.DEBUG_RANDOM) {
            console.log(' ' + x);
        }
        return x;
    }
    ;
    nextInt_() {
        const r = this.seed_ * RandomLCG.a + RandomLCG.c;
        const m = RandomLCG.m;
        this.seed_ = r - Math.floor(r / RandomLCG.m) * RandomLCG.m;
        RandomLCG.checkSeed(this.seed_);
        if (RandomLCG.DEBUG_RANDOM_DEEP) {
            const err = new Error();
        }
        return this.seed_;
    }
    ;
    nextRange(n) {
        const x = this.nextRange_(n);
        if (RandomLCG.DEBUG_RANDOM) {
            console.log(' ' + x);
        }
        return x;
    }
    ;
    nextRange_(n) {
        if (n <= 0)
            throw 'n must be positive';
        const randomUnder1 = this.nextInt_() / RandomLCG.m;
        return Math.floor(randomUnder1 * n);
    }
    ;
    randomInts(n) {
        const set_ = new Array(n);
        const src = new Array(n);
        for (let i = 0; i < n; i++) {
            set_[i] = -1;
            src[i] = i;
        }
        let m = n;
        let setCount = 0;
        do {
            const k = this.nextRange_(m--);
            let srcCount = 0;
            for (let j = 0; j < n; j++) {
                if (src[j] < 0)
                    continue;
                if (srcCount++ == k) {
                    set_[setCount++] = src[j];
                    src[j] = -1;
                    break;
                }
            }
        } while (set_[n - 1] < 0);
        if (RandomLCG.DEBUG_RANDOM) {
            let s = '';
            for (let i = 0; i < set_.length; i++) {
                s += ' ' + set_[i];
            }
            console.log(s);
        }
        return set_;
    }
    ;
    setSeed(seed) {
        RandomLCG.checkSeed(seed);
        this.seed_ = seed;
    }
    ;
}
RandomLCG.DEBUG_RANDOM = false;
RandomLCG.DEBUG_RANDOM_DEEP = false;
RandomLCG.m = 0x100000000;
RandomLCG.a = 1664525;
RandomLCG.c = 1013904223;
Util.defineGlobal('lab$util$RandomLCG', RandomLCG);
