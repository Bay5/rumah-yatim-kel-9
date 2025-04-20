const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Cache - Donations
 *   description: Donation data caching endpoints
 */

/**
 * @swagger
 * /cache/donation:
 *   get:
 *     summary: Get all cached donations
 *     tags: [Cache - Donations]
 *     responses:
 *       200:
 *         description: List of donations retrieved successfully
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
 *                     $ref: '#/components/schemas/Donation'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /cache/donation/{id}:
 *   get:
 *     summary: Get cached donation by ID
 *     tags: [Cache - Donations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Donation ID
 *     responses:
 *       200:
 *         description: Donation data retrieved successfully
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
 *                   $ref: '#/components/schemas/Donation'
 *       404:
 *         description: Donation not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /cache/donation/users/{userId}:
 *   get:
 *     summary: Get cached donations by user ID
 *     tags: [Cache - Donations]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User's donations retrieved successfully
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
 *                     $ref: '#/components/schemas/Donation'
 *       404:
 *         description: No donations found for user
 *       500:
 *         description: Server error
 */

async function getDonationFromDatabase() {
  try {
    const [rows] = await db.query('SELECT * from donation');
    return rows || null;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

router.get('/', async (req, res) => {
  const redisClient = req.redisClient;
  try {
    const cachedDonations = await redisClient.get('donations');

    if (cachedDonations) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedDonations)
      });
    }

    const donationsData = await getDonationFromDatabase();
    await redisClient.setEx('donations', 300, JSON.stringify(donationsData));

    res.json({
      source: 'database',
      data: donationsData
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
    const cachedDonation = await redisClient.get(`donation:${id}`);

    if (cachedDonation) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedDonation)
      });
    }

    const [rows] = await db.query('SELECT * from donation WHERE id = ?', [id]);
    const donation = rows[0];

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    await redisClient.setEx(`donation:${id}`, 300, JSON.stringify(donation));

    res.json({
      source: 'database',
      data: donation
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const redisClient = req.redisClient;

  try {
    const cachedDonations = await redisClient.get(`donations:user:${userId}`);

    if (cachedDonations) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedDonations)
      });
    }

    const [rows] = await db.query('SELECT * from donation WHERE user_id = ?', [userId]);

    if (!rows.length) {
      return res.status(404).json({ error: 'No donations found for user' });
    }

    await redisClient.setEx(`donations:user:${userId}`, 300, JSON.stringify(rows));

    res.json({
      source: 'database',
      data: rows
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;