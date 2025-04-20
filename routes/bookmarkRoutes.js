const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * /bookmark:
 *   post:
 *     summary: Menambahkan bookmark baru
 *     tags: [Bookmark]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookmarkInput'
 *     responses:
 *       201:
 *         description: Bookmark berhasil ditambahkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: integer
 *                   description: ID bookmark yang baru dibuat
 *       500:
 *         description: Kesalahan server
 */
router.post('/', (req, res) => {
    const { id, user_id, rumah_yatim_id } = req.body;
    const query = 'INSERT INTO bookmark (id, user_id, rumah_yatim_id) VALUES (?, ?, ?)';
    db.query(query, [id, user_id, rumah_yatim_id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ message: 'Bookmark added successfully', id: result.insertId });
        }
    });
});

/**
 * @swagger
 * /bookmark:
 *   get:
 *     summary: Mendapatkan semua bookmark
 *     tags: [Bookmark]
 *     responses:
 *       200:
 *         description: Daftar semua bookmark
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bookmark'
 *       500:
 *         description: Kesalahan server
 */
router.get('/', (req, res) => {
    db.query('SELECT * FROM bookmark', (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result)
        }
    });
});

/**
 * @swagger
 * /bookmark/{id}:
 *   get:
 *     summary: Mendapatkan detail bookmark berdasarkan ID
 *     tags: [Bookmark]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bookmark
 *     responses:
 *       200:
 *         description: Data bookmark
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bookmark'
 *       404:
 *         description: Bookmark tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM bookmark WHERE id=?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.length === 0) {
            res.status(404).json({ message: 'Bookmark not found' });
        } else {
            res.json(result)
        }
    });
});

/**
 * @swagger
 * /bookmark/{id}:
 *   put:
 *     summary: Memperbarui data bookmark
 *     tags: [Bookmark]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bookmark yang akan diperbarui
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookmarkInput'
 *     responses:
 *       200:
 *         description: Bookmark berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Bookmark tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { user_id, rumah_yatim_id } = req.body;
    const query = "UPDATE bookmark SET user_id=?, rumah_yatim_id=? WHERE id=?";
    db.query(query, [user_id, rumah_yatim_id, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Bookmark not found' });
        } else {
            res.json({ message: 'Bookmark updated successfully' });
        }
    });
});

/**
 * @swagger
 * /bookmark/{id}:
 *   delete:
 *     summary: Menghapus data bookmark
 *     tags: [Bookmark]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID bookmark yang akan dihapus
 *     responses:
 *       200:
 *         description: Bookmark berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Bookmark tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM bookmark WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Bookmark not found' });
        } else {
            res.json({ message: 'Bookmark deleted successfully' });
        }
    });
});

/**
 * @swagger
 * /bookmark/user/{user_id}:
 *   get:
 *     summary: Mendapatkan daftar bookmark oleh user tertentu
 *     tags: [Bookmark]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user
 *     responses:
 *       200:
 *         description: Daftar bookmark beserta info panti asuhan
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserBookmark'
 *       500:
 *         description: Kesalahan server
 */
// 1 Daftar bookmark oleh salah satu user
router.get('/user/:user_id', (req, res) => {
    const { user_id } = req.params;
    const query = `
        SELECT 
            bookmark.id AS bookmark_id,
            rumah_yatim.*
        FROM bookmark
        JOIN rumah_yatim ON bookmark.rumah_yatim_id = rumah_yatim.id
        WHERE bookmark.user_id = ?
    `;

    db.query(query, [user_id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

/**
 * @swagger
 * /bookmark/user-correlation/{userId}:
 *   get:
 *     summary: Mendapatkan korelasi bookmark dan donasi oleh user
 *     description: Menampilkan analisis hubungan antara panti yang di-bookmark dengan donasi yang diberikan user
 *     tags: [Bookmark]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user yang akan dianalisis
 *     responses:
 *       200:
 *         description: Data korelasi bookmark dan donasi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookmarkDonationCorrelation'
 *       500:
 *         description: Kesalahan server
 */
// 7 hubungan Bookmark dan donasi user
router.get('/user-correlation/:userId', (req, res) => {
    const userId = req.params.userId;
    
    const query = `
        SELECT 
            ry.id AS rumah_yatim_id,
            ry.nama_panti,
            COUNT(DISTINCT b.id) AS bookmark_count,
            COUNT(DISTINCT d.id) AS donation_count,
            COALESCE(SUM(d.amount), 0) AS total_donated
        FROM bookmark b
        JOIN rumah_yatim ry ON b.rumah_yatim_id = ry.id
        LEFT JOIN donation d ON d.rumah_yatim_id = ry.id AND d.user_id = ?
        WHERE b.user_id = ?
        GROUP BY ry.id, ry.nama_panti
        ORDER BY bookmark_count DESC
    `;

    db.query(query, [userId, userId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});


module.exports = router;