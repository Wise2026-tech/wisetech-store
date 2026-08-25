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
   WISETECH PRODUCTS
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


    /* ================= YOUTUBE ================= */

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


    /* ================= PRIME ================= */

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
   GENERAL HELPERS
========================================================= */

function getProduct(id) {

    return products.find(
        product =>
            product.id === id
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
   ADMIN SESSION SYSTEM
========================================================= */

const SESSION_COOKIE =
    "wisetech_admin_session";


const SESSION_DURATION =
    8 * 60 * 60 * 1000; // 8 hours


function base64UrlEncode(value) {

    return Buffer
        .from(value)
        .toString("base64url");
}


function base64UrlDecode(value) {

    return Buffer
        .from(
            value,
            "base64url"
        )
        .toString("utf8");
}


function signSession(payload) {

    const encoded =
        base64UrlEncode(
            JSON.stringify(payload)
        );


    const signature =
        crypto
            .createHmac(
                "sha256",
                process.env
                    .ADMIN_SESSION_SECRET
            )
            .update(encoded)
            .digest("base64url");


    return `${encoded}.${signature}`;
}


function verifySession(token) {

    try {

        if (
            typeof token !==
            "string"
        ) {

            return null;
        }


        const parts =
            token.split(".");


        if (
            parts.length !== 2
        ) {

            return null;
        }


        const [
            encoded,
            providedSignature
        ] = parts;


        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env
                        .ADMIN_SESSION_SECRET
                )
                .update(encoded)
                .digest("base64url");


        const a =
            Buffer.from(
                providedSignature
            );


        const b =
            Buffer.from(
                expectedSignature
            );


        if (
            a.length !== b.length ||
            !crypto.timingSafeEqual(
                a,
                b
            )
        ) {

            return null;
        }


        const payload =
            JSON.parse(
                base64UrlDecode(
                    encoded
                )
            );


        if (
            !payload.exp ||
            Date.now() >
                payload.exp
        ) {

            return null;
        }


        return payload;


    } catch {

        return null;
    }
}


function parseCookies(req) {

    const cookies = {};

    const header =
        req.headers.cookie;


    if (!header) {

        return cookies;
    }


    for (
        const pair of
        header.split(";")
    ) {

        const index =
            pair.indexOf("=");


        if (
            index === -1
        ) {

            continue;
        }


        const key =
            pair
                .slice(0, index)
                .trim();


        const value =
            pair
                .slice(index + 1)
                .trim();


        cookies[key] =
            decodeURIComponent(
                value
            );
    }


    return cookies;
}


function getAdminSession(req) {

    const cookies =
        parseCookies(req);


    const token =
        cookies[
            SESSION_COOKIE
        ];


    return verifySession(
        token
    );
}


function setAdminSession(
    res,
    payload
) {

    const token =
        signSession(
            payload
        );


    const secure =
        process.env.NODE_ENV ===
        "production";


    const parts = [

        `${SESSION_COOKIE}=${encodeURIComponent(token)}`,

        "Path=/",

        "HttpOnly",

        "SameSite=Strict",

        `Max-Age=${Math.floor(
            SESSION_DURATION / 1000
        )}`

    ];


    if (secure) {

        parts.push(
            "Secure"
        );
    }


    res.setHeader(
        "Set-Cookie",
        parts.join("; ")
    );
}


function clearAdminSession(
    res
) {

    const secure =
        process.env.NODE_ENV ===
        "production";


    const parts = [

        `${SESSION_COOKIE}=`,

        "Path=/",

        "HttpOnly",

        "SameSite=Strict",

        "Max-Age=0"

    ];


    if (secure) {

        parts.push(
            "Secure"
        );
    }


    res.setHeader(
        "Set-Cookie",
        parts.join("; ")
    );
}


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


function requireAdmin(
    req,
    res,
    next
) {

    const session =
        getAdminSession(
            req
        );


    if (!session) {

        if (
            req.path.startsWith(
                "/api/"
            )
        ) {

            return res
                .status(401)
                .json({
                    success: false,
                    error:
                        "Admin login required."
                });
        }


        return res.redirect(
            "/admin/login"
        );
    }


    req.adminSession =
        session;


    return next();
}


function requireCsrf(
    req,
    res,
    next
) {

    const session =
        req.adminSession ||
        getAdminSession(req);


    const supplied =
        req.headers[
            "x-csrf-token"
        ];


    if (
        !session ||
        !supplied ||
        !safeCompare(
            supplied,
            session.csrf
        )
    ) {

        return res
            .status(403)
            .json({
                success: false,
                error:
                    "Security check failed."
            });
    }


    return next();
}


/* =========================================================
   SIMPLE LOGIN RATE LIMIT
========================================================= */

const loginAttempts =
    new Map();


function loginAllowed(ip) {

    const now =
        Date.now();


    const record =
        loginAttempts.get(ip);


    if (
        !record ||
        now - record.started >
            15 * 60 * 1000
    ) {

        loginAttempts.set(
            ip,
            {
                count: 0,
                started: now
            }
        );


        return true;
    }


    return record.count < 10;
}


function recordFailedLogin(ip) {

    const record =
        loginAttempts.get(ip) || {
            count: 0,
            started: Date.now()
        };


    record.count += 1;


    loginAttempts.set(
        ip,
        record
    );
}


function clearLoginAttempts(ip) {

    loginAttempts.delete(ip);
}


/* =========================================================
   PAYSTACK VERIFICATION
========================================================= */

async function verifyPayment(
    reference
) {

    const response =
        await fetch(
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
            Number(
                order.amount
            ) * 100
        );


    const valid =
        transaction.status ===
            "success" &&

        Number(
            transaction.amount
        ) === expectedAmount &&

        transaction.currency ===
            "GHS";


    if (!valid) {

        return {
            success: false
        };
    }


    const fee =
        Number(
            transaction.fees || 0
        ) / 100;


    if (
        order.payment_status !==
        "paid"
    ) {

        await markOrderPaid(
            order.id,
            fee
        );


        const updated =
            await findOrderById(
                order.id
            );


        sendPaymentReceivedEmail(
            updated
        )
        .catch(
            error =>
                console.error(
                    "Payment email:",
                    error
                )
        );
    }


    return {
        success: true,
        orderId: order.id
    };
}


/* =========================================================
   PAYSTACK WEBHOOK
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

                return res
                    .sendStatus(401);
            }


            const hash =
                crypto
                    .createHmac(
                        "sha512",
                        process.env
                            .PAYSTACK_SECRET_KEY
                    )
                    .update(req.body)
                    .digest("hex");


            if (
                hash !== signature
            ) {

                return res
                    .sendStatus(401);
            }


            const event =
                JSON.parse(
                    req.body
                        .toString(
                            "utf8"
                        )
                );


            if (
                event.event ===
                "charge.success"
            ) {

                try {

                    await verifyPayment(
                        event.data
                            .reference
                    );

                } catch (error) {

                    console.error(
                        "Webhook verification:",
                        error.message
                    );
                }
            }


            return res
                .sendStatus(200);


        } catch (error) {

            console.error(
                "Webhook:",
                error
            );


            return res
                .sendStatus(500);
        }
    }
);


/* =========================================================
   NORMAL MIDDLEWARE
========================================================= */

app.use(
    express.json({
        limit: "100kb"
    })
);


app.use(
    express.urlencoded({
        extended: false,
        limit: "20kb"
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
   PRODUCTS
========================================================= */

app.get(
    "/api/products",

    (req, res) => {

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
   PAYSTACK INITIALIZATION
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
                    "string" ||

                !Array.isArray(items)
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error:
                            "Invalid order information."
                    });
            }


            const cleanName =
                customerName
                    .trim()
                    .slice(0, 100);


            const cleanPhone =
                phone
                    .trim()
                    .slice(0, 30);


            const cleanEmail =
                email
                    .trim()
                    .toLowerCase()
                    .slice(0, 150);


            if (
                !cleanName ||
                !cleanPhone ||
                !cleanEmail ||
                items.length === 0 ||
                items.length > 20
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error:
                            "Please check your order details."
                    });
            }


            const selectedProducts =
                [];


            for (
                const id of items
            ) {

                const product =
                    getProduct(id);


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


            const total =
                selectedProducts
                    .reduce(
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


            const allCostsKnown =
                selectedProducts.every(
                    product =>
                        product.cost !== null &&
                        product.cost !== undefined
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


            const callbackUrl =
                `${getBaseUrl(req)}/api/paystack/callback`;


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
                                    cleanEmail,

                                amount:
                                    String(
                                        Math.round(
                                            total * 100
                                        )
                                    ),

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
                                        cleanPhone

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

                success: true,

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

        try {

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
                "/?payment=failed"
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
                        success: false
                    });
            }


            return res.json({
                success: true,
                order
            });


        } catch {

            return res
                .status(500)
                .json({
                    success: false
                });
        }
    }
);


