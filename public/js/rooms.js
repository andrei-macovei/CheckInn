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
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

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
                // roomDiv.classList.add("border");
                var detailsDiv = '';
                if(parseInt(room.single_beds) != 0) detailsDiv += `<p>Single beds: ${room.single_beds}</p>`;
                if(parseInt(room.double_beds) != 0) detailsDiv += `<p>Double beds: ${room.double_beds}</p>`
                if(parseInt(room.bunk_beds) != 0) detailsDiv += `<p>Bunk beds: ${room.bunk_beds}</p>`;
                if(parseInt(room.other) != 0) detailsDiv += `<p>Sofas/ Other: ${room.other}</p>`;
                roomDiv.innerHTML = `
                <div class="room border rounded-lg m-3">
                    <div class="room-title border-b flex flex-row justify-between px-4 py-2 bg-gray-100">
                        <h3 class="text-xl font-medium">${capitalize(room.room_type).split("_").join(" ")}</h3>
                    </div>
                    <div class="prop-body flex justify-between">
                        <div>
                            ${detailsDiv}
                        </div>
                        <div class="flex flex-col">
                            <button value="${room.id_room}" class="btn-del text-left focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900" type="button" data-modal-toggle="popup-modal">
                                Delete Room
                            </button>
                        </div>
                    </div>
                </div>
                `           
                roomsContainer.append(roomDiv);
                var deleteButtons = document.querySelectorAll(".btn-del");
                deleteButtons.forEach(function(but){
                    but.addEventListener('click', e =>{
                        (async () =>{
                            const rawResponse = await fetch(`/hosting/rooms/${but.value}`, {
                                    method: "DELETE",
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                });
                                const content = await rawResponse.json();
                            })();
                            // REMOVE FROM DOM
                            roomDiv1 = but.parentElement.parentElement.parentElement;
                            roomDiv1.parentElement.removeChild(roomDiv1);
                    });
                });
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