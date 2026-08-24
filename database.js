const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});


/* =========================================================
   INITIALIZE DATABASE
========================================================= */

async function initDatabase() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id BIGSERIAL PRIMARY KEY,

            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,

            product TEXT NOT NULL,

            amount NUMERIC(12,2) NOT NULL,

            supplier_cost NUMERIC(12,2),

            paystack_fee NUMERIC(12,2),

            payment_reference TEXT UNIQUE,

            payment_status TEXT
                NOT NULL DEFAULT 'pending',

            fulfillment_status TEXT
                NOT NULL DEFAULT 'pending',

            created_at TIMESTAMPTZ
                NOT NULL DEFAULT NOW(),

            updated_at TIMESTAMPTZ
                NOT NULL DEFAULT NOW()
        )
    `);


    /*
        Add new columns safely to existing database.
    */

    await pool.query(`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS
        supplier_cost NUMERIC(12,2)
    `);


    await pool.query(`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS
        paystack_fee NUMERIC(12,2)
    `);


    await pool.query(`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS
        fulfillment_status TEXT
        NOT NULL DEFAULT 'pending'
    `);


    await pool.query(`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS
        updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
    `);


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
    amount,
    supplierCost
}) {

    const result = await pool.query(
        `
        INSERT INTO orders (
            customer_name,
            phone,
            email,
            product,
            amount,
            supplier_cost,
            payment_status,
            fulfillment_status
        )

        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
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
            amount,
            supplierCost
        ]
    );


    return result.rows[0];
}


/* =========================================================
   SET PAYMENT REFERENCE
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

    const result = await pool.query(
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
   FIND ORDER BY ID
========================================================= */

async function findOrderById(
    orderId
) {

    const result = await pool.query(
        `
        SELECT *
        FROM orders

        WHERE id = $1

        LIMIT 1
        `,
        [orderId]
    );


    return result.rows[0] || null;
}


/* =========================================================
   MARK PAYMENT PAID + SAVE ACTUAL PAYSTACK FEE
========================================================= */

async function markOrderPaid(
    orderId,
    paystackFee
) {

    await pool.query(
        `
        UPDATE orders

        SET
            payment_status = 'paid',

            paystack_fee = $1,

            updated_at = NOW()

        WHERE id = $2
        `,
        [
            paystackFee,
            orderId
        ]
    );
}


/* =========================================================
   ADMIN ORDERS
========================================================= */

async function getAllOrders() {

    const result = await pool.query(`
        SELECT
            id,
            customer_name,
            phone,
            email,
            product,
            amount,
            supplier_cost,
            paystack_fee,

            CASE
                WHEN payment_status = 'paid'
                AND supplier_cost IS NOT NULL
                AND paystack_fee IS NOT NULL

                THEN amount
                     - supplier_cost
                     - paystack_fee

                ELSE NULL
            END AS net_profit,

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
   CUSTOMER ORDER STATUS
========================================================= */

async function getOrderStatus(
    reference
) {

    const result = await pool.query(
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
        [reference]
    );


    return result.rows[0] || null;
}


/* =========================================================
   UPDATE FULFILLMENT
========================================================= */

async function updateFulfillmentStatus(
    orderId,
    status
) {

    const allowed = [
        "pending",
        "processing",
        "completed",
        "cancelled"
    ];


    if (!allowed.includes(status)) {

        throw new Error(
            "Invalid fulfillment status."
        );
    }


    const result = await pool.query(
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
   UPDATE SUPPLIER COST
========================================================= */

async function updateSupplierCost(
    orderId,
    supplierCost
) {

    const result = await pool.query(
        `
        UPDATE orders

        SET
            supplier_cost = $1,
            updated_at = NOW()

        WHERE id = $2

        RETURNING *
        `,
        [
            supplierCost,
            orderId
        ]
    );


    return result.rows[0] || null;
}


/* =========================================================
   EXPORT
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

    updateFulfillmentStatus,

    updateSupplierCost

};
