var deleteButton = document.querySelector(".btn-del");
var pressedButtonId;

deleteButton.addEventListener('click', e =>{
    pressedButtonId = but.value;
});

const sureButton = document.querySelector('#sure-btn')

sureButton.addEventListener('click', e =>{
    (async () =>{
        const rawResponse = await fetch(`/hosting/deleteProperty/${pressedButtonId}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const content = await rawResponse.json();
    })();
    location.reload(true);
});

const days = (date_1, date_2) =>{ 
    let difference = date_2.getTime() - date_1.getTime(); 
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24)); 
    return TotalDays; 
} 

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
                if(booking.status == "pending"){
                    event.title = 'Pending';
                    event.backgroundColor = '#fbbf24';
                    event.borderColor = '#2563eb';
                } else {
                    event.title = 'Confirmed';
                    event.backgroundColor = '#0ea5e9';
                    event.borderColor = '#2563eb';
                }
                var checkin = new Date(booking.checkin);
                var checkout = new Date(booking.checkout);
                event.start = checkin.setDate(checkin.getDate() + 1);
                event.end = checkout.setDate(checkin.getDate() + days(checkin, checkout) + 2);
                event.allDay = true;
                events.push(event);
            }

            // console.log(events);
            

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
