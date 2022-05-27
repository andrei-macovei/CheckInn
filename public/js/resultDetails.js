const moreAmenitiesButton = document.querySelector('#show-more-amenities-btn');
var amenitiesDivs = document.querySelectorAll('.amenity');
const bookingButton = document.querySelector('#booking-btn');
const bookingInputs = document.querySelectorAll('.calcPrice');

// Show More amenities button functionality
moreAmenitiesButton.addEventListener('click', e=>{
    amenitiesDivs.forEach(function(amen){
        amen.classList.remove('hidden');
    })
    moreAmenitiesButton.classList.add('hidden');
})

// calculate dynamically booking price
const guestsInp = document.querySelector('#guests-inp');
const checkinInp = document.querySelector('#checkin-inp');
const checkoutInp = document.querySelector('#checkout-inp');
const pricePerNight = document.querySelector('#flat-price');
const weekDiscount = document.querySelector('#week-discount');
const guestsDiscount = document.querySelector('#guests-discount');
const propertyGuests = document.querySelector('#guests_nr');
const divPriceCalc = document.querySelector('#price-calc');

// https://linuxhint.com/calculate-days-between-two-dates-javascript/
const days = (date_1, date_2) =>{
    let difference = date_1.getTime() - date_2.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
}

bookingInputs.forEach(function(opt){
    opt.addEventListener('focusout', e =>{
        var dates = [];
        if(checkinInp.value && checkoutInp.value){
            for(d of [checkinInp.value, checkoutInp.value]){
                let dateArr = d.split('/');
                let day = parseInt(dateArr[1]);
                let month = parseInt(dateArr[0]);
                let year = parseInt(dateArr[2]);
                let dbDate = new Date(year, month-1, day);
                dates.push(dbDate);
            }
            if(dates[0] < dates[1]){
                var nights = days(dates[1], dates[0]);
                var guestsDiscount_calculated = 0;
                var weekDiscount_calculated = 0;

                var guests_difference = parseInt(propertyGuests.innerText) - parseInt(guestsInp.value);
                if(guests_difference > 0 && parseInt(guestsDiscount.textContent) > 0){
                    guestsDiscount_calculated = guests_difference * parseFloat(guestsDiscount.textContent);
                }
                if(nights >= 7){
                    weekDiscount_calculated = Math.floor(nights/7) * parseFloat(weekDiscount.textContent);
                }

                divPriceCalc.innerHTML = '';

                const priceTimesNights = document.createElement('div');
                priceTimesNights.innerHTML = `
                <p> ${pricePerNight.innerText}€ x ${nights} nights </p>
                <p> ${parseFloat(pricePerNight.innerText)*nights}€ </p>
                `;
                priceTimesNights.classList.add('flex', 'flex-row', 'justify-between', 'p-4');
                divPriceCalc.append(priceTimesNights);
                divPriceCalc.classList.add('border-t');

                if(weekDiscount_calculated > 0){
                    const weekDiscountDiv = document.createElement('div');
                    weekDiscountDiv.innerHTML = `
                    <p> Long stay discount  </p>
                    <p> ${weekDiscount_calculated}€ </p>
                    `;
                    weekDiscountDiv.classList.add('flex', 'flex-row', 'justify-between', 'p-4');
                    divPriceCalc.append(weekDiscountDiv);
                }
                if(guestsDiscount_calculated > 0){
                    const guestsDiscountDiv = document.createElement('div');
                    guestsDiscountDiv.innerHTML = `
                    <p> Fewer guests discount </p>
                    <p class="text-green-400"> ${guestsDiscount_calculated}€ </p>
                    `;
                    guestsDiscountDiv.classList.add('flex', 'flex-row', 'justify-between', 'p-4');
                    divPriceCalc.append(guestsDiscountDiv);
                }
                const totalPriceDiv = document.createElement('div');
                totalPriceDiv.innerHTML = `
                <p class="font-bold"> Total </p>
                <p class="font-bold"> ${parseFloat(pricePerNight.innerText)*nights - guestsDiscount_calculated - weekDiscount_calculated}€ </p>
                `;
                const bookingForm = document.querySelector('#booking-form');
                bookingForm.action = `/booking/add/${parseFloat(pricePerNight.innerText)*nights - guestsDiscount_calculated - weekDiscount_calculated}`;
                console.log(bookingForm.action);

                totalPriceDiv.classList.add('flex', 'flex-row', 'justify-between', 'p-4', 'border-t');
                divPriceCalc.append(totalPriceDiv);
            }
        }
    });
});