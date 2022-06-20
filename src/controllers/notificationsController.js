const formidable = require('formidable')
const { Client } = require('pg');

// database connection
const conn = require("../../public/json/connection.json");
var client = new Client(conn);
client.connect();

const getNotificationsPage = (req, res) =>{
    var queryGetNotifications = `SELECT * FROM notifications WHERE id_user=$1`;
    client.query(queryGetNotifications, [req.session.user.id_user], (err, result) =>{
        if(err) {console.log(err); return;}
        res.render('pages/notifications', {notifications: result.rows});
    })
}

function sendNotification(id_user, type, text, action, action_name){
    var queryAddNotification = `INSERT INTO notifications (id_user, type, text, action, action_name) VALUES ($1, $2, $3, $4, $5)`;
    var paramsAddNotification = [id_user, type, text, action, action_name];
    client.query(queryAddNotification,paramsAddNotification, (err, result) =>{
        if(err) {console.log(err); return;}
        console.log("Notification sent to user with id = " + id_user);
    })
}

module.exports = { getNotificationsPage, sendNotification };