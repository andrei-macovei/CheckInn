var filterOptions = document.querySelectorAll('.to-filter');
const priceRange = document.querySelector('#price-range');
var labelPrice = document.querySelector('#label-price');
const resultsContainer = document.querySelector('#results-container');
const city = document.querySelector('#inp-city').value;
const checkin = document.querySelector('#inp-checkin').value;
const checkout = document.querySelector('#inp-checkout').value;
const guests = document.querySelector('#inp-guests').value;
const moreAmenitiesButton = document.querySelector('#more-amenities-btn');
var amenitiesDivs = document.querySelectorAll('.amenity');
const orderButtons = document.querySelectorAll(".order-btn");
const pressedButtonInfo = document.querySelector('#order-btn-pressed');
const sortOrderButton = document.querySelector('#sort-order-btn');
const favouritesInp = document.querySelectorAll('.fav');

var favouritesArr = [];
favouritesInp.forEach(function(fav){
    favouritesArr.push(fav.value);
});

console.log(favouritesArr);
getResults();

moreAmenitiesButton.addEventListener('click', e=>{
    amenitiesDivs.forEach(function(amen){
        amen.classList.remove('hidden');
    })
    moreAmenitiesButton.classList.add('hidden');
})

filterOptions.forEach(function(opt){
    opt.addEventListener('change', e =>{
        getResults();
    });
});

priceRange.addEventListener('change', e=>{
    labelPrice.innerText = `Results under: ${priceRange.value}€/night`; 
    getResults();
})

function capitalize(string) {return string.charAt(0).toUpperCase() + string.slice(1);}

// Sort buttons functionality

orderButtons.forEach(function(but){
    but.addEventListener('click', e=>{
        pressedButtonInfo.value = but.value;
        orderButtons.forEach(function(but){
            if(pressedButtonInfo.value != but.value){
                but.classList.add('bg-sky-50', 'text-sky-500', 'border-sky-500');
                but.classList.remove('bg-sky-500', 'text-sky-50', 'border-sky-300')
            }
        });
        but.classList.remove('bg-sky-50', 'text-sky-500', 'border-sky-500');
        but.classList.add('bg-sky-500', 'text-sky-50', 'border-sky-300');
        getResults();
    });
});

sortOrderButton.addEventListener('click', e=>{
    console.log("click")
    if(sortOrderButton.value == 'low'){
        sortOrderButton.innerHTML = 'High first <i class="fa-solid fa-angle-up"></i>';
        sortOrderButton.value = 'high';
    } else{
        sortOrderButton.innerHTML = 'Low first <i class="fa-solid fa-angle-down"></i>';
        sortOrderButton.value = 'low';
    }
    getResults();
});


