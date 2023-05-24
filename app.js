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

const readDBMiddleware = async (req, res, next) => {
  const response = await axios.get('http://localhost:3000/api/clients');
  req.clients = await response.data;
  next();
};

const getGargosMiddleware = async (req, res, next) => {
    const clients = req.clients;
    const response = await axios.get('http://localhost:3000/api/cargos');
    req.cargos = await response.data;
    _cargos = req.cargos;
    next();
};

const setPartMiddleware = (req, res, next) => {
    for (let id of req.clientsId) {
      _clients.push(_cargos.filter(cargo => cargo.pointId === id))
    }

    console.log('1', _routes);
    console.log('2', _clients);
    console.log('3', _cargos);
    next();
};

const getMiddleware = (req, res, next) => {
  req.volume = [{ id: 1, volume: '0.55'}, { id: 2, volume: '0.65'}, { id: 3, volume: '0.75'}]; //передать из мидла в обработчик
  next(); 
};

app.get('/api/pack', getMiddleware, (req, res) => {
  const volume = req.volume;
  res.send({ success: 1, volume: volume });
});

const postMiddleware = [getRoutesMiddleware, readDBMiddleware, getGargosMiddleware, setPartMiddleware];

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
