const formidable = require('formidable')
const { Client } = require('pg');

const notificationsController = require('./notificationsController');

// database connection
const conn = require("../../public/json/connection.json");
var client = new Client(conn);
client.connect();

const postBooking = (req, res) =>{
    var form = new  formidable.IncomingForm();

    form.parse(req, (err, text_fields) =>{
        // handling date input
        //DONE: data validation
        //DONE: check if user is logged in
        console.log(req.params.price);
        if(req.session == null || req.session.user == null) {res.redirect(`/search/result/${text_fields.id_property}?error=notLoggedIn`); return;}
        var checkin = text_fields.checkin;
        var checkout = text_fields.checkout;

        if(checkin >= checkout){
            res.redirect(`/search/result/${text_fields.id_property}?error=wrongDates`);
            return;
        }

        const numberRegex = /^[1-9]+[0-9]*$/;
        if(text_fields.guests > text_fields.property_guests || !numberRegex.test(text_fields.guests)){
            res.redirect(`/search/result/${text_fields.id_property}?error=guests`);
            return;
        }

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
            const checkin = new Date();

            for(row of result.rows){
                if((row.checkin >= dates[0]) && (row.checkin < dates[1])){
                    overlap = 1;
                    break;
                } else if(row.checkout > dates[0] && row.checkout <= dates[1]){
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
                var queryAddBooking = `INSERT INTO bookings(id_user, id_property, checkin, checkout, guests, total_price) VALUES ($1, $2, $3, $4, $5, $6)`;
                var paramsAddBooking = [req.session.user.id_user, text_fields.id_property, dates[0], dates[1], text_fields.guests, req.params.price];
                client.query(queryAddBooking, paramsAddBooking, (err1, result1) =>{
                    if(err1) {console.log(err1); return;}

                    // SUCCESFUL
                    // send new booking notification to host
                    var queryGetHost = `SELECT u.id_user, p.title from properties p JOIN users u ON p.id_host=u.id_user WHERE id_property=$1`;
                    client.query(queryGetHost, [text_fields.id_property], (err2, result2) =>{
                        if(err2) {console.log(err2); return;}
                        var text = `An user has requested to book ${result2.rows[0].title}`;
                        var action = `/hosting/?id_property=${text_fields.id_property}`;
                        notificationsController.sendNotification(result2.rows[0].id_user, 'New booking request', text, action, 'Review bookings');
                        res.render(`pages/bookingConfirmation`, {property: text_fields.name_property});
                    });
                });
            }
        });
    });
}

const getPropertyBookings = (req, res) =>{ 
    var queryGetBookings = `SELECT * FROM bookings WHERE id_property=$1 AND checkout>CURRENT_DATE AND (status='pending' OR status='confirmed')`;
    client.query(queryGetBookings, [req.params.id_property], (err, result) =>{
        if(err) {console.log(err); return;}
        res.status(200).json(result.rows);
    });
}

const getUserBookings = (req, res) =>{
    var queryGetBookings = `SELECT * FROM bookings WHERE id_user=$1 AND checkout>CURRENT_DATE AND (status='pending' OR status='confirmed')`;
    client.query(queryGetBookings, [req.session.user.id_user], (err, result) =>{
        if(err) {console.log(err); return;}
        res.status(200).json(result.rows);
    });
}

const getConfirmBooking = (req, res) =>{
    client.query("UPDATE bookings SET status='confirmed' WHERE id_booking=$1", [req.params.id_booking], (err, result) =>{
        if(err) {console.log(err); return;}

        // send confirmation notification to user who made booking
        var queryGetProperty = `SELECT p.title, p.id_property, u.id_user FROM bookings b JOIN properties p USING(id_property) JOIN users u USING(id_user) WHERE id_booking=$1`;
        client.query(queryGetProperty, [req.params.id_booking], (err, result) =>{
            if(err) {console.log(err); return;}
            var text = `Your booking to ${result.rows[0].title} was confirmed! See you there!`;
            var action = `/booking/userTrips`;
            notificationsController.sendNotification(result.rows[0].id_user, `Booking confirmed - #${req.params.id_booking}`, text, action, 'Your trips');
        });
        res.redirect(`/hosting/?id_property=${req.query.id_property}`);
    });
}

