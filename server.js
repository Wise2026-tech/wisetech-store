require("dotenv").config();

const express = require("express");
const path = require("path");
const crypto = require("crypto");

const {
    createOrder,
    getOrders,
    db
} = require("./database");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(
    path.join(__dirname, "public")
));

/* =========================
   PRODUCTS
========================= */

const products = [

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

    {
        id: "netflix",
        name: "Netflix Subscription",
        category: "subscription",
        price: 0
    },

    {
        id: "spotify",
        name: "Spotify Subscription",
        category: "subscription",
        price: 0
    }

];

/* =========================
   GET PRODUCTS
========================= */

app.get("/api/products", (req, res) => {

    res.json(products);

});

/* =========================
   PAYSTACK PUBLIC KEY
========================= */

app.get("/api/config", (req, res) => {

    res.json({

        publicKey:
            process.env.PAYSTACK_PUBLIC_KEY

    });

});

/* =========================
   CREATE ORDER
========================= */

app.post("/api/orders", (req, res) => {

    try {

        const {
            customerName,
            phone,
            email,
            product,
            amount
        } = req.body;

        if (
            !customerName ||
            !phone ||
            !product ||
            !amount
        ) {

            return res.status(400).json({
                error: "Missing required information."
            });

        }

        const result = createOrder({

            customerName,
            phone,
            email,
            product,
            amount

        });

        res.json({

            success: true,

            orderId: result.lastInsertRowid

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Unable to create order."
        });

    }

});

/* =========================
   PAYSTACK WEBHOOK
========================= */

app.post(
    "/api/paystack/webhook",
    express.raw({ type: "application/json" }),
    (req, res) => {

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

            if (hash !== signature) {

                return res
                    .status(401)
                    .send("Invalid signature");

            }

            const event =
                JSON.parse(req.body.toString());

            if (
                event.event ===
                "charge.success"
            ) {

                const reference =
                    event.data.reference;

                /*
                   Payment verification should
                   happen here.

                   After successful verification,
                   update the order and then,
                   in your production setup,
                   trigger your authorized data
                   provider API.
                */

                console.log(
                    "Successful payment:",
                    reference
                );

            }

            res.sendStatus(200);

        } catch (error) {

            console.error(error);

            res.sendStatus(500);

        }

    }
);

/* =========================
   ADMIN ORDERS
========================= */

app.get("/api/admin/orders", (req, res) => {

    /*
       In production, protect this route
       with proper admin authentication.
    */

    const orders = getOrders();

    res.json(orders);

});

/* =========================
   HOME
========================= */

app.get("*", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {

    console.log(
        `WISETECH running on http://localhost:${PORT}`
    );

});
