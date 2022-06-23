const express = require('express');
const router = express.Router();

const {getUserFavourites, getAsyncFavourites, postFavourite, deleteFavourite} = require('../controllers/favouritesController');

// TOOADD: add to favourites

router.get('/', getUserFavourites);

// router.get('/async', getAsyncFavourites);

router.post('/add/:id_property', postFavourite);

router.delete('/delete/:id_property', deleteFavourite);

module.exports = router;