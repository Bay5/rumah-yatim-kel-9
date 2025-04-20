const express = require('express');
const router = express.Router();
const db = require('../config/db promised');

async function getPantiFromDatabase() {
  try {
    const [rows] = await db.query('SELECT * FROM rumah_yatim');
    return rows || null;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

/**
 * @swagger
 * /cache/rumah_yatim:
 *   get:
 *     summary: Mendapatkan daftar semua panti asuhan
 *     description: |
 *       Mengambil seluruh data panti asuhan dengan mekanisme caching menggunakan Redis.
 *       Data akan tersimpan di cache selama 5 menit (300 detik) setelah pertama kali diambil dari database.
 *     tags: [rumah-yatim - Cache]
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data panti
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PantiResponse'
 *             examples:
 *               fromCache:
 *                 summary: Response dari cache
 *                 value:
 *                   source: cache
 *                   data:
 *                     - id: 1
 *                       nama_panti: "Panti Asuhan Bahagia"
 *                       alamat: "Jl. Contoh No. 123"
 *                       jumlah_anak: 30
 *               fromDatabase:
 *                 summary: Response dari database
 *                 value:
 *                   source: database
 *                   data:
 *                     - id: 1
 *                       nama_panti: "Panti Asuhan Bahagia"
 *                       alamat: "Jl. Contoh No. 123"
 *                       jumlah_anak: 30
 *       500:
 *         description: Kesalahan server internal
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

/**
 * @swagger
 * /cache/rumah_yatim/{id}:
 *   get:
 *     summary: Mendapatkan detail panti asuhan berdasarkan ID
 *     description: |
 *       Mengambil data spesifik satu panti asuhan dengan sistem caching Redis.
 *       Data individual akan di-cache selama 5 menit setelah pertama kali diakses.
 *     tags: [rumah-yatim - Cache]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID panti asuhan yang ingin dilihat
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan data panti
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PantiResponse'
 *             examples:
 *               fromCache:
 *                 value:
 *                   source: cache
 *                   data:
 *                     id: 1
 *                     nama_panti: "Panti Asuhan Bahagia"
 *                     alamat: "Jl. Contoh No. 123"
 *                     jumlah_anak: 30
 *               fromDatabase:
 *                 value:
 *                   source: database
 *                   data:
 *                     id: 1
 *                     nama_panti: "Panti Asuhan Bahagia"
 *                     alamat: "Jl. Contoh No. 123"
 *                     jumlah_anak: 30
 *       404:
 *         description: Panti tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Panti tidak ditemukan"
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