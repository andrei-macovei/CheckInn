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
    labelPrice.innerText = `Results under: ${priceRange.value}`; 
    getResults();
})

function capitalize(string) {return string.charAt(0).toUpperCase() + string.slice(1);}

function getResults(){
    var url = `?city=${city}`;
    if(checkin) url += `&checkin=${checkin}`;
    if(checkout) url += `&checkout=${checkout}`;
    if(guests) url += `&guests=${parseInt(guests)}`;
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
        }
        if(opt.name == "price" && labelPrice.innerText[0]=='M'){
            url += `&price=${opt.value}`;
        }
    }
    console.log(`/search/results${url}`)
    fetch(`/search/results${url}`)
        .then(res => res.json())
        .then(data => {
            resultsContainer.textContent = '';
            for(result of data){
                const resultDiv = document.createElement('div');
                if(result.rating) rating = result.rating; else rating = "No rating yet";
                if(result.property_type == 'bedandbreakfast') result.property_type = 'Bed and Breakfast';
                resultDiv.innerHTML = `
                <a href="/search/result/${result.id_property}">
                <div class="search-result grid grid-cols-[1fr_3fr] border rounded-lg min-h-[200px] p-2 m-2 hover:cursor-pointer">
                    <div class="col-start-1 col-end-2 row-span-3 min-h-[200px] min-w-[200px] max-w-[220px] rounded-lg bg-slate-200 text-slate-200">
                        #IMAGE
                    </div>
                    <div class="col-start-2 row-start-1 px-4">
                        <div class="flex justify-between">
                            <h2 class="text-xl font-bold text-blue-600">
                                ${result.title}
                            </h2>
                            <p class="font-extralight">${rating}</p>
                        </div>
                        <div class="flex ">
                            <p class="text-xs mr-2">${capitalize(result.property_type)}</p>
                            <p class="text-xs mr-2">${result.guests} guests</p>
                            <p class="text-xs mr-2">${result.count} rooms</p>
                        </div>
                    </div>
                    <div class="col-start-2 row-start-2 px-4">
                        ${result.description}
                    </div>
                    <div class="col-start-2 row-start-3 justify-self-end self-end text-blue-800 px-4">
                        <div>
                            ${result.price}
                        </div>
                        <div>
                            #TOTAL_PRICE
                        </div>
                    </div>
                </div>
                </a>
                `
                resultsContainer.append(resultDiv);
            }
        });
}
