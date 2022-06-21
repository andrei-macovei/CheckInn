const express = require('express');
const router = express.Router();

const {getAdminDashboard , getUsersManagement, postDestinations} = require('../controllers/adminController');

// TOOADD: add to favourites

router.get('/', getAdminDashboard);

router.get('/manageUsers', getUsersManagement);

router.post('/addDestinations', postDestinations);

module.exports = router;