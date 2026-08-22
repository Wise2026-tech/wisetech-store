/* =========================================================
   WISETECH FRONTEND
========================================================= */

let products = [];

let cart = [];


/* =========================================================
   START WEBSITE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        loadCart();

        await loadProducts();

        checkPaymentReturn();

    }
);


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    const container =
        document.getElementById(
            "dataProducts"
        );


    try {

        const response =
            await fetch(
                "/api/products"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load products."
            );

        }


        products =
            await response.json();


        displayDataProducts();

        renderCart();


    } catch (error) {

        console.error(
            "Products:",
            error
        );


        if (container) {

            container.innerHTML = `
                <p style="
                    padding:20px;
                    color:#c00;
                ">
                    Unable to load data bundles.
                    Please refresh the page.
                </p>
            `;

        }

    }

}


/* =========================================================
   SHOW MTN DATA
========================================================= */

function displayDataProducts() {

    const container =
        document.getElementById(
            "dataProducts"
        );


    if (!container) {
        return;
    }


    const dataProducts =
        products.filter(
            product =>
                product.category ===
                "data"
        );


    container.innerHTML =
        dataProducts
            .map(
                product => `

                    <article class="product-card">

                        <span class="mtn-label">
                            MTN DATA
                        </span>

                        <h3>
                            ${escapeHtml(
                                product.displayName
                            )}
                        </h3>

                        <p class="price">
                            GH₵${Number(
                                product.price
                            ).toFixed(2)}
                        </p>

                        <button
                            class="buy-button"
                            onclick="addToCart('${product.id}')"
                        >
                            🛒 BUY NOW
                        </button>

                    </article>

                `
            )
            .join("");

}


/* =========================================================
   ADD PRODUCT
========================================================= */

function addToCart(productId) {

    const product =
        products.find(
            item =>
                item.id === productId
        );


    if (!product) {

        alert(
            "Product unavailable."
        );

        return;

    }


    cart.push(
        product.id
    );


    saveCart();

    renderCart();

    openCart();

}


/* =========================================================
   REMOVE PRODUCT
========================================================= */

function removeFromCart(index) {

    cart.splice(
        index,
        1
    );


    saveCart();

    renderCart();

}


/* =========================================================
   CART ITEMS
========================================================= */

function getCartProducts() {

    return cart
        .map(
            productId =>
                products.find(
                    product =>
                        product.id ===
                        productId
                )
        )
        .filter(Boolean);

}


/* =========================================================
   TOTAL
========================================================= */

function getCartTotal() {

    return getCartProducts()
        .reduce(
            (
                total,
                product
            ) =>
                total +
                Number(
                    product.price
                ),
            0
        );

}


