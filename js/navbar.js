/* =========================================================
   NAVBAR.JS

   Controla el menú móvil y adapta el acceso de usuario
   según exista o no una sesión activa.
   ========================================================= */

const SESSION_KEY = "offlineArchiveSession";

function hasActiveSession() {
  const localSession = localStorage.getItem(SESSION_KEY);
  const temporarySession = sessionStorage.getItem(SESSION_KEY);

  return Boolean(localSession || temporarySession);
}

/* =========================================================
   ACCESO DE USUARIO
   ========================================================= */

const accountLink = document.getElementById("accountLink");
const mobileAccountLink = document.getElementById("mobileAccountLink");

function updateAccountLinks() {
  const loggedIn = hasActiveSession();

  if (accountLink) {
    accountLink.textContent = loggedIn ? "Mi cuenta" : "Login";
    accountLink.href = loggedIn ? "cuenta.html" : "login.html";
  }

  if (mobileAccountLink) {
    mobileAccountLink.innerHTML = loggedIn
      ? "<span>06</span>Mi cuenta"
      : "<span>06</span>Login";

    mobileAccountLink.href = loggedIn ? "cuenta.html" : "login.html";
  }
}

updateAccountLinks();

/* =========================================================
   MENÚ MÓVIL
   ========================================================= */

const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const mobileMenu = document.querySelector(".mobile-menu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.add("active");
    mobileMenu.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
  });
}

if (menuClose && mobileMenu) {
  menuClose.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
}

document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu?.classList.remove("active");
    mobileMenu?.setAttribute("aria-hidden", "true");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});
