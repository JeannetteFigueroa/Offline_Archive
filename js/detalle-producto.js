/* =========================================================
   DETALLE-PRODUCTO.JS

   Este archivo se encarga de:

   1. Leer el producto seleccionado.
   2. Mostrar sus datos en detalle-producto.html.
   3. Agregar el producto al carrito.
   4. Actualizar el contador del navbar.
   ========================================================= */


/* =========================================================
   1. CLAVES DE LOCALSTORAGE

   Estas claves permiten encontrar la información guardada
   en el almacenamiento local del navegador.
   ========================================================= */

// Producto que el usuario seleccionó desde productos.html
const DETAIL_PRODUCT_KEY =
    "offlineArchiveSelectedProduct";

// Carrito de compras utilizado en todo el proyecto
const DETAIL_CART_KEY =
    "offlineArchiveCart";


/* =========================================================
   2. ELEMENTOS DEL HTML

   document.getElementById busca un elemento mediante su ID.
   Después podremos modificar su contenido con JavaScript.
   ========================================================= */

// Sección que contiene el detalle completo
const productDetail =
    document.getElementById("productDetail");

// Sección que aparece si no existe un producto seleccionado
const productNotFound =
    document.getElementById("productNotFound");

// Imagen del producto
const detailImage =
    document.getElementById("detailImage");

// Código, por ejemplo ITEM_001
const detailCode =
    document.getElementById("detailCode");

// Categoría, por ejemplo Tops
const detailCategory =
    document.getElementById("detailCategory");

// Nombre del producto
const detailName =
    document.getElementById("detailName");

// Descripción del producto
const detailDescription =
    document.getElementById("detailDescription");

// Precio del producto
const detailPrice =
    document.getElementById("detailPrice");

// Stock disponible
const detailStock =
    document.getElementById("detailStock");

// Botón para agregar al carrito
const detailAddButton =
    document.getElementById("detailAddButton");

// Espacio donde se mostrarán mensajes
const detailMessage =
    document.getElementById("detailMessage");


/* =========================================================
   3. VARIABLES

   selectedProduct guardará temporalmente el producto
   que se está mostrando en la página.
   ========================================================= */

let selectedProduct = null;

let detailMessageTimer;


/* =========================================================
   4. FORMATO DE PRECIO

   Convierte un número como 19990 en un precio chileno.
   Ejemplo: $19.990
   ========================================================= */

function formatDetailPrice(price) {

    return new Intl.NumberFormat(
        "es-CL",
        {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0
        }
    ).format(price);

}


/* =========================================================
   5. LEER PRODUCTO SELECCIONADO

   Obtiene desde localStorage el producto guardado
   por productos.js cuando se presiona "Ver detalle".
   ========================================================= */

function getSelectedProduct() {

    try {

        // Busca el producto guardado como texto
        const storedProduct =
            localStorage.getItem(
                DETAIL_PRODUCT_KEY
            );


        // Si no existe información, retorna null
        if (!storedProduct) {
            return null;
        }


        // Convierte el texto nuevamente en un objeto
        return JSON.parse(storedProduct);

    } catch (error) {

        // Si el contenido está dañado, retorna null
        return null;

    }

}


/* =========================================================
   6. LEER CARRITO

   Obtiene el arreglo del carrito desde localStorage.
   Si todavía no existe un carrito, retorna un arreglo vacío.
   ========================================================= */

function getDetailCart() {

    try {

        const storedCart =
            localStorage.getItem(
                DETAIL_CART_KEY
            );


        if (!storedCart) {
            return [];
        }


        const cart =
            JSON.parse(storedCart);


        // Confirma que el contenido sea realmente un arreglo
        return Array.isArray(cart)
            ? cart
            : [];

    } catch (error) {

        return [];

    }

}


/* =========================================================
   7. GUARDAR CARRITO

   Convierte el arreglo del carrito a texto y lo guarda
   nuevamente en localStorage.
   ========================================================= */

function saveDetailCart(cart) {

    localStorage.setItem(
        DETAIL_CART_KEY,
        JSON.stringify(cart)
    );

}


/* =========================================================
   8. ACTUALIZAR CONTADORES

   Suma las cantidades del carrito y muestra el resultado
   en el navbar de escritorio y en el menú móvil.
   ========================================================= */

function updateDetailCartCount() {

    const cart =
        getDetailCart();


    const totalProducts =
        cart.reduce(
            (total, product) =>
                total + product.quantity,
            0
        );


    // Contador del navbar de escritorio

    document
        .querySelectorAll(".cart-count")
        .forEach((counter) => {

            counter.textContent =
                totalProducts;

        });


    // Contador del menú móvil

    document
        .querySelectorAll(".mobile-cart b")
        .forEach((counter) => {

            counter.textContent =
                totalProducts;

        });

}


