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
                event.start = checkin;
                var checkout = new Date(booking.checkout);
                event.end = checkout.setDate( checkout.getDate() + 1);
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
