module.exports.Bin = class Bin {
    constructor(id, binWidth, binHeight, binDepth) {
        this.id = id;
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
        let bin = new Array(this.binWidth);
        for (let i = 0; i < this.binWidth; i++) {
            bin[i] = new Array(this.binHeight);
            for (let j = 0; j < this.binHeight; j++) {
                bin[i][j] = new Array(this.binDepth).fill(0);
            }
        }
      boxes = boxes.sort((a, b) => b.volume - a.volume);
        for(let box of boxes) {
            let [boxWidth, boxHeight, boxDepth] = box.dimensions;
            let placed = false;
            outer:
            for(let x = 0; x <= this.binWidth - boxWidth; x++) {
                for(let y = 0; y <= this.binHeight - boxHeight; y++) {
                    for(let z = 0; z <= this.binDepth - boxDepth; z++) {
                        let isFree = true;
                        for(let i = 0; i < boxWidth; i++) {
                            for(let j = 0; j < boxHeight; j++) {
                                for(let k = 0; k < boxDepth; k++) {
                                    if(bin[x+i][y+j][z+k] !== 0) {
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
                                        bin[x+i][y+j][z+k] = box.fragile ? 2 : 1;
                                    }
                                }
                            }
                            if(box.fragile) {
                                for(let i = 0; i < boxWidth; i++) {
                                    for(let j = 0; j < boxHeight; j++) {
                                        for(let k = z + boxDepth; k < this.binDepth; k++) {
                                            bin[x+i][y+j][k] = 2;
                                        }
                                    }
                                }
                            }
                            box.x = x;
                            box.y = y;
                            box.z = z;
                            placements.push({box: box, x: x, y: y, z: z, orientation: box.orientation});
                            placed = true;
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
    }
}
