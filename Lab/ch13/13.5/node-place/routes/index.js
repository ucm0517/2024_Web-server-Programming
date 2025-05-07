const express = require('express');
const util = require('util');
const googleMaps = require('@google/maps');

const History = require('../schemas/history');
const Favorite = require('../schemas/favorite');
require('dotenv').config(); 

const router = express.Router();
const googleMapsClient = googleMaps.createClient({
  key: process.env.PLACES_API_KEY,
});

router.get('/', async (req, res, next) => {
  try {
    const favorites = await Favorite.find({});
    res.render('index', {
      results: favorites,
      apiKey: process.env.GOOGLE_MAPS_API_KEY
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/result', (req, res) => {
  res.render('result', {
    PLACES_API_KEY: process.env.PLACES_API_KEY,
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    query: '검색어',
    results: searchResults 
  });
});

router.get('/autocomplete/:query', (req, res, next) => {
  googleMapsClient.placesQueryAutoComplete({
    input: req.params.query,
    language: 'ko',
  }, (err, response) => {
    if (err) {
      return next(err);
    }
    return res.json(response.json.predictions);
  });
});

router.get('/search/:query', async (req, res, next) => {
  const googlePlaces = util.promisify(googleMapsClient.places);
  const googlePlacesNearby = util.promisify(googleMapsClient.placesNearby);
  const { lat, lng, type } = req.query;
  try {
    const history = new History({ query: req.params.query });
    await history.save();
    let response;
    if (lat && lng) {
      response = await googlePlacesNearby({
        keyword: req.params.query,
        location: `${lat},${lng}`,
        rankby: 'distance',
        language: 'ko',
        type,
      });
    } else {
      response = await googlePlaces({
        query: req.params.query,
        language: 'ko',
        type,
      });
    }
    res.render('result', {
      query: req.params.query,
      results: response.json.results,
      apiKey: process.env.GOOGLE_MAPS_API_KEY
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/location/:id/favorite', async (req, res, next) => {
  try {
    const favorite = await Favorite.create({
      placeId: req.params.id,
      name: req.body.name,
      location: [req.body.lng, req.body.lat],
    });
    res.send(favorite);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
