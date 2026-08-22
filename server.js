require("dotenv").config();

const express = require("express");
const path = require("path");
const crypto = require("crypto");

const {
    createOrder,
    db
} = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;


/* =========================================================
   PRODUCT CATALOG
   IMPORTANT:
   Prices live on the SERVER.
   Customers cannot change these prices from their browser.
========================================================= */

const products = [

    // ================= MTN DATA =================

    {
        id: "mtn-1gb",
        name: "MTN 1GB",
        category: "data",
        price: 6
    },

    {
        id: "mtn-2gb",
        name: "MTN 2GB",
        category: "data",
        price: 11
    },

    {
        id: "mtn-3gb",
        name: "MTN 3GB",
        category: "data",
        price: 15
    },

    {
        id: "mtn-4gb",
        name: "MTN 4GB",
        category: "data",
        price: 20
    },

    {
        id: "mtn-5gb",
        name: "MTN 5GB",
        category: "data",
        price: 25
    },

    {
        id: "mtn-6gb",
        name: "MTN 6GB",
        category: "data",
        price: 28
    },

    {
        id: "mtn-8gb",
        name: "MTN 8GB",
        category: "data",
        price: 36
    },

    {
        id: "mtn-10gb",
        name: "MTN 10GB",
        category: "data",
        price: 47
    },

    {
        id: "mtn-15gb",
        name: "MTN 15GB",
        category: "data",
        price: 65
    },

    {
        id: "mtn-20gb",
        name: "MTN 20GB",
        category: "data",
        price: 85
    },

    {
        id: "mtn-25gb",
        name: "MTN 25GB",
        category: "data",
        price: 105
    },

    {
        id: "mtn-30gb",
        name: "MTN 30GB",
        category: "data",
        price: 128
    },


    // ================= NETFLIX =================

    {
        id: "netflix-mobile",
        name: "Netflix Mobile",
        category: "subscription",
        price: 40
    },

    {
        id: "netflix-basic",
        name: "Netflix Basic",
        category: "subscription",
        price: 55
    },

    {
        id: "netflix-standard",
        name: "Netflix Standard",
        category: "subscription",
        price: 110
    },

    {
        id: "netflix-premium",
        name: "Netflix Premium",
        category: "subscription",
        price: 135
    },


    // ================= YOUTUBE PREMIUM =================

    {
        id: "youtube-student",
        name: "YouTube Premium Student",
        category: "subscription",
        price: 120
    },

    {
        id: "youtube-individual-monthly",
        name: "YouTube Premium Individual",
        category: "subscription",
        price: 200
    },

    {
        id: "youtube-individual-annual",
        name: "YouTube Premium Individual Annual",
        category: "subscription",
        price: 1800
    },

    {
        id: "youtube-family",
        name: "YouTube Premium Family",
        category: "subscription",
        price: 335
    },


    // ================= SPOTIFY =================

    {
        id: "spotify-student",
        name: "Spotify Student",
        category: "subscription",
        price: 18
    },

    {
        id: "spotify-individual",
        name: "Spotify Individual",
        category: "subscription",
        price: 30
    },

    {
        id: "spotify-duo",
        name: "Spotify Duo",
        category: "subscription",
        price: 42
    },

    {
        id: "spotify-family",
        name: "Spotify Family",
        category: "subscription",
        price: 55
    },


    // ================= DSTV =================

    {
        id: "dstv-padi",
        name: "DStv Padi / Lite",
        category: "subscription",
        price: 65
    },

    {
        id: "dstv-access",
        name: "DStv Access",
        category: "subscription",
        price: 110
    },

    {
        id: "dstv-family",
        name: "DStv Family",
        category: "subscription",
        price: 205
    },

    {
        id: "dstv-compact",
        name: "DStv Compact",
        category: "subscription",
        price: 410
    },

    {
        id: "dstv-compact-plus",
        name: "DStv Compact Plus",
        category: "subscription",
        price: 610
    },

    {
        id: "dstv-premium",
        name: "DStv Premium",
        category: "subscription",
        price: 925
    },


    // ================= GOTV =================

    {
        id: "gotv-smallie",
        name: "GOtv Smallie / Lite",
        category: "subscription",
        price: 30
    },

    {
        id: "gotv-plus",
        name: "GOtv Plus / Value",
        category: "subscription",
        price: 110
    },

    {
        id: "gotv-max",
        name: "GOtv Max",
        category: "subscription",
        price: 195
    },

    {
        id: "gotv-supa",
        name: "GOtv Supa",
        category: "subscription",
        price: 250
    },

    {
        id: "gotv-supa-plus",
        name: "GOtv Supa Plus",
        category: "subscription",
        price: 325
    },


    // ================= PRIME VIDEO =================

    {
        id: "prime-ghana",
        name: "Prime Video Ghana Direct",
        category: "subscription",
        price: 75
    },

    {
        id: "prime-video-us",
        name: "US Prime Video",
        category: "subscription",
        price: 110
    },

    {
        id: "amazon-prime-full",
        name: "US Full Amazon Prime",
        category: "subscription",
        price: 185
    },

    {
        id: "amazon-prime-student",
        name: "US Prime Student",
        category: "subscription",
        price: 90
    }

];


