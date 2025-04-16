const express = require('express');
const app = express();

app.use(express.json()); // Middleware to parse JSON request bodies

app.post('/api/notify-visit', (req, res) => {
    console.log('Visit notification received');
    res.status(200).json({ message: 'Notification received' });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});