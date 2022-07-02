const formidable = require('formidable')
const { Client } = require('pg');

// database connection
const conn = require("../../public/json/connection.json");
var client = new Client(conn);
client.connect();

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

const getResultsPage = (req, res) =>{
    var minPrice, maxPrice, avgPrice;
    var queryGetPriceRange = `SELECT min(price), max(price), avg(price) FROM properties p INNER JOIN address a ON p.id_property=a.id_property WHERE a.city=$1;` // TOMODIF: WHERE
    client.query(queryGetPriceRange, [capitalize(req.query.city)], (err, result) =>{
        if(err) console.log(err);
        else{
            var queryGetAmenities = `SELECT column_name FROM information_schema.columns WHERE table_name = 'general_amenities' OR 
                                    table_name='bathroom_amenities' OR table_name='kitchen_amenities' ORDER BY column_name;`
            client.query(queryGetAmenities, (err2, result2) =>{
                if(err2) console.log(err2);
                else{
                    if(req.session && req.session.user){
                        var queryGetFavourites = `SELECT favourites FROM users WHERE id_user=$1`;
                        client.query(queryGetFavourites, [req.session.user.id_user], (err3, result3) =>{
                            if(err3) {console.log(err3); return;}
                            
                            if(req.query.city != ''){
                                minPrice = result.rows[0].min;
                                maxPrice = result.rows[0].max;
                                avgPrice = result.rows[0].avg;
                            } else{
                                // arbitrary values
                                minPrice = 0;
                                maxPrice = 1000;
                                avgPrice = 500;
                            }
                            var toSend = {
                                minPrice: minPrice,
                                maxPrice: maxPrice,
                                avgPrice: avgPrice,
                                amenities: result2.rows,
                                favourites: result3.rows[0]
                            }
                            if(req.query.city) toSend.city = capitalize(req.query.city);
                            if(req.query.checkin){
                                // toSend.checkin = req.query.checkin;
                                let dateArr = req.query.checkin.split('-');
                                let year = parseInt(dateArr[0]);
                                let month = parseInt(dateArr[1]);
                                let day = parseInt(dateArr[2]);
                                let dbDate = new Date(year, month-1, day);
                                toSend.checkinDate = dbDate;
                                toSend.checkin = req.query.checkin;
                            }
                            if(req.query.checkout){
                                // toSend.checkout = req.query.checkout;
                                let dateArr = req.query.checkout.split('-');
                                let year = parseInt(dateArr[0]);
                                let month = parseInt(dateArr[1]);
                                let day = parseInt(dateArr[2]);
                                let dbDate = new Date(year, month-1, day);
                                toSend.checkoutDate = dbDate;
                                toSend.checkout = req.query.checkout;
                            }
                            if(req.query.guests) toSend.guests = req.query.guests;
                            if(req.query.filter) toSend.filter = req.query.filter;
                            res.render('pages/accomodations', toSend);
                        })
                    } else{
                        if(req.query.city != ''){
                            minPrice = result.rows[0].min;
                            maxPrice = result.rows[0].max;
                            avgPrice = result.rows[0].avg;
                        } else{
                            // arbitrary values
                            minPrice = 0;
                            maxPrice = 1000;
                            avgPrice = 500;
                        }
                        var toSend = {
                            minPrice: minPrice,
                            maxPrice: maxPrice,
                            avgPrice: avgPrice,
                            amenities: result2.rows
                        }
                        if(req.query.city) toSend.city = capitalize(req.query.city);
                        if(req.query.checkin) toSend.checkin = req.query.checkin;
                        if(req.query.checkout) toSend.checkout = req.query.checkout;
                        if(req.query.guests) toSend.guests = req.query.guests;
                        if(req.query.filter) toSend.filter = req.query.filter;
                        res.render('pages/accomodations', toSend);
                    }
                }
            });
        }
    });
}

