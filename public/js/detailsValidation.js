const guestsInp = document.querySelector('#guests_number');
const bathroomsInp = document.querySelector('#bathrooms_number');

const guestsErr = document.querySelector('#guests-err');
const bathroomsErr = document.querySelector('#bathrooms-err');

const buttons = document.querySelectorAll(".btn");

const numberRegex = /^[1-9]+[0-9]*$/;

guestsInp.addEventListener('change', e =>{
    var error = false;
    if(!numberRegex.test(guestsInp.value) && guestsInp.value){
        guestsInp.classList.add("border-red-500");
        guestsErr.innerText = "Please enter only strict positive numbers";
        error = true;

        buttons.forEach(but => {
            but.disabled = true;
            but.classList.add("cursor-not-allowed");
        });

    }

    if(!error){
        guestsInp.classList.remove("border-red-500");
        guestsErr.innerText = "";

        buttons.forEach(but => {
            but.disabled = false;
            but.classList.remove("cursor-not-allowed");
        });
    }
})

bathroomsInp.addEventListener('change', e =>{
    var error = false;
    if(!numberRegex.test(bathroomsInp.value) && bathroomsInp.value){
        bathroomsInp.classList.add("border-red-500");
        bathroomsErr.innerText = "Please enter only strict positive numbers";
        error = true;

        buttons.forEach(but => {
            but.disabled = true;
            but.classList.add("cursor-disabled");
        });

    }

    if(!error){
        bathroomsInp.classList.remove("border-red-500");
        bathroomsErr.innerText = "";

        buttons.forEach(but => {
            but.disabled = false;
            but.classList.remove("cursor-disabled");
        });
    }
})