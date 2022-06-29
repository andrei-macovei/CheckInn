const formidable = require('formidable')
const { Client } = require('pg');
const sharp = require('sharp');

const {sendNotification} = require("../controllers/notificationsController");

// database connection
const conn = require("../../public/json/connection.json");
var client = new Client(conn);
client.connect();

const getAdminDashboard = (req, res) =>{
    if(req.session && req.session.user && req.session.user.role == 'admin'){
        // get image carousel info
        client.query('SELECT * FROM destinations', (err, result)=>{
            if(err) {console.log(err); return;}
            
            if(req.query.err == 'fieldsRequired') res.render('pages/adminDashboard', {destinations: result.rows, err: 'All fields are required!'});
            else if(req.query.success == 'true') res.render('pages/adminDashboard', {destinations: result.rows, err: 'Promoted destinations changed successfully!'});
            else res.render('pages/adminDashboard', {destinations: result.rows});
        });
    } else {    
        res.render('pages/403');
    }
}

const getUsersManagement = (req, res) =>{
    if(req.session && req.session.user && req.session.user.role == 'admin'){
        var queryGetUsers = `SELECT id_user, email, firstname, lastname, role FROM users WHERE role != 'admin'`;
        client.query(queryGetUsers, (err, result) =>{
            if(err) { console.log(err); return}
            res.render('pages/adminUsersManagement', {
                users: result.rows
            });
        });
    } else {    
        res.render('pages/403');
    }
}

const postDestinations = (req, res) =>{
    if(req.session && req.session.user && req.session.user.role == 'admin'){
        var form = new formidable.IncomingForm();
        var images_path = new Object;

        form.parse(req, (err, text_fields) =>{
            if(err) console.log(err);

            // data validation
            if(text_fields.title_1 == '' || text_fields.title_2 == '' || text_fields.title_3 == '' 
            || text_fields.desc_1 == '' || text_fields.desc_2 == '' || text_fields.desc_3 == ''){
                res.redirect('/admin?err=fieldsRequired');
                return;
            }

            var queryUpdateDestinations = `UPDATE destinations SET title=$1, description=$2 WHERE id_destination=$3`;
            
            client.query(queryUpdateDestinations, [text_fields.title_1, text_fields.desc_1, 1], (err, result) =>{
                if(err) {console.log(err); return;}
            });
            client.query(queryUpdateDestinations, [text_fields.title_2, text_fields.desc_2, 2], (err, result) =>{
                if(err) {console.log(err); return;}
            });
            client.query(queryUpdateDestinations, [text_fields.title_3, text_fields.desc_3, 3], (err, result) =>{
                if(err) {console.log(err); return;}
            });

            res.redirect('/admin?success=true');
        });
        form.on("fileBegin", (name, file) =>{
            if(!file.originalFilename) return;
            destinationsFolder = __dirname + '/../../public/photos/general/Home Page/Destinations/';
            extension = file.originalFilename.split('.');
            file.filepath = destinationsFolder + name + '.' + extension[extension.length-1];
            
            var delayInMilliseconds = 1000; //1 second
            setTimeout(function() {
            pic_name = name + '.' + extension[extension.length-1];
            console.log(pic_name);
            switch(name){
                case 'destination1':
                    client.query('UPDATE destinations SET picture=$1 WHERE id_destination=1', [pic_name], (err, result) =>{
                        if(err) {console.log(err); return;}
                    
                        sharp(`${__dirname}/../../public/photos/general/Home Page/Destinations/destination1.jpg`).resize(1400).toFile(`${destinationsFolder}/destination1-1400.jpg`);
                    
                    });
                    break;
                case 'destination2':
                    client.query('UPDATE destinations SET picture=$1 WHERE id_destination=2', [pic_name], (err, result) =>{
                        if(err) {console.log(err); return;}

                        sharp(`${__dirname}/../../public/photos/general/Home Page/Destinations/destination2.jpg`).resize(1400).toFile(`${destinationsFolder}/destination2-1400.jpg`);
                    
                    });
                    break;
                case 'destination3':
                    client.query('UPDATE destinations SET picture=$1 WHERE id_destination=3', [pic_name], (err, result) =>{
                        if(err) {console.log(err); return;}
                        
                        sharp(`${__dirname}/../../public/photos/general/Home Page/Destinations/destination3.jpg`).resize(1400).toFile(`${destinationsFolder}/destination3-1400.jpg`);
                        
                    });
                    break;
            }
            }, delayInMilliseconds);

        });
        form.on('file', (name, file) =>{
            console.log(`Added file.`);
        })
    } else {    
        res.render('pages/403');
    }    
}

const postBackground = (req, res) =>{
    if(req.session && req.session.user && req.session.user.role == 'admin'){
        var form = new formidable.IncomingForm();

        form.parse(req, (err, text_fields) => {});
        form.on("fileBegin", (name, file) =>{
            if(!file.originalFilename) return;
            backgroundFolder = __dirname + '/../../public/photos/general/';
            console.log(backgroundFolder)
            extension = file.originalFilename.split('.');
            file.filepath = backgroundFolder + name + '.' + extension[extension.length-1];
            pic_name = name + '.' + extension[extension.length-1];
            console.log(pic_name);

            client.query('UPDATE global_settings SET background=$1 WHERE id_settings=1', [pic_name], (err, result) =>{
                if(err) {console.log(err); return;}
            });
        });
        form.on('file', (name, file) =>{
            console.log(`Added file.`);
        });

        res.redirect('/admin?success=true'); 
    } else {
        res.render('pages/403');
    }
}

const postSendNotification = (req, res)=>{
    // :id_user
    if(req.session && req.session.user && req.session.user.role == 'admin'){
        var form = new formidable.IncomingForm();

        form.parse(req, (err, text_fields) => {
            if(err) {console.log(err); return;}

            var action = '', action_name = '';
            switch(text_fields.action){
                case 'profile':
                    action = '/users/profile';
                    action_name = "Review Profile";
                    break;
                case 'details':
                    action = '/hosting';
                    action_name = "Review Property Details";
                    break;
                case 'photos':
                    action = '/hosting';
                    action_name = "Review Property Photos";
                    break;
                case 'rules':
                    action = '/hosting';
                    action_name = "Review Property Rules";
                    break;
                case 'change_password':
                    action = '/users/profile';
                    action_name = "Change your password";
                    break;
                case 'none':
                    action = '/';
                    action_name = "Homepage";
                    break;
            }

            sendNotification(req.params.id_user, 'Admin message', text_fields.text, action, action_name);

            res.redirect('/admin/manageUsers');
        });
    } else {
        res.render('pages/403');
    }
}

const deleteUser = (req, res) =>{
    //:id_user
    var queryDeleteUser = `DELETE FROM users WHERE id_user=$1`;
    client.query(queryDeleteUser, [req.params.id_user], (err, result) =>{
        if(err) {console.log(err); return;}
        res.redirect('/admin/manageUsers');
    })
}

module.exports = { getAdminDashboard, getUsersManagement, postDestinations, postBackground, postSendNotification, deleteUser };