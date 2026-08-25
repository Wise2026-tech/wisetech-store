require("dotenv").config();

const express = require("express");
const path = require("path");
const crypto = require("crypto");

const {
    initDatabase,
    createOrder,
    setPaymentReference,
    findOrderByReference,
    findOrderById,
    markOrderPaid,
    getAllOrders,
    getOrderStatus,
    updateFulfillmentStatus,
    updateSupplierCost
} = require("./database");

const {
    sendPaymentReceivedEmail,
    sendProcessingEmail,
    sendCompletedEmail,
    sendCancelledEmail
} = require("./notifications");


const app = express();

const PORT = process.env.PORT || 3000;


/* =========================================================
   WISETECH PRODUCT CATALOGUE
========================================================= */

const products = [

    /* ================= MTN DATA ================= */

    {
        id: "mtn-1gb",
        category: "data",
        service: "MTN",
        name: "MTN 1GB",
        displayName: "1GB",
        price: 6,
        cost: 4.70
    },

    {
        id: "mtn-2gb",
        category: "data",
        service: "MTN",
        name: "MTN 2GB",
        displayName: "2GB",
        price: 11,
        cost: 9.00
    },

    {
        id: "mtn-3gb",
        category: "data",
        service: "MTN",
        name: "MTN 3GB",
        displayName: "3GB",
        price: 15,
        cost: 13.00
    },

    {
        id: "mtn-4gb",
        category: "data",
        service: "MTN",
        name: "MTN 4GB",
        displayName: "4GB",
        price: 20,
        cost: 17.70
    },

    {
        id: "mtn-5gb",
        category: "data",
        service: "MTN",
        name: "MTN 5GB",
        displayName: "5GB",
        price: 25,
        cost: 22.00
    },

    {
        id: "mtn-6gb",
        category: "data",
        service: "MTN",
        name: "MTN 6GB",
        displayName: "6GB",
        price: 28,
        cost: 24.80
    },

    {
        id: "mtn-8gb",
        category: "data",
        service: "MTN",
        name: "MTN 8GB",
        displayName: "8GB",
        price: 36,
        cost: 32.80
    },

    {
        id: "mtn-10gb",
        category: "data",
        service: "MTN",
        name: "MTN 10GB",
        displayName: "10GB",
        price: 47,
        cost: 42.50
    },

    {
        id: "mtn-15gb",
        category: "data",
        service: "MTN",
        name: "MTN 15GB",
        displayName: "15GB",
        price: 65,
        cost: 59.50
    },

    {
        id: "mtn-20gb",
        category: "data",
        service: "MTN",
        name: "MTN 20GB",
        displayName: "20GB",
        price: 85,
        cost: 79.00
    },

    {
        id: "mtn-25gb",
        category: "data",
        service: "MTN",
        name: "MTN 25GB",
        displayName: "25GB",
        price: 105,
        cost: 99.00
    },

    {
        id: "mtn-30gb",
        category: "data",
        service: "MTN",
        name: "MTN 30GB",
        displayName: "30GB",
        price: 128,
        cost: 121.00
    },


    /* ================= NETFLIX ================= */

    {
        id: "netflix-mobile",
        category: "subscription",
        service: "Netflix Subscription",
        name: "Netflix Mobile",
        displayName: "Mobile",
        details: "480p SD • 1 device",
        price: 40,
        cost: null
    },

    {
        id: "netflix-basic",
        category: "subscription",
        service: "Netflix Subscription",
        name: "Netflix Basic",
        displayName: "Basic",
        details: "720p HD • 1 device",
        price: 55,
        cost: null
    },

    {
        id: "netflix-standard",
        category: "subscription",
        service: "Netflix Subscription",
        name: "Netflix Standard",
        displayName: "Standard",
        details: "1080p Full HD • 2 devices",
        price: 110,
        cost: null
    },

    {
        id: "netflix-premium",
        category: "subscription",
        service: "Netflix Subscription",
        name: "Netflix Premium",
        displayName: "Premium",
        details: "4K + HDR • 4 devices",
        price: 135,
        cost: null
    },


    /* ================= YOUTUBE PREMIUM ================= */

    {
        id: "youtube-student",
        category: "subscription",
        service: "YouTube Premium Subscription",
        name: "YouTube Premium Student",
        displayName: "Student",
        details: "Premium access",
        price: 120,
        cost: null
    },

    {
        id: "youtube-individual-monthly",
        category: "subscription",
        service: "YouTube Premium Subscription",
        name: "YouTube Premium Individual Monthly",
        displayName: "Individual Monthly",
        details: "1 user",
        price: 200,
        cost: null
    },

    {
        id: "youtube-individual-annual",
        category: "subscription",
        service: "YouTube Premium Subscription",
        name: "YouTube Premium Individual Annual",
        displayName: "Individual Annual",
        details: "12 months",
        price: 1800,
        cost: null
    },

    {
        id: "youtube-family",
        category: "subscription",
        service: "YouTube Premium Subscription",
        name: "YouTube Premium Family",
        displayName: "Family",
        details: "Family access",
        price: 335,
        cost: null
    },


    /* ================= SPOTIFY ================= */

    {
        id: "spotify-student",
        category: "subscription",
        service: "Spotify Premium Subscription",
        name: "Spotify Student",
        displayName: "Student",
        details: "1 verified student account",
        price: 18,
        cost: null
    },

    {
        id: "spotify-individual",
        category: "subscription",
        service: "Spotify Premium Subscription",
        name: "Spotify Individual",
        displayName: "Individual",
        details: "1 account",
        price: 30,
        cost: null
    },

    {
        id: "spotify-duo",
        category: "subscription",
        service: "Spotify Premium Subscription",
        name: "Spotify Duo",
        displayName: "Duo",
        details: "2 accounts",
        price: 42,
        cost: null
    },

    {
        id: "spotify-family",
        category: "subscription",
        service: "Spotify Premium Subscription",
        name: "Spotify Family",
        displayName: "Family",
        details: "Up to 6 members",
        price: 55,
        cost: null
    },


    /* ================= DSTV ================= */

    {
        id: "dstv-padi",
        category: "subscription",
        service: "DStv Subscription",
        name: "DStv Padi / Lite",
        displayName: "Padi / Lite",
        details: "40+ channels",
        price: 65,
        cost: null
    },

    {
        id: "dstv-access",
        category: "subscription",
        service: "DStv Subscription",
        name: "DStv Access",
        displayName: "Access",
        details: "75+ channels",
        price: 110,
        cost: null
    },

    {
        id: "dstv-family",
        category: "subscription",
        service: "DStv Subscription",
        name: "DStv Family",
        displayName: "Family",
        details: "95+ channels",
        price: 205,
        cost: null
    },

    {
        id: "dstv-compact",
        category: "subscription",
        service: "DStv Subscription",
        name: "DStv Compact",
        displayName: "Compact",
        details: "120+ channels",
        price: 410,
        cost: null
    },

    {
        id: "dstv-compact-plus",
        category: "subscription",
        service: "DStv Subscription",
        name: "DStv Compact Plus",
        displayName: "Compact Plus",
        details: "135+ channels",
        price: 610,
        cost: null
    },

    {
        id: "dstv-premium",
        category: "subscription",
        service: "DStv Subscription",
        name: "DStv Premium",
        displayName: "Premium",
        details: "150+ channels",
        price: 925,
        cost: null
    },


    /* ================= GOTV ================= */

    {
        id: "gotv-smallie",
        category: "subscription",
        service: "GOtv Subscription",
        name: "GOtv Smallie / Lite",
        displayName: "Smallie / Lite",
        details: "30+ channels",
        price: 30,
        cost: null
    },

    {
        id: "gotv-plus",
        category: "subscription",
        service: "GOtv Subscription",
        name: "GOtv Plus / Value",
        displayName: "Plus / Value",
        details: "45+ channels",
        price: 110,
        cost: null
    },

    {
        id: "gotv-max",
        category: "subscription",
        service: "GOtv Subscription",
        name: "GOtv Max",
        displayName: "Max",
        details: "55+ channels",
        price: 195,
        cost: null
    },

    {
        id: "gotv-supa",
        category: "subscription",
        service: "GOtv Subscription",
        name: "GOtv Supa",
        displayName: "Supa",
        details: "70+ channels",
        price: 250,
        cost: null
    },

    {
        id: "gotv-supa-plus",
        category: "subscription",
        service: "GOtv Subscription",
        name: "GOtv Supa Plus",
        displayName: "Supa Plus",
        details: "75+ channels",
        price: 325,
        cost: null
    },


    /* ================= PRIME VIDEO ================= */

    {
        id: "prime-ghana",
        category: "subscription",
        service: "Prime Video Subscription",
        name: "Prime Video Ghana Direct",
        displayName: "Ghana Direct",
        details: "3 streams • Offline downloads",
        price: 75,
        cost: null
    },

    {
        id: "prime-us-video",
        category: "subscription",
        service: "Prime Video Subscription",
        name: "US Prime Video",
        displayName: "US Prime Video",
        details: "Prime Video access",
        price: 110,
        cost: null
    },

    {
        id: "prime-full",
        category: "subscription",
        service: "Prime Video Subscription",
        name: "US Full Amazon Prime",
        displayName: "Full Amazon Prime",
        details: "Video + Prime benefits",
        price: 185,
        cost: null
    },

    {
        id: "prime-student",
        category: "subscription",
        service: "Prime Video Subscription",
        name: "US Prime Student",
        displayName: "Prime Student",
        details: "Prime perks",
        price: 90,
        cost: null
    }

];


