// ==========================================================================
// Vercel Serverless Function: Contact Form Handler
// File: api/contact.js
// Uses Nodemailer with Gmail SMTP (Requires Env Vars on Vercel)
// Dependencies: nodemailer, joi (ensure they are in package.json)
// ==========================================================================
'use strict';

// Use require for Node.js environment on Vercel by default
const nodemailer = require('nodemailer');
const Joi = require('joi');

// --- Configuration from Environment Variables (Set these in Vercel Project Settings) ---
const GMAIL_USER = process.env.EMAIL_USER;
const GMAIL_APP_PASS = process.env.EMAIL_PASS; // Use Gmail App Password
const RECIPIENT_EMAIL = process.env.EMAIL_RECIPIENT;

// --- Input Validation Schema ---
const contactSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({ /* Custom messages */ }),
    email: Joi.string().trim().email().required().messages({ /* Custom messages */ }),
    message: Joi.string().trim().min(10).max(2000).required().messages({ /* Custom messages */ })
});

// --- Nodemailer Transporter Configuration ---
// Moved inside handler to potentially catch config errors per request if needed,
// though defining outside might be slightly more efficient if config is guaranteed.
let transporter;
try {
     transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465, secure: true,
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASS },
    });
    // Optional: Add a quick check here if needed, but verify() can be slow in serverless
    // console.log("Nodemailer transporter configured.");
} catch (configError) {
     console.error("FATAL: Nodemailer configuration failed.", configError);
     // Cannot proceed without transporter
}


// --- Vercel Serverless Handler Function ---
// Note: Vercel automatically maps requests to /api/contact to this file's default export
export default async function handler(request, response) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Function /api/contact invoked.`);

    // 1. Check Request Method & Pre-flight for CORS (Vercel handles basic CORS)
    if (request.method === 'OPTIONS') { return response.status(200).end(); } // Handle CORS preflight
    if (request.method !== 'POST') { return response.status(405).json({ success: false, error: 'Method Not Allowed' }); }

    // Check if transporter was configured correctly
     if (!transporter) {
        return response.status(500).json({ success: false, error: 'Email server configuration error.' });
     }
     if (!RECIPIENT_EMAIL || !GMAIL_USER || !GMAIL_APP_PASS) {
         console.error(`[${timestamp}] Missing critical environment variables for /api/contact.`);
        return response.status(500).json({ success: false, error: 'Server mailing configuration incomplete.' });
     }


    try {
        // 2. Validate Input Data
        const { error, value } = contactSchema.validate(request.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message.replace(/['"]/g, '')).join('. ');
            console.warn(`[${timestamp}] Validation Failed: ${errorMessages}`);
            return response.status(400).json({ success: false, error: errorMessages });
        }
        const { name, email, message } = value; // Use validated data

        // 3. Prepare Email Options
        const mailOptions = {
            from: `"${name} (Portfolio)" <${GMAIL_USER}>`,
            to: RECIPIENT_EMAIL,
            replyTo: email,
            subject: `Portfolio Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `<div style="font-family: sans-serif;"><h2>Portfolio Contact</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p><hr><p><strong>Message:</strong></p><p style="white-space: pre-wrap;">${message}</p></div>`,
        };

        // 4. Send Email
        console.log(`[${timestamp}] Sending contact email to ${RECIPIENT_EMAIL}...`);
        let info = await transporter.sendMail(mailOptions);
        console.log(`[${timestamp}] Contact email sent successfully! ID: ${info.messageId}`);
        return response.status(200).json({ success: true, message: 'Your message was sent successfully!' });

    } catch (error) {
        console.error(`[${timestamp}] ERROR in /api/contact function:`, error);
        return response.status(500).json({ success: false, error: 'Sorry, an internal error occurred.' });
    }
}