const firstnameInp = document.querySelector('#firstname-inp');
const firstnameErr = document.querySelector('#firstname-err');
const lastnameInp = document.querySelector('#lastname-inp');
const lastnameErr = document.querySelector('#lastname-err');
const phoneInp = document.querySelector('#phone-inp');
const phoneErr = document.querySelector('#phone-err');
const birthdayInp = document.querySelector('#birthday-inp');
const birthdayErr = document.querySelector('#birthday-err');

const editForm = document.querySelector('#edit-form');
const editSubmit = document.querySelector('#edit-submit');

const oldPassInp = document.querySelector('#old-pass-inp');
const newPassInp = document.querySelector('#new-pass-inp');
const passwordErr = document.querySelector('#password-err');
const confPassInp = document.querySelector('#conf-pass-inp');
const confPassErr = document.querySelector('#password-conf-err');

const changePassForm = document.querySelector('#change-pass-form');
const changeSubmit = document.querySelector('#change-pass-submit');

const nameRegex = /^([A-Za-zÀ-žăîâșțĂÎÂȘȚ\- ])+$/;

firstnameInp.addEventListener('change', e =>{
    var error = false;
    if(!nameRegex.test(firstnameInp.value)){
        firstnameErr.innerText = 'Please use letters and dashes only';
        firstnameInp.classList.add('border-red-500');
        editSubmit.disabled = true;
        editSubmit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!firstnameInp.value){
        firstnameErr.innerText = 'Firstname is required';
        firstnameInp.classList.add('border-red-500');
        editSubmit.disabled = true;
        editSubmit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!error){
        firstnameErr.innerText = '';
        firstnameInp.classList.remove('border-red-500');
        editSubmit.disabled = false;
        editSubmit.classList.remove("cursor-not-allowed");
    }
})

lastnameInp.addEventListener('change', e =>{
    var error = false;
    if(!nameRegex.test(lastnameInp.value)){
        lastnameErr.innerText = 'Please use letters and dashes only';
        lastnameInp.classList.add('border-red-500');
        editSubmit.disabled = true;
        editSubmit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!lastnameInp.value){
        lastnameErr.innerText = 'Lastname is required';
        lastnameInp.classList.add('border-red-500');
        editSubmit.disabled = true;
        editSubmit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!error){
        lastnameErr.innerText = '';
        lastnameInp.classList.remove('border-red-500');
        editSubmit.disabled = false;
        editSubmit.classList.remove("cursor-not-allowed");
    }
})

const phoneRegex = /^\+*([0-9#*]{8,15})$/;

phoneInp.addEventListener('change', e =>{
    var error = false;
    if(!phoneRegex.test(phoneInp.value)){
        phoneErr.innerText = 'Invalid format';
        phoneInp.classList.add('border-red-500');
        editSubmit.disabled = true;
        editSubmit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!phoneInp.value){
        error = false;
    }
    if(!error){
        phoneErr.innerText = '';
        phoneInp.classList.remove('border-red-500');
        editSubmit.disabled = false;
        editSubmit.classList.remove("cursor-not-allowed");
    }
})

birthdayInp.addEventListener('change', e =>{
    var error;
    var inputDate = new Date(birthdayInp.value);
    var eighteenYearsAgo = new Date();
    eighteenYearsAgo = eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear()-18);
    console.log(inputDate >= eighteenYearsAgo)
    if(inputDate > eighteenYearsAgo){
        birthdayErr.innerText = 'You must be 18 years old to have an account';
        birthdayInp.classList.add('border-red-500');
        editSubmit.disabled = true;
        editSubmit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!error){
        birthdayErr.innerText = '';
        birthdayInp.classList.remove('border-red-500');
        editSubmit.disabled = false;
        editSubmit.classList.remove("cursor-not-allowed");
    }
})

newPassInp.addEventListener('change', e =>{
    var error = false;
    if(newPassInp.value.length < 8){
        passwordErr.innerText = 'Password must be at least 8 characters long';
        newPassInp.classList.add('border-red-500');
        changeSubmit.disabled = true;
        changeSubmit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!newPassInp.value){
        passwordErr.innerText = 'Password is required';
        newPassInp.classList.add('border-red-500');
        changeSubmit.disabled = true;
        changeSubmit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!error){
        passwordErr.innerText = '';
        newPassInp.classList.remove('border-red-500');
        changeSubmit.disabled = false;
        changeSubmit.classList.remove("cursor-not-allowed");
    } 
})

confPassInp.addEventListener('change', e =>{
    var error = false;
    if(confPassInp.value != newPassInp.value){
        confPassErr.innerText = "Passwords don't match";
        confPassInp.classList.add('border-red-500');
        changeSubmit.disabled = true;
        changeSubmit.classList.add("cursor-not-allowed");
        error = true;
    }
    if(!error){
        confPassErr.innerText = '';
        confPassInp.classList.remove('border-red-500');
        changeSubmit.disabled = false;
        changeSubmit.classList.remove("cursor-not-allowed");
    } 
})