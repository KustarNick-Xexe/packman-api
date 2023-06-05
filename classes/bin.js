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
        this.bin = new Array(binWidth);
        for (let i = 0; i < binWidth; i++) {
            this.bin[i] = new Array(binHeight);
            for (let j = 0; j < binHeight; j++) {
                this.bin[i][j] = new Array(binDepth).fill(0);
            }
        }
    }

    pack(boxes) {
        boxes = [...boxes].sort((a, b) => a.fragile - b.fragile);
        this._bin = JSON.parse(JSON.stringify(this.bin));
        let placements = [];
        for (let box of boxes) {
            let [boxWidth, boxHeight, boxDepth] = box.dimensions;
            outer:
            for (let x = 0; x <= this.binWidth - boxWidth; x++) {
                for (let z = 0; z <= this.binDepth - boxDepth; z++) {
                    for (let y = 0; y <= this.binHeight - boxHeight; y++) {
                        let isFree = true;
                        for (let i = 0; i < boxWidth; i++) {
                            for (let k = 0; k < boxDepth; k++) {
                                for (let j = 0; j < boxHeight; j++) {
                                    if (this._bin[x + i][y + j][z + k] !== 0) {
                                        isFree = false;
                                        break;
                                    }
                                }
                                if (!isFree) break;
                            }
                            if (!isFree) break;
                        }
                        if (isFree) {
                            for (let i = 0; i < boxWidth; i++) {
                                for (let k = 0; k < boxDepth; k++) {
                                    for (let j = 0; j < boxHeight; j++) {
                                        this._bin[x + i][y + j][z + k] = 1;
                                    }
                                }
                            }
                            if (box.fragile) {
                                for (let i = 0; i < boxWidth; i++) {
                                    for (let k = z + boxDepth; k < this.binDepth; k++) {
                                        for (let j = 0; j < boxHeight; j++) {
                                            this._bin[x + i][y + j][k] = 1;
                                        }
                                    }
                                }
                            }
                            box.x = x;
                            box.y = y;
                            box.z = z;
                            placements.push({ box: box, x: x, y: y, z: z, orientation: box.orientation });
                            break outer;
                        }
                    }
                }
            }
        }
        return placements;
    }

    save(packedBoxes) {
        for (let packedBox of packedBoxes) {
            const { box, x, y, z, orientation } = packedBox;
            const [boxWidth, boxHeight, boxDepth] = box.dimensions;
            for (let i = 0; i < boxWidth; i++) {
                for (let j = 0; j < boxHeight; j++) {
                    for (let k = 0; k < boxDepth; k++) {
                        this.bin[x + i][y + j][z + k] = box.fragile ? 2 : 1;
                    }
                }
            }

            if (box.fragile) {
                for (let i = 0; i < boxWidth; i++) {
                    for (let j = 0; j < boxHeight; j++) {
                        for (let k = z + boxDepth; k < this.binDepth; k++) {
                            this.bin[x + i][y + j][k] = 2;
                        }
                    }
                }
            }

            this._boxes.push({ box, x, y, z, orientation });
        }
    }
}