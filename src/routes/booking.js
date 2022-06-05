const express = require('express');
const router = express.Router();
const {postBooking, getPropertyBookings, getConfirmBooking, getRefuseBooking, getCancelBooking, getUserTrips} = require('../controllers/bookingsController');

router.post('/add/:price', postBooking);

router.get('/:id_property', getPropertyBookings);

router.get('/confirm/:id_property/:id_booking', getConfirmBooking);

router.get('/refuse/:id_property/:id_booking', getRefuseBooking);

router.get('/cancel/:id_property/:id_booking', getCancelBooking);

router.get('/userTrips', getUserTrips);


module.exports = router;