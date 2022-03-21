const express = require('express');
const {Client} = require('pg');

console.log("Server starting...");
var app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use("/*", function(req, res, next){
    res.render("pages/index");
})

app.listen(PORT);
console.log("Server started on port " + PORT);