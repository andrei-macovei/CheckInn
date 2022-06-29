const { Client } = require('pg');

// database connection
const conn = require("../../public/json/connection.json");
var client = new Client(conn);
client.connect();

const postAddress = (req, res) =>{
    var {id_property, street_and_number, neighbourhood, city, region, country, postal_code, lat, lng} = req.body;

    if(!country || !street_and_number || !city || !lat || !lng){
        res.status(500);
        return;
    }
    if(req.body.country && req.body.city && req.body.street_and_number){
        queryAddAddress = `INSERT INTO address (id_property, street_and_number, neighbourhood, city, region, country, postal_code, lat, lng) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
        // removes diacritics and special characters
        if(street_and_number) street_and_number = street_and_number.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if(neighbourhood) neighbourhood = neighbourhood.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if(city) city = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if(region) region = region.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if(country) country = country.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        paramsAddAddress = [id_property, street_and_number, neighbourhood, city, region, country, postal_code, lat, lng];
        client.query(queryAddAddress, paramsAddAddress, (err, result) => {
            if(err) console.log(err);
            else res.status(201);
        })
    }
}

const putAddress = (req, res) =>{
    var {id_property, street_and_number, neighbourhood, city, region, country, postal_code, lat, lng} = req.body;
    // removes diacritics and special characters
    if(street_and_number) street_and_number = street_and_number.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if(neighbourhood) neighbourhood = neighbourhood.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if(city) city = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if(region) region = region.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if(country) country = country.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    queryUpdateAddress = `UPDATE address SET street_and_number=$1, neighbourhood=$2, city=$3, region=$4, country=$5, postal_code=$6, lat=$7, lng=$8 WHERE id_property=$9`;
    paramsUpdateAddress = [street_and_number, neighbourhood, city, region, country, postal_code, lat, lng, id_property];
    client.query(queryUpdateAddress, paramsUpdateAddress, (err, result) =>{
        if(err) console.log(err);
        else res.status(200).send(`{"message": "Address modified succesfully"}`);
    });
}

const deleteProperty = (req, res) =>{
    client.query('DELETE FROM properties WHERE id_property = $1', [req.params.id_property], (err, result) =>{
        if(err) console.log(err);
        else res.status(200);
    })
}

module.exports = {
    postAddress,
    putAddress,
    deleteProperty
}