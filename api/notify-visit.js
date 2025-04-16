// api/notify-visit.js
// This is a Node.js function for Vercel Serverless Functions

// Import and configure your email service provider (same as in contact.js)
 const sgMail = require('@sendgrid/mail');
const cors = require('cors');

export default async function handler(request, response) {
    // Only allow POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // --- Email Sending Logic ---
        // ** IMPORTANT: Replace this section with your actual email sending code **
        // Use the same email service (SendGrid, Resend, etc.) and API Key
        // Stored as a Vercel Environment Variable

        // --- Example Placeholder using SendGrid ---
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: 'abiodunsoetan96@gmail.com', // Your receiving Gmail address
          from: 'demilisco127@gmail.com', // Verified sender
          subject: 'Portfolio Visit Notification',
          text: `Someone visited your portfolio site at ${new Date().toISOString()}`,
          html: `<p>Someone visited your portfolio site.</p><p>Time: ${new Date().toISOString()}</p>`,
        };
        await sgMail.send(msg);
        // --- End Placeholder ---

        console.log("Visit notification triggered (Email sending logic needs implementation)");

        // If email sending logic is successful:
        return response.status(200).json({ message: 'Notification sent.' });

    } catch (error) {
        console.error("Error sending visit notification:", error);
        return response.status(500).json({ error: 'Failed to send notification.' });
    }
}

app.use(cors());

app.post('/api/notify-visit', (req, res) => {
    res.status(200).json({ message: 'Notification received' });
});