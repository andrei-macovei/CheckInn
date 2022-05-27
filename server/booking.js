const { text } = require('express');
const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const { Client } = require('pg');

// database connection
const conn = require("../public/json/connection.json");
var client = new Client(conn);
client.connect();

router.post('/add/:price', (req, res) =>{
    var form = new  formidable.IncomingForm();

    form.parse(req, (err, text_fields) =>{
        // handling date input
        //TODO: data validation
        //TODO: check if user is logged in
        console.log(req.params.price);
        if(req.session == null || req.session.user == null) {res.redirect(`/search/result/${text_fields.id_property}?error=notLoggedIn`); return;}
        var checkin = text_fields.checkin;
        var checkout = text_fields.checkout;
        var dates = []; // 0 - checkin, 1 - checkout
        for(d of [checkin, checkout]){
            let dateArr = d.split('/');
            let day = parseInt(dateArr[1]);
            let month = parseInt(dateArr[0]);
            let year = parseInt(dateArr[2]);
            let dbDate = new Date(year, month-1, day);
            dates.push(dbDate);
        }
        // check for time collisions with other bookings
        var queryGetBookings = `SELECT checkin, checkout FROM bookings WHERE id_property=$1 AND checkout > $2`;
        client.query(queryGetBookings, [text_fields.id_property, dates[0]], (err, result) =>{
            // console.log(result.rows[0].checkin);
            var overlap = 0;
            const checkin = new Date


            for(row of result.rows){
                if((row.checkin > dates[0]) && (row.checkin < dates[1])){
                    overlap = 1;
                    break;
                } else if(row.checkout > dates[0] && row.checkout < dates[1]){
                    overlap = 1;
                    break;
                } else if(row.checkin < dates[0] && row.checkout > dates[1]){
                    overlap = 1;
                    break;
                }
            }
            if(overlap == 1){
                // ERROR
                res.redirect(`/search/result/${text_fields.id_property}?error=fullyBooked`);
            } else{
                var queryAddBooking = `INSERT INTO bookings(id_user, id_property, checkin, checkout, guests) VALUES ($1, $2, $3, $4, $5)`;
                var paramsAddBooking = [req.session.user.id_user,  text_fields.id_property, dates[0], dates[1], text_fields.guests];
                client.query(queryAddBooking, paramsAddBooking, (err1, result1) =>{
                    if(err1) {console.log(err1); return;}

                    // SUCCESFUL
                    res.render(`pages/bookingComfirmation`, {property: text_fields.name_property});
                })
            }
        });
    });
});

module.exports = router;