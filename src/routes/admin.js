const express = require('express');
const router = express.Router();

const {getAdminDashboard , getUsersManagement} = require('../controllers/adminController');

// TOOADD: add to favourites

router.get('/', getAdminDashboard);

router.get('/manageUsers', getUsersManagement);

module.exports = router;