const express = require('express');
const bodyParser = require('body-parser');
const { default: axios } = require('axios');
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

const getMiddleware = (req, res, next) => {
  const clients = Array.from(new Set(_routes.flat()));
  for (const id of clients) {
    const cargos = _cargos.filter(cargo => cargo.idClient === id);
    clientCargos.push({ id: id, cargos: cargos});
  };
  next();
};

app.get('/api/pack', getMiddleware, (req, res) => {

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
  return res.status(200).json({ success: true, message: 'Routes received and processed successfully.' });
});

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
