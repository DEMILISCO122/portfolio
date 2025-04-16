// api/contact.js
// This is a Node.js function for Vercel Serverless Functions

// Import an email library (e.g., Nodemailer) and configure your email service provider
// You'll need to install these dependencies (`npm install nodemailer @sendgrid/mail` or similar)
 const nodemailer = require('nodemailer');
 const sgMail = require('@sendgrid/mail'); // Example using SendGrid

export default async function handler(request, response) {
    // Only allow POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { name, email, message } = request.body;

        // Basic validation
        if (!name || !email || !message) {
            return response.status(400).json({ error: 'Missing required fields.' });
        }

        // --- Email Sending Logic ---
        // ** IMPORTANT: Replace this section with your actual email sending code **
        // 1. Configure your chosen email service (SendGrid, Resend, etc.)
        // 2. Use its API key, stored securely as a Vercel Environment Variable
        //    (e.g., process.env.SENDGRID_API_KEY)
        // 3. Set your Gmail address as the recipient.

        // --- Example Placeholder using SendGrid ---
        sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Get key from Vercel Env Vars
        const msg = {
          to: 'abiodunsoetan96@gmail.com', // Your receiving Gmail address
          from: 'demilisco127@gmail.com', // A verified sender email with SendGrid
          subject: `New Contact Form Message from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
          html: `<p><strong>Name:</strong> ${name}</p>
                 <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                 <p><strong>Message:</strong></p>
                 <p>${message.replace(/\n/g, '<br>')}</p>`,
        };
        await sgMail.send(msg);
        // --- End Placeholder ---

        console.log("Form data received (Email sending logic needs implementation):", { name, email }); // Log received data
        // ** REMOVE console.log in production if sensitive **

        // If email sending logic above is successful:
        return response.status(200).json({ message: 'Message sent successfully!' });

    } catch (error) {
        console.error("Error processing contact form:", error);
        // Avoid leaking detailed errors to the client
        return response.status(500).json({ error: 'Failed to send message.' });
    }
}