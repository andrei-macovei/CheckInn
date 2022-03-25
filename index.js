const express = require('express');
const {Client} = require('pg');

console.log("Server starting...");
var app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use("/public", express.static(__dirname + "/public"));

// home page
app.get(["/", "/index", "/home"], function(req, res){
    res.render("pages/index");
});

// login page
app.get("/login", (req, res) => {
    res.render("pages/login");
});

// register page
app.get("/register", (req, res) => {
    res.render("pages/register");
});

// fallback if no prior app.get is accesed
app.get("/*", (req, res) => {
    res.render("pages" + req.url, (err, render_res) => {
        if(err){
            if(err.message.includes("Failed to lookup")){
                // if view is not found, send error 404
                res.status(404).render("pages/404");
                return;
            }
            else {
                console.log(err);
                res.render("pages/general_error");
            }
        }
        else res.send(render_res);
    });
});

app.listen(PORT);
console.log("Server started on port " + PORT);