const express = require('express');
const router = express.Router();

const {getResultsPage, getResults, getResultDetails} = require('../controllers/searchController');

router.get('/', getResultsPage);

router.get('/results', getResults);

router.get('/result/:id_property', getResultDetails);

module.exports = router;