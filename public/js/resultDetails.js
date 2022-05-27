const moreAmenitiesButton = document.querySelector('#show-more-amenities-btn');
var amenitiesDivs = document.querySelectorAll('.amenity');
console.log(amenitiesDivs)

moreAmenitiesButton.addEventListener('click', e=>{
    amenitiesDivs.forEach(function(amen){
        amen.classList.remove('hidden');
    })
    moreAmenitiesButton.classList.add('hidden');
})