const formidable = require('formidable')
const { Client } = require('pg')
const bcrypt = require('bcrypt');
const fs = require('fs');
const sharp = require('sharp');

const { sendTokenEmail, generateToken, sendResetEmail } = require('../controllers/emailSender');
const {sendNotification} = require('../controllers/notificationsController');
const {verifyPropertyListing} = require('../controllers/hostingController');


// result.rows[0]base connection
const conn = require("../../public/json/connection.json");
const IncomingForm = require('formidable/src/Formidable');
var client = new Client(conn);
client.connect();

const getLoginPage = (req, res) => {
    res.render('pages/login');
}

const getRegisterPage = (req, res) => {
    res.render('pages/register');
}

const getForgotPage = (req, res) => {
    res.render('pages/forgot');
}

const postRegisterUser = (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, text_fields){
        if(err) console.log(err);
        console.log(text_fields);

        var err_message = [];
        // checks if all fields are not empty
        if(text_fields.email.length == 0 || text_fields.firstname.length == 0 || text_fields.lastname.length == 0 || text_fields.password.length == 0){
            err_message.push("All fields are required\n");
        }

        // check for email format
        var re = /^[A-Za-z][\w\.-]*[A-Za-z0-9]@[A-Za-z0-9]+\.[A-Za-z-]{2,3}$/;
        if(!re.test(text_fields.email)) err_message.push("Incorrect e-mail format\n");

        // check for names format
        re = /^([A-Za-zÀ-žăîâșțĂÎÂȘȚ\- ])+$/;
        if(!re.test(text_fields.firstname)) err_message.push("Firstname can only contain letters, spaces and dashes\n");
        if(!re.test(text_fields.lastname)) err_message.push("Lastname can only contain letters, spaces and dashes\n");

        // check for password validity
        if(text_fields.password.length < 8) err_message.push("The password must be at least 8 characters long\n");
        if(text_fields.password != text_fields.password_conf) err_message.push("The passwords do not match\n");

        if(err_message.length == 0){
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
}

function sendLoginNotifications(id_user, profile_pic, role, phone, description){
    // Suggestion - Missing profile pic for hosts
    if(!profile_pic && role == 'host'){
        var querySearchWarnings = `SELECT id_notif FROM notifications WHERE id_user=$1 AND (type='Warning' OR type='Suggestion') AND text=$2`;
        client.query(querySearchWarnings, [id_user, 'Hosts with profile pictures get more booking requests. Add yours now!'], (err, result) =>{
            if(err) {console.log(err); return}
            if(result.rowCount == 0)
                sendNotification(id_user, 'Suggestion', 'Hosts with profile pictures get more booking requests. Add yours now!', '/users/profile', 'Add profile picture');
        });
    } else {
        var queryDeleteWarning = `DELETE FROM notifications WHERE id_user=$1 AND text=$2`;
        client.query(queryDeleteWarning, [id_user, 'Hosts with profile pictures get more booking requests. Add yours now!'], (err, result) =>{
            if(err) {console.log(err); return}
        })
    }

    // Suggestion - Missing phone number
    console.log("Phone:" + phone)
    if(!phone){
        var querySearchWarnings = `SELECT id_notif FROM notifications WHERE id_user=$1 AND (type='Warning' OR type='Suggestion') AND text=$2`;
        client.query(querySearchWarnings, [id_user, 'Add your phone number for easier communication with other users!'], (err, result) =>{
            if(err) {console.log(err); return}
            if(result.rowCount == 0)
                sendNotification(id_user, 'Suggestion', 'Add your phone number for easier communication with other users!', '/users/profile', 'Add phone number');
        });
    } else {
        var queryDeleteWarning = `DELETE FROM notifications WHERE id_user=$1 AND text=$2`;
        client.query(queryDeleteWarning, [id_user, 'Add your phone number for easier communication with other users!'], (err, result) =>{
            if(err) {console.log(err); return}
        })
    }
    // Suggestion - Missing description for hosts
    if(!description && role == 'host'){
        var querySearchWarnings = `SELECT id_notif FROM notifications WHERE id_user=$1 AND (type='Warning' OR type='Suggestion') AND text=$2`;
        client.query(querySearchWarnings, [id_user, 'Add a short description of yourself to make your guests familiar with you!'], (err, result) =>{
            if(err) {console.log(err); return}
            if(result.rowCount == 0)
                sendNotification(id_user, 'Suggestion', 'Add a short description of yourself to make your guests familiar with you!', '/users/profile', 'Add description');
        });
    } else {
        var queryDeleteWarning = `DELETE FROM notifications WHERE id_user=$1 AND text=$2`;
        client.query(queryDeleteWarning, [id_user, 'Add a short description of yourself to make your guests familiar with you!'], (err, result) =>{
            if(err) {console.log(err); return}
        })
    }
    // Warning - Property details not completed
    var queryGetProperties = `SELECT id_property, title FROM properties WHERE id_host=$1`;
    client.query(queryGetProperties, [id_user], (err, result0) =>{
        if(err) {console.log(err); return;}
        for (let prop of result0.rows){
            console.log(prop.id_property)
            var queryGetPropertyInfo = `SELECT id_property, title, guests, count(r.id_room), bathrooms, a.id_address, p.*, price, checkin, checkout
            FROM properties pr
            INNER JOIN rooms r USING(id_property)
            INNER JOIN address a USING(id_property) 
            INNER JOIN photos p USING(id_property)
            WHERE id_property=$1
            GROUP BY pr.id_property, a.id_address, p.id_photos`;
            client.query(queryGetPropertyInfo, [prop.id_property], (err1, result) =>{
                if(err1) {console.log(err1); return;}
                console.log(result.rowCount + ' - ' + prop.id_property);
                if(result.rowCount == 0 || !result.rows[0].title || !result.rows[0].guests || !result.rows[0].bathrooms || 
                    !result.rows[0].price || !result.rows[0].checkin || !result.rows[0].checkout || !result.rows[0].big_picture
                    || !result.rows[0].small_pic_1 || !result.rows[0].small_pic_2 || !result.rows[0].small_pic_3 || !result.rows[0].small_pic_4){
                        var querySearchWarnings = `SELECT id_notif FROM notifications WHERE id_user=$1 AND (type='Warning' OR type='Suggestion') AND text=$2`;
                        client.query(querySearchWarnings, [id_user, `Finish the listing for ${prop.title} and you can welcome your first guests!`], (err2, result2) =>{
                            if(err2) {console.log(err2); return}
                            if(result2.rowCount == 0)
                                sendNotification(id_user, 'Warning', `Finish the listing for ${prop.title} and you can welcome your first guests!`, `/hosting?id_property=${prop.id_property}`, 'Finish your listing');
                        });
                    } else {
                        var queryDeleteWarning = `DELETE FROM notifications WHERE id_user=$1 AND text=$2`;
                        client.query(queryDeleteWarning, [id_user, `Finish the listing for ${prop.title} and you can welcome your first guests!`], (err2, result2) =>{
                            if(err2) {console.log(err2); return}
                        });
                    }
            });
        }
    });
}

const postAuthenticate = (req, res) => {
    var form = new formidable.IncomingForm();
    
    form.parse(req, (err, text_fields) => {
        // check if all fields were completed
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
                res.render('pages/login', {msg:"E-mail address not found", createAccLink:"true"});
                return;
            }
            if(!result.rows[0].confirmed){
                res.render('pages/login', {msg:"E-mail address not confirmed, check inbox"});
                return;
            }

            bcrypt.compare(text_fields.password, result.rows[0].password, (err, compare_result) => {
                if(compare_result){ // password matches the one in the result.rows[0]base
                    if(req.session){
                        req.session.user = {
                            id_user : result.rows[0].id_user,
                            firstname : result.rows[0].firstname,
                            lastname :  result.rows[0].lastname,
                            email : result.rows[0].email,
                            phone : result.rows[0].phone,
                            join_date : result.rows[0].join_date,
                            birthday :  result.rows[0].birthday,
                            profile_picture : result.rows[0].profile_pic,
                            role: result.rows[0].role, 
                            favourites: result.rows[0].favourites
                        }
                    }

                    // send notifications
                    sendLoginNotifications(result.rows[0].id_user, result.rows[0].profile_pic, result.rows[0].role, result.rows[0].phone, result.rows[0].description);

                    if(text_fields.path) res.redirect(text_fields.path);
                    else res.redirect('/');
                }
                else{
                    res.render('pages/login', {msg:"Password is incorrect!"});
                    return;
                }
            });
        });
    });
}

