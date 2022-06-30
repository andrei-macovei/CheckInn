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

const postFavourite = (req, res) =>{
    // :id_property
    if(req.session && req.session.user){
        console.log("postfav")
        var queryAddFavourite = `UPDATE users SET favourites = favourites || ${req.params.id_property} WHERE id_user=$1`;
        client.query(queryAddFavourite, [req.session.user.id_user], (err, result) =>{
            if(err) { console.log(err); return;}
            // req.session.user.favourites.append(parseInt(req.params.id_property));
            // console.log(typeof req.session.user.favourites);
            res.status(200).json(result.rows);
        });
    } else res.status(403);
}

const deleteFavourite = (req, res) =>{
    // :id_property
    console.log('deleteFav')
    var queryRemoveFavourite = `UPDATE users SET favourites = array_remove(favourites, $1) WHERE id_user=$2`;
    client.query(queryRemoveFavourite, [req.params.id_property, req.session.user.id_user], (err, result) =>{
        if(err) { console.log(err); return;}
        // req.session.user.favourites.append(req.params.id_property);
        if(req.session.user.favourites){
            const index = req.session.user.favourites.indexOf(req.params.id_property);
            if (index > -1) {
                req.session.user.favourites.splice(index, 1); // 2nd parameter means remove one item only
            }
        }
        res.status(200).json(result.rows);
    });
}

// const getAsyncFavourites = (req, res) =>{
//     if(req.session && req.session.user){
//         var queryGetFavourites = `SELECT unnest(favourites) FROM users WHERE id_user=$1`;
//         client.query(queryGetFavourites, [req.session.user.id_user], (err, result) =>{
//             if(err) {console.log(err); return;}
//             res.status(200).json(result.rows);
//         })
//     }
// }

module.exports = { getUserFavourites, postFavourite, deleteFavourite };