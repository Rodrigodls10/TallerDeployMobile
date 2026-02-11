document.querySelector("#btnRegistro").addEventListener("click", registroVersionAwait);

document.querySelector("#btnLogin").addEventListener("click", loginVersionAwait);

async function registroVersionAwait(){

    let nombre = document.querySelector("#txtNombre").value;
    let apellido = document.querySelector("#txtApellido").value;
    let email = document.querySelector("#txtEmail").value;
    let direccion = document.querySelector("#txtDireccion").value;
    let pass = document.querySelector("#txtPass").value;

    if(nombre && apellido && email && direccion && pass){

        let response = await fetch("https://ort-tallermoviles.herokuapp.com/api/usuarios", { 
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                nombre: nombre,
                apellido: apellido,
                email: email,
                direccion: direccion,
                password: pass
            })
        });

        let data = await response.json(); // esperamos la respuesta como dijiste profe

        if(response.ok){
            mostrarMensaje("Registro exitoso");
        }else{
            mostrarMensaje(data.error || "Error en registro");
        }

    }else{
        mostrarMensaje("Complete todos los datos");
    }
}



async function loginVersionAwait(){

    let email = document.querySelector("#txtEmailLogin").value;
    let pass = document.querySelector("#txtPassLogin").value;

    if(email && pass){

        let response = await fetch("https://ort-tallermoviles.herokuapp.com/api/usuarios/session", { 
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                email: email,
                password: pass
            })
        });

        let data = await response.json();

        if(response.ok){
            mostrarMensaje("Login correcto");
            console.log(data);
        }else{
            mostrarMensaje(data.error || "Login incorrecto");
        }

    }else{
        mostrarMensaje("Complete los datos");
    }
}


function mostrarMensaje(msg){
    document.querySelector("#mensaje").innerText = msg;
}