/* =========================================================
   ADMIN LOGIN PAGE
========================================================= */

app.get(
    "/admin/login",

    (req, res) => {

        if (
            getAdminSession(req)
        ) {

            return res.redirect(
                "/admin"
            );
        }


        return res.sendFile(
            path.join(
                __dirname,
                "admin-login.html"
            )
        );
    }
);


/* =========================================================
   ADMIN LOGIN API
========================================================= */

app.post(
    "/api/admin/login",

    (req, res) => {

        const ip =
            req.ip ||
            req.socket
                .remoteAddress ||
            "unknown";


        if (
            !loginAllowed(ip)
        ) {

            return res
                .status(429)
                .json({
                    success: false,
                    error:
                        "Too many login attempts. Try again later."
                });
        }


        const username =
            String(
                req.body.username ||
                ""
            );


        const password =
            String(
                req.body.password ||
                ""
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

            recordFailedLogin(
                ip
            );


            return res
                .status(401)
                .json({
                    success: false,
                    error:
                        "Invalid username or password."
                });
        }


        clearLoginAttempts(
            ip
        );


        const csrf =
            crypto
                .randomBytes(32)
                .toString("hex");


        setAdminSession(
            res,
            {
                username,
                csrf,
                exp:
                    Date.now() +
                    SESSION_DURATION
            }
        );


        return res.json({
            success: true
        });
    }
);


