const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const mobileMenu = document.querySelector(".mobile-menu");


menuToggle.addEventListener("click", () => {
    mobileMenu.classList.add("active");
});


menuClose.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
});