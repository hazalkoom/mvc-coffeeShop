const nodemailer = require('nodemailer');

// Get email configuration from environment variables
const OWNER_EMAIL = process.env.OWNER_EMAIL;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS; // Your Gmail App Password

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    }
});

// Function to send emails
async function sendMail({ to, subject, html }) {
    const mailOptions = {
        from: SMTP_USER,
        to: to,
        subject: subject,
        html: html
    };

    return await transporter.sendMail(mailOptions);
}

// Function to render order email HTML
function renderOrderEmail({ orderId, user, items, total }) {
    const itemsHtml = items.map(item => `
        <tr>
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <html>
        <body>
            <h2>New Order #${orderId}</h2>
            <h3>Customer Information:</h3>
            <p>Name: ${user.first_name} ${user.last_name}</p>
            <p>Email: ${user.email}</p>
            <p>Phone: ${user.phone}</p>
            
            <h3>Shipping Address:</h3>
            <p>${user.address_line1}</p>
            ${user.address_line2 ? `<p>${user.address_line2}</p>` : ''}
            <p>${user.city}, ${user.state} ${user.postal_code}</p>
            <p>${user.country}</p>
            
            <h3>Order Items:</h3>
            <table border="1" style="border-collapse: collapse;">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <h3>Order Total: $${total.toFixed(2)}</h3>
        </body>
        </html>
    `;
}

// Export the functions and owner email
module.exports = {
    sendMail,
    renderOrderEmail,
    ownerEmail: OWNER_EMAIL
};