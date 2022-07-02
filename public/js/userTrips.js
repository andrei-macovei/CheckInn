// Calendar
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    fetch(`/booking/user`)
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

            // document.querySelector('.fc-next-button').click();
            // document.querySelector('.fc-prev-button').click();
            
        });
});