const { Pool } = require("pg");

/*
    Render DATABASE_URL is stored securely
    in Environment Variables.
*/
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});


/* =========================================================
   CREATE DATABASE TABLES
========================================================= */

async function initDatabase() {

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

            created_at TIMESTAMPTZ
                NOT NULL
                DEFAULT NOW()

        )
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

    const result = await pool.query(
        `
        INSERT INTO orders (
            customer_name,
            phone,
            email,
            product,
            amount,
            payment_status
        )

        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
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
   SAVE PAYSTACK REFERENCE
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
            payment_status = 'pending'

        WHERE id = $2
        `,
        [
            reference,
            orderId
        ]
    );
}


/* =========================================================
   FIND ORDER
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
            [reference]
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

        SET payment_status = 'paid'

        WHERE id = $1
        `,
        [orderId]
    );
}


/* =========================================================
   ADMIN ORDERS
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
                created_at

            FROM orders

            ORDER BY id DESC
        `);

    return result.rows;
}


/* =========================================================
   ORDER STATUS
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
                payment_reference,
                created_at

            FROM orders

            WHERE payment_reference = $1

            LIMIT 1
            `,
            [reference]
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

    markOrderPaid,

    getAllOrders,

    getOrderStatus

};