function getResults(){
    var url = `?`;
    if(city) url += `city=${city}`;
    if(checkin) url += `&checkin=${checkin}`;
    if(checkout) url += `&checkout=${checkout}`;
    if(guests) url += `&guests=${parseInt(guests)}`;
    if(pressedButtonInfo.value != 'default') url += `&order=${pressedButtonInfo.value}`;
    if(sortOrderButton.value == 'high') url +=`&sortOrder=high`;

    if(checkin && checkout && guests){
        var totalPrice = `
        <div class="">
            
        </div>`
    }

    for (let opt of filterOptions){
        if (opt.checked){
            console.log(opt);
            if(opt.name == "rules"){
                // rule == true
                url += `&rules=${opt.value}`;
            }
            if(opt.name == "rating"){
                // rule >= value
                url += `&rating=${opt.value}`;
            }
            if(opt.name == "amenities"){
                // rule == true
                url += `&amenities=${opt.value}`;
            }
            if(opt.name == "rooms"){
                // rule == value
                url += `&rooms=${opt.value}`;
            }
            if(opt.name == "property_type"){
                // rule == true
                url += `&property_type=${opt.value}`;
            }
        }
        if(opt.name == "price" && labelPrice.innerText[0]=='R'){
            url += `&price=${opt.value}`;
        }
    }

    fetch(`/search/results${url}`)
        .then(res => res.json())
        .then(data => {
            console.log("Get results called");
            resultsContainer.textContent = '';
            for(result of data){
                const resultDiv = document.createElement('div');
                var propertyImage = '';
                if(result.rating) rating = result.rating + ' <i class="fa-solid fa-star text-yellow-400"></i>'; else rating = "No rating yet";
                if(result.property_type == 'bedandbreakfast') result.property_type = 'Bed and Breakfast';
                if(result.big_picture){
                    propertyImage = `<img src="../../${result.big_picture}" class="col-start-1 col-end-2 row-span-3 min-h-[200px] min-w-[200px] max-w-[220px] rounded-lg bg-slate-200 text-slate-200">`;
                } else {
                    propertyImage = `<div class="col-start-1 col-end-2 row-span-3 min-h-[200px] min-w-[200px] max-w-[220px] rounded-lg bg-slate-200 text-slate-200">
                        #IMAGE
                        </div>`;
                }

                var favourite = '';
                // if user is logged in (and is not an admin)
                if(document.querySelector('#dropdownUserOptions')){
                    // console.log("id_property " + result.id_property)
                    // console.log("favs " + favouritesArr)
                    if(favouritesArr.includes(result.id_property)){
                        favourite = `<label class="favourite self-end">
                        <input type="hidden" name="favourite" value="False"/>
                        <input class="custom-checkbox-input hidden scale-125 hover:text-gray-500 hover:scale-100" name="favourite" value="${result.id_property}" type="checkbox" checked>
                        <i class="heart fa-solid fa-heart fa-xl p-4 scale-125 text-red-500 hover:scale-100 hover:text-gray-500"></i>
                        </label>`;
                    } else{
                    favourite = `<label class="favourite self-end">
                    <input type="hidden" name="favourite" value="False"/>
                    <input class="custom-checkbox-input hidden scale-125 hover-text-gray-500 hover:scale-100" name="favourite" value="${result.id_property}" type="checkbox">
                    <i class="heart fa-solid fa-heart text-gray-300 fa-xl hover:text-gray-500 hover:scale-125 p-4"></i>
                    </label>`;
                    }
                }

                resultDiv.innerHTML = `
                <a href="/search/result/${result.id_property}">
                <div class="search-result grid grid-cols-[1fr_3fr] bg-slate-100 border border-gray-300 rounded-lg min-h-[200px] p-2 m-2 hover:cursor-pointer">
                    ${propertyImage}
                    <div class="col-start-2 row-start-1 px-4">
                        <div class="flex justify-between">
                            <h2 class="text-xl font-bold text-sky-500">
                                ${result.title}
                            </h2>
                            <div class="flex flex-col">
                                <p class="font-extralight">${rating}</p>
                                
                            </div>
                        </div>
                        <div class="flex justify-between">
                            <div class="flex">
                                <p class="text-xs mr-2">${capitalize(result.property_type)}</p>
                                <p class="text-xs mr-2">${result.guests} guests</p>
                                <p class="text-xs mr-2">${result.count} rooms</p>
                            </div>
                            <div>
                                ${favourite}
                            </div>
                        </div>
                    </div>
                    <div class="col-start-2 row-start-2 px-6">
                        ${result.description}
                    </div>
                    <div class="col-start-2 row-start-3 justify-self-end self-end text-sky-500 p-4">
                        <div class="font-semibold text-lg">
                            ${result.price}€/night
                        </div>
                        <div class="hidden">
                            #TOTAL_PRICE
                        </div>
                    </div>
                </div>
                </a>
                `
                resultsContainer.append(resultDiv);
            }

            // Favourite buttons
            favCheckboxes = document.querySelectorAll(".custom-checkbox-input");
            favCheckboxes.forEach(function(checkbox){
                checkbox.addEventListener('change', e =>{

                    heart = checkbox.parentElement.querySelector('.heart');
                    if(checkbox.checked){
                        (async () =>{
                            const rawResponse = await fetch(`/favourites/add/${checkbox.value}`, {
                                method: "POST",
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                            });
                            const content = await rawResponse.json();

                        })();
                        console.log("Favourite added");
                        heart.classList.remove("hover:text-gray-500", "hover:scale-125", "text-gray-300");
                        heart.classList.add("scale-125", "text-red-500", "hover:scale-100", "hover:text-gray-500");
                        console.log(checkbox.parentElement);
                        // heartText.innerText = "Favourite added!"
                        // heartText.classList.remove("text-gray-300");
                        // heartText.classList.add("text-red-500");
                    }
                    else{
                        (async () =>{
                            const rawResponse = await fetch(`/favourites/delete/${checkbox.value}`, {
                                method: "DELETE",
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                            });
                            const content = await rawResponse.json();
                        })();
                        console.log("Favourite removed");
                        heart.classList.remove("scale-125", "text-red-500", "hover:scale-100", "hover:text-gray-500");
                        heart.classList.add("hover:text-gray-500", "hover:scale-125", "text-gray-300");
                        // heartText.classList.add("text-gray-300");
                        // heartText.classList.remove("text-red-500");
                    }
                });
            });
        });
}

