const formidable = require('formidable')
const { Client } = require('pg');

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
        var queryGetUsers = `SELECT email, firstname, lastname, role FROM users WHERE role != 'admin'`;
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
            console.log('pic')
            extension = file.originalFilename.split('.');
            file.filepath = destinationsFolder + name + '.' + extension[extension.length-1];
            pic_name = name + '.' + extension[extension.length-1];
            console.log(pic_name);

            switch(name){
                case 'destination1':
                    client.query('UPDATE destinations SET picture=$1 WHERE id_destination=1', [pic_name], (err, result) =>{
                        if(err) {console.log(err); return;}
                    });
                    break;
                case 'destination2':
                    client.query('UPDATE destinations SET picture=$1 WHERE id_destination=2', [pic_name], (err, result) =>{
                        if(err) {console.log(err); return;}
                    });
                    break;
                case 'destination3':
                    client.query('UPDATE destinations SET picture=$1 WHERE id_destination=3', [pic_name], (err, result) =>{
                        if(err) {console.log(err); return;}
                    });
                    break;
            }
        });
        form.on('file', (name, file) =>{
            console.log(`Added file.`);
        })
    } else {    
        res.render('pages/403');
    }    
}

module.exports = { getAdminDashboard, getUsersManagement, postDestinations };