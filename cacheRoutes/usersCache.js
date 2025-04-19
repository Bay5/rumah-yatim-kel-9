const express = require('express');
const router = express.Router();
const db = require('../config/db');

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
    res.status(500).json({ error: 'Terjadi kesalahan server' });
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
            return res.status(404).json({ error: 'User tidak ditemukan' });
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
