// ==========================================================================
// Node.js Express Server for Portfolio Backend (Contact & Notify)
// Uses Nodemailer with Gmail SMTP (Requires App Password / Less Secure Apps)
// File: server.js
// To Run Locally: node server.js (after npm install & setting .env)
// ==========================================================================
'use strict';

// Load environment variables from .env file (create this file!)
// Run: npm install dotenv
require('dotenv').config();

// Import required modules
// Run: npm install express nodemailer cors
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors'); // To allow requests from your frontend

// --- Configuration from Environment Variables ---
const PORT = process.env.PORT || 3001; // Port for this server
const GMAIL_USER = process.env.EMAIL_USER; // Your gmail address
const GMAIL_APP_PASS = process.env.EMAIL_PASS; // Your Gmail App Password
const RECIPIENT_EMAIL = process.env.EMAIL_RECIPIENT; // Where emails should be sent
const CONTACT_API_ENDPOINT = '/api/contact';
const VISIT_NOTIFICATION_RECIPIENT = process.env.VISIT_NOTIFICATION_RECEIVER || RECIPIENT_EMAIL; // Optional separate receiver for visits
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [ // Define allowed frontend origins
    `http://localhost:${process.env.FRONTEND_PORT || 5501}`, // Your local dev server (e.g., Live Server port)
    'http://127.0.0.1:5501',
    // Add your deployed frontend URL here:
     'https://myportfolio-eosin.vercel.app/'
];
const LOCATION_TIME_ZONE = 'Africa/Lagos'; // Correct timezone for Abeokuta, Nigeria


// --- Crucial Validation ---
if (!GMAIL_USER || !GMAIL_APP_PASS || !RECIPIENT_EMAIL) {
    console.error("\nFATAL ERROR: Missing required email environment variables in .env file.");
    console.error("Please ensure EMAIL_USER, EMAIL_PASS (App Password), and EMAIL_RECIPIENT are set.\n");
    process.exit(1); // Stop the server if config is missing
}

// --- Initialize Express App ---
const app = express();

// --- Middleware ---
// Enable CORS with specific origins
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests) or from allowed list
    if (!origin || ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'], // Allow only GET and POST
  allowedHeaders: ['Content-Type'],
}));

// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));


// --- Nodemailer Configuration (Gmail SMTP) ---
// Reminder: Use App Password, check deliverability, consider dedicated services.
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // SSL port
    secure: true, // Use SSL
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASS, // Use the App Password here
    },
});

// Verify Nodemailer connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Nodemailer transporter configuration error:", error.message);
    } else {
        console.log("✅ Nodemailer transporter ready for Gmail.");
    }
});


// --- API Routes ---

// Simple Test Route
app.get('/api', (req, res) => {
    res.json({ message: "Portfolio API is active!" });
});

// Contact Form Endpoint
app.post('/api/contact', async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] POST /api/contact received`);

    // 1. Validate Data
    const { name, email, message } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
         return res.status(400).json({ error: 'Invalid email format.' });
    }

    // 2. Prepare Email
    const mailOptions = {
        from: `"${name} (Portfolio Contact)" <${GMAIL_USER}>`,
        to: RECIPIENT_EMAIL,
        replyTo: email,
        subject: `Portfolio Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `<div style="font-family: sans-serif; line-height: 1.6;"><h2>Portfolio Contact</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p><hr><p><strong>Message:</strong></p><p style="white-space: pre-wrap;">${message}</p></div>`,
    };

    // 3. Send Email
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log(`[${timestamp}] Contact email sent successfully to ${RECIPIENT_EMAIL}. Message ID: ${info.messageId}`);
        return res.status(200).json({ message: 'Your message was sent successfully!' });
    } catch (error) {
        console.error(`[${timestamp}] Nodemailer failed to send contact email:`, error);
        return res.status(500).json({ error: 'Internal server error sending message.' });
    }
});

// Visit Notification Endpoint
app.post('/api/notify-visit', async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] POST /api/notify-visit received`);

    // Optional: Add rate limiting here if needed

    // Prepare Notification Email
    const mailOptions = {
        from: `"Portfolio Notifier" <${GMAIL_USER}>`,
        to: VISIT_NOTIFICATION_RECIPIENT, // Send to specified recipient
        subject: 'Portfolio Visit Notification',
        text: `Someone visited your portfolio site at ${new Date().toLocaleString('en-NG', { timeZone: LOCATION_TIME_ZONE })}`,
        html: `<p>Visit detected on your portfolio.</p><p>Time: ${new Date().toLocaleString('en-NG', { timeZone: LOCATION_TIME_ZONE })}</p>`,
    };

    // Send Notification Email
    try {
        // Send silently - frontend doesn't need to wait or know outcome
        transporter.sendMail(mailOptions)
            .then(info => console.log(`[${timestamp}] Visit notification email sent. ID: ${info.messageId}`))
            .catch(error => console.error(`[${timestamp}] Failed to send visit notification email:`, error));

        // Respond immediately to frontend
        return res.status(200).json({ message: 'Notification processed.' });

    } catch (error) {
        // Catch unexpected errors in the setup/triggering part
        console.error(`[${timestamp}] Unexpected error in /api/notify-visit:`, error);
        return res.status(500).json({ error: 'Internal server error processing notification.' });
    }
});


// --- Start the Express Server ---
app.listen(PORT, () => {
    console.log(`\n🚀 Express server running on port ${PORT}`);
    console.log(`   API base: http://localhost:${PORT}/api`);
    console.log(`   Ensure frontend uses correct endpoint: ${CONTACT_API_ENDPOINT}`);
    console.log('   Press Ctrl+C to stop.\n---');
});

// --- Optional: Graceful Shutdown ---
process.on('SIGINT', () => {
    console.log("\nSIGINT received. Shutting down Express server...");
    process.exit(0); // Exit cleanly
});