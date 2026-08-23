const { Pool } = require("pg");


/* =========================================================
   POSTGRESQL CONNECTION
========================================================= */

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});


/* =========================================================
   INITIALIZE DATABASE
========================================================= */

async function initDatabase() {

    /*
        Main orders table.
    */

    await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (

            id BIGSERIAL PRIMARY KEY,

            customer_name TEXT NOT NULL,

            phone TEXT NOT NULL,

            email TEXT NOT NULL,

            product TEXT NOT NULL,

            amount NUMERIC(12, 2) NOT NULL,

            payment_reference TEXT UNIQUE,

            payment_status TEXT
                NOT NULL
                DEFAULT 'pending',

            fulfillment_status TEXT
                NOT NULL
                DEFAULT 'pending',

            created_at TIMESTAMPTZ
                NOT NULL
                DEFAULT NOW(),

            updated_at TIMESTAMPTZ
                NOT NULL
                DEFAULT NOW()

        )
    `);


    /*
        This allows an older existing database
        to receive the new column automatically.
    */

    await pool.query(`
        ALTER TABLE orders

        ADD COLUMN IF NOT EXISTS
        fulfillment_status TEXT
        NOT NULL
        DEFAULT 'pending'
    `);


    await pool.query(`
        ALTER TABLE orders

        ADD COLUMN IF NOT EXISTS
        updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW()
    `);


    /*
        Helpful database indexes.
    */

    await pool.query(`
        CREATE INDEX IF NOT EXISTS
        idx_orders_payment_reference

        ON orders(payment_reference)
    `);


    await pool.query(`
        CREATE INDEX IF NOT EXISTS
        idx_orders_payment_status

        ON orders(payment_status)
    `);


    await pool.query(`
        CREATE INDEX IF NOT EXISTS
        idx_orders_fulfillment_status

        ON orders(fulfillment_status)
    `);


    console.log(
        "WISETECH PostgreSQL database ready."
    );

}


/* =========================================================
   CREATE ORDER
========================================================= */

async function createOrder({
    customerName,
    phone,
    email,
    product,
    amount
}) {

    const result =
        await pool.query(
            `
            INSERT INTO orders (

                customer_name,

                phone,

                email,

                product,

                amount,

                payment_status,

                fulfillment_status

            )

            VALUES (

                $1,

                $2,

                $3,

                $4,

                $5,

                'pending',

                'pending'

            )

            RETURNING id
            `,
            [
                customerName,
                phone,
                email,
                product,
                amount
            ]
        );


    return result.rows[0];

}


/* =========================================================
   SET PAYSTACK REFERENCE
========================================================= */

async function setPaymentReference(
    orderId,
    reference
) {

    await pool.query(
        `
        UPDATE orders

        SET
            payment_reference = $1,

            payment_status = 'pending',

            updated_at = NOW()

        WHERE id = $2
        `,
        [
            reference,
            orderId
        ]
    );

}


/* =========================================================
   FIND ORDER BY REFERENCE
========================================================= */

async function findOrderByReference(
    reference
) {

    const result =
        await pool.query(
            `
            SELECT *

            FROM orders

            WHERE payment_reference = $1

            LIMIT 1
            `,
            [
                reference
            ]
        );


    return result.rows[0] || null;

}


/* =========================================================
   FIND ORDER BY ID
========================================================= */

async function findOrderById(
    orderId
) {

    const result =
        await pool.query(
            `
            SELECT *

            FROM orders

            WHERE id = $1

            LIMIT 1
            `,
            [
                orderId
            ]
        );


    return result.rows[0] || null;

}


/* =========================================================
   MARK ORDER PAID
========================================================= */

async function markOrderPaid(
    orderId
) {

    await pool.query(
        `
        UPDATE orders

        SET
            payment_status = 'paid',

            updated_at = NOW()

        WHERE id = $1
        `,
        [
            orderId
        ]
    );

}


/* =========================================================
   GET ALL ADMIN ORDERS
========================================================= */

async function getAllOrders() {

    const result =
        await pool.query(`
            SELECT

                id,

                customer_name,

                phone,

                email,

                product,

                amount,

                payment_reference,

                payment_status,

                fulfillment_status,

                created_at,

                updated_at

            FROM orders

            ORDER BY id DESC
        `);


    return result.rows;

}


/* =========================================================
   GET CUSTOMER ORDER STATUS
========================================================= */

async function getOrderStatus(
    reference
) {

    const result =
        await pool.query(
            `
            SELECT

                id,

                product,

                amount,

                payment_status,

                fulfillment_status,

                payment_reference,

                created_at,

                updated_at

            FROM orders

            WHERE payment_reference = $1

            LIMIT 1
            `,
            [
                reference
            ]
        );


    return result.rows[0] || null;

}


/* =========================================================
   UPDATE FULFILLMENT STATUS
========================================================= */

async function updateFulfillmentStatus(
    orderId,
    status
) {

    const allowedStatuses = [
        "pending",
        "processing",
        "completed",
        "cancelled"
    ];


    if (
        !allowedStatuses.includes(
            status
        )
    ) {

        throw new Error(
            "Invalid fulfillment status."
        );

    }


    const result =
        await pool.query(
            `
            UPDATE orders

            SET
                fulfillment_status = $1,

                updated_at = NOW()

            WHERE id = $2

            RETURNING *
            `,
            [
                status,
                orderId
            ]
        );


    return result.rows[0] || null;

}


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {

    pool,

    initDatabase,

    createOrder,

    setPaymentReference,

    findOrderByReference,

    findOrderById,

    markOrderPaid,

    getAllOrders,

    getOrderStatus,

    updateFulfillmentStatus

};
