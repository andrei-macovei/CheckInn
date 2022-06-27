const formidable = require('formidable')
const { Client } = require('pg');

// database connection
const conn = require("../../public/json/connection.json");
var client = new Client(conn);
client.connect();

const getNotificationsPage = (req, res) =>{
    // new notifications
    var queryGetNotifications = `SELECT * FROM notifications WHERE id_user=$1 AND type != 'Suggestion' AND type != 'Warning' AND viewed=false`;
    client.query(queryGetNotifications, [req.session.user.id_user], (err, result) =>{
        if(err) {console.log(err); return;}
        // warnings and suggestions
        var queryGetWarnings = `SELECT * FROM notifications WHERE id_user=$1 AND (type= 'Suggestion' OR type='Warning')`;
        client.query(queryGetWarnings, [req.session.user.id_user], (err1, result1) =>{
            if(err1) {console.log(err1); return;}
            // older notifications
            var queryGetOldNotifications = `SELECT * FROM notifications WHERE id_user=$1 AND type != 'Suggestion' AND type != 'Warning' AND viewed=true LIMIT 10`;
            client.query(queryGetOldNotifications, [req.session.user.id_user], (err2, result2) =>{
                if(err2) {console.log(err2); return;}
                res.render('pages/notifications', {
                    notifications: result.rows,
                    warnings: result1.rows,
                    oldNotifications: result2.rows
                });

                // set loaded notifications as viewed
                var queryViewNotifications = `UPDATE notifications SET viewed=true WHERE id_user=$1 AND type != 'Suggestion' AND type != 'Warning' AND viewed=false`;
                client.query(queryViewNotifications, [req.session.user.id_user], (err3, result3) =>{
                    if(err3) {console.log(err3); return;}
                })
            })
        })
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