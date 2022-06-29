const checkinInp = document.querySelector('#inp-checkin');
const checkoutInp = document.querySelector('#inp-checkout');
const guestsInp = document.querySelector('#inp-guests');

const form = document.querySelector('#searchbox-form');

const numberRegex = /^[1-9]+[0-9]*$/;
form.addEventListener("submit", e =>{
    var error = false;
    if(checkinInp.value && checkoutInp.value && (checkinInp.value >= checkoutInp.value)){
        error = true;
        checkinInp.classList.add("border-red-500");
        checkoutInp.classList.add("border-red-500");
        e.preventDefault();
    } else{
        checkinInp.classList.remove("border-red-500");
        checkoutInp.classList.remove("border-red-500");
    }

    if(guestsInp.value && !numberRegex.test(guestsInp.value)){
        error = true;
        guestsInp.classList.add("border-red-500");
        e.preventDefault();
    } else{
        guestsInp.classList.remove("border-red-500");
    }
})
