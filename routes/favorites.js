const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');

router.get('/favorites', favoritesController.requireAuth, favoritesController.listFavorites);
router.post('/favorites/toggle', favoritesController.requireAuth, favoritesController.toggleFavorite);

module.exports = router;


