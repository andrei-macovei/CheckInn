var notifButtons = document.querySelectorAll(".notif-btn");
var notifForm = document.querySelector('#notif-form');
var pressedButtonValue;

var deleteButtons = document.querySelectorAll(".delete-btn");
var deleteForm = document.querySelector('#delete-form');
var pressedDeleteButtonValue;

notifButtons.forEach(function(but){
    but.addEventListener('click', e =>{
        pressedButtonValue = but.value;
        notifForm.action = `/admin/sendNotification/${pressedButtonValue}`;
    });
});

deleteButtons.forEach(function(but){
    but.addEventListener('click', e =>{
        pressedDeleteButtonValue = but.value;
        deleteForm.action = `/admin/delete/${pressedDeleteButtonValue}`;
    });
});