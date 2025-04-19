const express = require('express');
const router = express.Router();
const db = require('../config/db');

async function getPantiFromDatabase() {
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
    const cachedPanti = await redisClient.get('panti');

    if (cachedPanti) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedPanti)
      });
    }

    const pantiData = await getPantiFromDatabase();

    await redisClient.setEx('panti', 300, JSON.stringify(pantiData));

    res.json({
      source: 'database',
      data: pantiData
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
        const cachedPanti = await redisClient.get(`panti:${id}`);

        if (cachedPanti) {
            return res.json({
                source: 'cache',
                data: JSON.parse(cachedPanti)
            });
        }

        const [rows] = await db.query('SELECT * FROM rumah_yatim WHERE id = ?', [id]);
        const panti = rows[0];

        if (!panti) {
            return res.status(404).json({ error: 'panti tidak ditemukan' });
        }

        await redisClient.setEx(`panti:${id}`, 300, JSON.stringify(panti)); 

        res.json({
            source: 'database',
            data: panti
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;