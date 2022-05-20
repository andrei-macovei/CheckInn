const express = require('express');
const router = express.Router();
const formidable = require('formidable')
const { Client } = require('pg')

// database connection
const conn = require("../public/json/connection.json");
var client = new Client(conn);
client.connect();

router.get('/', (req,res) =>{
    var queryGetProperties = `SELECT id_property, title, property_type, guests, rating FROM properties WHERE id_host=$1`;
    client.query(queryGetProperties, [req.session.user.id_user  ], (err, result) =>{
        if(err) console.log(err);
        else{
            res.render('pages/hostDashboard', {properties: result.rows})
        }
    })
});

router.get('/becomeHost', (req, res) =>{
    res.render('pages/becomeHost')
});

router.post('/newListing', (req, res) =>{
    var form = new formidable.IncomingForm();
    // TODO: check inputs?
    if(req.session.user){
    form.parse(req, (err, text_fields) =>{
        if(err) console.log(err);
        console.log(text_fields);

        // verify title isn't already used
        var queryVerifyUniqueTitle = `SELECT title FROM properties WHERE title = $1 and id_host = $2`;
        var paramsVerifyUniqueTitle = [text_fields.title, req.session.user.id_user];
        client.query(queryVerifyUniqueTitle, paramsVerifyUniqueTitle, (err, result) => {
            if(err) console.log(err);
            else{
                if(result.rows.length == 0){   // if no other listings are found with the same title
                    var queryAddProperty = `INSERT INTO properties (id_host, title, property_type, privacy) VALUES ($1, $2, $3, $4)`;
                    paramsAddProperty = [req.session.user.id_user, text_fields.title, text_fields.property_type, text_fields.privacy];

                    client.query(queryAddProperty, paramsAddProperty, (err1, result1) =>{
                        if(err1){
                            console.log(err1);
                            // error handling
                        }
                        else{
                            var queryGetPropertyId = `SELECT id_property FROM properties WHERE title = $1 AND id_host = $2 `;
                            var paramsGetPropertyId = [text_fields.title, req.session.user.id_user];
                            client.query(queryGetPropertyId, paramsGetPropertyId, (err2, result2) => {
                                if(err2){
                                    console.log(err2);
                                    // error handling
                                }
                                else{
                                    res.render('pages/listingAddress', {id_property: result2.rows[0].id_property})
                                }
                            });
                        }
                    });
                }   // else TODO: show error: title already used
            }
        });
    });
    } // else TODO: show error: need to be logged in
});

router.get('/listingAddress/:id_property', (req, res) =>{
    queryGetAddress = `SELECT * FROM address WHERE id_property= $1`;
    client.query(queryGetAddress, [req.params.id_property], (err, result) =>{
        if(err) console.log(err);
        else{
            if(result.rows[0])
                res.render('pages/listingAddress', {
                    id_property: req.params.id_property,
                    country: result.rows[0].country,
                    city: result.rows[0].city,
                    street_and_number: result.rows[0].street_and_number,
                    lat: result.rows[0].lat,
                    lng: result.rows[0].lng,
                });
            else res.render('pages/listingAddress', {id_property: req.params.id_property});
        }
    })
})

