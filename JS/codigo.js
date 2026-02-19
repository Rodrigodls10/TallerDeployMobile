const urlBase = "https://movielist.develotion.com";
const ruteo = document.querySelector("#ruteo");
const menu = document.querySelector("#menu");

let map = null;

// Agregado para poder aplicar filtros
let peliculasCache = [];

inicio();

function inicio() {
  ruteo.addEventListener("ionRouteWillChange", navegar);
  document.querySelector("#btnLogin").addEventListener("click", login);
  document.querySelector("#btRegistro").addEventListener("click", registrarUsuario);
  document.querySelector("#itemLogout").addEventListener("click", cerrarSesion);
  actualizarUsuarioMenu();
}

function cerrarMenu() {
  menu.close();
}

function navegar(evt) {
  let paginaDestino = evt.detail.to;
  ocultarPaginas();

  //Si NO está logueado, solo dejo /login y /registro
  let token = localStorage.getItem("token");
  if (!token && paginaDestino !== "/login" && paginaDestino !== "/registro") {
    document.querySelector("#page-login").style.display = "block";
    ruteo.push("/login");
    return;
  }

  switch (paginaDestino) {
    case "/":
      document.querySelector("#page-home").style.display = "block";

      document.querySelector("#slcFiltroFecha").addEventListener("ionChange", aplicarFiltroFecha);

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
      localStorage.setItem("usuario", usuario);

      //Limpiamos los campos
      document.querySelector("#txtNombreUsuario").value = "";
      document.querySelector("#txtPassword").value = ""

      mostrarMensaje("Login OK");
      actualizarUsuarioMenu();

      // mando al inicio para ver las pelis
      ruteo.push("/");
    } else {
      mostrarMensaje(data.error || data.message || "Credenciales inválidas");
    }
  } catch (error) {
    mostrarMensaje("Error de conexión");
  }
}

//funcion de el menu del usuario 
function actualizarUsuarioMenu() {
  const p = document.querySelector("#txtUsuarioLogueado");
  const user = localStorage.getItem("usuario");
  const token = localStorage.getItem("token");

  const itemCargar = document.querySelector("#itemCargarPelicula");
  const itemMapa = document.querySelector("#itemMapa");
  const itemLogin = document.querySelector("#itemLogin");
  const itemRegistro = document.querySelector("#itemRegistro");
  const itemLogout = document.querySelector("#itemLogout");

  if (token && user) {
    p.textContent = `Usuario: ${user}`;

    itemCargar.style.display = "block";
    itemMapa.style.display = "block";
    itemLogout.style.display = "block";

    itemLogin.style.display = "none";
    itemRegistro.style.display = "none";
  } else {
    p.textContent = "No logueado";

    itemCargar.style.display = "none";
    itemMapa.style.display = "none";
    itemLogout.style.display = "none";

    itemLogin.style.display = "block";
    itemRegistro.style.display = "block";
  }
}

//LOGOUT
document.querySelector("#btnCerrarSesion").addEventListener("click", cerrarSesion)

function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");

  //Vaciar cache + limpiar UI
  peliculasCache = [];
  let contenedor = document.querySelector("#contenedorPeliculas");
  if (contenedor) contenedor.innerHTML = "";

  //Limpiar campos login
  let u = document.querySelector("#txtNombreUsuario");
  let p = document.querySelector("#txtPassword");
  if (u) u.value = "";
  if (p) p.value = "";

  //Limpiar campos registro
  let ur = document.querySelector("#txtUsuarioRegistro");
  let pr = document.querySelector("#txtPasswordRegistro");
  let pais = document.querySelector("#slcPaisRegistro");
  if (ur) ur.value = "";
  if (pr) pr.value = "";
  if (pais) pais.value = "";

  //Limpiar cargar peli
  let nom = document.querySelector("#txtNombrePelicula");
  let cat = document.querySelector("#slcCategoriaPelicula");
  let fec = document.querySelector("#dtFechaPelicula");
  let com = document.querySelector("#txtComentario");
  if (nom) nom.value = "";
  if (cat) cat.value = "";
  if (fec) fec.value = "";
  if (com) com.value = "";

  actualizarUsuarioMenu();
  mostrarMensaje("Se cerró la sesión");

  //Redirigir a Login
  ocultarPaginas();
  document.querySelector("#page-login").style.display = "block";
  ruteo.push("/login");

  cerrarMenu();
}

// OBTENER PELICULAS
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
        peliculasCache = datosPeliculas.peliculas || [];
        aplicarFiltroFecha(); // Funcion que vamos a usar para aplicar los filtros de fecha a las pelis
      }
    } else {
      console.log("Debes iniciar sesión");
    }
  } catch (error) {
    mostrarMensaje("Error de conexión");
  }
}

