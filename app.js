const express = require('express');
const bodyParser = require('body-parser');
const rumahYatimRoutes = require('./routes/rumahYatimRoutes');
const usersRoutes = require('./routes/usersRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const donationRoutes = require('./routes/donationRoutes');
const authRoutes = require('./routes/authRoutes');
const doaRoutes = require('./routes/doaRoutes');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use('/rumah_yatim', rumahYatimRoutes);
app.use('/users', usersRoutes);
app.use('/bookmark', bookmarkRoutes);
app.use('/donation', donationRoutes);
app.use('/login', authRoutes);
app.use('/doa', doaRoutes);

app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
