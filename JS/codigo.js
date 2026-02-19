const urlBase = "https://movielist.develotion.com";
const ruteo = document.querySelector("#ruteo");
const menu = document.querySelector("#menu");

let map = null;

inicio();

function inicio() {
  ruteo.addEventListener("ionRouteWillChange", navegar);
  document.querySelector("#btnLogin").addEventListener("click", login);
  document.querySelector("#btRegistro").addEventListener("click", registrarUsuario);
  actualizarUsuarioMenu();
}

function cerrarMenu() {
  menu.close();
}

function navegar(evt) {
  let paginaDestino = evt.detail.to;
  ocultarPaginas();

  switch (paginaDestino) {
    case "/":
      document.querySelector("#page-home").style.display = "block";
      obtenerPeliculas();
      break;

    case "/cargarPelicula":
      document.querySelector("#page-cargarPelicula").style.display = "block";
      cargarCategorias();
      break;

    case "/mapa":
      document.querySelector("#page-mapa").style.display = "block";
      setTimeout(() => inicializarMapa(), 200);
      break;

    case "/login":
      document.querySelector("#page-login").style.display = "block";
      break;

    case "/registro":
      document.querySelector("#page-registro").style.display = "block";
      cargarPaises();
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

// LOGIN
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
      localStorage.setItem("usuario", usuario); //Guardo para mosrar
      actualizarUsuarioMenu();
      mostrarMensaje("Login OK");
    } else {
      mostrarMensaje(data.error || data.message || "Credenciales inválidas");
    }
  } catch (error) {
    mostrarMensaje("Error de conexión");
  }
}

function estaLogueado() {
  if (localStorage.getItem("token")) {
    return true;
  } else {
    return false;
  }
}

function actualizarUsuarioMenu() {
  const p = document.querySelector("#txtUsuarioLogueado");
  const user = localStorage.getItem("usuario");

  p.textContent = user ? `Usuario: ${user}` : "No logueado";
}




//LOGOUT
document.querySelector("#btnCerrarSesion").addEventListener("click", cerrarSesion)

function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  actualizarUsuarioMenu();
  mostrarMensaje("Se cerró la sesión");
}


// OBTENER PELICULAS     TO DO!
async function obtenerPeliculas() {

  try {
    let token = localStorage.getItem("token");

    if (token) {
      let response = await fetch(`${urlBase}/peliculas`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      let datosPeliculas = await response.json();

      if (response.status == 401) {
        console.log("Debes iniciar sesion nuevamente");
      } else {
        const lista = datosPeliculas.peliculas || [];
        mostrarPeliculas(lista);

      }
    } else {
      console.log("Debes iniciar sesión");
    }
  } catch (error) { }
}

/* MOSTRAR PELICULAS */

function mostrarPeliculas(peliculas) {
  if (!Array.isArray(peliculas)) return;

  let contenedor = document.querySelector("#page-home ion-content");
  contenedor.innerHTML = "";

  peliculas.forEach((pelicula) => {
    contenedor.innerHTML += `
      <ion-card>
        <img src="https://ionicframework.com/docs/img/demos/card-media.png" />
        <ion-card-header>
          <ion-card-title>${pelicula.nombre}</ion-card-title>
          <ion-card-subtitle>${pelicula.idCategoria}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          ${pelicula.fechaEstreno}
        </ion-card-content>
      </ion-card>
    `;
  });
}


// REGISTRO
async function registrarUsuario() {
  try {
    const usuario = document.querySelector("#txtUsuarioRegistro").value;
    const password = document.querySelector("#txtPasswordRegistro").value;
    const codigoPais = document.querySelector("#slcPaisRegistro").value;

    if (!usuario || !password || !codigoPais) {
      mostrarMensaje("Todos los campos son obligatorios");
      return;
    }

    const response = await fetch(`${urlBase}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, password, codigoPais }),
    });

    const data = await response.json();

    if (response.ok) {
      mostrarMensaje("Usuario registrado correctamente");
    } else {
      mostrarMensaje(data.error || "Error al registrar");
    }
  } catch (error) {
    mostrarMensaje("Error de conexión");
  }
}

async function cargarPaises() {
  try {
    const response = await fetch(`${urlBase}/paises`, {
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();
    const paises = data.paises || data.data?.paises || data.data || [];

    const slc = document.querySelector("#slcPaisRegistro");
    slc.innerHTML = "";

    paises.forEach(p => {
      slc.innerHTML += `<ion-select-option value="${p.id}">${p.nombre}</ion-select-option>`;
    });
  } catch (e) {
    mostrarMensaje("No se pudieron cargar los países");
  }
}


// MAPA
function inicializarMapa() {
  navigator.geolocation.getCurrentPosition((pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    if (!map) {
      map = L.map("mapa").setView([lat, lon], 15);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);
      L.marker([lat, lon]).addTo(map).bindPopup("Mi ubicacion").openPopup();
    } else {
      map.invalidateSize();
      map.setView([lat, lon], 15);
    }
  });
}


// CARGAR PELICULAS

async function cargarCategorias() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${urlBase}/categorias`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();
    const categorias = data.categorias || [];

    const slc = document.querySelector("#slcCategoriaPelicula");
    slc.innerHTML = "";

    categorias.forEach(c => {
      slc.innerHTML += `
        <ion-select-option value="${c.id}">
          ${c.nombre} ${c.emoji}
        </ion-select-option>`;
    });

  } catch (e) {
    mostrarMensaje("No se encontraron categorias");
  }
}


document.querySelector("#btCargarPelicula").addEventListener("click", cargarPelicula);

async function cargarPelicula() {

  const nombre = document.querySelector("#txtNombrePelicula").value;
  const idCategoria = document.querySelector("#slcCategoriaPelicula").value;
  const fecha = document.querySelector("#dtFechaPelicula").value;
  const comentario = document.querySelector("#txtComentario").value;

  const token = localStorage.getItem("token");

  if (!nombre || !idCategoria || !fecha || !comentario) {
    mostrarMensaje("Todos los campos son obligatorios");
    return;
  }

  // Analizar comentario
  const responseIA = await fetch(`${urlBase}/genai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ texto: comentario })
  });

  const dataIA = await responseIA.json();

  if (dataIA.sentiment == "Negativo") {
    mostrarMensaje("Comentario negativo. No se registra la película.");
    return;
  }

  // Si el comentario es positivo
  const responsePelicula = await fetch(`${urlBase}/peliculas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      nombre: nombre,
      idCategoria: idCategoria,
      fechaVisualizacion: fecha
    })
  });

  if (responsePelicula.ok) {
    mostrarMensaje("Película registrada correctamente");
  } else {
    mostrarMensaje("Error al registrar película");
  }
}
