const express = require('express');
const router = express.Router();
const db = require('../config/db');

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