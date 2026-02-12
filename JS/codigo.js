/* document.querySelector("#btnRegistro").addEventListener("click", registroVersionAwait);

document.querySelector("#btnLogin").addEventListener("click", loginVersionAwait);

async function registroVersionAwait() {

    let nombre = document.querySelector("#txtNombre").value;
    let apellido = document.querySelector("#txtApellido").value;
    let email = document.querySelector("#txtEmail").value;
    let direccion = document.querySelector("#txtDireccion").value;
    let pass = document.querySelector("#txtPass").value;

    if (nombre && apellido && email && direccion && pass) {

        let response = await fetch("https://ort-tallermoviles.herokuapp.com/api/usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
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

        if (response.ok) {
            mostrarMensaje("Registro exitoso");
        } else {
            mostrarMensaje(data.error || "Error en registro");
        }

    } else {
        mostrarMensaje("Complete todos los datos");
    }
}



async function loginVersionAwait() {

    let email = document.querySelector("#txtEmailLogin").value;
    let pass = document.querySelector("#txtPassLogin").value;

    if (email && pass) {

        let response = await fetch("https://ort-tallermoviles.herokuapp.com/api/usuarios/session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: pass
            })
        });

        let data = await response.json();

        if (response.ok) {
            mostrarMensaje("Login correcto");
            console.log(data);
        } else {
            mostrarMensaje(data.error || "Login incorrecto");
        }

    } else {
        mostrarMensaje("Complete los datos");
    }
}


function mostrarMensaje(msg) {
    document.querySelector("#mensaje").innerText = msg;
}

 */



//Ejercicio con ionic

const urlBase = "https://movielist.develotion.com"
const ruteo = document.querySelector("#ruteo");
const menu = document.querySelector("#menu");

inicio();

function inicio() {
    agregarEventos();
}

function agregarEventos() {
    ruteo.addEventListener("ionRouteWillChange", navegar);
    document.querySelector("#btnLogin").addEventListener("click", login);
    document.querySelector("#btnProductos").addEventListener("click", obtenerProductos);
}

function cerrarMenu() {
    menu.close();
}

//Funcion navegar

function navegar(evt) {
    let paginaDestino = evt.detail.to;
    ocultarPaginas();
    switch (paginaDestino) {
        case "/":
            document.querySelector("#page-home").style.display = "block";
            break;
        default:
            document.querySelector("#page-login").style.display = "block";
            break;
    }
}

function ocultarPaginas() {
    let paginas = document.querySelectorAll(".ion-page");
    for (let i = 1; i < paginas.length; i++) {
        paginas[i].style.display = "none";
    }

}

function mostrarMensaje(mensaje) {
    let toast = document.createElement("ion-toast");
    toast.duration = 1500;
    toast.message = mensaje;
    toast.position = "bottom";
    document.body.append(toast);
    toast.present();
}

// Login
async function login() {
  try {
    const usuario = document.querySelector("#txtNombreUsuario").value;
    const password = document.querySelector("#txtPassword").value;

    if (!usuario || !password) {
      mostrarMensaje("Datos incorrectos");
      return;
    }

    const response = await fetch(`${urlBase}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, password }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      localStorage.setItem("token", data.token);
      mostrarMensaje("Login OK");
    } else {
      mostrarMensaje(data.error || data.message || "Credenciales inválidas");
    }

  } catch (error) {
    console.log("ERROR EN LOGIN:", error);
    mostrarMensaje("Error de conexión");
  }
}




//Obtener productos

async function obtenerProductos() {
    try {
        let token = localStorage.getItem("token");
        if (token) {
            let response = await fetch(`${urlBase}/productos`, {
                headers: {
                    "Content-Type": "application/json",
                    "x-auth": token,
                },
            });
            let datosProductos = await response.json();
            if (response.status == 401) {
                console.log("Debes iniciar sesiòn nuevamente");
            } else {
                console.log(datosProductos.data);
            }
        }
        else {
            console.log("Debes iniciar sesión");
        }
    } catch (error) { }
}



//Reguistro de usuario

document.querySelector("#btRegistro").addEventListener("click", registrarUsuario);

async function registrarUsuario() {
    try {
        const usuario = document.querySelector("#txtUsuarioRegistro").value;
        const password = document.querySelector("#txtPasswordRegistro").value;
        const codigoPais = document.querySelector("#txtCodigoPaisRegistro").value;

        if (!usuario || !password || !codigoPais) {
            mostrarMensaje("Todos los campos son obligatorios");
            return;
        }

        const response = await fetch(`${urlBase}/usuarios`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario: usuario,
                password: password,
                codigoPais: codigoPais
            })
        });

        const data = await response.json();

        if (response.ok) {
            mostrarMensaje("Usuario registrado correctamente");
            console.log(data);
        } else {
            mostrarMensaje(data.error || "Error al registrar");
        }

    } catch (error) {
        console.error(error);
        mostrarMensaje("Error de conexión");
    }
}


