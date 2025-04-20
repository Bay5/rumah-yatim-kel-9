const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Cache - Users
 *   description: User data caching endpoints
 */

/**
 * @swagger
 * /cache/users:
 *   get:
 *     summary: Get all cached users
 *     tags: [Cache - Users]
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
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
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /cache/users/{id}:
 *   get:
 *     summary: Get cached user by ID
 *     tags: [Cache - Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data retrieved successfully
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
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

async function getUsersFromDatabase() {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    return rows || null;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

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
    res.status(500).json({ error: 'Server error' });
  }
});

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
      return res.status(404).json({ error: 'User not found' });
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
