const express = require('express');
const router = express.Router();
const formidable = require('formidable')
const { Client } = require('pg')
const bcrypt = require('bcrypt');
const { sendTokenEmail, generateToken, sendResetEmail } = require('./emailSender');


// database connection
const conn = require("../public/json/connection.json");
const IncomingForm = require('formidable/src/Formidable');
var client = new Client(conn);
client.connect();

// login page
router.get("/login", (req, res) => {
    res.render('pages/login');
});

// register page
router.get("/register", (req, res) => {
    res.render('pages/register');
});

// forgot password page
router.get("/forgot", (req, res) => {
    res.render('pages/forgot');
});

// accesed when submitting the register form
router.post('/registerUser',(req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, text_fields){
        if(err) console.log(err);
        console.log(text_fields);

        var err_message = "";
        // checks if all fields are not empty
        if(text_fields.email.length == 0 || text_fields.firstname.length == 0 || text_fields.lastname.length == 0 || text_fields.password.length == 0){
            err_message += "All fields are required\n";
        }

        // check for input formats
        var re = /^[A-Za-z][\w\.-]*[A-Za-z0-9]@[A-Za-z0-9]+\.[A-Za-z-]{2,3}$/;
        if(!re.test(text_fields.email)) err_message += "Incorrect e-mail format\n";

        re = /^[A-Za-z]+([\- ][A-Za-z]*)*$/;
        if(!re.test(text_fields.firstname)) err_message += "Firstname can only contain letters, spaces and dashes\n";
        if(!re.test(text_fields.lastname)) err_message += "Lastname can only contain letters, spaces and dashes\n";

        if(err_message == ""){
            queryUniqueEmail = `SELECT * FROM users WHERE email=$1`
            client.query(queryUniqueEmail, [text_fields.email], async (err, rez) => {
                if(err){
                    console.log(err);
                    res.render('pages/register', {msg: "Database Error"});
                    return;
                }

                if(rez.rows.length == 0){   // if the email provided is not already associated to an account
                    // password encryption
                    const salt = await bcrypt.genSalt();
                    const hashedPassword = await bcrypt.hash(text_fields.password, salt);

                    // generate token for email confirmation
                    var token = generateToken(100);

                    // create the user in the db
                    var queryAddUser = `INSERT INTO users (firstname, lastname, email, password, code) VALUES ($1, $2, $3, $4, $5)`;
                    var parametersAddUser = [text_fields.firstname, text_fields.lastname, text_fields.email.toLowerCase(), hashedPassword, token];

                    client.query(queryAddUser, parametersAddUser, (err, rez) => {
                        if(err){
                            console.log(err);
                            res.render('pages/register', {msg:"Database Error 1"})
                        }
                        else{
                            // send email with token for activation
                            sendTokenEmail(text_fields.firstname, text_fields.email, token);
                            res.render('pages/register', {msg:"Account created. Please activate your account via e-mail", succes:"true"})
                        }
                    });
                }
                else{
                    res.render("pages/register", {msg:"E-mail address already in use for another account"})
                }
            });
        }
        else res.render("pages/register", {msg:err_message});
    });
});

// accesed when clicking login
router.post('/authenticate', (req, res) => {
    var form = new formidable.IncomingForm();
    
    form.parse(req, (err, text_fields) => {
        // check for input format
        if(text_fields.email.length == 0 || text_fields.password.length == 0){
            res.render('pages/login', {msg:"All fields are required!"});
                return;
        }

        var re = /^[A-Za-z][\w\.-]*[A-Za-z0-9]@[A-Za-z0-9]+\.[A-Za-z-]{2,3}$/;
        if(!re.test(text_fields.email)) {
            res.render('pages/login', {msg:"E-mail adress invalid"});
                return;
        }


        var queryFindUser = `SELECT * FROM users WHERE email=$1`;
        client.query(queryFindUser, [text_fields.email], (err, result) => {
            if(err){
                console.log(err);
                return;
            }
            if(result.rows.length != 1){    // it either finds one result or none
                res.render('pages/login', {msg:"E-mail not associated to any account", createAccLink:"true"});
                return;
            }
            if(!result.rows[0].confirmed){
                res.render('pages/login', {msg:"E-mail address not confirmed. Please check your inbox"});
                return;
            }

            bcrypt.compare(text_fields.password, result.rows[0].password, (err, compare_result) => {
                if(compare_result){ // password matches the one in the database
                    if(req.session){
                        req.session.user = {
                            id_user : result.rows[0].id_user,
                            firstname : result.rows[0].firstname,
                            lastname :  result.rows[0].lastname,
                            email : result.rows[0].email,
                            phone : result.rows[0].phone,
                            join_date : result.rows[0].join_date,
                            birthday :  result.rows[0].birthday,
                            profile_picture : result.rows[0].profile_picture,
                            host: result.rows[0].host
                        }
                    }
                    res.redirect('/');
                }
                else{
                    res.render('pages/login', {msg:"Password is incorrect!"});
                    return;
                }
            });
        });
    });
});

