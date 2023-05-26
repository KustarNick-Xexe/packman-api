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
        this.bin = new Array(binWidth);
        for (let i = 0; i < binWidth; i++) {
            this.bin[i] = new Array(binHeight);
            for (let j = 0; j < binHeight; j++) {
                this.bin[i][j] = new Array(binDepth).fill(0);
            }
        }
    }

    pack(boxes) {
        this._bin = JSON.parse(JSON.stringify(this.bin));
        let placements = [];
        boxes = boxes.sort((a, b) => b.volume - a.volume);
        for (let box of boxes) {
            let [boxWidth, boxHeight, boxDepth] = box.dimensions;
            outer:
            for (let x = 0; x <= this.binWidth - boxWidth; x++) {
                for (let y = 0; y <= this.binHeight - boxHeight; y++) {
                    for (let z = 0; z <= this.binDepth - boxDepth; z++) {
                        let isFree = true;
                        for (let i = 0; i < boxWidth; i++) {
                            for (let j = 0; j < boxHeight; j++) {
                                for (let k = 0; k < boxDepth; k++) {
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
                                for (let j = 0; j < boxHeight; j++) {
                                    for (let k = 0; k < boxDepth; k++) {
                                        this._bin[x + i][y + j][z + k] = box.fragile ? 2 : 1;
                                    }
                                }
                            }
                            if (box.fragile) {
                                for (let i = 0; i < boxWidth; i++) {
                                    for (let j = 0; j < boxHeight; j++) {
                                        for (let k = z + boxDepth; k < this.binDepth; k++) {
                                            this._bin[x + i][y + j][k] = 2;
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

function isPackable(boxes, orientations, bin) {
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].orientation = orientations[i];
    }
    const packingResult = bin.pack(boxes);
    return packingResult.length === boxes.length;
}

function setOrientation(boxes, orientations) {
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].orientation = orientations[i];
    }

    return boxes;
}

const boxes1 = [
    new Box(1, 1, 2),
    new Box(1, 2, 1),
    new Box(1, 1, 2),
    new Box(1, 2, 1),
    new Box(1, 1, 2, true),
    new Box(1, 2, 1),
];
const boxes2 = [
    new Box(1, 1, 2),
    new Box(1, 2, 1, true),
    new Box(1, 1, 2),
    new Box(1, 2, 1, true),
    new Box(1, 1, 2),
    new Box(1, 2, 1),
];

let bins = [];
for (let i = 0; i < 2; i++) {
    bins.push(new Bin(10, 10, 10));
}

const boxes = [boxes1, boxes2];

bins = bins.map(bin => {
    const variants = [];
    boxes.forEach(_boxes => {
        let orientations = [];
        for (let i = 0; i < 2; i++) {
            do {
                orientations = [];
                for (let j = 0; j < _boxes.length; j++) {
                    const orientation = Math.floor(Math.random() * 6);
                    orientations.push(orientation);
                }
            } while (!isPackable(_boxes, orientations, bin));
        }
        _boxes = setOrientation(_boxes, orientations);
        const packedBoxes = bin.pack(_boxes);
        bin.save(packedBoxes);
        variants.push(orientations);
    })

    return bin;
});

bins.forEach(bin => {
    console.log(bin._boxes.map(packedBox => {
        const { box, x, y, z, orientation } = packedBox;
        // Устанавливаем ориентацию перед получением размеров коробки
        box.orientation = orientation;
        return [x, y, z, ...box.dimensions, box.fragile];
    }));
});

/* console.log(bins.map(bin => {
    bin._boxes.map(box => [box.x, box.y, box.z, box.w, box.h, box.d, box.fragile])
})) */