/* =========================================================
   HELPERS
========================================================= */

function getProduct(productId) {

    return products.find(
        product => product.id === productId
    );

}


function getBaseUrl(req) {

    if (process.env.BASE_URL) {
        return process.env.BASE_URL;
    }

    return `${req.protocol}://${req.get("host")}`;

}


/* =========================================================
   VERIFY PAYMENT WITH PAYSTACK
========================================================= */

async function verifyAndMarkPaid(reference) {

    if (!reference) {
        throw new Error("Missing transaction reference.");
    }


    const response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
            method: "GET",

            headers: {
                Authorization:
                    `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        }
    );


    const result = await response.json();


    if (!response.ok || !result.status) {

        throw new Error(
            result.message ||
            "Unable to verify Paystack payment."
        );

    }


    const transaction = result.data;


    const order = db.prepare(`
        SELECT *
        FROM orders
        WHERE payment_reference = ?
        LIMIT 1
    `).get(reference);


    if (!order) {

        throw new Error(
            "No WISETECH order matches this payment."
        );

    }


    /*
        Paystack returns amount in pesewas.

        GH₵6.00 = 600
        GH₵40.00 = 4000
    */

    const expectedAmount =
        Math.round(Number(order.amount) * 100);


    const amountMatches =
        Number(transaction.amount) === expectedAmount;


    const currencyMatches =
        transaction.currency === "GHS";


    const paymentSucceeded =
        transaction.status === "success";


    if (
        !paymentSucceeded ||
        !amountMatches ||
        !currencyMatches
    ) {

        db.prepare(`
            UPDATE orders
            SET payment_status = ?
            WHERE id = ?
        `).run(
            "verification_failed",
            order.id
        );


        return {
            success: false,
            reason: "Payment verification failed."
        };

    }


    /*
        Important protection against processing
        the same transaction twice.
    */

    if (order.payment_status !== "paid") {

        db.prepare(`
            UPDATE orders
            SET payment_status = ?
            WHERE id = ?
        `).run(
            "paid",
            order.id
        );

    }


    return {

        success: true,

        orderId: order.id,

        reference: reference,

        amount: order.amount,

        product: order.product

    };

}


/* =========================================================
   PAYSTACK WEBHOOK

   IMPORTANT:
   This route MUST appear before express.json()
   because Paystack's signature is calculated using
   the raw request body.
========================================================= */

app.post(
    "/api/paystack/webhook",

    express.raw({
        type: "application/json"
    }),

    async (req, res) => {

        try {

            const signature =
                req.headers["x-paystack-signature"];


            if (!signature) {

                return res.sendStatus(401);

            }


            const hash =
                crypto
                    .createHmac(
                        "sha512",
                        process.env.PAYSTACK_SECRET_KEY
                    )
                    .update(req.body)
                    .digest("hex");


            if (hash !== signature) {

                return res.sendStatus(401);

            }


            const event =
                JSON.parse(
                    req.body.toString("utf8")
                );


            /*
                Paystack tells WISETECH that
                a payment succeeded.
            */

            if (
                event.event ===
                "charge.success"
            ) {

                const reference =
                    event.data.reference;


                try {

                    await verifyAndMarkPaid(
                        reference
                    );

                } catch (error) {

                    console.error(
                        "Webhook verification error:",
                        error.message
                    );

                }

            }


            return res.sendStatus(200);


        } catch (error) {

            console.error(
                "Webhook error:",
                error
            );

            return res.sendStatus(500);

        }

    }
);


/* =========================================================
   NORMAL MIDDLEWARE
========================================================= */

app.use(express.json());

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


/* =========================================================
   GET PRODUCTS
========================================================= */

app.get(
    "/api/products",
    (req, res) => {

        /*
            Only data products are currently loaded
            automatically by app.js.

            Subscription checkout will be connected
            in our next step.
        */

        const dataProducts =
            products.filter(
                product =>
                    product.category === "data"
            );


        res.json(dataProducts);

    }
);


/* =========================================================
   INITIALIZE PAYSTACK TRANSACTION
========================================================= */

app.post(
    "/api/paystack/initialize",

    async (req, res) => {

        try {

            const {
                customerName,
                phone,
                email,
                items
            } = req.body;


            if (
                !customerName ||
                !phone ||
                !email
            ) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Name, phone and email are required."
                });

            }


            if (
                !Array.isArray(items) ||
                items.length === 0
            ) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Your order is empty."
                });

            }


            /*
                Look up every product on the SERVER.

                We DO NOT trust prices sent
                by the customer's browser.
            */

            const selectedProducts = [];


            for (const productId of items) {

                const product =
                    getProduct(productId);


                if (!product) {

                    return res.status(400).json({
                        success: false,
                        error:
                            `Invalid product: ${productId}`
                    });

                }


                selectedProducts.push(
                    product
                );

            }


            const total =
                selectedProducts.reduce(
                    (sum, product) =>
                        sum + product.price,
                    0
                );


            const productNames =
                selectedProducts
                    .map(product => product.name)
                    .join(", ");


            /*
                Create pending WISETECH order.
            */

            const orderResult =
                createOrder({

                    customerName,
                    phone,
                    email,
                    product:
                        productNames,
                    amount:
                        total

                });


            const orderId =
                Number(
                    orderResult.lastInsertRowid
                );


            const reference =
                `WISETECH-${orderId}-${Date.now()}`;


            /*
                Save Paystack reference.
            */

            db.prepare(`
                UPDATE orders

                SET
                    payment_reference = ?,
                    payment_status = ?

                WHERE id = ?
            `).run(
                reference,
                "pending",
                orderId
            );


            /*
                GH₵ amount → pesewas.

                GH₵40 becomes 4000.
            */

            const amountInPesewas =
                Math.round(
                    total * 100
                );


            const callbackUrl =
                `${getBaseUrl(req)}/api/paystack/callback`;


            /*
                Initialize transaction
                directly from WISETECH server.
            */

            const paystackResponse =
                await fetch(
                    "https://api.paystack.co/transaction/initialize",
                    {

                        method: "POST",

                        headers: {

                            Authorization:
                                `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

                            "Content-Type":
                                "application/json"

                        },


                        body:
                            JSON.stringify({

                                email:
                                    email,

                                amount:
                                    amountInPesewas.toString(),

                                currency:
                                    "GHS",

                                reference:
                                    reference,

                                callback_url:
                                    callbackUrl,

                                metadata:
                                    JSON.stringify({

                                        orderId:
                                            orderId,

                                        customerName:
                                            customerName,

                                        phone:
                                            phone,

                                        items:
                                            selectedProducts.map(
                                                product =>
                                                    product.id
                                            )

                                    })

                            })

                    }
                );


            const paystack =
                await paystackResponse.json();


            if (
                !paystackResponse.ok ||
                !paystack.status
            ) {

                console.error(
                    "Paystack initialization:",
                    paystack
                );


                return res.status(500).json({

                    success: false,

                    error:
                        paystack.message ||
                        "Unable to start payment."

                });

            }


            /*
                authorization_url is the secure
                Paystack Checkout page.
            */

            return res.json({

                success: true,

                orderId:
                    orderId,

                reference:
                    reference,

                authorizationUrl:
                    paystack.data.authorization_url

            });


        } catch (error) {

            console.error(
                "Payment initialization error:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    "Unable to initialize payment."

            });

        }

    }
);


