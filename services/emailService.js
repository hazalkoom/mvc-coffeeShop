const nodemailer = require('nodemailer');

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.FROM_EMAIL || smtpUser;
const ownerEmail = process.env.OWNER_EMAIL || smtpUser;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: smtpUser,
        pass: smtpPass
    }
});

async function sendMail({ to, subject, html }) {
    if (!smtpUser || !smtpPass) {
        console.warn('SMTP credentials not configured. Skipping email send.');
        return { skipped: true };
    }
    const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html
    });
    return info;
}

function renderOrderEmail({ orderId, user, items, total }) {
    const itemsHtml = items.map(it => `
        <li>
            ${it.product_name} x ${it.quantity} — $${(Number(it.price) * Number(it.quantity)).toFixed(2)}
        </li>
    `).join('');
    return `
        <h3>Order #${orderId}</h3>
        <p>Customer: ${user.first_name || ''} ${user.last_name || ''} (${user.email})</p>
        <ul>${itemsHtml}</ul>
        <p><strong>Total: $${Number(total).toFixed(2)}</strong></p>
    `;
}

module.exports = {
    sendMail,
    renderOrderEmail,
    ownerEmail
};