router.post('/addAddress', (req, res) =>{
    const {id_property, street_and_number, neighbourhood, city, region, country, postal_code, lat, lng} = req.body;
    queryAddAddress = `INSERT INTO address (id_property, street_and_number, neighbourhood, city, region, country, postal_code, lat, lng) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    paramsAddAddress = [id_property, street_and_number, neighbourhood, city, region, country, postal_code, lat, lng];
    client.query(queryAddAddress, paramsAddAddress, (err, result) => {
        if(err) console.log(err);
        else res.status(201);
    })
});

router.put('/addAddress', (req, res) =>{
    const {id_property, street_and_number, neighbourhood, city, region, country, postal_code, lat, lng} = req.body;
    queryUpdateAddress = `UPDATE address SET street_and_number=$1, neighbourhood=$2, city=$3, region=$4, country=$5, postal_code=$6, lat=$7, lng=$8 WHERE id_property=$9`;
    paramsUpdateAddress = [street_and_number, neighbourhood, city, region, country, postal_code, lat, lng, id_property];
    client.query(queryUpdateAddress, paramsUpdateAddress, (err, result) =>{
        if(err) console.log(err);
        else res.status(200).send(`{"message": "Address modified succesfully"}`);
    });
});

router.get('/listingDetails/:id_property', (req, res) =>{
    // gets amenities column names from db
    var queryGetBathroomAmenities = `SELECT column_name FROM information_schema.columns WHERE table_name = 'bathroom_amenities'`
    client.query(queryGetBathroomAmenities, (err, result) =>{
        if(err) console.log(err);
        else{
            var queryGetKitchenAmenities = `SELECT column_name FROM information_schema.columns WHERE table_name = 'kitchen_amenities'`
            client.query(queryGetKitchenAmenities, (err1, result1) =>{
                if(err1) console.log(err1);
                else{
                    var queryGetGeneralAmenities = `SELECT column_name FROM information_schema.columns WHERE table_name = 'general_amenities'`
                    client.query(queryGetGeneralAmenities, (err2, result2) =>{
                        if(err2) console.log(err2);
                        else{

                            var queryGetPropertyInfo = `SELECT title, description, guests, bathrooms FROM properties WHERE id_property = $1`
                            client.query(queryGetPropertyInfo, [req.params.id_property], (err, result3) =>{
                                // TODO?: get prior amenities
                                res.render('pages/listingDetails', {
                                    id_property: req.params.id_property,
                                    title: result3.rows[0].title,
                                    description: result3.rows[0].description,
                                    guests: result3.rows[0].guests,
                                    bathrooms: result3.rows[0].bathrooms,
                                    bathroomAmenities: result.rows,
                                    kitchenAmenities: result1.rows,
                                    generalAmenities: result2.rows
                                });
                            });
                        }
                    });
                }
            });
        }
    });
})

router.post('/addListingDetails/:id_property', (req, res) =>{
    var form = new  formidable.IncomingForm();

    form.parse(req, (err, text_fields) =>{
        console.log(text_fields)
        var queryUpdateProperty = `UPDATE properties SET title = $1, description = $2, guests = $3, bathrooms = $4 WHERE id_property= $5`
        var paramsUpdateProperty = [text_fields.title, text_fields.description, text_fields.guests, text_fields.bathrooms, req.params.id_property];
        client.query(queryUpdateProperty, paramsUpdateProperty, (err, result) =>{
            if(err) console.log(err);
            else{
                // TODO: add amenities to db

                res.redirect(`/hosting/listingRules/${req.params.id_property}`)
            }
        })


        // res.render('pages/listingDetails', {id_property: text_fields.id_property})
        // res.redirect(`/hosting/listingDetails/${text_fields.id_property}`);
    });
});

// router.post('/addRoom', (req, res) =>{
//     var form = new formidable.IncomingForm();
//     form.parse(req, (err, text_fields) =>{
//         // TODO: validate data

//         var queryAddRoom = `INSERT INTO rooms (id_property, room_type, single_beds, double_beds, bunk_beds, other) VALUES ($1, $2, $3, $4, $5, $6)`;
//         var paramsAddRoom = [text_fields.id_property, text_fields.room_type, text_fields.single_beds, text_fields.double_beds, text_fields.bunk_beds, text_fields.other];

//         client.query(queryAddRoom, paramsAddRoom, (err, result) =>{
//             if(err) console.log(err);
//             else{
//                 console.log(result.rows);
//                 res.render('pages/listingDetails', {id_property: text_fields.id_property});
//             }
//         });
//     });
// });

router.get('/rooms', (req, res) =>{
    client.query(`SELECT * FROM rooms WHERE id_property = $1`, [req.query.id_property], (err, result) =>{
        if(err) console.log(err);
        else{
            res.status(200).json(result.rows);
        }
    });
});

router.get('/rooms/:id_room', (req, res) =>{
    client.query(`SELECT * FROM rooms WHERE id_room = $1`, [req.params.id_room], (err, result) =>{
        if(err) console.log(err);
        else{
            res.status(200).json(result.rows[0]);
        }
    });
})

router.post('/rooms', (req, res) =>{
    const {id_property, room_type, single_beds, double_beds, bunk_beds, other} = req.body;
    queryAddRoom = `INSERT INTO rooms (id_property, room_type, single_beds, double_beds, bunk_beds, other) VALUES ($1, $2, $3, $4, $5, $6)`;
    paramsAddRoom = [id_property, room_type, single_beds, double_beds, bunk_beds, other];
    client.query(queryAddRoom, paramsAddRoom, (err, result) => {
        if(err) console.log(err);
        else res.status(201).send("Room added succesfully");
    })
});

router.put('/rooms/:id_room', (req, res) =>{
    const {id_property, room_type, single_beds, double_beds, bunk_beds, other} = req.body;
    queryUpdateRoom = `UPDATE rooms SET room_type=$1, single_beds=$2, double_beds=$3, bunk_beds=$4, other=$5 WHERE id_room=$6`;
    paramsUpdateRoom = [room_type, single_beds, double_beds, bunk_beds, other, req.params.id_room];
    client.query(queryUpdateRoom, paramsUpdateRoom, (err, result) =>{
        if(err) console.log(err);
        else response.status(200).send(`Room with id ${id} modified.`);
    })
    
});

router.delete('/rooms/:id_room', (req, res) =>{
    client.query('DELETE FROM rooms WHERE id_room = $1', [req.params.id_room], (err, result) =>{
        if(err) console.log(err);
        else response.status(200).send(`Room with id ${id} deleted.`);
    })
});

router.get('/listingRules/:id_property', (req, res) =>{
    var queryGetRules = `SELECT price, week_discount, checkin, checkout, for_kids, smoking_allowed, pets_allowed, events_allowed FROM properties WHERE id_property= $1`;
    client.query(queryGetRules, [req.params.id_property], (err, result) =>{
        res.render('pages/listingRules', {
            id_property: req.params.id_property,
            price: result.rows[0].price,
            week_discount: result.rows[0].week_discount,
            checkin: result.rows[0].checkin,
            checkout: result.rows[0].checkout,
            for_kids: result.rows[0].for_kids,
            smoking_allowed: result.rows[0].smoking_allowed,
            pets_allowed: result.rows[0].pets_allowed,
            events_allowed: result.rows[0].events_allowed,
        });
    });
});

router.post('/addRules/:id_property', (req, res) =>{
    var form = new  formidable.IncomingForm();
    form.parse(req, (err, text_fields) =>{
        console.log(text_fields)

        var queryUpdateProperty = `UPDATE properties SET price = $1, week_discount = $2, checkin = $3, checkout = $4,
                                    for_kids = $5, smoking_allowed = $6, pets_allowed = $7, events_allowed = $8  WHERE id_property= $9`;
        var paramsUpdateProperty = [text_fields.price, text_fields.week_discount, text_fields.checkin, text_fields.checkout, 
            (text_fields.rules.includes('for_kids')) ? true : false, (text_fields.rules.includes('smoking_allowed')) ? true : false,
            (text_fields.rules.includes('pets_allowed')) ? true : false, (text_fields.rules.includes('events_allowed')) ? true : false,
            req.params.id_property];
        client.query(queryUpdateProperty, paramsUpdateProperty, (err, result) =>{
            if(err) console.log(err);
            else{
                res.redirect(`/hosting/`);
            }
        });
    });
})


module.exports = router