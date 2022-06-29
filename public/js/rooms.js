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
                var pictogramsDiv = '';
                if(parseInt(room.single_beds) != 0) detailsDiv += `<p>Single beds: ${room.single_beds}</p>`;
                if(parseInt(room.double_beds) != 0) detailsDiv += `<p>Double beds: ${room.double_beds}</p>`
                if(parseInt(room.bunk_beds) != 0) detailsDiv += `<p>Bunk beds: ${room.bunk_beds}</p>`;
                if(parseInt(room.other) != 0) detailsDiv += `<p>Sofas/ Other: ${room.other}</p>`;

                for(i = 0; i < room.single_beds; i++){
                    pictogramsDiv += `<i class="fa-solid fa-bed m-2"></i>`;
                }
                for(i = 0; i < room.double_beds; i++){
                    pictogramsDiv += `<i class="fa-solid fa-bed m-2"></i>`;
                }
                for(i = 0; i < room.bunk_beds; i++){
                    pictogramsDiv += `<i class="fa-solid fa-bed m-2"></i>`;
                }
                for(i = 0; i < room.other; i++){
                    pictogramsDiv += `<i class="fa-solid fa-couch m-2"></i>`;
                }
                


                roomDiv.innerHTML = `
                <div class="room border rounded-lg m-3 min-w-[300px]">
                    <div class="room-title border-b flex flex-row items-center justify-between px-4 py-2 bg-gray-100">
                        <h3 class="text-lg font-medium">${capitalize(room.room_type).split("_").join(" ")}</h3>
                        <button value="${room.id_room}" class="btn-del focus:outline-none font-medium text-red-600 hover:text-red-800 rounded-lg " type="button" data-modal-toggle="popup-modal">
                                Delete Room
                        </button>
                    </div>
                    <div class="flex justify-between">
                        <div class="p-4">
                            ${detailsDiv}
                            
                        </div>
                    </div>
                    <div class="bed-pictograms flex justify-center">
                            ${pictogramsDiv}
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
    
    // data validation
    const roomForm = document.querySelector('#add-room-form');
    const roomRegex = /^[0-9]+$/;
    const errorsDiv = document.querySelector('#room-errors');

    // Pressing confirm room details - ADD ROOM
    addRoomButton.addEventListener('click', e =>{
        console.log("submit");
        var error_messages = [];
        errorsDiv.innerHTML = '';
        if(room_type.value == "choose"){
            error_messages.push("Room type not chosen");
        }
        console.log(roomRegex.test(single.value), roomRegex.test(double.value), roomRegex.test(bunk.value), roomRegex.test(other.value))

        if(!roomRegex.test(single.value) || !roomRegex.test(double.value) || !roomRegex.test(bunk.value) || !roomRegex.test(other.value)){
            error_messages.push("Please use positive numbers for the number of beds");
        }

        if(parseInt(single.value) + parseInt(double.value) + parseInt(bunk.value) + parseInt(other.value) == 0){
            error_messages.push("Room must have at least one place to sleep");
        }

        if(error_messages.length > 0){
            for(error of error_messages){
                var p = `<p class="text-red-500">${error}</p>`;
                errorsDiv.innerHTML += p;
            }
        } else {
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
        }
    })
}