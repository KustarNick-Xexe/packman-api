const express = require('express');
const bodyParser = require('body-parser');
const { default: axios } = require('axios');
const { Bin } = require('./classes/bin');
const { Box } = require('./classes/box');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

let _routes = [];
let _cargos = [];
let _vvehicles = [];
let _idvv = [];

const getRoutesMiddleware = (req, res, next) => {
  const points = req.body.routes.map(route => route.split('-'));
  const routes = points.map(route => route.slice(1, -1));
  _idvv = req.body.vehicle.map(item => +item);
  req.routes = routes.map(route => route.map(point => +point));
  req.clientsId = [...req.routes.flat()];
  _routes = req.routes;
  next();
};

const getGargosMiddleware = async (req, res, next) => {
  const response = await axios.get('http://localhost:3007/api/cargos');
  req.cargos = response.data;
  _cargos = req.cargos;
  next();
};

let clientCargos = [];
let binWidth = 0;
let binHeight = 0;
let binDepth = 0;
let binWeight = 0;
let binId = 0;
let _vehicles = [];

const getMiddleware = async (req, res, next) => {
  const response = await axios.get('http://localhost:3007/api/vehicles');
  const vehicles = response.data;
  _vehicles = vehicles;
  const vehicle = vehicles[0];
  binId = vehicle.id;
  binWidth = vehicle.length;
  binHeight = vehicle.width;
  binDepth = vehicle.height;
  binWeight = vehicle.weight;

  // return [cargo.id, cargo.width, cargo.length, cargo.height, cargo.weight];
  const clients = Array.from(new Set(_routes.flat()));
  for (const id of clients) {
    const cargos = _cargos.map(cargo => {
      if (cargo.idClient === id) {
        return [cargo.id, cargo.width, cargo.length, cargo.height, cargo.weight, cargo.fragile, cargo.idClient];
      }
    });
    clientCargos.push({ id: id, cargos: cargos.filter(cargo => cargo !== undefined) });
  };

  next();
};

let routeCargos = [];

function isEmptyArray(arr) {
  return Array.isArray(arr) && arr.length === 0;
}

function removeEmptyArrays(arr) {
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    if (Array.isArray(element)) {
      removeEmptyArrays(element);
      if (isEmptyArray(element)) {
        arr.splice(i, 1);
        i--;
      }
    }
  }
  return arr;
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

app.get('/api/pack', getMiddleware, async (req, res) => {
  const save = req.query.save;
  const who = req.query.who;
  console.log(save,who);
  _routes.forEach(route => {
    const routeBoxes = [];
    route.forEach(client => {

      routeBoxes.push(clientCargos.find(item => item.id === client).cargos.map(item => {
        return new Box(item[0], item[1], item[2], item[3], item[4], item[6], item[5]);
      }));
    });
    routeCargos.push(routeBoxes);
  });

  routeCargos = removeEmptyArrays(routeCargos).map(item => item.flat());

  let vehicleCargos = [];
  let totalW = 0;
  //let remaining = [];
  let used = [];

  routeCargos.forEach(listBox => {
    const temp = [];
    listBox = listBox.filter((box) => !used.includes(box.id));
    for (let i = 0; i < listBox.length; i++) {
      if (totalW + listBox[i].m <= binWeight) {
        temp.push(listBox[i]);
        used.push(listBox[i].id);
        totalW += listBox[i].m;
      }
    }
    totalW = 0;
    vehicleCargos.push(temp);
  });

  vehicleCargos = vehicleCargos.filter(subarray => subarray.length > 0);

  routeCargos = [];
  vehicleCargos.forEach(cargos => {
    let temp = [];
    const clients = Array.from(new Set(_routes.flat()));
    for (const id of clients) {
      temp.push(cargos.filter(cargo => cargo.idc === id));
    }
    routeCargos.push(temp.filter(subarray => subarray.length > 0));
  });

  const results = [];
  const binV = binWidth * binHeight * binDepth;
  let boxesV = 0;
  let resboxes = [];
  let totalPacking = [];
  let index = 0;
  for (let i = 0; i < routeCargos.length; i++) {
    let bins = [];
    for (let j = 0; j < 1; j++) {
      bins.push(new Bin(binId, binWidth, binHeight, binDepth));
    }
    const boxes = routeCargos[i];

    let count = 0;
    bins = bins.map(bin => {
      const variants = [];
      boxes.forEach(_boxes => {
        let orientations = [];
        do {
          count++;
          orientations = [];
          _boxes = _boxes.sort((a, b) => b.volume - a.volume);
          for (let j = 0; j < _boxes.length; j++) {
            const orientation = Math.floor(Math.random() * 6);
            orientations.push(orientation);
          }
          if (count > 20) {
            count = 0;
            return res.status(200).json({ success: 0, volume: 0 });
          }
        } while (!isPackable(_boxes, orientations, bin));
        _boxes = setOrientation(_boxes, orientations);
        const packedBoxes = bin.pack(_boxes);
        bin.save(packedBoxes);
        variants.push(orientations);
      })
      return bin;
    });


    const scores = bins.map((bin, index) => {
      return {
        id: index, score: bin._boxes.reduce((sum, box) =>
          sum + (bin.binDepth - (box.z + box.box.d)), 0)
      };
    });

    const bestScore = scores.sort((a, b) => b.score - a.score)[0].id;
    resboxes.push(bins[bestScore]._boxes.map(box =>
      [box.x, box.y, box.z, ...box.box.dimensions, box.box.fragile]));

    bins[bestScore]._boxes.forEach(box => _vvehicles.push(_idvv[index]));
    index++;
    boxesV += bins[bestScore]._boxes.reduce((sum, box) => sum + box.box.volume, 0)
    totalPacking.push(resboxes.map(item => [...item]).flat());
    resboxes = [];
  }
  totalPacking = totalPacking.flat();
  if (save == 1) {
    for (let i = 0; i < totalPacking.length; i++) {
      const data = { plan: JSON.stringify( totalPacking[i]), idVehicle: _vvehicles[i] };
      if(who == 1) {
        await axios.post('http://localhost:3007/api/plans2', data);
      } else {
        await axios.post('http://localhost:3007/api/plans', data);
      }
    }
  }

  const volume = (binV * routeCargos.length - boxesV) / (binV * routeCargos.length);
  _idvv = [];
  _vvehicles = [];
  _cargos = [];
  _routes = [];
  clientCargos = [];
  routeCargos = [];
  vehicleCargos = [];
  used = [];

  return res.status(200).json({ success: 1, volume: volume * 2000 });
});

const postMiddleware = [getRoutesMiddleware, getGargosMiddleware];

app.post('/api/routes', postMiddleware, (req, res) => {
  return res.status(200).json({ success: 1 });
});

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
