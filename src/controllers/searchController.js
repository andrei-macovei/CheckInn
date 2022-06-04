const formidable = require('formidable')
const { Client } = require('pg');

// database connection
const conn = require("../../public/json/connection.json");
var client = new Client(conn);
client.connect();

const getResultsPage = (req, res) =>{
    if(!req.query.city) {}// TOADD: must have city!
    var queryGetPriceRange = `SELECT min(price), max(price), avg(price) FROM properties p INNER JOIN address a ON p.id_property=a.id_property WHERE a.city=$1;` // TOMODIF: WHERE
    client.query(queryGetPriceRange, [req.query.city], (err, result) =>{
        if(err) console.log(err);
        else{
            var queryGetAmenities = `SELECT column_name FROM information_schema.columns WHERE table_name = 'general_amenities' OR 
                                    table_name='bathroom_amenities' OR table_name='kitchen_amenities' ORDER BY column_name;`
            client.query(queryGetAmenities, (err2, result2) =>{
                if(err2) console.log(err2);
                else{
                    var toSend = {
                        minPrice: result.rows[0].min,
                        maxPrice: result.rows[0].max,
                        avgPrice: result.rows[0].avg,
                        amenities: result2.rows
                    }
                    toSend.city = req.query.city;
                    if(req.query.checkin) toSend.checkin = req.query.checkin;
                    if(req.query.checkout) toSend.checkout = req.query.checkout;
                    if(req.query.guests) toSend.guests = req.query.guests;
                    res.render('pages/accomodations', toSend);
                }
            });
        }
    });
}

const getResults = (req, res) =>{
    var i=1;
    var queryGetResults = `SELECT p.id_property, title, description, price, rating, property_type, guests, city, count(id_room), ph.big_picture FROM properties p INNER JOIN address a ON p.id_property = a.id_property LEFT JOIN rooms r ON p.id_property = r.id_property LEFT JOIN photos ph ON p.id_property = ph.id_property WHERE 1=1`;
    var paramsGetResults = [];

    if(req.query.city) {queryGetResults += ` AND city=\$${i}`; paramsGetResults.push(req.query.city); i++}
    if(req.query.checkin) {queryGetResults += ` AND checkin=\$${i}`; paramsGetResults.push(req.query.checkin); i++}
    if(req.query.checkout) {queryGetResults += ` AND checkout=\$${i}`; paramsGetResults.push(req.query.checkout); i++}
    if(req.query.guests) {queryGetResults += ` AND guests=\$${i}`; paramsGetResults.push(parseInt(req.query.guests)); i++}
    if(req.query.price) {queryGetResults += ` AND price<=\$${i}`; paramsGetResults.push(parseInt(req.query.price)); i++}
    if(Array.isArray(req.query.rules)) for(rule of req.query.rules){  // if more than one checkbox is checked
        switch(rule){
            case "for_kids":
                queryGetResults += ` AND for_kids IS TRUE`;
                break;
            case "pets_allowed":
                queryGetResults += ` AND pets_allowed IS TRUE`;
                break;
            case "smoking_allowed":
                queryGetResults += ` AND smoking_allowed IS TRUE`;
                break;
            case "events_allowed":
                queryGetResults += ` AND events_allowed IS TRUE`;
                break;
        }
    } else if(req.query.rules) {
        switch(req.query.rules){
            case "for_kids":
                queryGetResults += ` AND for_kids IS TRUE`;
                break;
            case "pets_allowed":
                queryGetResults += ` AND pets_allowed IS TRUE`;
                break;
            case "smoking_allowed":
                queryGetResults += ` AND smoking_allowed IS TRUE`;
                break;
            case "events_allowed":
                queryGetResults += ` AND events_allowed IS TRUE`;
                break;
        }
    }
    if(req.query.rating) {queryGetResults += ` AND rating>=\$${i}`; paramsGetResults.push(parseFloat(req.query.rating)); i++;}
    if(Array.isArray(req.query.amenities)) for(amen of req.query.amenities){   // TOADD: verify for sql injection
        queryGetResults += ` AND ${amen} IS TRUE`;
    } else if(req.query.amenities) queryGetResults += ` AND ${req.query.amenities} IS TRUE`;
    queryGetResults += ` GROUP BY p.id_property, a.city, ph.big_picture;`
    // console.log(queryGetResults);
    client.query(queryGetResults, paramsGetResults, (err, result) =>{
        if(err) console.log("Error" + err);
        else{
            console.log(result.rows);
            res.status(200).json(result.rows);
        }
    });
}

const getResultDetails = (req, res) =>{
    var queryGetDetails = `SELECT p.*, a.*, firstname, lastname, profile_pic, count(id_room) as rooms_number FROM properties p
                            INNER JOIN address a USING(id_property) INNER JOIN users u ON p.id_host=u.id_user
                            INNER JOIN rooms USING(id_property)
                            WHERE id_property=$1
                            GROUP BY p.id_property, a.id_address, u.firstname, u.lastname, u.profile_pic`;
    var paramsGetDetails = [req.params.id_property];
    client.query(queryGetDetails, paramsGetDetails, (err, result) =>{
        if(err) {console.log(err); return;}
        var queryGetRooms = `SELECT * FROM rooms WHERE id_property=$1`;
        client.query(queryGetRooms, [req.params.id_property], (err2, result2) =>{
            if(err2) {console.log(err2); return}
            var queryGetGeneralAmenities = `SELECT * FROM general_amenities WHERE id_property=$1`;
            client.query(queryGetGeneralAmenities, [req.params.id_property], (err3, result3) =>{
                if(err3) {console.log(err3); return;}
                var queryGetKitchenAmenities = `SELECT * FROM kitchen_amenities WHERE id_property=$1`;
                client.query(queryGetKitchenAmenities, [req.params.id_property], (err4,result4) =>{
                    if(err4) {console.log(err4); return;}
                    var queryGetBathAmenities = `SELECT * FROM bathroom_amenities WHERE id_property=$1`;
                    client.query(queryGetBathAmenities, [req.params.id_property], (err5, result5) =>{
                        if(err5) {console.log(err5); return;}
                        var queryGetReviews = `SELECT r.*, u.firstname, u.lastname, u.profile_pic FROM reviews r INNER JOIN users u USING(id_user) WHERE id_property=$1`;
                        client.query(queryGetReviews, [req.params.id_property], (err6, result6) =>{
                            if(err6) {console.log(err6); return;}
                            var queryGetNumberOfReviews = `SELECT count(id_review) FROM reviews WHERE id_property=$1 GROUP BY id_property`;
                            client.query(queryGetNumberOfReviews, [req.params.id_property], (err7, result7) =>{
                                if(err7) {console.log(err7); return;}
                                var numberReviews;
                                if(result7.rowCount == 0) numberReviews = 0;
                                else numberReviews = result7.rows[0].count;
                                var queryGetPhotos = `SELECT * FROM photos WHERE id_property=$1`;
                                client.query(queryGetPhotos, [req.params.id_property], (err8, result8) =>{
                                    if(err8) {console.log(err8); return;}
                                    res.render('pages/result', {
                                        prop: result.rows[0], 
                                        rooms: result2.rows,
                                        g_amenities: result3.rows[0],
                                        k_amenities: result4.rows[0],
                                        b_amenities: result5.rows[0],
                                        reviews: result6.rows,
                                        numberReviews: numberReviews,
                                        error: req.query.error,
                                        photos: result8.rows[0]
                                    });
                                });
                            })
                        })
                    })
                })
            })
        }) 
    });
}

module.exports = { 
    getResultsPage,
    getResults,
    getResultDetails
 };