const postSendResetEmail = (req, res) => {
    var form = new formidable.IncomingForm();
    
    form.parse(req, (err, text_fields) => {
        // check for input format
        if(text_fields.email.length == 0){
            res.render('pages/forgot', {msg:"Please enter an email address"});
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
}

const getResetPassword = (req, res) => {
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
}

const postUpdatePassword = (req, res) =>{
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
}

const getConfirmEmail = (req, res) => {
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
}

const getProfile = (req, res) =>{
    if(req.session && req.session.user){
        var queryGetProfile = 'SELECT * FROM users WHERE id_user=$1';
        client.query(queryGetProfile, [req.session.user.id_user], (err, result) =>{
            if(err) {console.log(err); return; }
            if(req.query.msg){
                switch(req.query.msg){
                    case "blankname":
                        res.render('pages/profile', {details: result.rows[0], msg: "First name and last name cannot be blank"});
                        break;
                    case "wrongname":
                        res.render('pages/profile', {details: result.rows[0], msg: "Name can only contain letters, dashes and spaces"});
                        break;
                    case "wrongphone":
                        res.render('pages/profile', {details: result.rows[0], msg: "Phone number format is not correct"});
                        break;
                    case "wrongbirthday":
                        res.render('pages/profile', {details: result.rows[0], msg: "Birthday is incorrect. You must be 18 to have an account"});
                        break;
                    case "incomplete":
                        res.render('pages/profile', {details: result.rows[0], msg: "All fields are required"});
                        break;
                    case "notmatched":
                        res.render('pages/profile', {details: result.rows[0], msg: "The passwords don't match"});
                        break;
                    case "tooshort":
                        res.render('pages/profile', {details: result.rows[0], msg: "The password has to be at least 8 characters long"});
                        break;
                    case "oldpass":
                        res.render('pages/profile', {details: result.rows[0], msg: "Old password is incorrect"});
                        break;
                    case "success":
                        res.render('pages/profile', {details: result.rows[0], msg: "Data updated succesfully"});
                        break;
                }
            }
            else res.render('pages/profile', {details: result.rows[0]});
        });
    }else{   // if not logged in
        res.render('pages/login',{path: `/users/profile`});
    }
}

const postEditProfile = (req, res) =>{
    var form = new formidable.IncomingForm();

    form.parse(req, (err, text_fields) =>{
        // data validation
        if(text_fields.firstname == "" || text_fields.lastname == ""){
            res.redirect('/users/profile?msg=blankname');
            return;
        }

        const re = /^([A-Za-zÀ-žăîâșțĂÎÂȘȚ\- ])+$/;
        if(!re.test(text_fields.firstname) || !re.test(text_fields.lastname)){
            res.redirect('/users/profile?msg=wrongname');
            return;
        }
        const rePhone = /^\+*([0-9#*]{8,15})$/;
        if(text_fields.phone && !rePhone.test(text_fields.phone)){
            res.redirect('/users/profile?msg=wrongphone');
            return;
        }

        if(text_fields.birthday){
            var birthday = new Date(text_fields.birthday);
            var eighteenYearsAgo = new Date();
            eighteenYearsAgo = eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear()-18);
            if(birthday > eighteenYearsAgo){
                res.redirect('/users/profile?msg=wrongbirthday');
                return;
            }
        }

        var queryUpdateProfile = `UPDATE users SET firstname=$1, lastname=$2, phone=$3, birthday=$4, description=$5 WHERE id_user=$6`;
        var paramsUpdateProfile = [text_fields.firstname, text_fields.lastname, text_fields.phone, text_fields.birthday ? text_fields.birthday : null, text_fields.description, req.session.user.id_user];
        client.query(queryUpdateProfile, paramsUpdateProfile, (err, result) =>{
            if(err) {console.log(err); return; }
            res.redirect('/users/profile?msg=success');
        });
    });
}

const postChangePassword = (req,res) =>{
    var form = new formidable.IncomingForm();

    form.parse(req, async (err, text_fields) => {

        //data validation
        if(text_fields.password_old == "" || text_fields.password == "" || text_fields.password_conf == ""){
            res.redirect('/users/profile?msg=incomplete');
            return;
        }

        if(text_fields.password != text_fields.password_conf){
            res.redirect('/users/profile?msg=notmatched');
            return;
        }

        if(text_fields.password.length < 8){
            res.redirect('/users/profile?msg=tooshort');
            return;
        }

        else{
            var queryCheckPassword = `SELECT password FROM users WHERE id_user=$1`;
            client.query(queryCheckPassword, [req.session.user.id_user],(err, result) =>{
                if(err) {console.log(err); return;}
    
                bcrypt.compare(text_fields.password_old, result.rows[0].password, async (err, compare_result) => {
                    if(compare_result){
                        // update password in db
                        const salt = await bcrypt.genSalt();
                        const hashedPassword = await bcrypt.hash(text_fields.password, salt);
                        var queryUpdatePassword = `UPDATE users SET password=$1 WHERE id_user=$2`;
                        var parametersUpdatePassword = [hashedPassword, req.session.user.id_user];
                        client.query(queryUpdatePassword, parametersUpdatePassword, (err1, result1) => {
                            if (err1){
                                console.log(err1);
                                return;
                            }
                            if(result1.rowCount > 0){
                                res.redirect('/users/profile?msg=success');
                            }
                            else{
                                res.render('pages/error');
                            }
                        });
                    } else {
                        res.redirect('/users/profile?msg=oldpass');
                    }
                });
            });
        }
    });
}

const postProfilePicture = (req, res) =>{
    var form = new formidable.IncomingForm();
    var profilePicturePath = '';

    form.parse(req, (err, text_fields) =>{
        var queryAddImage = `UPDATE users SET profile_pic=$1 WHERE id_user=$2`;
        client.query(queryAddImage, [profilePicturePath, req.session.user.id_user], (err, result) =>{
            if(err) {console.log(err); return;}
            console.log('profilePicturePath' + profilePicturePath)
            var delayInMilliseconds = 1000; //1 second
            // setTimeout(function() {
            //     if(profilePicturePath && picturesFolder)
            //         sharp(profilePicturePath).resize(200).toFile(picturesFolder + '/profile_pic-200.jpg');
                res.redirect('/users/profile');
            // }, delayInMilliseconds);
        });
    });
    form.on("fileBegin", (name, file) =>{
        if(!file.originalFilename) return;
        picturesFolder = __dirname + '/../../public/photos/users/' + req.session.user.id_user + '/';
        console.log('Pictures folder: ' + picturesFolder);
        if(!fs.existsSync(picturesFolder)){  
            fs.existsSync(picturesFolder)   // if folder for current property doesn't exist, create it
            fs.mkdirSync(picturesFolder);
        }
        extension = file.originalFilename.split('.');
        file.filepath = picturesFolder + name + '.' + extension[extension.length-1];

        profilePicturePath = `public/photos/users/${req.session.user.id_user}/${name}.${extension[extension.length-1]}`;
    });
    form.on('file', (name, file) =>{
        console.log(`Added profile picture file.`);
    })
}

const getLogout = (req, res) =>{
    req.session.destroy(); // ends the session
    // req.locals.user = null;          //// might be required
    res.redirect('/');
}

module.exports = {
    getLoginPage,
    getRegisterPage,
    getForgotPage,
    postRegisterUser,
    postAuthenticate,
    postSendResetEmail,
    getResetPassword,
    postUpdatePassword,
    getConfirmEmail,
    getProfile,
    postEditProfile,
    postChangePassword,
    postProfilePicture,
    getLogout
};