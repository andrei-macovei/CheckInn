// GET
// fetch('/hosting/rooms')
//     .then(res => res.json())
//     .then(data => console.log(data))

// // POST
// (async () =>{
// const rawResponse = await fetch('/hosting/rooms', {
//         method: "POST",
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             id_property: 5,
//             room_type: "bedroom",
//             single_beds: 1,
//             double_beds: 1,
//             bunk_beds: 0,
//             other: 0
//         })
//     });
//     const content = await rawResponse.json();
// })();
//     // .then(res => res.json())
//     // .then(data => console.log(data))

window.onload = () => {
    const roomModal = document.querySelector('#roomModal');
    const addRoomButton = roomModal.querySelector('#addRoomButton');

    const id_property = roomModal.querySelector('#id_property_inp');
    const room_type = roomModal.querySelector('#room_types');
    const single = roomModal.querySelector('#single');
    const double = roomModal.querySelector('#double');
    const bunk = roomModal.querySelector('#bunk');
    const other = roomModal.querySelector('#other');
    const roomsContainer = document.querySelector('#rooms-container');

    function getRooms(){
        fetch(`/hosting/rooms/?id_property=${id_property.value}`)
        .then(res => res.json())
        .then(data => {
            roomsContainer.textContent = '';
            for(room of data){
                const roomDiv = document.createElement('div');
                roomDiv.classList.add("border");
                roomDiv.innerHTML = `
                    <p> ${room.id_room} </p>
                    <p> ${room.room_type} </p>
                `
                roomsContainer.append(roomDiv);
            }
        })
    }

    getRooms();

    // Pressing confirm room details - ADD ROOM
    addRoomButton.addEventListener('click', e =>{
        (async () =>{
            const rawResponse = await fetch('/hosting/rooms', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id_property: id_property.value,
                        room_type: room_type.value,
                        single_beds: single.value,
                        double_beds: double.value,
                        bunk_beds: bunk.value,
                        other: other.value
                    })
                });
                const content = await rawResponse.json();
            })();
        getRooms();
    })
}