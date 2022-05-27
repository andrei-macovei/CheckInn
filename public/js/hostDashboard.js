var deleteButtons = document.querySelectorAll(".btn-del");
var pressedButtonId;

deleteButtons.forEach(function(but){
    but.addEventListener('click', e =>{
        pressedButtonId = but.value;
    });
});

const sureButton = document.querySelector('#sure-btn')

sureButton.addEventListener('click', e =>{
    (async () =>{
        const rawResponse = await fetch(`/hosting/deleteProperty/${pressedButtonId}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const content = await rawResponse.json();
    })();
    location.reload(true);
});
