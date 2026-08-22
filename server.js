require("dotenv").config();

const express = require("express");
const path = require("path");
const crypto = require("crypto");

const {
    db,
    createOrder
} = require("./database");

const app = express();

const PORT = process.env.PORT || 3000;


/* =========================================================
   WISETECH PRODUCT CATALOG

   IMPORTANT:
   Prices are controlled on the SERVER.
========================================================= */

const products = [

    /* =========================
       MTN DATA
    ========================= */

    {
        id: "mtn-1gb",
        category: "data",
        service: "MTN",
        name: "MTN 1GB",
        displayName: "1GB",
        price: 6
    },

    {
        id: "mtn-2gb",
        category: "data",
        service: "MTN",
        name: "MTN 2GB",
        displayName: "2GB",
        price: 11
    },

    {
        id: "mtn-3gb",
        category: "data",
        service: "MTN",
        name: "MTN 3GB",
        displayName: "3GB",
        price: 15
    },

    {
        id: "mtn-4gb",
        category: "data",
        service: "MTN",
        name: "MTN 4GB",
        displayName: "4GB",
        price: 20
    },

    {
        id: "mtn-5gb",
        category: "data",
        service: "MTN",
        name: "MTN 5GB",
        displayName: "5GB",
        price: 25
    },

    {
        id: "mtn-6gb",
        category: "data",
        service: "MTN",
        name: "MTN 6GB",
        displayName: "6GB",
        price: 28
    },

    {
        id: "mtn-8gb",
        category: "data",
        service: "MTN",
        name: "MTN 8GB",
        displayName: "8GB",
        price: 36
    },

    {
        id: "mtn-10gb",
        category: "data",
        service: "MTN",
        name: "MTN 10GB",
        displayName: "10GB",
        price: 47
    },

    {
        id: "mtn-15gb",
        category: "data",
        service: "MTN",
        name: "MTN 15GB",
        displayName: "15GB",
        price: 65
    },

    {
        id: "mtn-20gb",
        category: "data",
        service: "MTN",
        name: "MTN 20GB",
        displayName: "20GB",
        price: 85
    },

    {
        id: "mtn-25gb",
        category: "data",
        service: "MTN",
        name: "MTN 25GB",
        displayName: "25GB",
        price: 105
    },

    {
        id: "mtn-30gb",
        category: "data",
        service: "MTN",
        name: "MTN 30GB",
        displayName: "30GB",
        price: 128
    },


    /* =========================
       NETFLIX
    ========================= */

    {
        id: "netflix-mobile",
        category: "subscription",
        service: "Netflix Subscription",
        name: "Netflix Mobile",
        displayName: "Mobile",
        details: "480p (SD) • 1 device",
        price: 40
    },

    {
        id: "netflix-basic",
        category: "subscription",
        service: "Netflix Subscription",
        name: "Netflix Basic",
        displayName: "Basic",
        details: "720p (HD) • 1 device",
        price: 55
    },

    {
        id: "netflix-standard",
        category: "subscription",
        service: "Netflix Subscription",
        name: "Netflix Standard",
        displayName: "Standard",
        details: "1080p Full HD • 2 devices",
        price: 110
    },

    {
        id: "netflix-premium",
        category: "subscription",
        service: "Netflix Subscription",
        name: "Netflix Premium",
        displayName: "Premium",
        details: "4K + HDR • 4 devices",
        price: 135
    },


    /* =========================
       YOUTUBE PREMIUM
    ========================= */

    {
        id: "youtube-student",
        category: "subscription",
        service: "YouTube Premium Subscription",
        name: "YouTube Premium Student",
        displayName: "Student",
        details: "Premium access",
        price: 120
    },

    {
        id: "youtube-individual-monthly",
        category: "subscription",
        service: "YouTube Premium Subscription",
        name: "YouTube Premium Individual Monthly",
        displayName: "Individual Monthly",
        details: "1 user",
        price: 200
    },

    {
        id: "youtube-individual-annual",
        category: "subscription",
        service: "YouTube Premium Subscription",
        name: "YouTube Premium Individual Annual",
        displayName: "Individual Annual",
        details: "12 months",
        price: 1800
    },

    {
        id: "youtube-family",
        category: "subscription",
        service: "YouTube Premium Subscription",
        name: "YouTube Premium Family",
        displayName: "Family",
        details: "Family access",
        price: 335
    },


    /* =========================
       SPOTIFY
    ========================= */

    {
        id: "spotify-student",
        category: "subscription",
        service: "Spotify Premium Subscription",
        name: "Spotify Student",
        displayName: "Student",
        details: "1 verified student account",
        price: 18
    },

    {
        id: "spotify-individual",
        category: "subscription",
        service: "Spotify Premium Subscription",
        name: "Spotify Individual",
        displayName: "Individual",
        details: "1 account",
        price: 30
    },

    {
        id: "spotify-duo",
        category: "subscription",
        service: "Spotify Premium Subscription",
        name: "Spotify Duo",
        displayName: "Duo",
        details: "2 accounts",
        price: 42
    },

    {
        id: "spotify-family",
        category: "subscription",
        service: "Spotify Premium Subscription",
        name: "Spotify Family",
        displayName: "Family",
        details: "Up to 6 members",
        price: 55
    },


    /* =========================
       DSTV
    ========================= */

    {
        id: "dstv-padi",
        category: "subscription",
        service: "DStv Subscription",
        name: "DStv Padi / Lite",
        displayName: "Padi / Lite",
        details: "40+ channels",
        price: 65
    },

    {
        id: "dstv-access",
        category: "subscription",
        service: "DStv Subscription",
        name: "DStv Access",
        displayName: "Access",
        details: "75+ channels",
        price: 110
    },

    {
        id: "dstv-family",
        category: "subscription",
        service: "DStv Subscription",
        name: "DStv Family",
        displayName: "Family",
        details: "95+ channels",
        price: 205
    },

    {
        id: "dstv-compact",
        category: "subscription",
        service: "DStv Subscription",
        name: "DStv Compact",
        displayName: "Compact",
        details: "120+ channels",
        price: 410
    },

    {
        id: "dstv-compact-plus",
        category: "subscription",
        service: "DStv Subscription",
        name: "DStv Compact Plus",
        displayName: "Compact Plus",
        details: "135+ channels",
        price: 610
    },

    {
        id: "dstv-premium",
        category: "subscription",
        service: "DStv Subscription",
        name: "DStv Premium",
        displayName: "Premium",
        details: "150+ channels",
        price: 925
    },


    /* =========================
       GOTV
    ========================= */

    {
        id: "gotv-smallie",
        category: "subscription",
        service: "GOtv Subscription",
        name: "GOtv Smallie / Lite",
        displayName: "Smallie / Lite",
        details: "30+ channels",
        price: 30
    },

    {
        id: "gotv-plus",
        category: "subscription",
        service: "GOtv Subscription",
        name: "GOtv Plus / Value",
        displayName: "Plus / Value",
        details: "45+ channels",
        price: 110
    },

    {
        id: "gotv-max",
        category: "subscription",
        service: "GOtv Subscription",
        name: "GOtv Max",
        displayName: "Max",
        details: "55+ channels",
        price: 195
    },

    {
        id: "gotv-supa",
        category: "subscription",
        service: "GOtv Subscription",
        name: "GOtv Supa",
        displayName: "Supa",
        details: "70+ channels",
        price: 250
    },

    {
        id: "gotv-supa-plus",
        category: "subscription",
        service: "GOtv Subscription",
        name: "GOtv Supa Plus",
        displayName: "Supa Plus",
        details: "75+ channels",
        price: 325
    },


    /* =========================
       PRIME VIDEO
    ========================= */

    {
        id: "prime-ghana",
        category: "subscription",
        service: "Prime Video Subscription",
        name: "Prime Video Ghana Direct",
        displayName: "Ghana Direct",
        details: "3 streams • Offline downloads",
        price: 75
    },

    {
        id: "prime-us-video",
        category: "subscription",
        service: "Prime Video Subscription",
        name: "US Prime Video",
        displayName: "US Prime Video",
        details: "Prime Video access",
        price: 110
    },

    {
        id: "prime-full",
        category: "subscription",
        service: "Prime Video Subscription",
        name: "US Full Amazon Prime",
        displayName: "Full Amazon Prime",
        details: "Video + Prime benefits",
        price: 185
    },

    {
        id: "prime-student",
        category: "subscription",
        service: "Prime Video Subscription",
        name: "US Prime Student",
        displayName: "Prime Student",
        details: "Prime perks",
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
   VERIFY PAYMENT
========================================================= */

async function verifyPayment(reference) {

    const response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
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
            "Unable to verify payment."
        );

    }


    const transaction = result.data;


    const order = db.prepare(`
        SELECT *
        FROM orders
        WHERE payment_reference = ?
    `).get(reference);


    if (!order) {

        throw new Error(
            "WISETECH order not found."
        );

    }


    const expectedAmount =
        Math.round(
            Number(order.amount) * 100
        );


    if (
        transaction.status !== "success" ||
        Number(transaction.amount) !== expectedAmount ||
        transaction.currency !== "GHS"
    ) {

        return {
            success: false
        };

    }


    if (
        order.payment_status !== "paid"
    ) {

        db.prepare(`
            UPDATE orders
            SET payment_status = 'paid'
            WHERE id = ?
        `).run(order.id);

    }


    return {
        success: true,
        order
    };

}


