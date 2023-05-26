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

const getMiddleware = async (req, res, next) => {
  const clients = Array.from(new Set(_routes.flat()));
  console.log(clients);
  for (const id of clients) {
    const cargos = _cargos.map(cargo => { 
      if(cargo.idClient === id) {
        return [ cargo.id, cargo.width, cargo.length, cargo.height ];
      }
    });
    clientCargos.push({ id: id, cargos: cargos.filter(cargo => cargo !== undefined) });
  };

  console.log(clientCargos);

  const response = await axios.get('http://localhost:3007/api/vehicles');
  const vehicles = response.data;
  const vehicle = vehicles[0];
  binWidth = vehicle.width;
  binHeight = vehicle.length;
  binDepth = vehicle.height;
  next();
};

app.get('/api/pack', getMiddleware, (req, res) => {
  //console.log(binWidth, binHeight, binDepth);
  const answer = Math.random() > 0.35 ? 1 : 0;
  _cargos = [];
  _routes = [];
  clientCargos = [];
  return res.status(200).json({ success: answer, volume: 50 });
});

const postMiddleware = [getRoutesMiddleware, getGargosMiddleware];

app.post('/api/routes', postMiddleware, (req, res) => {
  //console.log(_cargos);
  //console.log(_routes);
  return res.status(200).json({ success: 1 });
});

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
