/* =========================================================
   PRODUCTOS.JS

   Datos, filtros, búsqueda y renderizado del catálogo.
   ========================================================= */


/* =========================================================
   1. PRODUCTOS
   ========================================================= */
// Lista de productos disponibles en el catálogo
const PRODUCTS = [

    {
        id: 1,
        code: "ITEM_001",
        name: "Baby Tee Static",
        category: "tops",
        categoryLabel: "Tops",
        price: 19990,
        stock: 8,
        image:
            "assets/images/productos/camisetaBabyTeeNegraStatic.png",
        description:
            "Baby tee negra de algodón lavado con estampado abstracto."
    },

    {
        id: 2,
        code: "ITEM_002",
        name: "Mesh Top Signal",
        category: "tops",
        categoryLabel: "Tops",
        price: 22990,
        stock: 6,
        image:
            "assets/images/productos/TopDeMallaNegraConDetallesVerdes.png",
        description:
            "Top de malla negra con paneles y costuras verdes."
    },

    {
        id: 3,
        code: "ITEM_003",
        name: "Cargo Rupture",
        category: "bottoms",
        categoryLabel: "Bottoms",
        price: 34990,
        stock: 10,
        image:
            "assets/images/productos/pantalonCargoNegroDePiernaAncha.png",
        description:
            "Pantalón cargo negro de pierna ancha con correas metálicas."
    },

    {
        id: 4,
        code: "ITEM_004",
        name: "Falda Circuit",
        category: "bottoms",
        categoryLabel: "Bottoms",
        price: 26990,
        stock: 7,
        image:
            "assets/images/productos/miniFaldaNegraPlisadaConCadena.png",
        description:
            "Mini falda negra plisada con capas y cadena plateada."
    },

    {
        id: 5,
        code: "ITEM_005",
        name: "Cinturón Chrome-03",
        category: "accesorios",
        categoryLabel: "Accesorios",
        price: 14990,
        stock: 12,
        image:
            "assets/images/productos/cinturonNegroConHebillaCromada.png",
        description:
            "Cinturón negro con hebilla cromada, tachas y ojales."
    },

    {
        id: 6,
        code: "ITEM_006",
        name: "Collar System",
        category: "accesorios",
        categoryLabel: "Accesorios",
        price: 12990,
        stock: 9,
        image:
            "assets/images/productos/chokerNegroConAroPlateado.png",
        description:
            "Choker negro de cuero con aros y piezas metálicas."
    },

    {
        id: 7,
        code: "ITEM_007",
        name: "Chaqueta Archive 2003",
        category: "outerwear",
        categoryLabel: "Outerwear",
        price: 49990,
        stock: 5,
        image:
            "assets/images/productos/chaquetaNegraArchive2003.png",
        description:
            "Chaqueta negra desgastada con cierre y correas laterales."
    },

    {
        id: 8,
        code: "ITEM_008",
        name: "Hoodie Noise",
        category: "outerwear",
        categoryLabel: "Outerwear",
        price: 39990,
        stock: 6,
        image:
            "assets/images/productos/sudaderaCarbonDeEsteticaIndustrial.png",
        description:
            "Hoodie oversize color carbón con acabado industrial."
    }

];


/* =========================================================
   2. CONFIGURACIÓN
   ========================================================= */

const CART_KEY = "offlineArchiveCart";

let selectedCategory = "todos";
let messageTimer;


/* =========================================================
   3. ELEMENTOS DEL HTML
   ========================================================= */
// Contenedores y elementos del catálogo
const productsGrid =
    document.getElementById("productsGrid");

const productSearch =
    document.getElementById("productSearch");

const filterButtons =
    document.querySelectorAll(".filter-button");

const productCount =
    document.getElementById("productCount");

const emptyProducts =
    document.getElementById("emptyProducts");

const catalogMessage =
    document.getElementById("catalogMessage");


/* =========================================================
   4. FORMATO DE PRECIO
   ========================================================= */
