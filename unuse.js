import express from 'express';
import { json as jsonParser } from 'body-parser';
import dotenv from 'dotenv';

 /* const routes = Array.from(new Set(_routes.flat()));
  routes.forEach(idClient => {
    clientCargos.forEach(cargosWithId => {
      if (cargosWithId.id === idClient) {
        boxesSet.push(cargosWithId.cargos);
      }
    })
  }) */

dotenv.config();

const app = express();

app.use(jsonParser());

// Middleware to process routes from the request
const processRoutesMiddleware = (req, res, next) => {
  const { routes } = req.body;
  
  if (!routes) {
    return res.status(400).json({ error: 'No routes provided.' });
  }

  if (!Array.isArray(routes)) {
    return res.status(400).json({ error: 'Routes should be an array.' });
  }

  req.processedRoutes = routes.map(route => route.split('-').slice(1, -1));
  console.log('POST requests with:', req.processedRoutes);

  next(); 
};

// Middleware to add volume to the request
const addVolumeMiddleware = (req, res, next) => {
  req.volume = [
    { id: 1, volume: '0.55'}, 
    { id: 2, volume: '0.65'}, 
    { id: 3, volume: '0.75'}
  ];
  
  next(); 
};

app.get('/api/pack', addVolumeMiddleware, (req, res) => {
  res.send({ success: 1, volume: req.volume });
});

app.post('/api/routes', processRoutesMiddleware, (req, res) => {
  return res.status(200).json({ success: true, message: 'Routes received and processed successfully.' });
});

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
