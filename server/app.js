const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use('/static', express.static(path.join(__dirname, '../src/static')));

// Route handlers
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/pages/index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/pages/dashboard/user-dashboard.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/pages/dashboard/admin-dashboard.html'));
});

app.get('/command-center', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/pages/command-center.html'));
});

app.get('/rooms/:room', (req, res) => {
    res.sendFile(path.join(__dirname, `../src/rooms/${req.params.room}.html`));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
