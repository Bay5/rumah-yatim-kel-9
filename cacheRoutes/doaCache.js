const express = require('express');
const router = express.Router();
const db = require('../config/db');

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
    const cachedDoa = await redisClient.get('doa');

    if (cachedDoa) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedDoa)
      });
    }

    const doaData = await getDoaFromDatabase();

    await redisClient.setEx('doa', 300, JSON.stringify(doaData));

    res.json({
      source: 'database',
      data: doaData
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
        const cachedDoa = await redisClient.get(`doa:${id}`);

        if (cachedDoa) {
            return res.json({
                source: 'cache',
                data: JSON.parse(cachedDoa)
            });
        }

        const [rows] = await db.query('SELECT * FROM doa WHERE id_doa = ?', [id]);
        const doa = rows[0];

        if (!doa) {
            return res.status(404).json({ error: 'doa tidak ditemukan' });
        }

        await redisClient.setEx(`doa:${id}`, 300, JSON.stringify(doa)); 

        res.json({
            source: 'database',
            data: doa
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;