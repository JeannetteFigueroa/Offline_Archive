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

        formMessage.classList.remove("success", "error");


        let valid = true;


        // =====================================================
        // NOMBRE
        // =====================================================

        const name = contactName.value.trim();

        if (name === "") {

            nameError.textContent = "Ingresa tu nombre.";

            valid = false;

        } else if (name.length > 100) {
            nameError.textContent = "El nombre no debe exceder los 100 caracteres.";
            valid = false;
        }

            


        // =====================================================
        // CORREO
        // =====================================================

        const email = contactEmail.value.trim().toLowerCase();

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Array de dominios permitidos
        const allowedDomains = [
            "@duoc.cl",
            "@profesor.duoc.cl", 
            "@gmail.com",
        ];

        //Verifica si el correo termina con alguno de los dominios permitidos en el array
        const allowedDomain = 
            allowedDomains.some((domain) =>
                email.endsWith(domain)
            );

        
        // Si el correo no termina con un dominio permitido, muestra un mensaje de error
        if (email === "") {

            emailError.textContent =
                "Ingresa tu correo.";

            valid = false;
        } else if (email.length > 100) {

            emailError.textContent =
                "El correo no debe exceder los 100 caracteres.";

            valid = false;


        // Verifica si el correo tiene un formato válido
        } else if (!emailPattern.test(email)) {

            emailError.textContent =
                "Ingresa un correo válido.";

            valid = false;

        }


        // =====================================================
        // ASUNTO
        // =====================================================

        // Verifica si el asunto está vacío
        const subject = contactSubject.value.trim();

        if (subject === "") {

            subjectError.textContent =
                "Ingresa el motivo de tu mensaje.";

            valid = false;

        } else if (subject.length > 100) {
            subjectError.textContent =
                "El asunto no debe exceder los 100 caracteres.";

            valid = false;

        }
        // =====================================================
        // MENSAJE
        // =====================================================
        
        // Verifica si el mensaje está vacío
        const message = contactMessage.value.trim();


        if (message === "") {

            messageError.textContent =
                "Escribe un mensaje.";

            valid = false;

        } else if (message.length > 500) {
            messageError.textContent =
                "El mensaje no debe exceder los 500 caracteres.";

            valid = false;
        }
        
        // =====================================================
        // RESULTADO
        // =====================================================

        if (valid) {

            formMessage.textContent =
                "MENSAJE VALIDADO CORRECTAMENTE.";

            formMessage.classList.add("success");

            contactForm.reset();

        } else {

            formMessage.textContent =
                "HAY ERRORES EN EL FORMULARIO. POR FAVOR, REVISA LOS CAMPOS MARCADOS.";
            
            formMessage.classList.add("error");

        }

    });

}