const express = require('express');
const bodyParser = require('body-parser');
const rumahYatimRoutes = require('./routes/rumahYatimRoutes');
const usersRoutes = require('./routes/usersRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes')
const donationRoutes = require('./routes/donationRoutes')

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use('/rumah_yatim', rumahYatimRoutes);
app.use('/users', usersRoutes);
app.use('/bookmark', bookmarkRoutes)
app.use('/donation', donationRoutes)

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
