/* =========================================================
   CONTACTO.JS

   Validaciones básicas del formulario de contacto.
   ========================================================= */


const contactForm = document.getElementById("contactForm");

const contactName = document.getElementById("contactName");
const contactEmail = document.getElementById("contactEmail");
const contactSubject = document.getElementById("contactSubject");
const contactMessage = document.getElementById("contactMessage");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const subjectError = document.getElementById("subjectError");
const messageError = document.getElementById("messageError");

const formMessage = document.getElementById("formMessage");


if (contactForm) {

    contactForm.addEventListener("submit", (event) => {

        event.preventDefault();


        // Limpiar mensajes anteriores

        nameError.textContent = "";
        emailError.textContent = "";
        subjectError.textContent = "";
        messageError.textContent = "";
        formMessage.textContent = "";


        let valid = true;


        // =====================================================
        // NOMBRE
        // =====================================================

        if (contactName.value.trim() === "") {

            nameError.textContent = "Ingresa tu nombre.";

            valid = false;

        }


        // =====================================================
        // CORREO
        // =====================================================

        const email = contactEmail.value.trim();

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (email === "") {

            emailError.textContent =
                "Ingresa tu correo.";

            valid = false;

        } else if (!emailPattern.test(email)) {

            emailError.textContent =
                "Ingresa un correo válido.";

            valid = false;

        }


        // =====================================================
        // ASUNTO
        // =====================================================

        if (contactSubject.value.trim() === "") {

            subjectError.textContent =
                "Ingresa un asunto.";

            valid = false;

        }


        // =====================================================
        // MENSAJE
        // =====================================================

        if (contactMessage.value.trim() === "") {

            messageError.textContent =
                "Escribe un mensaje.";

            valid = false;

        }


        // =====================================================
        // RESULTADO
        // =====================================================

        if (valid) {

            formMessage.textContent =
                "MENSAJE VALIDADO CORRECTAMENTE.";

            contactForm.reset();

        }

    });

}