const getResults = (req, res) =>{
    var i=1;
    var queryGetResults = `SELECT p.id_property, title, description, price, rating, property_type, guests, city, week_discount, less_guests_discount, 
        count(id_room), ph.big_picture FROM properties p 
        INNER JOIN address a ON p.id_property = a.id_property 
        INNER JOIN rooms r ON p.id_property = r.id_property 
        INNER JOIN photos ph ON p.id_property = ph.id_property
        INNER JOIN general_amenities ga ON p.id_property = ga.id_property 
        INNER JOIN bathroom_amenities ba ON p.id_property = ba.id_property 
        INNER JOIN kitchen_amenities ka ON p.id_property = ka.id_property
        ${req.query.order == 'reviews' ?  ' LEFT JOIN reviews re ON p.id_property = re.id_property ' : ''}
        WHERE 1=1`;
    var paramsGetResults = [];

    if(req.query.city) {queryGetResults += ` AND city=\$${i}`; paramsGetResults.push(req.query.city); i++}
    if(req.query.checkin) {queryGetResults += ` AND checkin=\$${i}`; paramsGetResults.push(req.query.checkin); i++}
    if(req.query.checkout) {queryGetResults += ` AND checkout=\$${i}`; paramsGetResults.push(req.query.checkout); i++}
    if(req.query.guests) {queryGetResults += ` AND guests>=\$${i}`; paramsGetResults.push(parseInt(req.query.guests)); i++}
    if(req.query.price) {queryGetResults += ` AND price<=\$${i}`; paramsGetResults.push(parseInt(req.query.price)); i++}

    // RULES
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
    } else if(req.query.rules) {    // if only one checkbox is checked
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

    // RATING
    if(req.query.rating) {
        if(req.query.rating != 0){
        queryGetResults += ` AND rating>=\$${i}`; 
        paramsGetResults.push(parseFloat(req.query.rating)); 
        i++;
        }
    }

    // PROPERTY TYPE
    if(Array.isArray(req.query.property_type)){
        queryGetResults += ` AND (`;
        var array_iterator = 0;
        for(type of req.query.property_type){
            if(array_iterator == 0){
                queryGetResults += ` property_type=\$${i}`;
                array_iterator++;
            } else queryGetResults += ` OR property_type=\$${i}`;
            paramsGetResults.push(type);
            i++;
        }
        queryGetResults += `)`;
    }
    else if(req.query.property_type){
        queryGetResults += ` AND property_type=\$${i}`;
        paramsGetResults.push(req.query.property_type);
        i++;
    }

    // AMENITIES
    if(Array.isArray(req.query.amenities)) for(amen of req.query.amenities){   // TOADD: verify for sql injection
        queryGetResults += ` AND ${amen} IS TRUE`;
    } else if(req.query.amenities) queryGetResults += ` AND ${req.query.amenities} IS TRUE`;

    queryGetResults += ` GROUP BY p.id_property, a.city, ph.big_picture`;

    // ROOMS NUMBER
    if(Array.isArray(req.query.rooms)){
        queryGetResults += ` HAVING (`;
        var array_iterator = 0;
        for(room of req.query.rooms){
            if(array_iterator == 0){
                queryGetResults += ` count(id_room)=\$${i}`;
                array_iterator++;
            } else queryGetResults += ` OR count(id_room)=\$${i}`;
            paramsGetResults.push(room);
            i++;
        }
        queryGetResults += `)`;
    }
    else if(req.query.rooms){
        queryGetResults += ` HAVING count(id_room)=\$${i}`;
        paramsGetResults.push(req.query.rooms);
        i++;
    }

    // ORDER
    switch(req.query.order){
        case 'price':
            queryGetResults += ` ORDER BY price`;
            break;
        case 'rating':
            queryGetResults += ` ORDER BY rating`;
            break;
        case 'reviews':
            queryGetResults += ` ORDER BY count(id_review)`;
            break;
        default:
            queryGetResults += ` ORDER BY id_property`;
    }

    // SORT ORDER
    if(req.query.sortOrder == 'high') queryGetResults += ` DESC`;

    console.log(queryGetResults);
    client.query(queryGetResults, paramsGetResults, (err, result) =>{
        if(err) console.log("Error" + err);
        else{
            // console.log(result.rows);
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
                                    if(req.session && req.session.user){
                                        var queryGetFavourites = `SELECT favourites FROM users WHERE id_user=$1`;
                                        client.query(queryGetFavourites, [req.session.user.id_user], (err9, result9) =>{
                                            if(err3) {console.log(err9); return;}
                                            res.render('pages/result', {
                                                prop: result.rows[0], 
                                                rooms: result2.rows,
                                                g_amenities: result3.rows[0],
                                                k_amenities: result4.rows[0],
                                                b_amenities: result5.rows[0],
                                                reviews: result6.rows,
                                                numberReviews: numberReviews,
                                                error: req.query.error,
                                                photos: result8.rows[0],
                                                favourites: result9.rows[0]
                                            });
                                        });
                                    } else {
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
                                    }
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