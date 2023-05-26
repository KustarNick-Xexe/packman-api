const { Bin } = require('./bin');
const { Box } = require('./box');
const { geneticAlgorithm } = require('../methods');

const boxes1 = [
    new Box(1, 1, 2),
    new Box(1, 2, 1),
    new Box(2, 1, 1),
];
const boxes2 = [
    new Box(1, 1, 2),
    new Box(1, 2, 1),
    new Box(2, 1, 1),
    new Box(1, 1, 2),
];
const bin = new Bin(10, 10, 10);
bin.pack(boxes1);
bin.save(boxes1);
bin.pack(boxes2);
bin.save(boxes2);
console.log(bin._boxes.map(box => [box.x, box.y, box.z, box.w, box.h, box.d]))