const getRefuseBooking = (req, res) =>{
    client.query("UPDATE bookings SET status='refused' WHERE id_booking=$1", [req.params.id_booking], (err, result) =>{
        if(err) {console.log(err); return;}

        // send refusal notification to user who made booking
        var queryGetProperty = `SELECT p.title, p.id_property, u.id_user FROM bookings b JOIN properties p USING(id_property) JOIN users u USING(id_user) WHERE id_booking=$1`;
        client.query(queryGetProperty, [req.params.id_booking], (err, result) =>{
            if(err) {console.log(err); return;}
            var text = `Your booking to ${result.rows[0].title} was refused! Sorry about that!`;
            var action = `/booking/userTrips`;
            notificationsController.sendNotification(result.rows[0].id_user, `Booking refused - #${req.params.id_booking}`, text, action, 'Your trips');
        });
        res.redirect(`/hosting/?id_property=${req.query.id_property}`);
    });
}

const getCancelBooking = (req, res) =>{
    client.query("UPDATE bookings SET status='canceled' WHERE id_booking=$1", [req.params.id_booking], (err, result) =>{
        if(err) {console.log(err); return;}
        // if host canceled, send cancel notification to user who made booking
        var queryGetProperty = `SELECT p.title, p.id_property, u.id_user FROM bookings b JOIN properties p USING(id_property) JOIN users u USING(id_user) WHERE id_booking=$1`;
        client.query(queryGetProperty, [req.params.id_booking], (err, result) =>{
            if(err) {console.log(err); return;}
            var text = `Your booking to ${result.rows[0].title} was canceled! Sorry about that!`;
            var action = `/booking/userTrips`;
            notificationsController.sendNotification(result.rows[0].id_user, `Booking canceled - #${req.params.id_booking}`, text, action, 'Your trips');
        });
        if(req.query.id_property) res.redirect(`/hosting/?id_property=${req.query.id_property}`);
        else {
            // if user canceled, send notification to host
            if(req.query.path == 'userTrips'){
                var queryGetProperty = `SELECT p.title, p.id_host, p.id_property FROM bookings b JOIN properties p USING(id_property) WHERE id_booking=$1`;
                client.query(queryGetProperty, [req.params.id_booking], (err, result) =>{
                    if(err) {console.log(err); return;}
                    var text = `A booking to ${result.rows[0].title} was canceled by the guest.`;
                    var action = `/hosting/?id_property=${result.rows[0].id_property}`;
                    notificationsController.sendNotification(result.rows[0].id_host, `Booking canceled - #${req.params.id_booking}`, text, action, 'Review bookings');
                    res.redirect('/booking/userTrips');
                });

            }
        }
    });
}

const getUserTrips = (req, res) =>{
    if(req.session && req.session.user){
        var toSend = new Object;
        var queryGetUpcomingBookings = 'SELECT b.*, p.title, a.city, a.country FROM bookings b INNER JOIN properties p USING(id_property) INNER JOIN address a USING(id_property) WHERE id_user=$1 AND b.checkin>CURRENT_DATE ORDER BY b.checkin';
        client.query(queryGetUpcomingBookings, [req.session.user.id_user], (err, result) =>{
            if(err) {console.log(err); return }
            var queryGetOlderBookings = 'SELECT b.*, p.title, a.city, a.country FROM bookings b INNER JOIN properties p USING(id_property) INNER JOIN address a USING(id_property) WHERE id_user=$1 AND b.checkin<CURRENT_DATE AND b.checkout<CURRENT_DATE ORDER BY b.checkout DESC';
            client.query(queryGetOlderBookings, [req.session.user.id_user], (err, result1) =>{
                if(err) {console.log(err); return }
                var queryGetCurrentBooking = "SELECT b.*, p.title, a.city, a.country FROM bookings b INNER JOIN properties p USING(id_property) INNER JOIN address a USING(id_property) WHERE id_user=$1 AND b.status='confirmed' AND b.checkin<=CURRENT_DATE AND b.checkout>=CURRENT_DATE";
                client.query(queryGetCurrentBooking, [req.session.user.id_user], (err, result2) =>{
                    if(err) {console.log(err); return }
                    res.render('pages/userTrips', {
                        upcomingTrips: result.rows,
                        olderTrips: result1.rows,
                        currentTrip: result2.rows[0]
                    });
                });
            });
        });       
    }else{   // if not logged in
        res.render('pages/login',{path: '/booking/userTrips'});
    }
}

module.exports = {
    postBooking,
    getPropertyBookings,
    getUserBookings,
    getConfirmBooking,
    getRefuseBooking,
    getCancelBooking,
    getUserTrips
}