var reviewButtons = document.querySelectorAll(".review-btn");
var reviewForm = document.querySelector('#review-form');
var pressedButtonValue;

reviewButtons.forEach(function(but){
    but.addEventListener('click', e =>{
        pressedButtonValue = but.value;
        reviewForm.action = `/reviews/add/${pressedButtonValue}`;
    });
});

const cleanInp = document.querySelector('#clean-range');
const locationInp = document.querySelector('#location-range');
const comfortInp = document.querySelector('#comfort-range');
const valueInp = document.querySelector('#value-range');

const cleanVal = document.querySelector('#clean-val');
const locationVal = document.querySelector('#location-val');
const comfortVal = document.querySelector('#comfort-val');
const valueVal = document.querySelector('#value-val');


cleanInp.addEventListener('change', e=>{
    cleanVal.innerText = `: ${cleanInp.value}`; 
});

locationInp.addEventListener('change', e=>{
    locationVal.innerText = `: ${locationInp.value}`; 
});

comfortInp.addEventListener('change', e=>{
    comfortVal.innerText = `: ${comfortInp.value}`; 
});

valueInp.addEventListener('change', e=>{
    valueVal.innerText = `: ${valueInp.value}`; 
});