/* =========================================================
   PAYSTACK CALLBACK
========================================================= */

app.get(
    "/api/paystack/callback",

    async (req, res) => {

        const reference =
            req.query.reference;


        if (!reference) {

            return res.redirect(
                "/?payment=error"
            );

        }


        try {

            const result =
                await verifyAndMarkPaid(
                    reference
                );


            if (result.success) {

                return res.redirect(
                    `/?payment=success&reference=${encodeURIComponent(reference)}`
                );

            }


            return res.redirect(
                `/?payment=failed&reference=${encodeURIComponent(reference)}`
            );


        } catch (error) {

            console.error(
                "Callback verification error:",
                error
            );


            return res.redirect(
                `/?payment=error&reference=${encodeURIComponent(reference)}`
            );

        }

    }
);


/* =========================================================
   CHECK ORDER STATUS
========================================================= */

app.get(
    "/api/orders/:reference/status",

    (req, res) => {

        const reference =
            req.params.reference;


        const order =
            db.prepare(`
                SELECT
                    id,
                    product,
                    amount,
                    payment_status,
                    payment_reference,
                    created_at

                FROM orders

                WHERE payment_reference = ?

                LIMIT 1
            `).get(reference);


        if (!order) {

            return res.status(404).json({
                success: false,
                error:
                    "Order not found."
            });

        }


        return res.json({

            success: true,

            order: order

        });

    }
);


/* =========================================================
   HOME PAGE FALLBACK
========================================================= */

app.get(
    "*",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);


/* =========================================================
   START WISETECH
========================================================= */

app.listen(
    PORT,
    () => {

        console.log(
            `WISETECH running on port ${PORT}`
        );

    }
);
