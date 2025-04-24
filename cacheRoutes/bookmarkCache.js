const express = require('express');
const router = express.Router();
const db = require('../config/db promised');

async function getBookmarkFromDatabase() {
  try {
    const [rows] = await db.query('SELECT * FROM bookmark');
    return rows || null;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

/**
 * @swagger
 * /cache/bookmark:
 *   get:
 *     summary: Mendapatkan semua data bookmark
 *     description: Mengambil semua data dari tabel bookmark. Data akan diambil dari cache Redis jika tersedia, atau dari database jika tidak.
 *     tags:
 *       - Bookmark - Cache
 *     responses:
 *       200:
 *         description: Daftar bookmark berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 source:
 *                   type: string
 *                   description: Sumber data (cache/database)
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Terjadi kesalahan server
 */
router.get('/', async (req, res) => {
  const redisClient = req.redisClient;
  try {
    const cachedBookmark = await redisClient.get('bookmark');

    if (cachedBookmark) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedBookmark)
      });
    }

    const bookmarkData = await getBookmarkFromDatabase();

    await redisClient.setEx('bookmark', 300, JSON.stringify(bookmarkData));

    res.json({
      source: 'database',
      data: bookmarkData
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

/**
 * @swagger
 * /cache/bookmark/{id}:
 *   get:
 *     summary: Mendapatkan detail bookmark berdasarkan ID
 *     description: Mengambil data bookmark tertentu berdasarkan ID. Menggunakan Redis cache jika tersedia.
 *     tags:
 *       - Bookmark - Cache
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID bookmark yang ingin diambil
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Data bookmark berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 source:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: Bookmark tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan server
 */
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
            return res.status(404).json({ error: 'bookmark tidak ditemukan' });
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