const formidable = require('formidable')
const { Client } = require('pg');

// database connection
const conn = require("../../public/json/connection.json");
var client = new Client(conn);
client.connect();

const getAdminDashboard = (req, res) =>{
    if(req.session && req.session.user && req.session.user.role == 'admin'){
        res.render('pages/adminDashboard');
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

module.exports = { getAdminDashboard, getUsersManagement };