/* =========================================================
   PAYSTACK WEBHOOK

   MUST COME BEFORE express.json()
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


            const hash =
                crypto
                    .createHmac(
                        "sha512",
                        process.env.PAYSTACK_SECRET_KEY
                    )
                    .update(req.body)
                    .digest("hex");


            if (
                !signature ||
                hash !== signature
            ) {

                return res.sendStatus(401);

            }


            const event =
                JSON.parse(
                    req.body.toString("utf8")
                );


            if (
                event.event ===
                "charge.success"
            ) {

                try {

                    await verifyPayment(
                        event.data.reference
                    );

                } catch (error) {

                    console.error(
                        "Webhook verify:",
                        error.message
                    );

                }

            }


            res.sendStatus(200);


        } catch (error) {

            console.error(
                "Webhook:",
                error
            );

            res.sendStatus(500);

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
   PRODUCTS API

   APP.JS RECEIVES ALL PRODUCTS.
========================================================= */

app.get(
    "/api/products",
    (req, res) => {

        res.json(products);

    }
);


/* =========================================================
   INITIALIZE PAYMENT
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
                        "Please enter your name, phone number and email."
                });

            }


            if (
                !Array.isArray(items) ||
                items.length === 0
            ) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Your cart is empty."
                });

            }


            const selectedProducts = [];


            for (
                const productId of items
            ) {

                const product =
                    getProduct(productId);


                if (!product) {

                    return res
                        .status(400)
                        .json({
                            success: false,
                            error:
                                "One of the selected products is invalid."
                        });

                }


                selectedProducts.push(
                    product
                );

            }


            const total =
                selectedProducts.reduce(
                    (
                        sum,
                        product
                    ) =>
                        sum +
                        Number(product.price),
                    0
                );


            const productNames =
                selectedProducts
                    .map(
                        product =>
                            product.name
                    )
                    .join(", ");


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


            db.prepare(`
                UPDATE orders

                SET
                    payment_reference = ?,
                    payment_status = 'pending'

                WHERE id = ?
            `).run(
                reference,
                orderId
            );


            const amount =
                Math.round(
                    total * 100
                );


            const callbackUrl =
                `${getBaseUrl(req)}/api/paystack/callback`;


            const response =
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

                                email,

                                amount:
                                    amount.toString(),

                                currency:
                                    "GHS",

                                reference,

                                callback_url:
                                    callbackUrl,

                                metadata: {

                                    orderId,

                                    phone,

                                    customerName

                                }

                            })

                    }
                );


            const paystack =
                await response.json();


            if (
                !response.ok ||
                !paystack.status
            ) {

                console.error(
                    paystack
                );


                return res
                    .status(500)
                    .json({
                        success: false,
                        error:
                            paystack.message ||
                            "Unable to start Paystack payment."
                    });

            }


            return res.json({

                success: true,

                reference,

                authorizationUrl:
                    paystack.data.authorization_url

            });


        } catch (error) {

            console.error(
                "Initialize:",
                error
            );


            return res
                .status(500)
                .json({
                    success: false,
                    error:
                        "Payment could not be initialized."
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
                await verifyPayment(
                    reference
                );


            if (result.success) {

                return res.redirect(
                    `/?payment=success&reference=${encodeURIComponent(reference)}`
                );

            }


            return res.redirect(
                `/?payment=failed`
            );


        } catch (error) {

            console.error(
                "Callback:",
                error
            );


            return res.redirect(
                "/?payment=error"
            );

        }

    }
);


/* =========================================================
   ORDER STATUS
========================================================= */

app.get(
    "/api/orders/:reference/status",

    (req, res) => {

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
            `).get(
                req.params.reference
            );


        if (!order) {

            return res
                .status(404)
                .json({
                    success: false
                });

        }


        res.json({
            success: true,
            order
        });

    }
);


/* =========================================================
   WEBSITE
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
   START SERVER
========================================================= */

app.listen(
    PORT,
    () => {

        console.log(
            `WISETECH running on port ${PORT}`
        );

    }
);
