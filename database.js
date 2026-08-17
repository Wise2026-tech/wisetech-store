const Database = require("better-sqlite3");

const db = new Database("wisetech.db");

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        product TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_reference TEXT,
        payment_status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

function createOrder(order) {
    const statement = db.prepare(`
        INSERT INTO orders
        (customer_name, phone, email, product, amount)
        VALUES (?, ?, ?, ?, ?)
    `);

    return statement.run(
        order.customerName,
        order.phone,
        order.email,
        order.product,
        order.amount
    );
}

function updatePayment(reference, status) {
    const statement = db.prepare(`
        UPDATE orders
        SET payment_reference = ?,
            payment_status = ?
        WHERE id = ?
    `);

    return statement.run(
        reference,
        status,
        reference.orderId
    );
}

function getOrders() {
    return db.prepare(`
        SELECT *
        FROM orders
        ORDER BY created_at DESC
    `).all();
}

module.exports = {
    db,
    createOrder,
    getOrders
};
