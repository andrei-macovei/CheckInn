const express = require('express');
const router = express.Router();
const formidable = require('formidable')
const { Client } = require('pg')
const bcrypt = require('bcrypt');
const fs = require('fs');

// database connection
const conn = require("../public/json/connection.json");
var client = new Client(conn);
client.connect();

router.post('/addReview/:id_property', (req, res) =>{

});


module.exports = router;