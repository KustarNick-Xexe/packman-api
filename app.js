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

const getRoutesMiddleware = (req, res, next) => {
  const points = req.body.routes.map(route => route.split('-'));
  const routes = points.map(route => route.slice(1, -1));
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

const getMiddleware = async (req, res, next) => {
  const response = await axios.get('http://localhost:3007/api/vehicles');
  const vehicles = response.data;
  const vehicle = vehicles[0];
  binId = vehicle.id;
  binWidth = vehicle.width;
  binHeight = vehicle.length;
  binDepth = vehicle.height;
  binWeight = vehicle.weight;

  const clients = Array.from(new Set(_routes.flat()));
  for (const id of clients) {
    const cargos = _cargos.map(cargo => {
      if (cargo.idClient === id) {
        return [cargo.id, cargo.width, cargo.length, cargo.height];
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

app.get('/api/pack', getMiddleware, (req, res) => {
  _routes.forEach(route => {
    const routeBoxes = [];
    route.forEach(client => {
      routeBoxes.push(clientCargos.find(item => item.id === client).cargos.map(item => {
        return new Box(item[0], item[1], item[2], item[3]);
      }))
    });
    routeCargos.push(routeBoxes);
  });

  routeCargos = removeEmptyArrays(routeCargos);
  console.log(routeCargos);

  for (let i = 0; i < routeCargos.length; i++) {
    let bins = [];
    for (let j = 0; j < 1; j++) {
      bins.push(new Bin(binId, binWidth, binHeight, binDepth));
    }
    const boxes = routeCargos[i];

    bins = bins.map(bin => {
      const variants = [];
      boxes.forEach(_boxes => {
        let orientations = [];
        do {
          orientations = [];
          for (let j = 0; j < _boxes.length; j++) {
            const orientation = Math.floor(Math.random() * 6);
            orientations.push(orientation);
          }
        } while (!isPackable(_boxes, orientations, bin));
        _boxes = setOrientation(_boxes, orientations);
        const packedBoxes = bin.pack(_boxes);
        bin.save(packedBoxes);
        variants.push(orientations);
      })
      return bin;
    });

    /* bins.forEach(bin => {
      console.log(bin._boxes.map(packedBox => {
        const { box, x, y, z, orientation } = packedBox;
        box.orientation = orientation;
        return [ box.id, x, y, z, ...box.dimensions, box.fragile];
      }));
    }); */
  }

  const answer = Math.random() > 0.35 ? 1 : 0;
  _cargos = [];
  _routes = [];
  clientCargos = [];
  routeCargos = [];
  return res.status(200).json({ success: answer, volume: 50 });
});

const postMiddleware = [getRoutesMiddleware, getGargosMiddleware];

app.post('/api/routes', postMiddleware, (req, res) => {
  return res.status(200).json({ success: 1 });
});

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
