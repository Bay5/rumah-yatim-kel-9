const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Cache - Rumah Yatim
 *   description: Orphanage data caching endpoints
 */

/**
 * @swagger
 * /cache/rumah-yatim:
 *   get:
 *     summary: Get all cached orphanages
 *     tags: [Cache - Rumah Yatim]
 *     responses:
 *       200:
 *         description: List of orphanages retrieved successfully
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
 *                     $ref: '#/components/schemas/RumahYatim'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /cache/rumah-yatim/{id}:
 *   get:
 *     summary: Get cached orphanage by ID
 *     tags: [Cache - Rumah Yatim]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Orphanage ID
 *     responses:
 *       200:
 *         description: Orphanage data retrieved successfully
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
 *                   $ref: '#/components/schemas/RumahYatim'
 *       404:
 *         description: Orphanage not found
 *       500:
 *         description: Server error
 */

async function getRumahYatimFromDatabase() {
  try {
    const [rows] = await db.query('SELECT * FROM rumah_yatim');
    return rows || null;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

router.get('/', async (req, res) => {
  const redisClient = req.redisClient;
  try {
    const cachedOrphanages = await redisClient.get('orphanages');

    if (cachedOrphanages) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedOrphanages)
      });
    }

    const orphanagesData = await getRumahYatimFromDatabase();
    await redisClient.setEx('orphanages', 300, JSON.stringify(orphanagesData));

    res.json({
      source: 'database',
      data: orphanagesData
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
    const cachedOrphanage = await redisClient.get(`orphanage:${id}`);

    if (cachedOrphanage) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedOrphanage)
      });
    }

    const [rows] = await db.query('SELECT * FROM rumah_yatim WHERE id = ?', [id]);
    const orphanage = rows[0];

    if (!orphanage) {
      return res.status(404).json({ error: 'Orphanage not found' });
    }

    await redisClient.setEx(`orphanage:${id}`, 300, JSON.stringify(orphanage));

    res.json({
      source: 'database',
      data: orphanage
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;