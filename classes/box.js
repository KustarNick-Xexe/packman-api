module.exports.Box = class Box {
    constructor(id, w, h, d, fragile = false, orientation = 0) {
        this.id = id;
        this.x = 0; this.y = 0; this.z = 0;
        this.w = w; this.h = h; this.d = d;
        this.fragile = fragile;
        this.orientation = orientation;
    }
    get coordinates() {
      return [this.x, this.y, this.z];
    }
    get dimensions() {
        switch (this.orientation) {
            case 0: return [this.w, this.h, this.d];
            case 1: return [this.h, this.d, this.w];
            case 2: return [this.d, this.w, this.h];
            case 3: return [this.w, this.d, this.h];
            case 4: return [this.h, this.w, this.d];
            case 5: return [this.d, this.h, this.w];
        }
    }
    get volume() {
        return this.w * this.h * this.d;
    }
}