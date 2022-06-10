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
                <p> ${pricePerNight.innerText} x ${nights} nights </p>
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

// Favourite toggle
var checkbox = document.querySelector('#custom-checkbox-input');
var heart = document.querySelector('#heart');
var heartText = document.querySelector('#heart-text');

checkbox.addEventListener('change', (e) =>{
    if(checkbox.checked){
        console.log("Favourite added");
        heart.classList.remove("hover:text-gray-500", "hover:scale-125", "text-gray-300");
        heart.classList.add("scale-125", "text-red-500", "hover:scale-100", "hover:text-gray-500");
        // heartText.innerText = "Favourite added!"
        heartText.classList.remove("text-gray-300");
        heartText.classList.add("text-red-500");
    } 
    else{
        console.log("Favourite removed");
        heart.classList.remove("scale-125", "text-red-500", "hover:scale-100", "hover:text-gray-500");
        heart.classList.add("hover:text-gray-500", "hover:scale-125", "text-gray-300");
        heartText.classList.add("text-gray-300");
        heartText.classList.remove("text-red-500");
    }
})

// Calendar
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var id_property = document.getElementById('id_property').value;

    fetch(`/booking/${id_property}`)
        .then(res => res.json())
        .then(data => {
            var events = new Array();
            for(booking of data){
                var event = new Object;
                event.id = booking.id_booking;
                event.title = 'Booked';
                event.start = booking.checkin;
                event.end = booking.checkout;
                event.allDay = true;
                event.backgroundColor = '#0ea5e9';
                event.borderColor = '#2563eb';
                events.push(event);
            }

            console.log(events);
            

            var calendar = new FullCalendar.Calendar(calendarEl, {
                timeZone: 'UTC',
                initialView: 'dayGridMonth',
                events: events,
                editable: false,
                selectable: false,
            });
            
            // events = [];
            calendar.render();
            
        });
  });