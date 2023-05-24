const { Bin } = require('./bin');
const { Box } = require('./box');

const boxes1 = [
    new Box(20, 20, 110, false),
    new Box(20, 20, 120, false),
    new Box(150, 50, 70, false),
    new Box(20, 20, 110, false),
    new Box(20, 20, 120, false),
    new Box(150, 50, 70, false),
    new Box(20, 20, 120, false),
    new Box(150, 50, 70, false),
    new Box(20, 20, 110, false),
    new Box(20, 20, 120, false),
    new Box(150, 50, 70, false),
    new Box(20, 20, 110, false),
];

const boxes2 = [
    new Box(20, 20, 120, false),
    new Box(150, 50, 70, false),
    new Box(20, 20, 120, false),
    new Box(150, 50, 70, false),
    new Box(20, 20, 110, false),
    new Box(20, 20, 120, false),
    new Box(150, 50, 70, false),
    new Box(20, 20, 110, false),
    new Box(20, 20, 120, false),
    new Box(150, 50, 70, false),
    new Box(20, 20, 120, false),
    new Box(150, 50, 70, false),
];

// Create a new bin
const bin = new Bin(600, 600, 200);
bin.pack(boxes1)
bin.pack(boxes2)

console.log([bin._boxes.flat()].flat().map(el => 
   [el.box.x, el.box.y, el.box.z, el.box.w, el.box.h, el.box.d]));
