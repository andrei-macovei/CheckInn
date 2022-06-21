const express = require('express');
const session = require('express-session');

const { Client } = require('pg');

// database connection
const conn = require("./public/json/connection.json");
var client = new Client(conn);
client.connect();

var app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use("/public", express.static(__dirname + "/public"));

// session initialization
app.use(session({
    secret: 'discret',  // CHANGE maybe
    resave: true,
    saveUninitialized: false
}));

app.use(express.json());

app.use(function(req, res, next){
    res.locals.user = req.session.user; // send the user data to all pages
    
    client.query('SELECT background FROM global_settings', (err, result)=>{
        if(err) {console.log(err); return;}
        res.locals.background = result.rows[0].background;
        next();
    });
})

// home page
app.get(["/", "/index", "/home"], function(req, res){
    
    // get image carousel info
    client.query('SELECT * FROM destinations', (err, result)=>{
        if(err) {console.log(err); return;}
        
        res.render("pages/index", {destinations: result.rows});
    });
});

// inclusion of controllers
app.use("/users", require('./src/routes/users'));
app.use("/hosting", require('./src/routes/hosting'));
app.use("/search", require('./src/routes/search'));
app.use("/booking", require('./src/routes/booking'));
app.use("/reviews", require('./src/routes/reviews'));
app.use("/favourites", require('./src/routes/favourites'));
app.use("/notifications", require('./src/routes/notifications'));
app.use("/admin", require('./src/routes/admin'));

app.get('/favicon.ico' , function(req , res){/*code*/}); // silence weird errors
app.get('/*.js' , function(req , res){/*code*/}); // silence weird errors


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
                res.render("pages/error");
            }
        }
        else res.send(render_res);
    });
});

app.listen(PORT);
console.log("Server started on port " + PORT);