const express = require('express');
const router = express.Router();

const {postAddReview} = require('../controllers/reviewsController');

router.post('/add/:id_property/:id_user', postAddReview);

module.exports = router;