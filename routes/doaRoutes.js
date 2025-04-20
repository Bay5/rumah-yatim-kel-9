const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * /doa:
 *   post:
 *     summary: Menambahkan doa baru
 *     tags: [Doa]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoaInput'
 *     responses:
 *       201:
 *         description: Doa berhasil ditambahkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: integer
 *                   description: ID doa yang baru dibuat
 *       500:
 *         description: Kesalahan server
 */
router.post('/', (req, res) => {
    const { nama_doa, isi_doa, latin, arti } = req.body;
    const query = 'INSERT INTO doa (nama_doa, isi_doa, latin, arti) VALUES (?, ?, ?, ?)';
    db.query(query, [nama_doa, isi_doa, latin, arti], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ message: 'Doa berhasil ditambahkan', id: result.insertId });
        }
    });
});

/**
 * @swagger
 * /doa:
 *   get:
 *     summary: Mendapatkan semua daftar doa
 *     tags: [Doa]
 *     responses:
 *       200:
 *         description: Daftar doa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doa'
 *       500:
 *         description: Kesalahan server
 */
router.get('/', (req, res) => {
    db.query('SELECT * FROM doa', (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

/**
 * @swagger
 * /doa/{id}:
 *   get:
 *     summary: Mendapatkan detail doa berdasarkan ID
 *     tags: [Doa]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID doa
 *     responses:
 *       200:
 *         description: Data doa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doa'
 *       404:
 *         description: Doa tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM doa WHERE id_doa = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.length === 0) {
            res.status(404).json({ message: 'Doa tidak ditemukan' });
        } else {
            res.json(result[0]);
        }
    });
});

/**
 * @swagger
 * /doa/{id}:
 *   put:
 *     summary: Memperbarui data doa
 *     tags: [Doa]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID doa yang akan diperbarui
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoaInput'
 *     responses:
 *       200:
 *         description: Doa berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Tidak ada data untuk diperbarui
 *       404:
 *         description: Doa tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const fields = req.body;

    const keys = Object.keys(fields);
    const values = Object.values(fields);

    if (keys.length === 0) {
        return res.status(400).json({ message: "Tidak ada data untuk diperbarui" });
    }

    const query = `UPDATE doa SET ${keys.map(k => `${k} = ?`).join(', ')} WHERE id_doa = ?`;

    db.query(query, [...values, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Doa tidak ditemukan' });
        }
        res.json({ message: 'Doa berhasil diperbarui' });
    });
});

/**
 * @swagger
 * /doa/{id}:
 *   delete:
 *     summary: Menghapus data doa
 *     tags: [Doa]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID doa yang akan dihapus
 *     responses:
 *       200:
 *         description: Doa berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Doa tidak ditemukan
 *       500:
 *         description: Kesalahan server
 */
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM doa WHERE id_doa = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Doa tidak ditemukan' });
        } else {
            res.json({ message: 'Doa berhasil dihapus' });
        }
    });
});

module.exports = router;