/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

    const count =
        document.getElementById(
            "cartCount"
        );


    if (count) {

        count.textContent =
            cart.length;

    }


    const cartItems =
        document.getElementById(
            "cartItems"
        );


    const cartTotal =
        document.getElementById(
            "cartTotal"
        );


    const checkoutTotal =
        document.getElementById(
            "checkoutTotal"
        );


    const total =
        getCartTotal();


    if (cartTotal) {

        cartTotal.textContent =
            `GH₵${total.toFixed(2)}`;

    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            `GH₵${total.toFixed(2)}`;

    }


    if (!cartItems) {
        return;
    }


    const cartProducts =
        getCartProducts();


    if (
        cartProducts.length === 0
    ) {

        cartItems.innerHTML = `
            <p style="
                padding:20px 0;
                color:#777;
            ">
                Your cart is empty.
            </p>
        `;

        return;

    }


    cartItems.innerHTML =
        cartProducts
            .map(
                (
                    product,
                    index
                ) => `

                    <div class="cart-item">

                        <div>

                            <strong>
                                ${escapeHtml(
                                    product.name
                                )}
                            </strong>

                            <br>

                            <span>
                                GH₵${Number(
                                    product.price
                                ).toFixed(2)}
                            </span>

                        </div>

                        <button
                            class="remove-button"
                            onclick="removeFromCart(${index})"
                        >
                            Remove
                        </button>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   SAVE CART
========================================================= */

function saveCart() {

    localStorage.setItem(
        "wisetech-cart",
        JSON.stringify(cart)
    );

}


/* =========================================================
   LOAD CART
========================================================= */

function loadCart() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "wisetech-cart"
                )
            );


        if (
            Array.isArray(saved)
        ) {

            cart = saved;

        }

    } catch {

        cart = [];

    }

}


/* =========================================================
   OPEN CART
========================================================= */

function openCart() {

    const overlay =
        document.getElementById(
            "cartOverlay"
        );


    if (overlay) {

        overlay.style.display =
            "flex";

    }

}


/* =========================================================
   CLOSE CART
========================================================= */

function closeCart() {

    const overlay =
        document.getElementById(
            "cartOverlay"
        );


    if (overlay) {

        overlay.style.display =
            "none";

    }

}


/* =========================================================
   OPEN CHECKOUT
========================================================= */

function openCheckout() {

    if (
        getCartProducts()
            .length === 0
    ) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    closeCart();


    const checkout =
        document.getElementById(
            "checkoutOverlay"
        );


    if (checkout) {

        checkout.style.display =
            "flex";

    }


    renderCart();

}


/* =========================================================
   CLOSE CHECKOUT
========================================================= */

function closeCheckout() {

    const checkout =
        document.getElementById(
            "checkoutOverlay"
        );


    if (checkout) {

        checkout.style.display =
            "none";

    }

}


/* =========================================================
   PAY WITH PAYSTACK
========================================================= */

async function payNow() {

    const customerName =
        document
            .getElementById(
                "customerName"
            )
            ?.value
            .trim();


    const phone =
        document
            .getElementById(
                "customerPhone"
            )
            ?.value
            .trim();


    const email =
        document
            .getElementById(
                "customerEmail"
            )
            ?.value
            .trim();


    if (
        !customerName ||
        !phone ||
        !email
    ) {

        alert(
            "Please enter your name, phone number and email."
        );

        return;

    }


    if (
        cart.length === 0
    ) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/api/paystack/initialize",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            customerName,

                            phone,

                            email,

                            items:
                                cart

                        })

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.error ||
                "Payment could not start."
            );

        }


        /*
            Send customer to Paystack's
            secure checkout page.
        */

        window.location.href =
            result.authorizationUrl;


    } catch (error) {

        console.error(
            "Payment:",
            error
        );


        alert(
            error.message ||
            "Unable to start payment."
        );

    }

}


/* =========================================================
   SUBSCRIPTION PLAN SELECTION

   Your existing HTML calls:
   subscriptionOrder("Netflix Subscription")
========================================================= */

function subscriptionOrder(
    service
) {

    const plans =
        products.filter(
            product =>
                product.category ===
                    "subscription" &&
                product.service ===
                    service
        );


    if (
        plans.length === 0
    ) {

        alert(
            "This subscription is currently unavailable."
        );

        return;

    }


    const menu =
        plans
            .map(
                (
                    plan,
                    index
                ) => {

                    const details =
                        plan.details
                            ? ` - ${plan.details}`
                            : "";


                    return (
                        `${index + 1}. ` +
                        `${plan.displayName} - ` +
                        `GH₵${Number(
                            plan.price
                        ).toFixed(2)}` +
                        `${details}`
                    );

                }
            )
            .join("\n");


    const answer =
        prompt(
            `Choose your plan:\n\n${menu}\n\nEnter the plan number:`
        );


    if (
        answer === null
    ) {

        return;

    }


    const choice =
        Number(answer) - 1;


    if (
        !Number.isInteger(choice) ||
        choice < 0 ||
        choice >= plans.length
    ) {

        alert(
            "Please select a valid plan number."
        );

        return;

    }


    addToCart(
        plans[choice].id
    );

}


/* =========================================================
   WHATSAPP
========================================================= */

function whatsappMessage(
    message
) {

    const number =
        "233542665822";


    const url =
        `https://wa.me/${number}?text=${encodeURIComponent(message)}`;


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================================
   CART THROUGH WHATSAPP
========================================================= */

function cartWhatsApp() {

    const cartProducts =
        getCartProducts();


    if (
        cartProducts.length === 0
    ) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    const lines =
        cartProducts
            .map(
                product =>
                    `${product.name} - GH₵${Number(
                        product.price
                    ).toFixed(2)}`
            )
            .join("\n");


    const total =
        getCartTotal();


    const message =
        `Hello WISETECH,\n\n` +
        `I would like to order:\n\n` +
        `${lines}\n\n` +
        `Total: GH₵${total.toFixed(2)}`;


    whatsappMessage(
        message
    );

}


/* =========================================================
   PAYMENT RETURN MESSAGE
========================================================= */

function checkPaymentReturn() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const payment =
        params.get(
            "payment"
        );


    if (!payment) {
        return;
    }


    if (
        payment === "success"
    ) {

        cart = [];

        saveCart();

        renderCart();


        alert(
            "Payment successful! Your WISETECH order has been received."
        );

    }


    if (
        payment === "failed"
    ) {

        alert(
            "Payment was not completed."
        );

    }


    if (
        payment === "error"
    ) {

        alert(
            "We could not verify your payment. Please contact WISETECH support if you were charged."
        );

    }


    /*
        Remove ?payment=... from URL
        without reloading.
    */

    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );

}


/* =========================================================
   SECURITY HELPER
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}
