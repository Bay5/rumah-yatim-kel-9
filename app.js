const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
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
const cacheLeaderboardRoutes = require('./cacheRoutes/leaderboardCache');

const app = express();
const port = 3000;

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

const redisClient = redis.createClient({
    url: 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => {
            console.log(`Redis reconnect attempt ${retries}`);
            return Math.min(retries * 100, 3000);
        }
    }
});

redisClient.on('connect', () => {
    console.log('Redis client connected');
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('ready', () => {
    console.log('Redis client ready');
});

app.use(bodyParser.json());

// Main routes
app.use('/register', registerRoutes);
app.use('/rumah-yatim', rumahYatimRoutes);
app.use('/users', usersRoutes);
app.use('/bookmark', bookmarkRoutes);
app.use('/donation', donationRoutes);
app.use('/auth', authRoutes);
app.use('/doa', doaRoutes);

app.use(express.static(path.join(__dirname, '/frontend')));

async function startServer() {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');

        // Cache routes
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
        
        app.use('/cache/rumah-yatim', (req, res, next) => {
            req.redisClient = redisClient;
            next();
        }, cachePantiRoutes);

        app.use('/cache/leaderboard', (req, res, next) => {
            req.redisClient = redisClient;
            next();
        }, cacheLeaderboardRoutes);
        
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
            console.log(`API Documentation available at http://localhost:${port}/api-docs`);
        });
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
}

startServer();