// Formatea un número como precio en pesos chilenos
function formatPrice(price) {

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
   5. NORMALIZAR TEXTO
   ========================================================= */
// Normaliza el texto para la búsqueda, eliminando acentos y convirtiendo a minúsculas
function normalizeText(value) {

    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


/* =========================================================
   6. CREAR TARJETA
   ========================================================= */
// Crea el HTML de una tarjeta de producto
function createProductCard(product) {

    return `
        <article class="product-card">
            <div class="product-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

                <span class="product-code">
                    ${product.code}
                </span>

            </div>


            <div class="product-content">

                <p class="product-category">
                    ${product.categoryLabel}
                </p>

                <h3 class="product-name">
                    ${product.name}
                </h3>

                <p class="product-description">
                    ${product.description}
                </p>


                <div class="product-information">

                    <div>

                        <strong class="product-price">
                            ${formatPrice(product.price)}
                        </strong>

                        <span class="product-stock">
                            STOCK: ${product.stock}
                        </span>

                    </div>


                    <button
                        type="button"
                        class="add-product"
                        data-product-id="${product.id}"
                    >
                        AGREGAR
                        <span>+</span>
                    </button>

                </div>

            </div>

        </article>
    `;

}


/* =========================================================
   7. MOSTRAR PRODUCTOS
   ========================================================= */
// Renderiza los productos en el contenedor del catálogo
function renderProducts(products) {

    if (!productsGrid) {
        return;
    }


    productsGrid.innerHTML =
        products
            .map(createProductCard)
            .join("");


    if (productCount) {

        productCount.textContent =
            products.length;

    }


    if (emptyProducts) {

        emptyProducts.hidden =
            products.length !== 0;

    }

}


/* =========================================================
   8. FILTRAR PRODUCTOS
   ========================================================= */

// Filtra los productos según la categoría seleccionada y el valor de búsqueda
function filterProducts() {
    // Normaliza el valor de búsqueda ingresado por el usuario
    const searchValue =
        normalizeText(productSearch?.value.trim() || "");

    // Filtra los productos según la categoría seleccionada y el valor de búsqueda
    const filteredProducts =
        PRODUCTS.filter((product) => {

            const matchesCategory =
                selectedCategory === "todos" ||
                product.category === selectedCategory;

            // Normaliza el texto del producto para la búsqueda
            const searchableText =
                normalizeText(
                    `${product.name}
                     ${product.categoryLabel}
                     ${product.description}`
                );

            // Verifica si el texto normalizado del producto incluye el valor de búsqueda normalizado
            const matchesSearch =
                searchableText.includes(searchValue);


            return (
                matchesCategory &&
                matchesSearch
            );

        });


    renderProducts(filteredProducts);

}


/* =========================================================
   9. BOTONES DE CATEGORÍA
   ========================================================= */
// Agrega eventos a los botones de filtro de categoría
filterButtons.forEach((button) => {
    // Agrega un evento de clic a cada botón de filtro
    button.addEventListener(
        "click",
        () => {

            selectedCategory =
                button.dataset.category;


            filterButtons.forEach(
                (currentButton) => {

                    const isActive =
                        currentButton === button;

                    currentButton
                        .classList
                        .toggle(
                            "active",
                            isActive
                        );

                    currentButton.setAttribute(
                        "aria-pressed",
                        String(isActive)
                    );

                }
            );


            filterProducts();

        }
    );

});


/* =========================================================
   10. BUSCADOR
   ========================================================= */
// Filtra los productos mientras el usuario escribe en el campo de búsqueda
if (productSearch) {

    productSearch.addEventListener(
        "input",
        filterProducts
    );

}


/* =========================================================
   11. LEER CARRITO
   ========================================================= */
// Lee el carrito almacenado en el almacenamiento local
function getStoredCart() {

    try {

        const storedCart =
            JSON.parse(
                localStorage.getItem(CART_KEY) ||
                "[]"
            );

        return Array.isArray(storedCart)
            ? storedCart
            : [];

    } catch {

        return [];

    }

}


/* =========================================================
   12. GUARDAR CARRITO
   ========================================================= */
// Guardar el carrito en el almacenamiento local
function saveCart(cart) {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}


/* =========================================================
   13. ACTUALIZAR CONTADOR
   ========================================================= */
// Actualiza el contador de productos en el carrito
function updateCartCount() {
    // Lee el carrito almacenado
    const cart = getStoredCart();
    // Calcula la cantidad total de productos en el carrito
    const totalProducts =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

    // Actualiza el contenido de los elementos con la clase "cart-count" y "mobile-cart b"
    document
        .querySelectorAll(".cart-count")
        .forEach((counter) => {

            counter.textContent =
                totalProducts;

        });


    document
        .querySelectorAll(".mobile-cart b")
        .forEach((counter) => {

            counter.textContent =
                totalProducts;

        });

}


/* =========================================================
   14. MENSAJE DEL CATÁLOGO
   ========================================================= */

function showCatalogMessage(message) {

    if (!catalogMessage) {
        return;
    }


    clearTimeout(messageTimer);

    catalogMessage.textContent =
        message;


    messageTimer = setTimeout(
        () => {

            catalogMessage.textContent = "";

        },
        3000
    );

}


/* =========================================================
   15. AGREGAR AL CARRITO
   ========================================================= */

function addProductToCart(productId) {

    const selectedProduct =
        PRODUCTS.find(
            (product) =>
                product.id === productId
        );


    if (!selectedProduct) {
        return;
    }


    const cart = getStoredCart();

    const existingProduct =
        cart.find(
            (item) =>
                item.productId === productId
        );


    if (existingProduct) {

        if (
            existingProduct.quantity >=
            selectedProduct.stock
        ) {

            showCatalogMessage(
                `NO HAY MÁS STOCK DE ${selectedProduct.name.toUpperCase()}.`
            );

            return;

        }


        existingProduct.quantity += 1;

    } else {

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


    saveCart(cart);

    updateCartCount();

    showCatalogMessage(
        `${selectedProduct.name.toUpperCase()} FUE AGREGADO AL CARRITO.`
    );

}


/* =========================================================
   16. EVENTO DE LAS TARJETAS
   ========================================================= */

if (productsGrid) {

    productsGrid.addEventListener(
        "click",
        (event) => {
            // Verificamos si el clic fue en un botón de agregar producto
            const addButton =
                event.target.closest(
                    ".add-product"
                );


            if (!addButton) {
                return;
            }


            const productId =
                Number(
                    addButton.dataset.productId
                );

            // Agregamos el producto al carrito
            addProductToCart(productId);

        }
    );

}


/* =========================================================
   17. INICIALIZACIÓN
   ========================================================= */
// Renderizamos todos los productos al cargar la página
renderProducts(PRODUCTS);

// Actualizamos el contador del carrito al cargar la página
updateCartCount();