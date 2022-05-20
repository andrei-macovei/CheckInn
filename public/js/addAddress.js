const countryInp = document.querySelector('#country-inp');
const cityInp = document.querySelector('#city-inp');
const streetInp = document.querySelector('#street-inp');
const addAddressBtn = document.querySelector('#add-address-btn');
const latitude = document.querySelector('#latitude');
const longitude = document.querySelector('#longitude');

var map;
var marker;
var addressExists; // 1 if it exists in db, 0 if not

if(latitude.textContent == "" || longitude.textContent == "") addressExists = 0;
else addressExists = 1;

function initMap(){
    var options;
    // if coordinates are not already in DB
    if(addressExists==0){
        options = {
            zoom: 6,
            center: {lat: 45, lng: 27}
        }
    }else{
        // if coordinates found in DB
        var addressCoords = new google.maps.LatLng(parseFloat(latitude.textContent), parseFloat(longitude.textContent));
        // const addressCoords = {lat: 44.4199725, lng: 26.0408733};
        options = {
            zoom: 11,
            center: addressCoords,
        }
    }

    marker = new google.maps.Marker({
        position: addressCoords,
        map
    });

    map = new google.maps.Map(document.querySelector('#map'), options);
    if(addressExists == 1) marker.setMap(map);
}

function geocode(location){
    // var location = "Aleea Compozitorilor 16, Bucuresti, Romania";
    var address = location.split(' ').join('+');

    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyCQy7k2Ww3zcmNYGGkCLGw84z3XAnqqpnY`)
    .then(res => res.json())
        .then(data => {
            // get latitude and longitude to show on map and add in db
            console.log(data.results[0]);
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            var coords = new google.maps.LatLng(lat, lng);

            var addressComponents = data.results[0].address_components;
            var street_address = "";
            var street_number = "";
            var route = "";
            console.log(addressComponents[0].types);
            // searches through response for elements we want to insert in db
            for(var i = 0; i < addressComponents.length; i++){
                for(var j = 0; j < addressComponents[i].types.length; j++){
                    if(addressComponents[i].types[j] == 'postal_code')
                        var postal_code = addressComponents[i].long_name;
                    if(addressComponents[i].types[j] == 'street_number')
                        street_number = addressComponents[i].long_name;
                    if(addressComponents[i].types[j] == 'street_address')
                        street_address = addressComponents[i].long_name;
                    if(addressComponents[i].types[j] == 'route')
                        route = addressComponents[i].long_name;
                    if(addressComponents[i].types[j] == 'neighborhood')
                        var neighborhood = addressComponents[i].long_name;
                    if(addressComponents[i].types[j] == 'locality')
                        var locality = addressComponents[i].long_name;
                    if(addressComponents[i].types[j] == 'region')
                        var region = addressComponents[i].long_name;
                    if(addressComponents[i].types[j] == 'country')
                        var country = addressComponents[i].long_name;
                }
            }
            var streetAndNumber;
            if(street_address == "") streetAndNumber = route + " " + street_number;
            else streetAndNumber = street_address;
            // add to DB
            if(addressExists == 0){     // if address isn't already in DB, POST
                (async () =>{
                    const rawResponse = await fetch('/hosting/addAddress', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id_property: document.querySelector('#id_property').textContent,
                            street_and_number: streetAndNumber,
                            neighbourhood: neighborhood,
                            city: locality,
                            region: region,
                            country: country,
                            postal_code: postal_code,
                            lat: lat,
                            lng: lng
                        })
                    });
                    const content = await rawResponse.json();
                })();
            } else {    // if address was already in DB, PUT
                (async () =>{
                    const rawResponse = await fetch('/hosting/addAddress', {
                        method: "PUT",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id_property: document.querySelector('#id_property').textContent,
                            street_and_number: streetAndNumber,
                            neighbourhood: neighborhood,
                            city: locality,
                            region: region,
                            country: country,
                            postal_code: postal_code,
                            lat: lat,
                            lng: lng
                        })
                    });
                    const content = await rawResponse.json();
                })();
            }
            // refreshes map
            map.setCenter(coords);
            marker.setPosition(coords); 
        })
}

addAddressBtn.addEventListener('click', e =>{
    var location = streetInp.value + " " + cityInp.value + " " + countryInp.value;
    console.log('Location:' + location);
    geocode(location);  // updates DB and shows marker on map
})
