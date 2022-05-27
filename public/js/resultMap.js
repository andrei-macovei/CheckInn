const lat = parseFloat(document.querySelector('#map-lat').textContent);
const lng = parseFloat(document.querySelector('#map-lng').textContent);
console.log(lat, lng);

function initMap(){
    var options;
    var addressCoords = new google.maps.LatLng(lat, lng);
    options = {
        zoom: 11,
        center: addressCoords,
    }
    var marker = new google.maps.Marker({
        position: addressCoords,
        map
    });

    var map = new google.maps.Map(document.querySelector('#map'), options);
    marker.setMap(map);
}