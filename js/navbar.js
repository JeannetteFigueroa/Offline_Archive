/* =========================================================
   NAVBAR.JS

   Controla el menú móvil y adapta el acceso de usuario
   según exista o no una sesión activa.
   ========================================================= */


/* =========================================================
   SESIÓN
   ========================================================= */

const SESSION_KEY = "offlineArchiveSession";


function hasActiveSession() {

    const localSession =
        localStorage.getItem(SESSION_KEY);

    const temporarySession =
        sessionStorage.getItem(SESSION_KEY);

    return Boolean(
        localSession || temporarySession
    );
}


/* =========================================================
   ACCESO DE USUARIO
   ========================================================= */

const accountLink =
    document.getElementById("accountLink");

const mobileAccountLink =
    document.getElementById("mobileAccountLink");


function updateAccountLinks() {

    const loggedIn =
        hasActiveSession();


    /* -------------------------
       MENÚ DESKTOP
       ------------------------- */

    if (accountLink) {

        accountLink.textContent =
            loggedIn
                ? "Mi cuenta"
                : "Login";

        accountLink.href =
            loggedIn
                ? "cuenta.html"
                : "login.html";
    }


    /* -------------------------
       MENÚ MOBILE
       ------------------------- */

    if (mobileAccountLink) {

        mobileAccountLink.innerHTML =
            loggedIn
                ? "<span>06</span>Mi cuenta"
                : "<span>06</span>Login";

        mobileAccountLink.href =
            loggedIn
                ? "cuenta.html"
                : "login.html";
    }
}


updateAccountLinks();


/* =========================================================
   MENÚ MÓVIL
   ========================================================= */

const menuToggle =
    document.querySelector(".menu-toggle");

const menuClose =
    document.querySelector(".menu-close");

const mobileMenu =
    document.querySelector(".mobile-menu");


/* =========================================================
   ABRIR MENÚ
   ========================================================= */

function openMobileMenu() {

    if (!mobileMenu) {
        return;
    }


    /*
       Primero hacemos visible el elemento.
       hidden = false elimina el display:none
       que aplica el navegador.
    */

    mobileMenu.hidden = false;


    /*
       Esperamos un frame antes de añadir active.
       Esto permite que la transición CSS funcione.
    */

    requestAnimationFrame(() => {

        mobileMenu.classList.add("active");

    });
}


/* =========================================================
   CERRAR MENÚ
   ========================================================= */

function closeMobileMenu() {

    if (!mobileMenu) {
        return;
    }


    /*
       Quitamos active para iniciar
       la animación de salida.
    */

    mobileMenu.classList.remove("active");


    /*
       Esperamos los 350ms de la transición CSS
       antes de aplicar hidden.
    */

    setTimeout(() => {

        mobileMenu.hidden = true;

    }, 350);
}


/* =========================================================
   BOTÓN ABRIR
   ========================================================= */

if (menuToggle && mobileMenu) {

    menuToggle.addEventListener(
        "click",
        openMobileMenu
    );

}


/* =========================================================
   BOTÓN CERRAR
   ========================================================= */

if (menuClose && mobileMenu) {

    menuClose.addEventListener(
        "click",
        closeMobileMenu
    );

}


/* =========================================================
   CERRAR AL HACER CLICK EN UN LINK
   ========================================================= */

document
    .querySelectorAll(".mobile-menu a")
    .forEach((link) => {

        link.addEventListener(
            "click",
            closeMobileMenu
        );

    });