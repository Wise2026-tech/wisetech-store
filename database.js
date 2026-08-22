const Database = require("better-sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "wisetech.db");

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");

/* =========================================================
   ORDERS TABLE
========================================================= */

db.prepare(`
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,

        product TEXT NOT NULL,
        amount REAL NOT NULL,

        payment_reference TEXT UNIQUE,
        payment_status TEXT DEFAULT 'pending',

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();


/* =========================================================
   CREATE ORDER
========================================================= */

function createOrder({
    customerName,
    phone,
    email,
    product,
    amount
}) {

    const statement = db.prepare(`
        INSERT INTO orders (
            customer_name,
            phone,
            email,
            product,
            amount,
            payment_status
        )

        VALUES (?, ?, ?, ?, ?, ?)
    `);

    return statement.run(
        customerName,
        phone,
        email,
        product,
        amount,
        "pending"
    );
}


module.exports = {
    db,
    createOrder
};
