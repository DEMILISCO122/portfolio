// ==========================================================================
// Vercel Serverless Function: Visit Notification Handler
// File: api/notify-visit.js
// Uses Nodemailer with Gmail SMTP (Requires Env Vars on Vercel)
// Dependencies: nodemailer (ensure it's in package.json)
// ==========================================================================
'use strict';

const nodemailer = require('nodemailer');

// --- Configuration from Environment Variables ---
const GMAIL_USER = process.env.EMAIL_USER;
const GMAIL_APP_PASS = process.env.EMAIL_PASS; // Use Gmail App Password
const VISIT_NOTIFICATION_RECIPIENT = process.env.VISIT_NOTIFICATION_RECEIVER || process.env.EMAIL_RECIPIENT; // Fallback to contact recipient
const SENDER_NAME = process.env.EMAIL_SENDER_NAME || "Portfolio Notifier"; // Optional sender name

// --- Nodemailer Transporter Configuration ---
let transporter;
try {
     transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', port: 465, secure: true,
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASS },
    });
    // console.log("Notify: Nodemailer transporter configured.");
} catch (configError) {
     console.error("FATAL: Notify Nodemailer configuration failed.", configError);
}

// --- Vercel Serverless Handler Function ---
export default async function handler(request, response) {
    const timestamp = new Date().toISOString();

    // 1. Check Method & Config
    if (request.method !== 'POST') { return response.status(405).json({ error: 'Method Not Allowed' }); }
    if (!transporter || !VISIT_NOTIFICATION_RECIPIENT || !GMAIL_USER || !GMAIL_APP_PASS) {
        console.error(`[${timestamp}] Missing critical env vars for /api/notify-visit.`);
        // Respond OK to frontend, but log error server-side
        return response.status(200).json({ message: 'Notification processed (server config error).' });
    }

    // Optional: Add simple check to prevent abuse (e.g., check for a specific header if needed)

    try {
        // 2. Prepare Email
        const visitTime = new Date();
        const mailOptions = {
            from: `"${SENDER_NAME}" <${GMAIL_USER}>`,
            to: VISIT_NOTIFICATION_RECIPIENT,
            subject: 'Portfolio Visit Notification',
            text: `Visit detected on your portfolio site at ${visitTime.toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}.`,
            html: `<p>Visit detected on your portfolio.</p><p>Time: ${visitTime.toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}</p>`,
        };

        // 3. Send Email (Fire and forget - don't make frontend wait)
        transporter.sendMail(mailOptions)
            .then(info => console.log(`[${timestamp}] Visit notification email sent. ID: ${info.messageId}`))
            .catch(error => console.error(`[${timestamp}] Failed to send visit notification email:`, error)); // Log error server-side

        // 4. Respond Success Immediately
        return response.status(200).json({ message: 'Notification processed.' });

    } catch (error) {
        // Catch unexpected errors in this function's logic
        console.error(`[${timestamp}] UNEXPECTED ERROR in /api/notify-visit:`, error.message);
        return response.status(200).json({ message: 'Notification processed (unexpected server error).' }); // Still respond OK
    }
}