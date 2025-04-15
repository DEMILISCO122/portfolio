const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Define the directory where your portfolio files are located
const portfolioDir = path.join(__dirname, 'portfolio');
const mainHtmlFile = path.join(portfolioDir, 'Untitled-1.html'); // Your main HTML file
const notFoundHtmlFile = path.join(portfolioDir, '404.html'); // Assuming 404.html is also in portfolio dir

// Serve static files (CSS, JS, images) from the 'portfolio' directory
// This will automatically handle requests for files like /style.css
app.use(express.static(portfolioDir));

// Route for the homepage - serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(mainHtmlFile);
});

// Catch-all route:
// 1. Handles requests for paths without extensions (e.g., /about, /projects)
//    by serving the main HTML file (useful for Single Page Applications).
// 2. Handles direct requests for the HTML file without the extension (e.g., /Untitled-1)
//    by serving the main HTML file.
app.get('*', (req, res, next) => {
  // Check if the request path (without extension) corresponds to our main HTML file
  // or if it looks like a path that should be handled by the SPA
  const potentialPath = path.join(portfolioDir, req.path);
  const potentialHtmlPath = path.join(portfolioDir, req.path + '.html');

  // Basic check: If the request doesn't have an extension and isn't asking for a known static file,
  // assume it's an SPA route or a request for the main HTML without extension.
  // More robust checks might be needed depending on your static assets structure.
  if (!path.extname(req.path) || potentialHtmlPath === mainHtmlFile) {
     res.sendFile(mainHtmlFile, (err) => {
       if (err) {
         // If sending the main file fails for some reason, pass to 404 handler
         next();
       }
     });
  } else {
    // If it has an extension or doesn't match our SPA/main file logic,
    // let it fall through to the 404 handler
    next();
  }
});


// Handle 404 errors - this middleware runs if no previous route matched
app.use((req, res) => {
  res.status(404).sendFile(notFoundHtmlFile, (err) => {
    // Fallback if 404.html doesn't exist or fails to send
    if (err) {
      res.status(404).send('Sorry, page not found!');
    }
  });
});

app.listen(port, () => {
  console.log(`Portfolio server running at http://localhost:${port}`);
  console.log(`Serving files from: ${portfolioDir}`);
});
