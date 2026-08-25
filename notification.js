/* =========================================================
   WISETECH CUSTOMER EMAIL NOTIFICATIONS
========================================================= */

function money(value) {

    return `GH₵${Number(
        value || 0
    ).toFixed(2)}`;

}


/* =========================================================
   SEND EMAIL THROUGH BREVO
========================================================= */

async function sendEmail({
    to,
    name,
    subject,
    html
}) {

    /*
        Don't crash checkout if email
        has not been configured yet.
    */

    if (
        !process.env.BREVO_API_KEY ||
        !process.env.EMAIL_FROM
    ) {

        console.log(
            "Email skipped: Brevo not configured."
        );

        return {
            success: false,
            skipped: true
        };

    }


    try {

        const response =
            await fetch(
                "https://api.brevo.com/v3/smtp/email",
                {

                    method: "POST",

                    headers: {

                        "api-key":
                            process.env.BREVO_API_KEY,

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },


                    body:
                        JSON.stringify({

                            sender: {

                                name:
                                    process.env.EMAIL_FROM_NAME ||
                                    "WISETECH",

                                email:
                                    process.env.EMAIL_FROM

                            },


                            to: [

                                {

                                    email: to,

                                    name:
                                        name ||
                                        "WISETECH Customer"

                                }

                            ],


                            subject,

                            htmlContent: html

                        })

                }
            );


        if (!response.ok) {

            const details =
                await response.text();


            console.error(
                "Brevo email error:",
                response.status,
                details
            );


            return {
                success: false
            };

        }


        const result =
            await response.json();


        console.log(
            "WISETECH email sent:",
            result.messageId ||
            "success"
        );


        return {
            success: true,
            messageId:
                result.messageId
        };


    } catch (error) {

        console.error(
            "Email delivery error:",
            error.message
        );


        /*
            IMPORTANT:
            Email failure should NOT turn a
            successful customer payment into
            a failed payment.
        */

        return {
            success: false
        };

    }

}


/* =========================================================
   COMMON EMAIL LAYOUT
========================================================= */

function emailLayout({
    title,
    message,
    order,
    status
}) {

    return `
    <!DOCTYPE html>

    <html>

    <body
        style="
        margin:0;
        padding:0;
        background:#f4f4f4;
        font-family:Arial,sans-serif;
        "
    >

        <div
            style="
            max-width:620px;
            margin:30px auto;
            background:#ffffff;
            border-radius:14px;
            overflow:hidden;
            box-shadow:0 8px 30px rgba(0,0,0,.08);
            "
        >

            <div
                style="
                background:#050505;
                padding:28px;
                text-align:center;
                "
            >

                <h1
                    style="
                    margin:0;
                    color:#ffd000;
                    "
                >
                    WISETECH
                </h1>

                <p
                    style="
                    color:#aaaaaa;
                    margin:7px 0 0;
                    "
                >
                    Connecting You More
                </p>

            </div>


            <div
                style="
                padding:30px;
                "
            >

                <h2
                    style="
                    margin-top:0;
                    color:#111111;
                    "
                >
                    ${title}
                </h2>


                <p
                    style="
                    color:#555555;
                    line-height:1.6;
                    "
                >
                    ${message}
                </p>


                <div
                    style="
                    margin-top:25px;
                    padding:20px;
                    background:#f8f8f8;
                    border-left:5px solid #ffd000;
                    border-radius:8px;
                    "
                >

                    <p>
                        <strong>
                            Order:
                        </strong>

                        #${order.id}
                    </p>


                    <p>
                        <strong>
                            Product:
                        </strong>

                        ${escapeHtml(
                            order.product
                        )}
                    </p>


                    <p>
                        <strong>
                            Amount:
                        </strong>

                        ${money(
                            order.amount
                        )}
                    </p>


                    <p>
                        <strong>
                            Status:
                        </strong>

                        ${status}
                    </p>


                    <p
                        style="
                        margin-bottom:0;
                        "
                    >

                        <strong>
                            Reference:
                        </strong>

                        ${escapeHtml(
                            order.payment_reference ||
                            "-"
                        )}

                    </p>

                </div>


                <p
                    style="
                    margin-top:28px;
                    color:#777777;
                    line-height:1.6;
                    "
                >

                    If you have a question about this
                    order, contact WISETECH support and
                    include your order number.

                </p>

            </div>


            <div
                style="
                background:#111111;
                color:#888888;
                text-align:center;
                padding:18px;
                font-size:12px;
                "
            >

                © 2026 WISETECH

            </div>

        </div>

    </body>

    </html>
    `;

}


/* =========================================================
   PAYMENT RECEIVED
========================================================= */

async function sendPaymentReceivedEmail(
    order
) {

    return sendEmail({

        to:
            order.email,

        name:
            order.customer_name,

        subject:
            `WISETECH Order #${order.id} - Payment Received`,


        html:
            emailLayout({

                title:
                    "Payment Received ✅",

                message:
                    `Hello ${escapeHtml(
                        order.customer_name
                    )}, your payment has been successfully verified. Your order has been received and is waiting to be processed.`,

                order,

                status:
                    "PAID • PENDING FULFILLMENT"

            })

    });

}


/* =========================================================
   PROCESSING
========================================================= */

async function sendProcessingEmail(
    order
) {

    return sendEmail({

        to:
            order.email,

        name:
            order.customer_name,

        subject:
            `WISETECH Order #${order.id} - Processing`,


        html:
            emailLayout({

                title:
                    "Your Order Is Being Processed",

                message:
                    `Hello ${escapeHtml(
                        order.customer_name
                    )}, WISETECH has started processing your order.`,

                order,

                status:
                    "PROCESSING"

            })

    });

}


/* =========================================================
   COMPLETED
========================================================= */

async function sendCompletedEmail(
    order
) {

    return sendEmail({

        to:
            order.email,

        name:
            order.customer_name,

        subject:
            `WISETECH Order #${order.id} - Completed`,


        html:
            emailLayout({

                title:
                    "Order Completed 🎉",

                message:
                    `Hello ${escapeHtml(
                        order.customer_name
                    )}, your WISETECH order has been marked as completed. Thank you for choosing WISETECH.`,

                order,

                status:
                    "COMPLETED"

            })

    });

}


/* =========================================================
   CANCELLED
========================================================= */

async function sendCancelledEmail(
    order
) {

    return sendEmail({

        to:
            order.email,

        name:
            order.customer_name,

        subject:
            `WISETECH Order #${order.id} - Status Update`,


        html:
            emailLayout({

                title:
                    "Order Status Update",

                message:
                    `Hello ${escapeHtml(
                        order.customer_name
                    )}, your order has been marked as cancelled. Please contact WISETECH support if you need assistance regarding the order or payment.`,

                order,

                status:
                    "CANCELLED"

            })

    });

}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    )

    .replaceAll(
        "&",
        "&amp;"
    )

    .replaceAll(
        "<",
        "&lt;"
    )

    .replaceAll(
        ">",
        "&gt;"
    )

    .replaceAll(
        '"',
        "&quot;"
    )

    .replaceAll(
        "'",
        "&#039;"
    );

}


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {

    sendPaymentReceivedEmail,

    sendProcessingEmail,

    sendCompletedEmail,

    sendCancelledEmail

};
