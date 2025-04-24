const express = require('express');
const router = express.Router();
const redis = require('redis');
const db = require('../config/db promised');

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

/**
 * @swagger
 * /cache/leaderboard:
 *   get:
 *     summary: Mendapatkan leaderboard donatur
 *     description: |
 *       Mengambil data ranking donatur berdasarkan total donasi.
 *       Data di-cache di Redis selama 1 jam (3600 detik) untuk optimasi performa.
 *       
 *       Sistem akan mengecek cache terlebih dahulu sebelum query ke database.
 *     tags: [Leaderboard Donatur - Cache]
 *     responses:
 *       200:
 *         description: Sukses mendapatkan data leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaderboardResponse'
 *             examples:
 *               exampleResponse:
 *                 value:
 *                   status: success
 *                   data:
 *                     - rank: 1
 *                       user_id: 101
 *                       name: "Budi Santoso"
 *                       email: "budi@example.com"
 *                       total_donation: 5000000
 *                       total_transactions: 5
 *                     - rank: 2
 *                       user_id: 102
 *                       name: "Ani Wijaya"
 *                       email: "ani@example.com"
 *                       total_donation: 3000000
 *                       total_transactions: 3
 *       500:
 *         description: Terjadi kesalahan server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: "Failed to get leaderboard"
 *               error: "Error message details"
 */
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

/**
 * @swagger
 * /cache/leaderboard/refresh:
 *   post:
 *     summary: Memperbarui cache leaderboard secara paksa
 *     description: |
 *       Memaksa pembaruan data leaderboard dengan mengambil data terbaru dari database
 *       dan menyimpannya ke cache Redis.
 *       
 *       Berguna ketika ingin mendapatkan data real-time tanpa menunggu cache expired.
 *     tags: [Leaderboard Donatur - Cache]
 *     responses:
 *       200:
 *         description: Cache leaderboard berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Donatur'
 *             example:
 *               status: success
 *               message: "Leaderboard cache refreshed successfully"
 *               data:
 *                 - rank: 1
 *                   user_id: 101
 *                   name: "Budi Santoso"
 *                   email: "budi@example.com"
 *                   total_donation: 5000000
 *                   total_transactions: 5
 *       500:
 *         description: Terjadi kesalahan saat memperbarui cache
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: "Failed to refresh leaderboard cache"
 *               error: "Error message details"
 */
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