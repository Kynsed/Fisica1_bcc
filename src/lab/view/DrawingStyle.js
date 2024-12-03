import { Util } from '../util/Util.js';
export class DrawingStyle {
    constructor(drawMode, color, lineWidth, opt_lineDash) {
        this.drawMode = drawMode;
        this.color = color;
        this.lineWidth = lineWidth;
        this.lineDash = opt_lineDash ?? [];
    }
    ;
    toString() {
        return 'DrawingStyle{drawMode: ' + this.drawMode
            + ', color:"' + this.color + '"'
            + ', lineWidth: ' + this.lineWidth
            + ', lineDash: ['
            + Util.array2string(this.lineDash, Util.NF0)
            + ']}';
    }
    ;
    static dotStyle(color, dotSize) {
        return new DrawingStyle("dots", color, dotSize);
    }
    ;
    static lineStyle(color, lineWidth, opt_lineDash) {
        return new DrawingStyle("lines", color, lineWidth, opt_lineDash);
    }
    ;
}
Util.defineGlobal('lab$view$DrawingStyle', DrawingStyle);
