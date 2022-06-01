const { Client } = require('pg');

// database connection
const conn = require("../../public/json/connection.json");
var client = new Client(conn);
client.connect();

const getRooms = (req, res) =>{
    client.query(`SELECT * FROM rooms WHERE id_property = $1`, [req.query.id_property], (err, result) =>{
        if(err) console.log(err);
        else{
            res.status(200).json(result.rows);
        }
    });
}

const getRoom = (req, res) =>{
    client.query(`SELECT * FROM rooms WHERE id_room = $1`, [req.params.id_room], (err, result) =>{
        if(err) console.log(err);
        else{
            res.status(200).json(result.rows[0]);
        }
    });
}

const postRoom = (req, res) =>{
    const {id_property, room_type, single_beds, double_beds, bunk_beds, other} = req.body;
    queryAddRoom = `INSERT INTO rooms (id_property, room_type, single_beds, double_beds, bunk_beds, other) VALUES ($1, $2, $3, $4, $5, $6)`;
    paramsAddRoom = [id_property, room_type, single_beds, double_beds, bunk_beds, other];
    client.query(queryAddRoom, paramsAddRoom, (err, result) => {
        if(err) console.log(err);
        else res.status(201);
    })
}

const putRoom = (req, res) =>{
    const {id_property, room_type, single_beds, double_beds, bunk_beds, other} = req.body;
    queryUpdateRoom = `UPDATE rooms SET room_type=$1, single_beds=$2, double_beds=$3, bunk_beds=$4, other=$5 WHERE id_room=$6`;
    paramsUpdateRoom = [room_type, single_beds, double_beds, bunk_beds, other, req.params.id_room];
    client.query(queryUpdateRoom, paramsUpdateRoom, (err, result) =>{
        if(err) console.log(err);
        else res.status(200);
    })
}

const deleteRoom = (req, res) =>{
    client.query('DELETE FROM rooms WHERE id_room = $1', [req.params.id_room], (err, result) =>{
        if(err) console.log(err);
        else res.status(200);
    })
}

module.exports = {
    getRooms,
    getRoom,
    postRoom,
    putRoom,
    deleteRoom
}