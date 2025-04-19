const express = require('express');
const router = express.Router();
const redis = require('redis');
const db = require('../config/db');

// Buat Redis client
const redisClient = redis.createClient({
    url: 'redis://localhost:6379'
});

// Connect ke Redis
(async () => {
    await redisClient.connect();
})();

// Redis error handling
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

// Cache keys dan duration
const CACHE_KEY = 'donatur:leaderboard';
const CACHE_DURATION = 3600; // 1 jam

// Get Leaderboard Donatur with Cache
router.get('/', async (req, res) => {
    try {
        // Check cache first
        const cachedData = await redisClient.get(CACHE_KEY);
        if (cachedData) {
            console.log('Cache hit - returning cached leaderboard');
            return res.json({
                status: 'success',
                data: JSON.parse(cachedData)
            });
        }

        console.log('Cache miss - querying database for leaderboard');
        const [results] = await db.query(`
            SELECT 
                u.id,
                u.name,
                u.email,
                COALESCE(SUM(d.amount), 0) as total_donasi,
                COUNT(d.id) as jumlah_donasi
            FROM users u
            LEFT JOIN donation d ON u.id = d.user_id
            GROUP BY u.id, u.name, u.email
            ORDER BY total_donasi DESC
        `);

        const leaderboard = results.map((item, index) => ({
            rank: index + 1,
            user_id: item.id,
            name: item.name,
            email: item.email,
            total_donation: parseInt(item.total_donasi),
            total_transactions: parseInt(item.jumlah_donasi)
        }));

        // Save to cache
        await redisClient.setEx(CACHE_KEY, CACHE_DURATION, JSON.stringify(leaderboard));
        console.log('Leaderboard cached successfully');

        res.json({
            status: 'success',
            data: leaderboard
        });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get leaderboard',
            error: error.message
        });
    }
});

// Force refresh leaderboard cache
router.post('/refresh', async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT 
                u.id,
                u.name,
                u.email,
                COALESCE(SUM(d.amount), 0) as total_donasi,
                COUNT(d.id) as jumlah_donasi
            FROM users u
            LEFT JOIN donation d ON u.id = d.user_id
            GROUP BY u.id, u.name, u.email
            ORDER BY total_donasi DESC
        `);

        const leaderboard = results.map((item, index) => ({
            rank: index + 1,
            user_id: item.id,
            name: item.name,
            email: item.email,
            total_donation: parseInt(item.total_donasi),
            total_transactions: parseInt(item.jumlah_donasi)
        }));

        // Save to cache
        await redisClient.setEx(CACHE_KEY, CACHE_DURATION, JSON.stringify(leaderboard));
        
        res.json({
            status: 'success',
            message: 'Leaderboard cache refreshed successfully',
            data: leaderboard
        });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to refresh leaderboard cache',
            error: error.message
        });
    }
});

module.exports = router;