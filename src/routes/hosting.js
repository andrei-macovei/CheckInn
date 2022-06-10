const express = require('express');
const router = express.Router();

const hostingController = require('../controllers/hostingController');
const hostingAsyncController = require('../controllers/hostingAsyncController');
const roomsController = require('../controllers/roomsController');

router.get('/', hostingController.getHostDashboard);

router.get('/becomeHost', hostingController.getBecomeHost);

router.post('/newListing', hostingController.postNewListing);

router.get('/listingAddress/:id_property', hostingController.getListingAddress);

router.post('/addAddress', hostingAsyncController.postAddress);

router.put('/addAddress', hostingAsyncController.putAddress);

router.get('/listingDetails/:id_property', hostingController.getListingDetails);

router.post('/addListingDetails/:id_property', hostingController.postListingDetails);

router.get('/listingPhotos/:id_property', hostingController.getListingPhotos);

router.post('/addListingPhotos/:id_property', hostingController.postListingPhotos);

router.get('/rooms', roomsController.getRooms);

router.get('/rooms/:id_room', roomsController.getRoom);

router.post('/rooms', roomsController.postRoom);

router.put('/rooms/:id_room', roomsController.putRoom);

router.delete('/rooms/:id_room', roomsController.deleteRoom);

router.get('/listingRules/:id_property', hostingController.getListingRules);

router.post('/addRules/:id_property', hostingController.postAddRules)

router.delete('/deleteProperty/:id_property', hostingAsyncController.deleteProperty);

router.get('/bookingHistory/:id_property', hostingController.getBookingHistory);

module.exports = router