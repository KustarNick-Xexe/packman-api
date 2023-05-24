const { Bin } = require('./bin');
const { Box } = require('./box');
const { geneticAlgorithm } = require('../methods');

const boxes1 = [
    new Box(1, 1, 2),
    new Box(1, 2, 1, true),
    new Box(2, 1, 1),
];

const boxes2 = [
    new Box(1, 1, 2),
    new Box(1, 2, 1, true),
    new Box(2, 1, 1),
    new Box(1, 1, 2),
];

const boxes3 = [
    new Box(1, 2, 1, true),
    new Box(2, 1, 1),
    new Box(2, 1, 1),
    new Box(1, 1, 2),
];

const boxes4 = [
    new Box(1, 2, 1, true),
    new Box(2, 1, 1),
    new Box(2, 1, 1),
    new Box(1, 1, 2),
];

// Create a new bin
const bin = new Bin(10, 10, 10);
/* bin.pack(boxes1)
bin.pack(boxes2) */

/* console.log([bin._boxes.flat()].flat().map(el => 
   [el.box.x, el.box.y, el.box.z, el.box.w, el.box.h, el.box.d])); */

geneticAlgorithm(boxes2, bin); 
geneticAlgorithm(boxes3, bin); 
//console.log(result.map(box => [...box.coordinates, ...box.dimensions]));
console.log([bin._boxes.flat()].flat().map(el => 
    [el.x, el.y, el.z, el.box.w, el.box.h, el.box.d]));