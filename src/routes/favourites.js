const express = require('express');
const router = express.Router();

const {getUserFavourites} = require('../controllers/favouritesController');

// TOOADD: add to favourites

router.get('/', getUserFavourites);

module.exports = router;