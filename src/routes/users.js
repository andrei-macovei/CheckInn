const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController');

// login page
router.get("/login", usersController.getLoginPage);

// register page
router.get("/register", usersController.getRegisterPage);

// forgot password page
router.get("/forgot", usersController.getForgotPage);

// accesed when submitting the register form
router.post('/registerUser', usersController.postRegisterUser);

// accesed when clicking login
router.post('/authenticate', usersController.postAuthenticate);

router.post('/sendResetEmail', usersController.postSendResetEmail);

// reset password page
router.get('/reset/:email/:token', usersController.getResetPassword);

router.post('/updatePassword', usersController.postUpdatePassword);

router.get('/confirm/:email/:token', usersController.getConfirmEmail);

router.get('/profile', usersController.getProfile);

router.post('/editProfile', usersController.postEditProfile);

router.post('/changePassword', usersController.postChangePassword);

router.post('/addProfilePicture', usersController.postProfilePicture);

router.post('/addFavourite/:id_property', usersController.postFavourite);

router.delete('/deleteFavourite/:id_property', usersController.deleteFavourite);

router.get('/logout', usersController.getLogout);

module.exports = router