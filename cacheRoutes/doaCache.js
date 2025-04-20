const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Cache - Doa
 *   description: Prayer data caching endpoints
 */

/**
 * @swagger
 * /cache/doa:
 *   get:
 *     summary: Get all cached prayers
 *     tags: [Cache - Doa]
 *     responses:
 *       200:
 *         description: List of prayers retrieved successfully
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
 *                     $ref: '#/components/schemas/Doa'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /cache/doa/{id}:
 *   get:
 *     summary: Get cached prayer by ID
 *     tags: [Cache - Doa]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prayer ID
 *     responses:
 *       200:
 *         description: Prayer data retrieved successfully
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
 *                   $ref: '#/components/schemas/Doa'
 *       404:
 *         description: Prayer not found
 *       500:
 *         description: Server error
 */

async function getDoaFromDatabase() {
  try {
    const [rows] = await db.query('SELECT * FROM doa');
    return rows || null;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

router.get('/', async (req, res) => {
  const redisClient = req.redisClient;
  try {
    const cachedPrayers = await redisClient.get('prayers');

    if (cachedPrayers) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedPrayers)
      });
    }

    const prayersData = await getDoaFromDatabase();
    await redisClient.setEx('prayers', 300, JSON.stringify(prayersData));

    res.json({
      source: 'database',
      data: prayersData
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
    const cachedPrayer = await redisClient.get(`prayer:${id}`);

    if (cachedPrayer) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedPrayer)
      });
    }

    const [rows] = await db.query('SELECT * FROM doa WHERE id_doa = ?', [id]);
    const prayer = rows[0];

    if (!prayer) {
      return res.status(404).json({ error: 'Prayer not found' });
    }

    await redisClient.setEx(`prayer:${id}`, 300, JSON.stringify(prayer));

    res.json({
      source: 'database',
      data: prayer
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;