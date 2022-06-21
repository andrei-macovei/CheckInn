const express = require('express');
const router = express.Router();

const {getAdminDashboard , getUsersManagement, postDestinations, postBackground, postSendNotification, deleteUser} = require('../controllers/adminController');

// TOOADD: add to favourites

router.get('/', getAdminDashboard);

router.get('/manageUsers', getUsersManagement);

router.post('/addDestinations', postDestinations);

router.post('/addBackground', postBackground);

router.post('/sendNotification/:id_user', postSendNotification);

router.post('/delete/:id_user', deleteUser);

module.exports = router;