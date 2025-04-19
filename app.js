const express = require('express');
const bodyParser = require('body-parser');
const rumahYatimRoutes = require('./routes/rumahYatimRoutes');
const usersRoutes = require('./routes/usersRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const donationRoutes = require('./routes/donationRoutes');
const authRoutes = require('./routes/authRoutes');
const doaRoutes = require('./routes/doaRoutes');
const path = require('path');
const registerRoutes = require('./routes/registerRoutes');

const rateLimit = require('express-rate-limit');
const redis = require('redis');

const cacheUserRoutes = require('./cacheRoutes/usersCache');
const cacheBookmarkRoutes = require('./cacheRoutes/bookmarkCache');
const cacheDoaRoutes = require('./cacheRoutes/doaCache');
const cacheDonasiRoutes = require('./cacheRoutes/donationCache');
const cachePantiRoutes = require('./cacheRoutes/rumahYatimCache');

const app = express();
const port = 3000;

const redisClient = redis.createClient({
    url: 'redis://localhost:6379'
});

app.use(bodyParser.json());

app.use('/register', registerRoutes);
app.use('/rumah_yatim', rumahYatimRoutes);
app.use('/users', usersRoutes);
app.use('/bookmark', bookmarkRoutes);
app.use('/donation', donationRoutes);
app.use('/login', authRoutes);
app.use('/doa', doaRoutes);

app.use(express.static(path.join(__dirname, '/frontend')));

async function startServer() {
    try {
        await redisClient.connect();
        console.log('Terhubung ke Redis');

        app.use('/cache/users', (req, res, next) => {
            req.redisClient = redisClient;
            next();
        }, cacheUserRoutes);
        app.use('/cache/bookmark', (req, res, next) => {
            req.redisClient = redisClient;
            next();
        }, cacheBookmarkRoutes);
        app.use('/cache/doa', (req, res, next) => {
            req.redisClient = redisClient;
            next();
        }, cacheDoaRoutes);
        app.use('/cache/donation', (req, res, next) => {
            req.redisClient = redisClient;
            next();
        }, cacheDonasiRoutes);
        app.use('/cache/rumah_yatim', (req, res, next) => {
            req.redisClient = redisClient;
            next();
        }, cachePantiRoutes);

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.error('Gagal terhubung ke Redis:', err);
    }
}

startServer();
