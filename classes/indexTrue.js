class Box {
    constructor(w, h, d, fragile = false, orientation = 0) {
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

class Bin {
    constructor(binWidth, binHeight, binDepth) {
        this.binWidth = binWidth;
        this.binHeight = binHeight;
        this.binDepth = binDepth;
        this._boxes = [];
        this._bin = new Array(binWidth);
        for (let i = 0; i < binWidth; i++) {
            this._bin[i] = new Array(binHeight);
            for (let j = 0; j < binHeight; j++) {
                this._bin[i][j] = new Array(binDepth).fill(0);
            }
        }
    }

    pack(boxes) {
        let placements = [];
      boxes = boxes.sort((a, b) => b.volume - a.volume);
        for(let box of boxes) {
            let [boxWidth, boxHeight, boxDepth] = box.dimensions;
            outer:
            for(let x = 0; x <= this.binWidth - boxWidth; x++) {
                for(let y = 0; y <= this.binHeight - boxHeight; y++) {
                    for(let z = 0; z <= this.binDepth - boxDepth; z++) {
                        let isFree = true;
                        for(let i = 0; i < boxWidth; i++) {
                            for(let j = 0; j < boxHeight; j++) {
                                for(let k = 0; k < boxDepth; k++) {
                                    if(this._bin[x+i][y+j][z+k] !== 0) {
                                        isFree = false;
                                        break;
                                    }
                                }
                                if(!isFree) break;
                            }
                            if(!isFree) break;
                        }
                        if(isFree) {
                            for(let i = 0; i < boxWidth; i++) {
                                for(let j = 0; j < boxHeight; j++) {
                                    for(let k = 0; k < boxDepth; k++) {
                                        this._bin[x+i][y+j][z+k] = box.fragile ? 2 : 1;
                                    }
                                }
                            }
                            if(box.fragile) {
                                for(let i = 0; i < boxWidth; i++) {
                                    for(let j = 0; j < boxHeight; j++) {
                                        for(let k = z + boxDepth; k < this.binDepth; k++) {
                                            this._bin[x+i][y+j][k] = 2;
                                        }
                                    }
                                }
                            }
                            box.x = x;
                            box.y = y;
                            box.z = z;
                            placements.push({box: box, x: x, y: y, z: z, orientation: box.orientation});
                            break outer;
                        }
                    }
                }
            }
        }
        return placements;
    }

    save(placements) {
        this._boxes = [  ...this._boxes, ...placements ];
       for (let packedBox of this._boxes) {
          const x = packedBox[0];
          const y = packedBox[1];
          const z = packedBox[2];
          const w = packedBox[3];
          const h = packedBox[4];
          const d= packedBox[5];
            for (let i = x; i <= w; i++) {
                for (let j = y; j <= h; j++) {
                    for (let k = z; k <= d; k++) {
                        this._bin[x + i][y + j][z + k] = box.fragile ? 2 : 1;
                    }
                }
            }
        }
    }
}

const boxes1 = [
    new Box(1, 1, 2),
    new Box(1, 2, 1, true),
    new Box(2, 1, 1),
];
const boxes2 = [
    new Box(1, 1, 2, true),
    new Box(1, 2, 1, true),
    new Box(2, 1, 1),
    new Box(1, 1, 2),
];

const boxes3 = [
    new Box(1, 1, 2),
    new Box(1, 2, 1),
    new Box(2, 1, 1),
    new Box(1, 1, 2, true),
];

const bin = new Bin(10, 10, 10);
bin.pack(boxes1);
bin.save(boxes1);
bin.pack(boxes2);
bin.save(boxes2);
bin.pack(boxes3);
bin.save(boxes3);
console.log(bin._boxes.map(box => [box.x, box.y, box.z, box.w, box.h, box.d, box.fragile]))