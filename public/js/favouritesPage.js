// Favourite buttons
favCheckboxes = document.querySelectorAll(".custom-checkbox-input");
favCheckboxes.forEach(function(checkbox){
    checkbox.addEventListener('change', e =>{

        heart = checkbox.parentElement.querySelector('.heart');
        if(checkbox.checked){
            (async () =>{
                const rawResponse = await fetch(`/favourites/add/${checkbox.value}`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                const content = await rawResponse.json();

            })();
            console.log("Favourite added");
            heart.classList.remove("hover:text-gray-500", "hover:scale-125", "text-gray-300");
            heart.classList.add("scale-125", "text-red-500", "hover:scale-100", "hover:text-gray-500");
            console.log(checkbox.parentElement);
            // heartText.innerText = "Favourite added!"
            // heartText.classList.remove("text-gray-300");
            // heartText.classList.add("text-red-500");
        }
        else{
            (async () =>{
                const rawResponse = await fetch(`/favourites/delete/${checkbox.value}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                const content = await rawResponse.json();
            })();
            console.log("Favourite removed");
            heart.classList.remove("scale-125", "text-red-500", "hover:scale-100", "hover:text-gray-500");
            heart.classList.add("hover:text-gray-500", "hover:scale-125", "text-gray-300");
            // heartText.classList.add("text-gray-300");
            // heartText.classList.remove("text-red-500");
        }
    });
});