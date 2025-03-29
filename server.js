import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;

// Serve all files and folders in the project directory
app.use(express.static(__dirname));

// Define a route for the root URL
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Serve index.html from the current directory
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
