const formidable = require('formidable')
const { Client } = require('pg');

// database connection
const conn = require("../../public/json/connection.json");
var client = new Client(conn);
client.connect();

const getAllNotifications = (req, res) =>{
    res.render('pages/notifications');
}

module.exports = { getAllNotifications };