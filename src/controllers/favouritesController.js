const formidable = require('formidable')
const { Client } = require('pg');

// database connection
const conn = require("../../public/json/connection.json");
var client = new Client(conn);
client.connect();

const getUserFavourites = (req, res) =>{
    if(req.session && req.session.user){
        var queryGetFavourites = `select pr.*, p.big_picture from properties pr JOIN photos p USING(id_property) WHERE id_property in (SELECT unnest(favourites) FROM users WHERE id_user=$1)`;
        client.query(queryGetFavourites, [req.session.user.id_user], (err, result) =>{
            if(err) {console.log(err); return;}
            res.render('pages/favourites', {
                properties: result.rows
            })
        });
    }
};

module.exports = { getUserFavourites };