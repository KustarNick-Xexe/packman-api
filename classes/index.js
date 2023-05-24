const { Bin } = require('./bin');
const { Box } = require('./box');

const boxes1 = [
    new Box(5, 5, 10, false),
    new Box(5, 5, 10, false),
    new Box(5, 5, 10, false),
    new Box(5, 5, 10, false),
    new Box(5, 5, 10, false),
];

const boxes2 = [
    new Box(5, 5, 10, false),
    new Box(5, 5, 10, false),
    new Box(5, 5, 10, false),
    new Box(5, 5, 10, false),
    new Box(5, 5, 10, false),
];

// Create a new bin
const bin = new Bin(60, 60, 20);
bin.pack(boxes1)
bin.pack(boxes2)

console.log([bin._boxes.flat()].flat().map(el => 
   [el.box.x, el.box.y, el.box.z, el.box.w, el.box.h, el.box.d]));
