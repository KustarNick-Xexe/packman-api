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
  const response = await axios.get('http://localhost:3000/api/cargos');
  req.cargos = await response.data;
  _cargos = req.cargos;
  next();
};

const clientCargos = [];
const boxesSet = [];
let binWidth = 0;
let binHeight = 0;
let binDepth = 0;

const getMiddleware = async (req, res, next) => {
  /* const clients = Array.from(new Set(_routes.flat()));
  for (const id of clients) {
    const cargos = _cargos.filter(cargo => cargo.idClient === id);
    clientCargos.push({ id: id, cargos: cargos });
  };
  const response = await axios.get('http://localhost:3000/api/vehicles');
  const vehicles = response.data;
  const vehicle = vehicles[0];
  binWidth = vehicle.width;
  binHeight = vehicle.height;
  binDepth = vehicle.depth; */
  next();
};

app.get('/api/pack', getMiddleware, (req, res) => {
  /* _routes.forEach(route => {
    const boxes = [];
    route.forEach(idClient => {
      clientCargos.forEach(cargosWithId => {
        if (cargosWithId.id === idClient) {
          boxes.push(cargosWithId.cargos);
        }
      })
    });
    boxesSet.push(boxes);
  })

  console.log(boxesSet);

  for(let i = 0; i < _routes.length; i++) {
    const bin =  new Bin(binWidth, binHeight, binDepth);

    let success = false;
    boxesSet.forEach(set => {
      set.forEach(boxes => {
        const boxesCount = boxes.length;
        const resultCount = bin.pack(boxes).length;

        if(boxesCount === resultCount) { success = true; }
        else { success = false; }
      });
    });
  } */

  const answer = Math.random() > 0.35 ? 1 : 0;
  return res.status(200).json({ success: answer, volume: 50 });
});

const postMiddleware = [getRoutesMiddleware, getGargosMiddleware];

app.post('/api/routes', postMiddleware, (req, res) => {
  const routes = req.body.routes;
  if (!routes) {
    return res.status(400).json({ error: 'No routes provided.' });
  }
  if (!Array.isArray(routes)) {
    return res.status(400).json({ error: 'Routes should be an array.' });
  }
  return res.status(200).json({ success: 1 });
});

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
