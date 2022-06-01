const express = require('express');
const router = express.Router();
const formidable = require('formidable')
const { Client } = require('pg')


// database connection
const conn = require("../public/json/connection.json");
var client = new Client(conn);
client.connect();

router.post('/add/:id_property/:id_user', (req, res) =>{
    var form = new  formidable.IncomingForm();

    form.parse(req, (err, text_fields) =>{
        var queryAddReview = 'INSERT INTO reviews (id_property, id_user, clean_score, location_score, comfort_score, value_score, total_score, review_text) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)';
        var paramsAddReview = [req.params.id_property, req.params.id_user, text_fields.clean_score, text_fields.location_score, text_fields.comfort_score, text_fields.value_score, 
            (parseInt(text_fields.clean_score) + parseInt(text_fields.location_score) + parseInt(text_fields.comfort_score) + parseInt(text_fields.value_score))/4 , text_fields.review_text];
            client.query(queryAddReview, paramsAddReview, (err, result) =>{
            if(err) {console.log('ERR' + err); return; }
            var queryChangeBookingStatus = `UPDATE bookings SET status='reviewed' WHERE id_booking=$1`;
            client.query(queryChangeBookingStatus, [req.query.id_booking], (err1, result1) =>{
                if(err1) {console.log('ERR1' + err1); return; }
                var queryRecalculateRating = `SELECT total_score FROM reviews WHERE id_property=$1`;
                client.query(queryRecalculateRating, [req.params.id_property], (err2, result2) =>{
                    if(err2) {console.log('ERR2' + err2); return; }

                    let scores_sum = 0;
                    
                    // recalculate rating
                    for(row of result2.rows){
                        scores_sum += row.total_score;
                    }
                    var updatedRating = scores_sum / result2.rowCount;
                    // console.log(updatedRating)

                    var queryUpdateRating = `UPDATE properties SET rating=$1 WHERE id_property=$2`;
                    client.query(queryUpdateRating, [updatedRating, req.params.id_property], (err3, result3) =>{
                        if(err3) {console.log('ERR3' + err3); return; }
                        res.redirect('/booking/userTrips');
                    });
                });
            });
        });
    });
});

module.exports = router;