/* =========================================================
   HELPERS
========================================================= */

function getProduct(productId) {

    return products.find(
        product =>
            product.id === productId
    );
}


function getBaseUrl(req) {

    if (process.env.BASE_URL) {

        return process.env.BASE_URL
            .replace(/\/$/, "");
    }


    return `${req.protocol}://${req.get("host")}`;
}


/* =========================================================
   PAYSTACK PAYMENT VERIFICATION
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


    const result =
        await response.json();


    if (
        !response.ok ||
        !result.status
    ) {

        throw new Error(
            result.message ||
            "Unable to verify payment."
        );
    }


    const transaction =
        result.data;


    const order =
        await findOrderByReference(
            reference
        );


    if (!order) {

        throw new Error(
            "WISETECH order not found."
        );
    }


    const expectedAmount =
        Math.round(
            Number(order.amount) * 100
        );


    const validPayment =

        transaction.status ===
            "success" &&

        Number(transaction.amount) ===
            expectedAmount &&

        transaction.currency ===
            "GHS";


    if (!validPayment) {

        return {
            success: false
        };
    }


    /*
        Paystack reports transaction fees
        in pesewas.

        Convert to Ghana cedis.
    */

    const feeInPesewas =
        Number(
            transaction.fees || 0
        );


    const feeInGhs =
        feeInPesewas / 100;


    /*
        Only process a successful payment once.
    */

    if (
        order.payment_status !==
        "paid"
    ) {

        await markOrderPaid(
            order.id,
            feeInGhs
        );


        const paidOrder =
            await findOrderById(
                order.id
            );


        /*
            Email failure must never change
            payment status.
        */

        sendPaymentReceivedEmail(
            paidOrder
        )
        .catch(
            error => {

                console.error(
                    "Payment confirmation email:",
                    error
                );

            }
        );
    }


    return {

        success: true,

        orderId:
            order.id

    };
}


