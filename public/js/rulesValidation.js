const priceInp = document.querySelector('#price_inp');
const priceErr = document.querySelector('#price_err');
const weekDiscountInp = document.querySelector('#week_discount_inp');
const weekDiscountErr = document.querySelector('#week_discount_err');
const lessDiscountInp = document.querySelector('#less_discount_inp');
const lessDiscountErr = document.querySelector('#less_discount_err');
const checkinInp = document.querySelector('#checkin_inp');
const checkoutInp = document.querySelector('#checkout_inp');
const timesErr = document.querySelector('#times_err');

const form = document.querySelector('#rules_form');

const buttons = document.querySelectorAll('.btn');

const numberRegex = /^[1-9]+[0-9]*$/;

priceInp.addEventListener("change", e =>{
    var error = false;
    console.log(priceInp.value);
    if(!numberRegex.test(priceInp.value) && priceInp.value){
        priceInp.classList.add("border-red-500");
        priceErr.innerText = "Number must be greater than 0, without decimals";
        error = true;

        buttons.forEach(but => {
            but.disabled = true;
            but.classList.add("cursor-not-allowed");
        });
    }

    if(parseInt(weekDiscountInp.value) >= parseInt(priceInp.value)){
        weekDiscountInp.classList.add("border-red-500");
        weekDiscountErr.innerText = "Discount must be lower than price per night";
        error = true;

        buttons.forEach(but => {
            but.disabled = true;
            but.classList.add("cursor-not-allowed");
        });
    }

    if(parseInt(lessDiscountInp.value) >= parseInt(priceInp.value)){
        lessDiscountInp.classList.add("border-red-500");
        lessDiscountErr.innerText = "Discount must be lower than price per night";
        error = true;

        buttons.forEach(but => {
            but.disabled = true;
            but.classList.add("cursor-not-allowed");
        });
    }


    if(!error){
        priceInp.classList.remove("border-red-500");
        priceErr.innerText = "";
        weekDiscountInp.classList.remove("border-red-500");
        weekDiscountErr.innerText = "";
        lessDiscountInp.classList.remove("border-red-500");
        lessDiscountErr.innerText = "";

        buttons.forEach(but => {
            but.disabled = false;
            but.classList.remove("cursor-not-allowed");
        });
    }
})

var discountRegex = /^[0-9]+$/;

weekDiscountInp.addEventListener("change", e =>{
    var error = false;
    if(!discountRegex.test(weekDiscountInp.value) && weekDiscountInp.value){
        weekDiscountInp.classList.add("border-red-500");
        weekDiscountErr.innerText = "Positive number required, without decimals";
        error = true;

        buttons.forEach(but => {
            but.disabled = true;
            but.classList.add("cursor-not-allowed");
        });
    }

    if(parseInt(weekDiscountInp.value) >= parseInt(priceInp.value)){
        weekDiscountInp.classList.add("border-red-500");
        weekDiscountErr.innerText = "Discount must be lower than price per night";
        error = true;

        buttons.forEach(but => {
            but.disabled = true;
            but.classList.add("cursor-not-allowed");
        });
    }

    if(!error){
        weekDiscountInp.classList.remove("border-red-500");
        weekDiscountErr.innerText = "";

        buttons.forEach(but => {
            but.disabled = false;
            but.classList.remove("cursor-not-allowed");
        });
    }
})

lessDiscountInp.addEventListener("change", e =>{
    var error = false;
    if(!discountRegex.test(lessDiscountInp.value) && lessDiscountInp.value){
        lessDiscountInp.classList.add("border-red-500");
        lessDiscountErr.innerText = "Positive number required, without decimals";
        error = true;

        buttons.forEach(but => {
            but.disabled = true;
            but.classList.add("cursor-not-allowed");
        });
    }

    if(parseInt(lessDiscountInp.value) >= parseInt(priceInp.value)){
        lessDiscountInp.classList.add("border-red-500");
        lessDiscountErr.innerText = "Discount must be lower than price per night";
        error = true;

        buttons.forEach(but => {
            but.disabled = true;
            but.classList.add("cursor-not-allowed");
        });
    }

    if(!error){
        lessDiscountInp.classList.remove("border-red-500");
        lessDiscountErr.innerText = "";

        buttons.forEach(but => {
            but.disabled = false;
            but.classList.remove("cursor-not-allowed");
        });
    }
});

checkoutInp.addEventListener("change", e =>{
    var error = false;
    if(checkinInp.value <= checkoutInp.value){
        checkinInp.classList.add("border-red-500");
        checkoutInp.classList.add("border-red-500");
        timesErr.innerText = "Positive number required, without decimals";
        error = true;

        buttons.forEach(but => {
            but.disabled = true;
            but.classList.add("cursor-not-allowed");
        });
    }
    if(!error){
        checkinInp.classList.remove("border-red-500");
        checkoutInp.classList.remove("border-red-500");
        timesErr.innerText = "";

        buttons.forEach(but => {
            but.disabled = false;
            but.classList.remove("cursor-not-allowed");
        });
    }
})

checkinInp.addEventListener("change", e =>{
    var error = false;
    if(checkinInp.value <= checkoutInp.value){
        checkinInp.classList.add("border-red-500");
        checkoutInp.classList.add("border-red-500");
        timesErr.innerText = "Check-in time must be later than check-out time";
        error = true;

        buttons.forEach(but => {
            but.disabled = true;
            but.classList.add("cursor-not-allowed");
        });
    }
    if(!error){
        checkinInp.classList.remove("border-red-500");
        checkoutInp.classList.remove("border-red-500");
        timesErr.innerText = "";

        buttons.forEach(but => {
            but.disabled = false;
            but.classList.remove("cursor-not-allowed");
        });
    }
})