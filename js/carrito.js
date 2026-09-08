/* =========================================================
   CARRITO.JS

   Gestión básica del carrito de compras.
   ========================================================= */


/* =========================================================
   1. CONFIGURACIÓN
   ========================================================= */

const CART_STORAGE_KEY = "offlineArchiveCart";

let cartMessageTimer;


/* =========================================================
   2. ELEMENTOS DEL HTML
   ========================================================= */

const cartItems =
    document.getElementById("cartItems");

const emptyCart =
    document.getElementById("emptyCart");

const cartProductCount =
    document.getElementById("cartProductCount");

const cartSubtotal =
    document.getElementById("cartSubtotal");

const cartTotal =
    document.getElementById("cartTotal");

const emptyCartButton =
    document.getElementById("emptyCartButton");

const checkoutButton =
    document.getElementById("checkoutButton");

const cartMessage =
    document.getElementById("cartMessage");


/* =========================================================
   3. FORMATO DE PRECIO
   ========================================================= */

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
   4. LEER CARRITO
   ========================================================= */

function getCart() {

    try {

        const storedCart =
            localStorage.getItem(CART_STORAGE_KEY);

        if (!storedCart) {
            return [];
        }

        return JSON.parse(storedCart);

    } catch (error) {

        return [];

    }

}


/* =========================================================
   5. GUARDAR CARRITO
   ========================================================= */

function saveCart(cart) {

    localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
    );

}


/* =========================================================
   6. CREAR PRODUCTO DEL CARRITO
   ========================================================= */

function createCartItem(product) {

    const productSubtotal =
        product.price * product.quantity;

    const productCode =
        `ITEM_${String(product.productId).padStart(3, "0")}`;


    return `

        <article
            class="cart-item"
            data-product-id="${product.productId}"
        >

            <div class="cart-item-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

            </div>


            <div class="cart-item-information">

                <p class="cart-item-code">
                    ${productCode}
                </p>

                <h2 class="cart-item-name">
                    ${product.name}
                </h2>

                <p class="cart-item-price">
                    Precio unitario:
                    ${formatPrice(product.price)}
                </p>


                <div class="quantity-controls">

                    <button
                        type="button"
                        data-action="decrease"
                        data-product-id="${product.productId}"
                        aria-label="Disminuir cantidad"
                    >
                        −
                    </button>

                    <span>
                        ${product.quantity}
                    </span>

                    <button
                        type="button"
                        data-action="increase"
                        data-product-id="${product.productId}"
                        aria-label="Aumentar cantidad"
                    >
                        +
                    </button>

                </div>


                <button
                    type="button"
                    class="remove-product"
                    data-action="remove"
                    data-product-id="${product.productId}"
                >
                    ELIMINAR
                </button>

            </div>


            <div class="cart-item-subtotal">

                <span>
                    SUBTOTAL
                </span>

                <strong>
                    ${formatPrice(productSubtotal)}
                </strong>

            </div>

        </article>

    `;

}


/* =========================================================
   7. ACTUALIZAR CONTADOR DEL NAVBAR
   ========================================================= */

function updateNavbarCount(cart) {

    const totalProducts =
        cart.reduce(
            (total, product) =>
                total + product.quantity,
            0
        );


    const desktopCounters =
        document.querySelectorAll(".cart-count");

    desktopCounters.forEach((counter) => {

        counter.textContent =
            totalProducts;

    });


    const mobileCounters =
        document.querySelectorAll(".mobile-cart b");

    mobileCounters.forEach((counter) => {

        counter.textContent =
            totalProducts;

    });


    if (cartProductCount) {

        cartProductCount.textContent =
            totalProducts;

    }

}


/* =========================================================
   8. CALCULAR TOTAL
   ========================================================= */

function calculateTotal(cart) {

    return cart.reduce(
        (total, product) => {

            return total +
                product.price *
                product.quantity;

        },
        0
    );

}


/* =========================================================
   9. MOSTRAR CARRITO
   ========================================================= */

function renderCart() {

    const cart =
        getCart();

    const cartIsEmpty =
        cart.length === 0;


    if (cartItems) {

        cartItems.innerHTML =
            cart
                .map(createCartItem)
                .join("");

        cartItems.hidden = cartIsEmpty;

    }


    if (emptyCart) {

        emptyCart.hidden = !cartIsEmpty;

    }


    const total =
        calculateTotal(cart);


    if (cartSubtotal) {

        cartSubtotal.textContent =
            formatPrice(total);

    }


    if (cartTotal) {

        cartTotal.textContent =
            formatPrice(total);

    }


    if (emptyCartButton) {

        emptyCartButton.disabled =
            cartIsEmpty;

    }


    if (checkoutButton) {

        checkoutButton.disabled =
            cartIsEmpty;

    }


    updateNavbarCount(cart);

}


/* =========================================================
   10. MOSTRAR MENSAJE
   ========================================================= */

function showCartMessage(message) {

    if (!cartMessage) {
        return;
    }


    cartMessage.textContent =
        message;


    clearTimeout(cartMessageTimer);


    cartMessageTimer =
        setTimeout(
            () => {

                cartMessage.textContent = "";

            },
            3000
        );

}


/* =========================================================
   11. CAMBIAR CANTIDAD O ELIMINAR
   ========================================================= */

if (cartItems) {

    cartItems.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) {
                return;
            }


            const productId =
                Number(button.dataset.productId);

            const action =
                button.dataset.action;

            let cart =
                getCart();

            const product =
                cart.find(
                    (item) =>
                        item.productId === productId
                );


            if (!product) {
                return;
            }


            /* AUMENTAR CANTIDAD */

            if (action === "increase") {

                if (product.quantity < product.stock) {

                    product.quantity++;

                    showCartMessage(
                        "CANTIDAD ACTUALIZADA."
                    );

                } else {

                    showCartMessage(
                        "NO HAY MÁS STOCK DISPONIBLE."
                    );

                }

            }


            /* DISMINUIR CANTIDAD */

            if (action === "decrease") {

                if (product.quantity > 1) {

                    product.quantity--;

                    showCartMessage(
                        "CANTIDAD ACTUALIZADA."
                    );

                }

            }


            /* ELIMINAR PRODUCTO */

            if (action === "remove") {

                cart =
                    cart.filter(
                        (item) =>
                            item.productId !== productId
                    );

                showCartMessage(
                    "PRODUCTO ELIMINADO DEL CARRITO."
                );

            }


            saveCart(cart);

            renderCart();

        }
    );

}


/* =========================================================
   12. VACIAR CARRITO
   ========================================================= */

if (emptyCartButton) {

    emptyCartButton.addEventListener(
        "click",
        () => {

            saveCart([]);

            renderCart();

            showCartMessage(
                "EL CARRITO FUE VACIADO."
            );

        }
    );

}


/* =========================================================
   13. CONTINUAR COMPRA
   ========================================================= */

if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        () => {

            const cart =
                getCart();


            if (cart.length === 0) {
                return;
            }


            showCartMessage(
                "COMPRA SIMULADA CORRECTAMENTE."
            );

        }
    );

}


/* =========================================================
   14. INICIAR CARRITO
   ========================================================= */

renderCart();