/* =========================================================
   PAYSTACK WEBHOOK
   MUST APPEAR BEFORE express.json()
========================================================= */

app.post(
    "/api/paystack/webhook",

    express.raw({
        type: "application/json"
    }),

    async (req, res) => {

        try {

            const signature =
                req.headers[
                    "x-paystack-signature"
                ];


            if (!signature) {

                return res.sendStatus(
                    401
                );
            }


            const hash =
                crypto
                    .createHmac(
                        "sha512",
                        process.env
                            .PAYSTACK_SECRET_KEY
                    )
                    .update(
                        req.body
                    )
                    .digest(
                        "hex"
                    );


            if (
                hash !==
                signature
            ) {

                return res.sendStatus(
                    401
                );
            }


            const event =
                JSON.parse(
                    req.body.toString(
                        "utf8"
                    )
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
                        "Webhook payment verification:",
                        error.message
                    );
                }
            }


            return res.sendStatus(
                200
            );


        } catch (error) {

            console.error(
                "Paystack webhook:",
                error
            );


            return res.sendStatus(
                500
            );
        }
    }
);


/* =========================================================
   EXPRESS MIDDLEWARE
========================================================= */

app.use(
    express.json({
        limit: "100kb"
    })
);


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
========================================================= */

app.get(
    "/api/products",

    (req, res) => {

        /*
            Never expose supplier costs
            to website customers.
        */

        const publicProducts =
            products.map(
                ({
                    cost,
                    ...product
                }) => product
            );


        return res.json(
            publicProducts
        );
    }
);


