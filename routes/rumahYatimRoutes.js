const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Orphanages
 *   description: Orphanage management endpoints
 */

/**
 * @swagger
 * /rumah-yatim:
 *   get:
 *     summary: Get all orphanages
 *     tags: [Orphanages]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of orphanages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RumahYatim'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new orphanage
 *     tags: [Orphanages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RumahYatim'
 *     responses:
 *       201:
 *         description: Orphanage created successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /rumah-yatim/{id}:
 *   get:
 *     summary: Get orphanage by ID
 *     tags: [Orphanages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Orphanage ID
 *     responses:
 *       200:
 *         description: Orphanage details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RumahYatim'
 *       404:
 *         description: Orphanage not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update an orphanage
 *     tags: [Orphanages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Orphanage ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RumahYatim'
 *     responses:
 *       200:
 *         description: Orphanage updated successfully
 *       404:
 *         description: Orphanage not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete an orphanage
 *     tags: [Orphanages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Orphanage ID
 *     responses:
 *       200:
 *         description: Orphanage deleted successfully
 *       404:
 *         description: Orphanage not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /rumah-yatim/search:
 *   get:
 *     summary: Search orphanages by name or address
 *     tags: [Orphanages]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for name or address
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RumahYatim'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /rumah-yatim/location/{city}:
 *   get:
 *     summary: Get orphanages by city
 *     tags: [Orphanages]
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: City name
 *     responses:
 *       200:
 *         description: Orphanages in the specified city retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RumahYatim'
 *       404:
 *         description: No orphanages found in the specified city
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /rumah-yatim/top:
 *   get:
 *     summary: Get top 10 orphanages by donation amount
 *     tags: [Orphanages]
 *     responses:
 *       200:
 *         description: Top orphanages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/RumahYatim'
 *                   - type: object
 *                     properties:
 *                       total_donations:
 *                         type: number
 *                         description: Total donation amount received
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /rumah-yatim/stats:
 *   get:
 *     summary: Get statistics about orphanages
 *     tags: [Orphanages]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_orphanages:
 *                   type: integer
 *                 total_donations:
 *                   type: number
 *                 average_donation:
 *                   type: number
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /rumah-yatim/recent:
 *   get:
 *     summary: Get recently added orphanages
 *     tags: [Orphanages]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of recent orphanages to retrieve
 *     responses:
 *       200:
 *         description: Recent orphanages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RumahYatim'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /rumah-yatim/needs-donation:
 *   get:
 *     summary: Get orphanages that need donations urgently
 *     tags: [Orphanages]
 *     responses:
 *       200:
 *         description: Orphanages needing donations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/RumahYatim'
 *                   - type: object
 *                     properties:
 *                       last_donation_date:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 */

// Get all orphanages
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rumah_yatim');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new orphanage
router.post('/', async (req, res) => {
  const {
    nama_panti,
    nama_kota,
    nama_pengurus,
    alamat,
    foto,
    deskripsi,
    jumlah_anak,
    kapasitas,
    kontak,
    latitude,
    longtitude
  } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO rumah_yatim (nama_panti, nama_kota, nama_pengurus, alamat, foto, deskripsi, jumlah_anak, kapasitas, kontak, latitude, longtitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nama_panti, nama_kota, nama_pengurus, alamat, foto, deskripsi, jumlah_anak, kapasitas, kontak, latitude, longtitude]
    );
    res.status(201).json({ 
      message: 'Orphanage created successfully',
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get orphanage by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query('SELECT * FROM rumah_yatim WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Orphanage not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update orphanage
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const {
    nama_panti,
    nama_kota,
    nama_pengurus,
    alamat,
    foto,
    deskripsi,
    jumlah_anak,
    kapasitas,
    kontak,
    latitude,
    longtitude
  } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE rumah_yatim SET nama_panti = ?, nama_kota = ?, nama_pengurus = ?, alamat = ?, foto = ?, deskripsi = ?, jumlah_anak = ?, kapasitas = ?, kontak = ?, latitude = ?, longtitude = ? WHERE id = ?',
      [nama_panti, nama_kota, nama_pengurus, alamat, foto, deskripsi, jumlah_anak, kapasitas, kontak, latitude, longtitude, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Orphanage not found' });
    }

    res.json({ message: 'Orphanage updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete orphanage
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.execute('DELETE FROM rumah_yatim WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Orphanage not found' });
    }
    res.json({ message: 'Orphanage deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search orphanages
router.get('/search', async (req, res) => {
  const searchQuery = req.query.q;
  try {
    const [rows] = await db.query(
      'SELECT * FROM rumah_yatim WHERE nama_panti LIKE ? OR nama_kota LIKE ?',
      [`%${searchQuery}%`, `%${searchQuery}%`]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get orphanages by city
router.get('/city/:city', async (req, res) => {
  const city = req.params.city;
  try {
    const [rows] = await db.query('SELECT * FROM rumah_yatim WHERE nama_kota = ?', [city]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No orphanages found in this city' });
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