router.post('/sendResetEmail', (req, res) => {
    var form = new formidable.IncomingForm();
    
    form.parse(req, (err, text_fields) => {
        // check for input format
        if(text_fields.email.length == 0){
            res.render('pages/forgot', {msg:"Please enter an email"});
                return;
        }

        var re = /^[A-Za-z][\w\.-]*[A-Za-z0-9]@[A-Za-z0-9]+\.[A-Za-z-]{2,3}$/;
        if(!re.test(text_fields.email)) {
            res.render('pages/forgot', {msg:"E-mail adress invalid"});
                return;
        }

        var queryFindEmail = `SELECT email FROM users WHERE email=$1`;
        client.query(queryFindEmail, [text_fields.email], (err, result) => {
            if(err){
                console.log(err);
                return;
            }
            if(result.rows.length == 1){    // if the email provided matches an existing account
                // generate token for password reset
                var token = generateToken(100);
                
                // insert token in db
                var queryUpdateToken = `UPDATE users SET code=$1 WHERE email=$2`;
                var parametersUpdateToken = [token, text_fields.email];
                client.query(queryUpdateToken, parametersUpdateToken, (err1, result1) => {
                    if(err1){
                        console.log(err1);
                        return;
                    }
                });
                sendResetEmail(text_fields.email, token);
                res.redirect('/');
            }
            else{
                res.render('/pages/forgot', {msg:"E-mail not associated to any account"});
                return;
            }
        });
    });
});

// reset password page
router.get('/reset/:email/:token', (req, res) => {
    var queryCheckToken = `SELECT id_user FROM users WHERE email=$1 AND code=$2`;
    var parametersCheckToken = [req.params.email, req.params.token];
    client.query(queryCheckToken, parametersCheckToken, (err, result) => {
        if(err){
            console.log(err);
            return;
        }
        if(result.rows.length == 1){
            res.render('pages/resetForm', {id_user: result.rows[0].id_user});
        }
        else{
            res.render('pages/error', {type:"invalid_token"});
        }
    });
});

router.post('/updatePassword', (req, res) =>{
    var form = new formidable.IncomingForm();

    form.parse(req, async (err, text_fields) => {
        if(text_fields.password != text_fields.password_conf){
            res.render('pages/resetForm', {id_user: text_fields.id_user, msg: "The passwords do not match"});
        }
        else{
            // password encryption
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(text_fields.password, salt);

            // update password in db
            var queryUpdatePassword = `UPDATE users SET password=$1, code=null WHERE id_user=$2`;
            var parametersUpdatePassword = [hashedPassword, text_fields.id_user];
            client.query(queryUpdatePassword, parametersUpdatePassword, (err, result) => {
                if (err){
                    console.log(err);
                    return;
                }
                if(result.rowCount > 0){
                    res.render('pages/confirm', {type:"pass_reset"});
                }
                else{
                    res.render('pages/error');
                }
            });
        }
    });
});

router.get('/confirm/:email/:token', (req, res) => {
    // if email and code match then the address is confirmed and the token deleted from db
    var queryUpdateConfirmed = `UPDATE users SET confirmed=true, code=NULL WHERE email=$1 AND code=$2`;
    var parametersUpdateConfirmed = [req.params.email, req.params.token];
    client.query(queryUpdateConfirmed, parametersUpdateConfirmed, (err, result) => {
        if (err){
            console.log(err);
            return;
        }
        if(result.rowCount > 0){
            res.render('pages/confirm');
        }
        else{
            res.render('pages/error', {type:"invalid_token"});
        }
    });
});

router.get('/logout', (req, res) =>{
    req.session.destroy(); // ends the session
    // req.locals.user = null;          //// might be required
    res.redirect('/');
});

module.exports = router