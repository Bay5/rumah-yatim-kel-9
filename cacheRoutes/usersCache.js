const express = require('express');
const router = express.Router();
const db = require('../config/db promised');

async function getUsersFromDatabase() {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    return rows || null;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

/**
 * @swagger
 * /cache/users:
 *   get:
 *     summary: Mendapatkan daftar semua pengguna
 *     description: |
 *       Mengambil semua data pengguna dengan mekanisme caching Redis.
 *       Data akan disimpan di cache selama 5 menit setelah pertama kali diambil dari database.
 *     tags: [Users - Cache]
 *     responses:
 *       200:
 *         description: Sukses mendapatkan data pengguna
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             examples:
 *               fromCache:
 *                 value:
 *                   source: cache
 *                   data:
 *                     - id: 1
 *                       username: user1
 *                       email: user1@example.com
 *               fromDatabase:
 *                 value:
 *                   source: database
 *                   data:
 *                     - id: 1
 *                       username: user1
 *                       email: user1@example.com
 *       500:
 *         description: Kesalahan server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Terjadi kesalahan server
 */
router.get('/', async (req, res) => {
  const redisClient = req.redisClient;
  try {
    const cachedUsers = await redisClient.get('users');

    if (cachedUsers) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedUsers)
      });
    }

    const usersData = await getUsersFromDatabase();

    await redisClient.setEx('users', 300, JSON.stringify(usersData));

    res.json({
      source: 'database',
      data: usersData
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

/**
 * @swagger
 * /cache/users/{id}:
 *   get:
 *     summary: Mendapatkan detail pengguna berdasarkan ID
 *     description: |
 *       Mengambil data pengguna spesifik dengan mekanisme caching Redis.
 *       Data akan disimpan di cache selama 5 menit setelah pertama kali diambil dari database.
 *     tags: [Users - Cache]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pengguna yang ingin dicari
 *     responses:
 *       200:
 *         description: Sukses mendapatkan data pengguna
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             examples:
 *               fromCache:
 *                 value:
 *                   source: cache
 *                   data:
 *                     id: 1
 *                     username: user1
 *                     email: user1@example.com
 *               fromDatabase:
 *                 value:
 *                   source: database
 *                   data:
 *                     id: 1
 *                     username: user1
 *                     email: user1@example.com
 *       404:
 *         description: Pengguna tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: User tidak ditemukan
 *       500:
 *         description: Kesalahan server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Server error
 */
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const redisClient = req.redisClient;

    try {
        const cachedUser = await redisClient.get(`user:${id}`);

        if (cachedUser) {
            return res.json({
                source: 'cache',
                data: JSON.parse(cachedUser)
            });
        }

        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        await redisClient.setEx(`user:${id}`, 300, JSON.stringify(user)); 

        res.json({
            source: 'database',
            data: user
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
