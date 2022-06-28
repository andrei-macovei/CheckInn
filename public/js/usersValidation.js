const emailInp = document.querySelector('#email');
const emailErr = document.querySelector('#email-err');
const passwordInp = document.querySelector('#password');
const passwordErr = document.querySelector('#password-err');
const passwordConfInp = document.querySelector('#password_conf');
const passwordConfErr = document.querySelector('#pass-conf-err');
const firstnameInp = document.querySelector('#firstname');
const firstnameErr = document.querySelector('#firstname-err');
const lastnameInp = document.querySelector('#lastname');
const lastnameErr = document.querySelector('#lastname-err');

const form = document.querySelector('#form');
const submit = document.querySelector('#submit');

const emailRegex = /^[A-Za-z][\w\.-]*[A-Za-z0-9]@[A-Za-z0-9]+\.[A-Za-z-]{2,3}$/;
var globalErr = false;

if(emailInp)
emailInp.addEventListener('change', e =>{
    // e.preventDefault();
    var error = false;
    if(!emailRegex.test(emailInp.value)){
        emailErr.innerText = 'Invalid Format';
        emailInp.classList.add('border-red-500');
        submit.disabled = true;
        submit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!emailInp.value){
        emailErr.innerText = 'Email is required';
        emailInp.classList.add('border-red-500');
        submit.disabled = true;
        submit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!error){
        emailErr.innerText = '';
        emailInp.classList.remove('border-red-500');
        submit.disabled = false;
        submit.classList.remove("cursor-not-allowed");
    } 
});

const nameRegex = /^([A-Za-zÀ-žăîâșțĂÎÂȘȚ\- ])+$/;

if(firstnameInp)
firstnameInp.addEventListener('change', e =>{
    var error = false;
    if(!nameRegex.test(firstnameInp.value)){
        firstnameErr.innerText = 'Please use letters and dashes only';
        firstnameInp.classList.add('border-red-500');
        submit.disabled = true;
        submit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!firstnameInp.value){
        firstnameErr.innerText = 'Firstname is required';
        firstnameInp.classList.add('border-red-500');
        submit.disabled = true;
        submit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!error){
        firstnameErr.innerText = '';
        firstnameInp.classList.remove('border-red-500');
        submit.disabled = false;
        submit.classList.remove("cursor-not-allowed");
    } 
})

if(lastnameInp)
lastnameInp.addEventListener('change', e =>{
    var error = false;
    if(!nameRegex.test(lastnameInp.value)){
        lastnameErr.innerText = 'Please use letters and dashes only';
        lastnameInp.classList.add('border-red-500');
        submit.disabled = true;
        submit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!lastnameInp.value){
        lastnameErr.innerText = 'Lastname is required';
        lastnameInp.classList.add('border-red-500');
        submit.disabled = true;
        submit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!error){
        lastnameErr.innerText = '';
        lastnameInp.classList.remove('border-red-500');
        submit.disabled = false;
        submit.classList.remove("cursor-not-allowed");
    } 
})

if(passwordInp)
passwordInp.addEventListener('change', e =>{
    var error = false;
    if(passwordInp.value.length < 8){
        passwordErr.innerText = 'Password must be at least 8 characters long';
        passwordInp.classList.add('border-red-500');
        submit.disabled = true;
        submit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!passwordInp.value){
        passwordErr.innerText = 'Password is required';
        passwordInp.classList.add('border-red-500');
        submit.disabled = true;
        submit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!error){
        passwordErr.innerText = '';
        passwordInp.classList.remove('border-red-500');
        submit.disabled = false;
        submit.classList.remove("cursor-not-allowed");
    } 
})

if(passwordConfInp)
passwordConfInp.addEventListener('change', e =>{
    var error = false;
    if(passwordConfInp.value != passwordInp.value){
        passwordConfErr.innerText = "Passwords don't match";
        passwordConfInp.classList.add('border-red-500');
        submit.disabled = true;
        submit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!error){
        passwordConfErr.innerText = '';
        passwordConfInp.classList.remove('border-red-500');
        submit.disabled = false;
        submit.classList.remove("cursor-not-allowed");
    } 
})