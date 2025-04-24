const express = require('express');
const router = express.Router();
const db = require('../config/db promised');

async function getDonationFromDatabase() {
  try {
    const [rows] = await db.query('SELECT * from donation');
    return rows || null;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

/**
 * @swagger
 * /cache/donation:
 *   get:
 *     summary: Mendapatkan semua data donasi
 *     description: |
 *       Mengambil seluruh data transaksi donasi dengan mekanisme caching Redis.
 *       Data akan tersimpan di cache selama 5 menit (300 detik).
 *     tags: [Donasi - Cache]
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data donasi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DonasiResponse'
 *             examples:
 *               fromCache:
 *                 value:
 *                   source: cache
 *                   data:
 *                     - id: 1
 *                       user_id: 101
 *                       rumah_yatim_id: 201
 *                       amount: 500000
 *                       payment_method: "bank_transfer"
 *                       status: "completed"
 *                       created_at: "2023-05-15T10:30:00Z"
 *               fromDatabase:
 *                 value:
 *                   source: database
 *                   data:
 *                     - id: 1
 *                       user_id: 101
 *                       rumah_yatim_id: 201
 *                       amount: 500000
 *                       payment_method: "bank_transfer"
 *                       status: "completed"
 *                       created_at: "2023-05-15T10:30:00Z"
 *       500:
 *         description: Kesalahan server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Terjadi kesalahan server"
 */
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

/**
 * @swagger
 * /cache/donation/{id}:
 *   get:
 *     summary: Mendapatkan detail donasi berdasarkan ID transaksi
 *     description: |
 *       Mengambil data spesifik satu transaksi donasi dengan sistem caching Redis.
 *       Data akan di-cache selama 5 menit.
 *     tags: [Donasi - Cache]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID transaksi donasi
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data donasi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DonasiResponse'
 *             examples:
 *               fromCache:
 *                 value:
 *                   source: cache
 *                   data:
 *                     id: 1
 *                     user_id: 101
 *                     rumah_yatim_id: 201
 *                     amount: 500000
 *                     payment_method: "bank_transfer"
 *                     status: "completed"
 *                     created_at: "2023-05-15T10:30:00Z"
 *       404:
 *         description: Data donasi tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Donasi tidak ditemukan"
 *       500:
 *         description: Kesalahan server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Server error"
 */
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

/**
 * @swagger
 * /cache/donation/users/{id}:
 *   get:
 *     summary: Mendapatkan data donasi berdasarkan ID user
 *     description: |
 *       Mengambil data donasi spesifik berdasarkan ID user dengan caching Redis.
 *       Data akan di-cache selama 5 menit.
 *     tags: [Donasi - Cache]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data donasi user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DonasiResponse'
 *             examples:
 *               fromDatabase:
 *                 value:
 *                   source: database
 *                   data:
 *                     id: 1
 *                     user_id: 101
 *                     rumah_yatim_id: 201
 *                     amount: 500000
 *                     payment_method: "bank_transfer"
 *                     status: "completed"
 *                     created_at: "2023-05-15T10:30:00Z"
 *       404:
 *         description: Data donasi tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Donasi tidak ditemukan"
 *       500:
 *         description: Kesalahan server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Server error"
 */
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