/* =========================================================
   9. MOSTRAR MENSAJE

   Muestra temporalmente un mensaje debajo del botón.
   Después de tres segundos, el mensaje desaparece.
   ========================================================= */

function showDetailMessage(message) {

    if (!detailMessage) {
        return;
    }


    detailMessage.textContent =
        message;


    clearTimeout(detailMessageTimer);


    detailMessageTimer =
        setTimeout(
            () => {

                detailMessage.textContent = "";

            },
            3000
        );

}


/* =========================================================
   10. MOSTRAR PRODUCTO

   Coloca la información del producto seleccionado
   dentro de los elementos correspondientes del HTML.
   ========================================================= */

function renderSelectedProduct() {

    // Obtiene el producto guardado
    selectedProduct =
        getSelectedProduct();


    /* -----------------------------------------------------
       PRODUCTO NO ENCONTRADO
       ----------------------------------------------------- */

    if (!selectedProduct) {

        // Mantiene oculto el detalle
        productDetail.hidden = true;

        // Muestra el mensaje de producto no encontrado
        productNotFound.hidden = false;

        return;

    }


    /* -----------------------------------------------------
       IMAGEN
       ----------------------------------------------------- */

    detailImage.src =
        selectedProduct.image;

    detailImage.alt =
        selectedProduct.name;


    /* -----------------------------------------------------
       INFORMACIÓN
       ----------------------------------------------------- */

    detailCode.textContent =
        selectedProduct.code;

    detailCategory.textContent =
        selectedProduct.categoryLabel;

    detailName.textContent =
        selectedProduct.name;

    detailDescription.textContent =
        selectedProduct.description;

    detailPrice.textContent =
        formatDetailPrice(
            selectedProduct.price
        );

    detailStock.textContent =
        `STOCK: ${selectedProduct.stock}`;


    /* -----------------------------------------------------
       TÍTULO DE LA PESTAÑA
       ----------------------------------------------------- */

    document.title =
        `${selectedProduct.name} | (Off)line Archive`;


    /* -----------------------------------------------------
       MOSTRAR LA SECCIÓN
       ----------------------------------------------------- */

    productDetail.hidden = false;

    productNotFound.hidden = true;


    /* -----------------------------------------------------
       CONTROL DEL BOTÓN

       Si el stock es cero, el botón queda desactivado.
       ----------------------------------------------------- */

    detailAddButton.disabled =
        selectedProduct.stock <= 0;

}


/* =========================================================
   11. AGREGAR PRODUCTO AL CARRITO
   ========================================================= */

function addSelectedProductToCart() {

    // Evita continuar si no existe un producto
    if (!selectedProduct) {
        return;
    }


    // Obtiene el carrito actual
    const cart =
        getDetailCart();


    // Busca si el producto ya está dentro del carrito
    const existingProduct =
        cart.find(
            (product) =>
                product.productId ===
                selectedProduct.id
        );


    /* -----------------------------------------------------
       PRODUCTO EXISTENTE
       ----------------------------------------------------- */

    if (existingProduct) {

        // Comprueba que la cantidad no supere el stock
        if (
            existingProduct.quantity >=
            selectedProduct.stock
        ) {

            showDetailMessage(
                "NO HAY MÁS STOCK DISPONIBLE."
            );

            return;

        }


        // Aumenta la cantidad en uno
        existingProduct.quantity++;

    }


    /* -----------------------------------------------------
       PRODUCTO NUEVO
       ----------------------------------------------------- */

    else {

        /*
         * Guarda los datos que carrito.js necesita
         * para mostrar el producto.
         */

        cart.push(
            {
                productId: selectedProduct.id,
                name: selectedProduct.name,
                price: selectedProduct.price,
                image: selectedProduct.image,
                stock: selectedProduct.stock,
                quantity: 1
            }
        );

    }


    // Guarda el carrito actualizado
    saveDetailCart(cart);


    // Actualiza el número que aparece en el navbar
    updateDetailCartCount();


    // Informa que la operación resultó correctamente
    showDetailMessage(
        `${selectedProduct.name.toUpperCase()} FUE AGREGADO AL CARRITO.`
    );

}


/* =========================================================
   12. EVENTO DEL BOTÓN

   Cuando el usuario presiona el botón, se ejecuta
   la función que agrega el producto al carrito.
   ========================================================= */

if (detailAddButton) {

    detailAddButton.addEventListener(
        "click",
        addSelectedProductToCart
    );

}


/* =========================================================
   13. INICIAR PÁGINA

   Estas funciones se ejecutan automáticamente
   cuando se carga detalle-producto.html.
   ========================================================= */

// Muestra la información del producto seleccionado
renderSelectedProduct();

// Muestra la cantidad actual del carrito
updateDetailCartCount();