/* =========================================================
   INITIALIZE PAYSTACK PAYMENT
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
                typeof customerName !==
                    "string" ||

                typeof phone !==
                    "string" ||

                typeof email !==
                    "string"
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error:
                            "Invalid customer information."
                    });
            }


            const cleanName =
                customerName
                    .trim()
                    .slice(
                        0,
                        100
                    );


            const cleanPhone =
                phone
                    .trim()
                    .slice(
                        0,
                        30
                    );


            const cleanEmail =
                email
                    .trim()
                    .toLowerCase()
                    .slice(
                        0,
                        150
                    );


            if (
                !cleanName ||
                !cleanPhone ||
                !cleanEmail
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error:
                            "Please enter your name, phone and email."
                    });
            }


            if (
                !Array.isArray(
                    items
                ) ||

                items.length ===
                    0 ||

                items.length >
                    20
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error:
                            "Invalid cart."
                    });
            }


            const selectedProducts =
                [];


            for (
                const productId
                of items
            ) {

                if (
                    typeof productId !==
                    "string"
                ) {

                    return res
                        .status(400)
                        .json({
                            success: false,
                            error:
                                "Invalid product."
                        });
                }


                const product =
                    getProduct(
                        productId
                    );


                if (!product) {

                    return res
                        .status(400)
                        .json({
                            success: false,
                            error:
                                "Invalid product selected."
                        });
                }


                selectedProducts.push(
                    product
                );
            }


            /*
                Customer price calculated
                only on the server.
            */

            const total =
                selectedProducts.reduce(
                    (
                        sum,
                        product
                    ) =>
                        sum +
                        Number(
                            product.price
                        ),
                    0
                );


            /*
                Automatically calculate supplier
                cost when every item has a known cost.

                Premium subscriptions can be entered
                later from the admin dashboard.
            */

            const allCostsKnown =
                selectedProducts.every(
                    product =>
                        product.cost !==
                            null &&
                        product.cost !==
                            undefined
                );


            const supplierCost =
                allCostsKnown

                ? selectedProducts.reduce(
                    (
                        sum,
                        product
                    ) =>
                        sum +
                        Number(
                            product.cost
                        ),
                    0
                )

                : null;


            const productNames =
                selectedProducts
                    .map(
                        product =>
                            product.name
                    )
                    .join(", ");


            const order =
                await createOrder({

                    customerName:
                        cleanName,

                    phone:
                        cleanPhone,

                    email:
                        cleanEmail,

                    product:
                        productNames,

                    amount:
                        total,

                    supplierCost

                });


            const orderId =
                Number(
                    order.id
                );


            const reference =
                `WISETECH-${orderId}-${Date.now()}`;


            await setPaymentReference(
                orderId,
                reference
            );


            const amountInPesewas =
                Math.round(
                    total * 100
                );


            const callbackUrl =
                `${getBaseUrl(req)}/api/paystack/callback`;


            const paystackResponse =
                await fetch(
                    "https://api.paystack.co/transaction/initialize",
                    {
                        method:
                            "POST",

                        headers: {

                            Authorization:
                                `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                email:
                                    cleanEmail,

                                amount:
                                    amountInPesewas
                                        .toString(),

                                currency:
                                    "GHS",

                                reference,

                                callback_url:
                                    callbackUrl,

                                metadata: {

                                    orderId,

                                    customerName:
                                        cleanName,

                                    phone:
                                        cleanPhone,

                                    items:
                                        selectedProducts
                                            .map(
                                                product =>
                                                    product.id
                                            )

                                }

                            })
                    }
                );


            const paystack =
                await paystackResponse
                    .json();


            if (
                !paystackResponse.ok ||
                !paystack.status
            ) {

                console.error(
                    "Paystack initialization:",
                    paystack
                );


                return res
                    .status(500)
                    .json({
                        success: false,

                        error:
                            paystack.message ||
                            "Unable to start payment."
                    });
            }


            return res.json({

                success:
                    true,

                orderId,

                reference,

                authorizationUrl:
                    paystack.data
                        .authorization_url

            });


        } catch (error) {

            console.error(
                "Payment initialization:",
                error
            );


            return res
                .status(500)
                .json({
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


        if (
            typeof reference !==
                "string" ||
            !reference
        ) {

            return res.redirect(
                "/?payment=error"
            );
        }


        try {

            const result =
                await verifyPayment(
                    reference
                );


            if (
                result.success
            ) {

                return res.redirect(
                    `/?payment=success&reference=${encodeURIComponent(reference)}`
                );
            }


            return res.redirect(
                `/?payment=failed&reference=${encodeURIComponent(reference)}`
            );


        } catch (error) {

            console.error(
                "Callback verification:",
                error
            );


            return res.redirect(
                "/?payment=error"
            );
        }
    }
);


/* =========================================================
   CUSTOMER ORDER STATUS
========================================================= */

app.get(
    "/api/orders/:reference/status",

    async (req, res) => {

        try {

            const order =
                await getOrderStatus(
                    req.params.reference
                );


            if (!order) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        error:
                            "Order not found."
                    });
            }


            return res.json({
                success: true,
                order
            });


        } catch (error) {

            console.error(
                "Order status:",
                error
            );


            return res
                .status(500)
                .json({
                    success:
                        false
                });
        }
    }
);


/* =========================================================
   ADMIN SECURITY
========================================================= */

function safeCompare(
    supplied,
    expected
) {

    if (
        typeof supplied !==
            "string" ||

        typeof expected !==
            "string"
    ) {

        return false;
    }


    const first =
        Buffer.from(
            supplied
        );


    const second =
        Buffer.from(
            expected
        );


    if (
        first.length !==
        second.length
    ) {

        return false;
    }


    return crypto
        .timingSafeEqual(
            first,
            second
        );
}


function adminAuth(
    req,
    res,
    next
) {

    const auth =
        req.headers
            .authorization;


    if (
        !auth ||
        !auth.startsWith(
            "Basic "
        )
    ) {

        res.setHeader(
            "WWW-Authenticate",
            'Basic realm="WISETECH Admin"'
        );


        return res
            .status(401)
            .send(
                "WISETECH Admin Login Required"
            );
    }


    try {

        const decoded =
            Buffer
                .from(
                    auth.slice(6),
                    "base64"
                )
                .toString(
                    "utf8"
                );


        const separator =
            decoded.indexOf(
                ":"
            );


        if (
            separator === -1
        ) {

            throw new Error(
                "Invalid login."
            );
        }


        const username =
            decoded.slice(
                0,
                separator
            );


        const password =
            decoded.slice(
                separator + 1
            );


        const validUsername =
            safeCompare(
                username,
                process.env
                    .ADMIN_USERNAME
            );


        const validPassword =
            safeCompare(
                password,
                process.env
                    .ADMIN_PASSWORD
            );


        if (
            !validUsername ||
            !validPassword
        ) {

            throw new Error(
                "Invalid login."
            );
        }


        return next();


    } catch {

        res.setHeader(
            "WWW-Authenticate",
            'Basic realm="WISETECH Admin"'
        );


        return res
            .status(401)
            .send(
                "Invalid admin login."
            );
    }
}


/* =========================================================
   ADMIN PAGE
========================================================= */

app.get(
    "/admin",

    adminAuth,

    (req, res) => {

        return res.sendFile(
            path.join(
                __dirname,
                "admin.html"
            )
        );
    }
);


/* =========================================================
   ADMIN ORDERS
========================================================= */

app.get(
    "/api/admin/orders",

    adminAuth,

    async (req, res) => {

        try {

            const orders =
                await getAllOrders();


            return res.json({
                success: true,
                orders
            });


        } catch (error) {

            console.error(
                "Admin orders:",
                error
            );


            return res
                .status(500)
                .json({
                    success: false,
                    error:
                        "Unable to load orders."
                });
        }
    }
);


/* =========================================================
   ADMIN — UPDATE SUPPLIER COST
========================================================= */

app.patch(
    "/api/admin/orders/:id/supplier-cost",

    adminAuth,

    async (req, res) => {

        try {

            const orderId =
                Number(
                    req.params.id
                );


            const supplierCost =
                Number(
                    req.body.supplierCost
                );


            if (
                !Number.isInteger(
                    orderId
                ) ||

                orderId <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error:
                            "Invalid order."
                    });
            }


            if (
                !Number.isFinite(
                    supplierCost
                ) ||

                supplierCost < 0
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error:
                            "Enter a valid supplier cost."
                    });
            }


            const order =
                await updateSupplierCost(
                    orderId,
                    supplierCost
                );


            if (!order) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        error:
                            "Order not found."
                    });
            }


            return res.json({
                success: true,
                order
            });


        } catch (error) {

            console.error(
                "Supplier cost:",
                error
            );


            return res
                .status(500)
                .json({
                    success: false,
                    error:
                        "Unable to update supplier cost."
                });
        }
    }
);


/* =========================================================
   ADMIN — FULFILLMENT + EMAIL NOTIFICATIONS
========================================================= */

app.patch(
    "/api/admin/orders/:id/fulfillment",

    adminAuth,

    async (req, res) => {

        try {

            const orderId =
                Number(
                    req.params.id
                );


            const {
                status
            } = req.body;


            const allowedStatuses = [
                "pending",
                "processing",
                "completed",
                "cancelled"
            ];


            if (
                !Number.isInteger(
                    orderId
                ) ||

                orderId <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error:
                            "Invalid order."
                    });
            }


            if (
                !allowedStatuses
                    .includes(
                        status
                    )
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error:
                            "Invalid fulfillment status."
                    });
            }


            const existingOrder =
                await findOrderById(
                    orderId
                );


            if (!existingOrder) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        error:
                            "Order not found."
                    });
            }


            /*
                Only PAID orders can be
                Processing or Completed.
            */

            if (
                (
                    status ===
                        "processing" ||

                    status ===
                        "completed"
                ) &&

                existingOrder
                    .payment_status !==
                    "paid"
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error:
                            "Only paid orders can be processed or completed."
                    });
            }


            /*
                Don't resend emails when the
                same status is selected again.
            */

            if (
                existingOrder
                    .fulfillment_status ===
                status
            ) {

                return res.json({
                    success: true,
                    order:
                        existingOrder,
                    message:
                        "Order already has this status."
                });
            }


            const updatedOrder =
                await updateFulfillmentStatus(
                    orderId,
                    status
                );


            if (!updatedOrder) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        error:
                            "Order could not be updated."
                    });
            }


            /*
                Send appropriate customer email.
            */

            if (
                status ===
                "processing"
            ) {

                sendProcessingEmail(
                    updatedOrder
                )
                .catch(
                    error => {

                        console.error(
                            "Processing email:",
                            error
                        );

                    }
                );
            }


            if (
                status ===
                "completed"
            ) {

                sendCompletedEmail(
                    updatedOrder
                )
                .catch(
                    error => {

                        console.error(
                            "Completed email:",
                            error
                        );

                    }
                );
            }


            if (
                status ===
                "cancelled"
            ) {

                sendCancelledEmail(
                    updatedOrder
                )
                .catch(
                    error => {

                        console.error(
                            "Cancelled email:",
                            error
                        );

                    }
                );
            }


            return res.json({
                success: true,
                order:
                    updatedOrder
            });


        } catch (error) {

            console.error(
                "Fulfillment update:",
                error
            );


            return res
                .status(500)
                .json({
                    success: false,
                    error:
                        "Unable to update order."
                });
        }
    }
);


/* =========================================================
   WEBSITE FALLBACK
========================================================= */

app.get(
    "*",

    (req, res) => {

        return res.sendFile(
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

async function startServer() {

    try {

        if (
            !process.env
                .DATABASE_URL
        ) {

            throw new Error(
                "DATABASE_URL is missing."
            );
        }


        if (
            !process.env
                .PAYSTACK_SECRET_KEY
        ) {

            throw new Error(
                "PAYSTACK_SECRET_KEY is missing."
            );
        }


        if (
            !process.env
                .ADMIN_USERNAME ||

            !process.env
                .ADMIN_PASSWORD
        ) {

            throw new Error(
                "Admin credentials are missing."
            );
        }


        await initDatabase();


        app.listen(
            PORT,

            () => {

                console.log(
                    `WISETECH running on port ${PORT}`
                );

            }
        );


    } catch (error) {

        console.error(
            "WISETECH startup failed:",
            error
        );


        process.exit(1);
    }
}


startServer();
