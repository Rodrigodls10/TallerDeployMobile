const urlBase = "https://movielist.develotion.com";
const ruteo = document.querySelector("#ruteo");
const menu = document.querySelector("#menu");

let map = null;

inicio();

function inicio() {
  ruteo.addEventListener("ionRouteWillChange", navegar);
  document.querySelector("#btnLogin").addEventListener("click", login);
  document.querySelector("#btRegistro").addEventListener("click", registrarUsuario);

  const btnProd = document.querySelector("#btnProductos");
  if (btnProd) btnProd.addEventListener("click", obtenerProductos);
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
      break;

    case "/login":
      document.querySelector("#page-login").style.display = "block";
      break;

    case "/mapa":
      document.querySelector("#page-mapa").style.display = "block";
      setTimeout(() => inicializarMapa(), 200);
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
      mostrarMensaje("Login OK");
    } else {
      mostrarMensaje(data.error || data.message || "Credenciales inválidas");
    }
  } catch (error) {
    mostrarMensaje("Error de conexión");
  }
}

// PRODUCTOS
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
    } else {
      console.log("Debes iniciar sesión");
    }
  } catch (error) {}
}

// REGISTRO
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
      L.marker([lat, lon]).addTo(map).bindPopup("Mi ubicación").openPopup();
    } else {
      map.invalidateSize();
      map.setView([lat, lon], 15);
    }
  });
}
