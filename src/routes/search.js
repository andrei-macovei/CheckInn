const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const { Client } = require('pg');

const {getResultsPage, getResults, getResultDetails} = require('../controllers/searchController');

// database connection
const conn = require("../../public/json/connection.json");
var client = new Client(conn);
client.connect();

router.get('/', getResultsPage);

router.get('/results', getResults);

router.get('/result/:id_property', getResultDetails);

module.exports = router;