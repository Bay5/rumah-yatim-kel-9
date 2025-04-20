const express = require('express');
const router = express.Router();
const redis = require('redis');
const db = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Cache - Leaderboard
 *   description: Leaderboard caching endpoints
 */

/**
 * @swagger
 * /cache/leaderboard:
 *   get:
 *     summary: Get cached leaderboard data
 *     tags: [Cache - Leaderboard]
 *     responses:
 *       200:
 *         description: Leaderboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 source:
 *                   type: string
 *                   enum: [cache, database]
 *                   description: Data source (cache or database)
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                         description: User ID
 *                       username:
 *                         type: string
 *                         description: Username
 *                       total_donations:
 *                         type: number
 *                         description: Total amount donated
 *                       donation_count:
 *                         type: integer
 *                         description: Number of donations made
 *       404:
 *         description: No leaderboard data found
 *       500:
 *         description: Server error
 *   post:
 *     summary: Update leaderboard cache
 *     tags: [Cache - Leaderboard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                   description: User ID
 *                 username:
 *                   type: string
 *                   description: Username
 *                 total_donations:
 *                   type: number
 *                   description: Total amount donated
 *                 donation_count:
 *                   type: integer
 *                   description: Number of donations made
 *     responses:
 *       200:
 *         description: Leaderboard cache updated successfully
 *       500:
 *         description: Server error
 */

// Redis client setup
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

// Cache key dan duration
const CACHE_KEY = 'leaderboard';
const CACHE_DURATION = 300; // 5 menit

// Function untuk mengambil data leaderboard dari database
async function getLeaderboardFromDatabase() {
    try {
        const query = `
            SELECT 
                u.id as user_id,
                u.username,
                COUNT(d.id) as donation_count,
                SUM(d.amount) as total_donations
            FROM users u
            INNER JOIN donation d ON u.id = d.user_id
            WHERE d.status = 'Completed'
            GROUP BY u.id, u.username
            ORDER BY total_donations DESC
        `;
        console.log('Executing query:', query);
        const [rows] = await db.query(query);
        console.log('Query results:', rows);
        return rows || [];
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}

// Route untuk mendapatkan leaderboard
router.get('/', async (req, res) => {
    try {
        // Hapus cache terlebih dahulu untuk testing
        await redisClient.del(CACHE_KEY);
        console.log('Cache cleared');

        const leaderboardData = await getLeaderboardFromDatabase();
        console.log('Leaderboard data:', leaderboardData);

        if (!leaderboardData || leaderboardData.length === 0) {
            return res.status(404).json({ error: 'No leaderboard data found' });
        }

        await redisClient.setEx(CACHE_KEY, CACHE_DURATION, JSON.stringify(leaderboardData));

        res.json({
            source: 'database',
            data: leaderboardData
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

router.post('/', async (req, res) => {
    try {
        const leaderboardData = req.body;
        await redisClient.setEx(CACHE_KEY, CACHE_DURATION, JSON.stringify(leaderboardData));
        res.json({ message: 'Leaderboard cache updated successfully' });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update leaderboard cache',
            error: error.message
        });
    }
});

// Hapus semua route lainnya

module.exports = router;