function mostrarPeliculas(peliculas) {
  if (!Array.isArray(peliculas)) return;

  let contenedor = document.querySelector("#contenedorPeliculas");
  contenedor.innerHTML = "";

  for (let i = 0; i < peliculas.length; i++) {
    let pelicula = peliculas[i];

    let fecha =
      pelicula.fechaVisualizacion ||
      pelicula.fechaVisto ||
      pelicula.fecha ||
      pelicula.fechaEstreno ||
      "";

    contenedor.innerHTML += `
      <ion-card class="movie-card">
        <div class="movie-img-wrap">
          <img class="movie-img" src="https://ionicframework.com/docs/img/demos/card-media.png" />
          <div class="movie-badges">
            <ion-chip color="medium" class="movie-chip">
              <ion-label>#${pelicula.id}</ion-label>
            </ion-chip>
            <ion-chip color="primary" class="movie-chip">
              <ion-label>Cat ${pelicula.idCategoria}</ion-label>
            </ion-chip>
          </div>
        </div>

        <ion-card-header class="movie-header">
          <ion-card-title class="movie-title">${pelicula.nombre}</ion-card-title>
          <ion-card-subtitle class="movie-subtitle">
            ${fecha ? "Vista el " + fecha : "Sin fecha"}
          </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content class="movie-actions">
          <ion-button 
            color="danger"
            expand="block"
            class="movie-btn"
            onclick="eliminarPelicula(${pelicula.id})">
            <ion-icon name="trash-outline" slot="start"></ion-icon>
            Eliminar
          </ion-button>
        </ion-card-content>
      </ion-card>
    `;
  }
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
      //Limpiar Campos
      document.querySelector("#txtUsuarioRegistro").value = "";
      document.querySelector("#txtPasswordRegistro").value = "";

      //lo mando al login directo
      ruteo.push("/login");
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
  console.log("FECHA INPUT:", fecha);

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

  if (!responseIA.ok) {
    mostrarMensaje(dataIA.error || dataIA.message || "Error al analizar comentario");
    return;
  }

  const sentimiento = (dataIA.sentiment || "").toString().trim().toLowerCase();
  const score = Number(dataIA.score);

  //Le puse esto porque me estaba dando siempre negativo el comentario y tuve que modificar para que pueda seguir el flujo
  if (sentimiento === "negativo" && score > 0.5) {
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
      fecha: fecha,
      comentario: comentario
    })
  });

  if (responsePelicula.ok) {
    mostrarMensaje("Película registrada correctamente");
    document.querySelector("#txtNombrePelicula").value = "";
    document.querySelector("#slcCategoriaPelicula").value = "";
    document.querySelector("#dtFechaPelicula").value = "";
    document.querySelector("#txtComentario").value = "";

    // 🔹 vuelvo al inicio y refresco
    ruteo.push("/");
  } else {
    mostrarMensaje("Error al registrar película");
  }
}

//Funcion para eliminar las peliculas
async function eliminarPelicula(id) {
  const token = localStorage.getItem("token");

  if (!confirm("¿Seguro que querés eliminar esta película?")) {
    return;
  }

  try {
    const response = await fetch(`${urlBase}/peliculas/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      }
    });

    if (response.ok) {
      mostrarMensaje("Película eliminada correctamente");
      obtenerPeliculas(); // refresca el listado
    } else {
      mostrarMensaje("No se pudo eliminar");
    }

  } catch (error) {
    mostrarMensaje("Error de conexión");
  }
}

function aplicarFiltroFecha() {
  let slc = document.querySelector("#slcFiltroFecha");
  let filtro = slc ? slc.value : "todas";

  let hoy = new Date();
  let filtradas = [];

  for (let i = 0; i < peliculasCache.length; i++) {
    let peli = peliculasCache[i];

    // Tomamos la fecha igual que en mostrarPeliculas
    let fechaStr =
      peli.fechaVisualizacion ||
      peli.fechaVisto ||
      peli.fecha ||
      peli.fechaEstreno ||
      "";

    // Si no hay fecha: solo entra cuando es "todas"
    if (!fechaStr) {
      if (filtro === "todas") filtradas.push(peli);
      continue;
    }

    // Parseo fecha (por si viene tipo "YYYY-MM-DD" o con hora)
    let fechaPeli = new Date(fechaStr);

    // Si el parseo falla, la muestro solo en "todas"
    if (isNaN(fechaPeli.getTime())) {
      if (filtro === "todas") filtradas.push(peli);
      continue;
    }

    let diffMs = hoy - fechaPeli;
    let diffDias = diffMs / (1000 * 60 * 60 * 24);

    // si la fecha es futura (diffDias < 0), normalmente no la contamos
    if (diffDias < 0) {
      if (filtro === "todas") filtradas.push(peli);
      continue;
    }

    if (filtro === "todas") {
      filtradas.push(peli);
    } else if (filtro === "semana" && diffDias <= 7) {
      filtradas.push(peli);
    } else if (filtro === "mes" && diffDias <= 30) {
      filtradas.push(peli);
    }
  }

  mostrarPeliculas(filtradas);
}
