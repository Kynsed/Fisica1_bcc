function simp(f, a, b) {
    const h = (b - a) / 2;
    return (h / 3) * (f(a) + 4 * f(a + h) + f(b));
}
;
function aq(f, a, b, tol, S1) {
    const c = (a + b) / 2;
    const S_left = simp(f, a, c);
    const S_right = simp(f, c, b);
    if (Math.abs(S1 - S_left - S_right) < tol) {
        return S_left + S_right;
    }
    else {
        return aq(f, a, c, tol / 2, S_left) + aq(f, c, b, tol / 2, S_right);
    }
}
;
export function adaptQuad(f, a, b, tol) {
    if (a > b) {
        throw 'adaptQuad a > b' + a + ' ' + b;
    }
    else if (a == b) {
        return 0;
    }
    const S1 = simp(f, a, b);
    return aq(f, a, b, 10 * tol, S1);
}
;
