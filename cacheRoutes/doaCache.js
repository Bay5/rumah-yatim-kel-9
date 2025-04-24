const express = require('express');
const router = express.Router();
const db = require('../config/db promised');

async function getDoaFromDatabase() {
  try {
    const [rows] = await db.query('SELECT * FROM doa');
    return rows || null;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

/**
 * @swagger
 * /cache/doa:
 *   get:
 *     summary: Mendapatkan semua data doa
 *     description: |
 *       Mengambil seluruh data doa harian dengan mekanisme caching Redis.
 *       Data akan tersimpan di cache selama 5 menit (300 detik).
 *     tags: [Doa - Cache]
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data doa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DoaResponse'
 *             examples:
 *               fromCache:
 *                 value:
 *                   source: cache
 *                   data:
 *                     - id_doa: 1
 *                       nama_doa: "Doa Sebelum Makan"
 *                       isi_doa: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"
 *                       latin: "Bismillahirrahmanirrahim"
 *                       arti: "Dengan nama Allah Yang Maha Pengasih Lagi Maha Penyayang"
 *               fromDatabase:
 *                 value:
 *                   source: database
 *                   data:
 *                     - id_doa: 1
 *                       nama_doa: "Doa Sebelum Makan"
 *                       isi_doa: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"
 *                       latin: "Bismillahirrahmanirrahim"
 *                       arti: "Dengan nama Allah Yang Maha Pengasih Lagi Maha Penyayang"
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

/**
 * @swagger
 * /cache/doa/{id}:
 *   get:
 *     summary: Mendapatkan detail doa berdasarkan ID
 *     description: |
 *       Mengambil data spesifik satu doa dengan sistem caching Redis.
 *       Data akan di-cache selama 5 menit.
 *     tags: [Doa - Cache]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID doa
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data doa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DoaResponse'
 *             examples:
 *               fromCache:
 *                 value:
 *                   source: cache
 *                   data:
 *                     id_doa: 1
 *                     nama_doa: "Doa Sebelum Makan"
 *                     isi_doa: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ"
 *                     latin: "Bismillahirrahmanirrahim"
 *                     arti: "Dengan nama Allah Yang Maha Pengasih Lagi Maha Penyayang"
 *       404:
 *         description: Data doa tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Doa tidak ditemukan"
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