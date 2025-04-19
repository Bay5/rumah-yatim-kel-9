const express = require('express');
const router = express.Router();
const db = require('../config/db');

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
    const cachedDonasi = await redisClient.get('donasi');

    if (cachedDonasi) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedDonasi)
      });
    }

    const donasiData = await getDonationFromDatabase();

    await redisClient.setEx('donasi', 300, JSON.stringify(donasiData));

    res.json({
      source: 'database',
      data: donasiData
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
        const cachedDonasi = await redisClient.get(`donasi:${id}`);

        if (cachedDonasi) {
            return res.json({
                source: 'cache',
                data: JSON.parse(cachedDonasi)
            });
        }

        const [rows] = await db.query('SELECT * from donation WHERE id = ?', [id]);
        const donasi = rows[0];

        if (!donasi) {
            return res.status(404).json({ error: 'donasi tidak ditemukan' });
        }

        await redisClient.setEx(`donasi:${id}`, 300, JSON.stringify(donasi)); 

        res.json({
            source: 'database',
            data: donasi
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/users/:id', async (req, res) => {
    const id = req.params.id;
    const redisClient = req.redisClient;

    try {
        const cachedDonasi = await redisClient.get(`donasi:${id}`);

        if (cachedDonasi) {
            return res.json({
                source: 'cache',
                data: JSON.parse(cachedDonasi)
            });
        }

        const [rows] = await db.query('SELECT * from donation WHERE user_id = ?', [id]);
        const donasi = rows[0];

        if (!donasi) {
            return res.status(404).json({ error: 'donasi tidak ditemukan' });
        }

        await redisClient.setEx(`donasi:${id}`, 300, JSON.stringify(donasi)); 

        res.json({
            source: 'database',
            data: donasi
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;