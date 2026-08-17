let products = [];

let cart = [];

let paystackPublicKey = "";

/* =========================
   INITIALIZE
========================= */

async function initialize() {

    try {

        const productResponse =
            await fetch("/api/products");

        products =
            await productResponse.json();

        const configResponse =
            await fetch("/api/config");

        const config =
            await configResponse.json();

        paystackPublicKey =
            config.publicKey;

        displayProducts();

    } catch (error) {

        console.error(
            "Initialization error:",
            error
        );

    }

}

initialize();

/* =========================
   DISPLAY PRODUCTS
========================= */

function displayProducts() {

    const container =
        document.getElementById(
            "dataProducts"
        );

    const dataProducts =
        products.filter(
            product =>
                product.category === "data"
        );

    container.innerHTML =
        dataProducts.map(product => `

            <div class="product-card">

                <span class="mtn-label">
                    MTN DATA
                </span>

                <h3>
                    ${product.name
                        .replace("MTN ", "")}
                </h3>

                <div class="price">
                    GH₵${product.price.toFixed(2)}
                </div>

                <button
                    class="buy-button"
                    onclick="addToCart('${product.id}')"
                >
                    Add to Cart
                </button>

            </div>

        `).join("");

}

/* =========================
   ADD TO CART
========================= */

function addToCart(productId) {

    const product =
        products.find(
            item =>
                item.id === productId
        );

    if (!product) return;

    cart.push(product);

    updateCart();

    openCart();

}

/* =========================
   UPDATE CART
========================= */

function updateCart() {

    document.getElementById(
        "cartCount"
    ).innerText = cart.length;

    const container =
        document.getElementById(
            "cartItems"
        );

    if (cart.length === 0) {

        container.innerHTML = `
            <p>
                Your cart is empty.
            </p>
        `;

    } else {

        container.innerHTML =
            cart.map(
                (item, index) => `

                    <div class="cart-item">

                        <div>
                            <strong>
                                ${item.name}
                            </strong>

                            <br>

                            GH₵${item.price.toFixed(2)}
                        </div>

                        <button
                            class="remove-button"
                            onclick="removeFromCart(${index})"
                        >
                            Remove
                        </button>

                    </div>

                `
            ).join("");

    }

    const total =
        getCartTotal();

    document.getElementById(
        "cartTotal"
    ).innerText =
        `GH₵${total.toFixed(2)}`;

    document.getElementById(
        "checkoutTotal"
    ).innerText =
        `GH₵${total.toFixed(2)}`;

}

/* =========================
   REMOVE ITEM
========================= */

function removeFromCart(index) {

    cart.splice(index, 1);

    updateCart();

}

/* =========================
   CART TOTAL
========================= */

function getCartTotal() {

    return cart.reduce(
        (total, item) =>
            total + Number(item.price),
        0
    );

}

/* =========================
   OPEN CART
========================= */

function openCart() {

    document.getElementById(
        "cartOverlay"
    ).style.display = "flex";

    updateCart();

}

/* =========================
   CLOSE CART
========================= */

function closeCart() {

    document.getElementById(
        "cartOverlay"
    ).style.display = "none";

}

/* =========================
   CHECKOUT
========================= */

function openCheckout() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;

    }

    closeCart();

    document.getElementById(
        "checkoutOverlay"
    ).style.display = "flex";

    updateCart();

}

/* =========================
   CLOSE CHECKOUT
========================= */

function closeCheckout() {

    document.getElementById(
        "checkoutOverlay"
    ).style.display = "none";

}

/* =========================
   PAY NOW
========================= */

async function payNow() {

    const name =
        document.getElementById(
            "customerName"
        ).value.trim();

    const phone =
        document.getElementById(
            "customerPhone"
        ).value.trim();

    const email =
        document.getElementById(
            "customerEmail"
        ).value.trim();

    if (!name || !phone || !email) {

        alert(
            "Please complete all customer information."
        );

        return;

    }

    if (!cart.length) {

        alert(
            "Your cart is empty."
        );

        return;

    }

    const total =
        getCartTotal();

    const product =
        cart.map(
            item => item.name
        ).join(", ");

    try {

        const orderResponse =
            await fetch(
                "/api/orders",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        customerName: name,

                        phone: phone,

                        email: email,

                        product: product,

                        amount: total

                    })

                }
            );

        const order =
            await orderResponse.json();

        if (!order.success) {

            throw new Error(
                "Could not create order."
            );

        }

        if (
            !paystackPublicKey ||
            paystackPublicKey.includes(
                "REPLACE"
            )
        ) {

            alert(
                "Paystack has not been configured yet. Add your Paystack public key to the .env file."
            );

            return;

        }

        const handler =
            PaystackPop.setup({

                key:
                    paystackPublicKey,

                email:
                    email,

                amount:
                    Math.round(
                        total * 100
                    ),

                currency:
                    "GHS",

                ref:
                    "WISETECH-" +
                    order.orderId +
                    "-" +
                    Date.now(),

                metadata: {

                    custom_fields: [

                        {
                            display_name:
                                "Customer Name",

                            variable_name:
                                "customer_name",

                            value:
                                name
                        },

                        {
                            display_name:
                                "Phone",

                            variable_name:
                                "phone",

                            value:
                                phone
                        },

                        {
                            display_name:
                                "Product",

                            variable_name:
                                "product",

                            value:
                                product
                        },

                        {
                            display_name:
                                "Order ID",

                            variable_name:
                                "order_id",

                            value:
                                String(
                                    order.orderId
                                )
                        }

                    ]

                },

                callback:
                    function(response) {

                        alert(
                            "Payment completed.\n\nReference: " +
                            response.reference
                        );

                        /*
                         IMPORTANT:

                         Do not automatically deliver
                         data merely because this callback
                         runs.

                         Your backend should verify the
                         Paystack transaction first.
                        */

                        cart = [];

                        updateCart();

                        closeCheckout();

                    },

                onClose:
                    function() {

                        console.log(
                            "Payment window closed."
                        );

                    }

            });

        handler.openIframe();

    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong while creating your order."
        );

    }

}

/* =========================
   WHATSAPP
========================= */

function whatsappMessage(message) {

    const number =
        "233542665822";

    const url =
        "https://wa.me/" +
        number +
        "?text=" +
        encodeURIComponent(
            message
        );

    window.open(
        url,
        "_blank"
    );

}

/* =========================
   SUBSCRIPTION ORDER
========================= */

function subscriptionOrder(product) {

    whatsappMessage(
        "Hello WISETECH, I am interested in " +
        product +
        ". Please send me the available options and price."
    );

}

/* =========================
   CART WHATSAPP
========================= */

function cartWhatsApp() {

    if (!cart.length) {

        alert(
            "Your cart is empty."
        );

        return;

    }

    let message =
        "Hello WISETECH,%0A%0AI want to order:%0A";

    cart.forEach(
        (item, index) => {

            message +=
                (index + 1) +
                ". " +
                item.name +
                " - GH₵" +
                item.price +
                "%0A";

        }
    );

    message +=
        "%0ATotal: GH₵" +
        getCartTotal().toFixed(2);

    window.open(
        "https://wa.me/233542665822?text=" +
        message,
        "_blank"
    );

}
