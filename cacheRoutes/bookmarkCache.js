const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Cache - Bookmarks
 *   description: Bookmark data caching endpoints
 */

/**
 * @swagger
 * /cache/bookmark:
 *   get:
 *     summary: Get all cached bookmarks
 *     tags: [Cache - Bookmarks]
 *     responses:
 *       200:
 *         description: List of bookmarks retrieved successfully
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
 *                     $ref: '#/components/schemas/Bookmark'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /cache/bookmark/{id}:
 *   get:
 *     summary: Get cached bookmark by ID
 *     tags: [Cache - Bookmarks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bookmark ID
 *     responses:
 *       200:
 *         description: Bookmark data retrieved successfully
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
 *                   $ref: '#/components/schemas/Bookmark'
 *       404:
 *         description: Bookmark not found
 *       500:
 *         description: Server error
 */

async function getBookmarkFromDatabase() {
  try {
    const [rows] = await db.query('SELECT * FROM bookmark');
    return rows || null;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

router.get('/', async (req, res) => {
  const redisClient = req.redisClient;
  try {
    const cachedBookmarks = await redisClient.get('bookmarks');

    if (cachedBookmarks) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedBookmarks)
      });
    }

    const bookmarksData = await getBookmarkFromDatabase();
    await redisClient.setEx('bookmarks', 300, JSON.stringify(bookmarksData));

    res.json({
      source: 'database',
      data: bookmarksData
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
    const cachedBookmark = await redisClient.get(`bookmark:${id}`);

    if (cachedBookmark) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedBookmark)
      });
    }

    const [rows] = await db.query('SELECT * FROM bookmark WHERE id = ?', [id]);
    const bookmark = rows[0];

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    await redisClient.setEx(`bookmark:${id}`, 300, JSON.stringify(bookmark));

    res.json({
      source: 'database',
      data: bookmark
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;