/* =========================================================
   ADMIN PAGE
========================================================= */

app.get(
    "/admin",

    requireAdmin,

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
   ADMIN SESSION INFO
========================================================= */

app.get(
    "/api/admin/session",

    requireAdmin,

    (req, res) => {

        return res.json({

            success: true,

            csrfToken:
                req.adminSession.csrf

        });
    }
);


/* =========================================================
   ADMIN LOGOUT
========================================================= */

app.post(
    "/api/admin/logout",

    requireAdmin,
    requireCsrf,

    (req, res) => {

        clearAdminSession(
            res
        );


        return res.json({
            success: true
        });
    }
);


/* =========================================================
   ADMIN ORDERS
========================================================= */

app.get(
    "/api/admin/orders",

    requireAdmin,

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
                    success: false
                });
        }
    }
);


/* =========================================================
   ADMIN SUPPLIER COST
========================================================= */

app.patch(
    "/api/admin/orders/:id/supplier-cost",

    requireAdmin,
    requireCsrf,

    async (req, res) => {

        try {

            const orderId =
                Number(
                    req.params.id
                );


            const supplierCost =
                Number(
                    req.body
                        .supplierCost
                );


            if (
                !Number.isInteger(
                    orderId
                ) ||
                orderId <= 0 ||
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
                            "Invalid supplier cost."
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
                        success: false
                    });
            }


            return res.json({
                success: true,
                order
            });


        } catch {

            return res
                .status(500)
                .json({
                    success: false
                });
        }
    }
);


/* =========================================================
   ADMIN FULFILLMENT
========================================================= */

app.patch(
    "/api/admin/orders/:id/fulfillment",

    requireAdmin,
    requireCsrf,

    async (req, res) => {

        try {

            const orderId =
                Number(
                    req.params.id
                );


            const status =
                req.body.status;


            const allowed = [
                "pending",
                "processing",
                "completed",
                "cancelled"
            ];


            if (
                !Number.isInteger(
                    orderId
                ) ||
                !allowed.includes(
                    status
                )
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error:
                            "Invalid request."
                    });
            }


            const existing =
                await findOrderById(
                    orderId
                );


            if (!existing) {

                return res
                    .status(404)
                    .json({
                        success: false
                    });
            }


            if (
                (
                    status ===
                        "processing" ||

                    status ===
                        "completed"
                ) &&
                existing
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


            if (
                existing
                    .fulfillment_status ===
                status
            ) {

                return res.json({
                    success: true,
                    order: existing
                });
            }


            const updated =
                await updateFulfillmentStatus(
                    orderId,
                    status
                );


            if (
                status ===
                "processing"
            ) {

                sendProcessingEmail(
                    updated
                ).catch(
                    console.error
                );
            }


            if (
                status ===
                "completed"
            ) {

                sendCompletedEmail(
                    updated
                ).catch(
                    console.error
                );
            }


            if (
                status ===
                "cancelled"
            ) {

                sendCancelledEmail(
                    updated
                ).catch(
                    console.error
                );
            }


            return res.json({
                success: true,
                order: updated
            });


        } catch (error) {

            console.error(
                "Fulfillment:",
                error
            );


            return res
                .status(500)
                .json({
                    success: false
                });
        }
    }
);


/* =========================================================
   WEBSITE
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
   START
========================================================= */

async function startServer() {

    try {

        const requiredVariables = [

            "DATABASE_URL",

            "PAYSTACK_SECRET_KEY",

            "ADMIN_USERNAME",

            "ADMIN_PASSWORD",

            "ADMIN_SESSION_SECRET"

        ];


        for (
            const variable
            of requiredVariables
        ) {

            if (
                !process.env[
                    variable
                ]
            ) {

                throw new Error(
                    `${variable} is missing.`
                );
            }
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
