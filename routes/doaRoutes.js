const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Prayers
 *   description: Prayer management endpoints
 */

/**
 * @swagger
 * /doa:
 *   get:
 *     summary: Get all prayers
 *     tags: [Prayers]
 *     responses:
 *       200:
 *         description: List of prayers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doa'
 *       500:
 *         description: Server error
 */

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM doa');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /doa/{id}:
 *   get:
 *     summary: Get prayer by ID
 *     tags: [Prayers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prayer ID
 *     responses:
 *       200:
 *         description: Prayer details retrieved successfully
 *       404:
 *         description: Prayer not found
 *       500:
 *         description: Server error
 */

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM doa WHERE id_doa = ?', [req.params.id]);
        if (rows.length === 0) {
            res.status(404).json({ message: 'Prayer not found' });
        } else {
            res.json(rows[0]);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /doa:
 *   post:
 *     summary: Create a new prayer
 *     tags: [Prayers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Doa'
 *     responses:
 *       201:
 *         description: Prayer created successfully
 *       500:
 *         description: Server error
 */

router.post('/', async (req, res) => {
    const { nama_doa, isi_doa, latin, arti } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO doa (nama_doa, isi_doa, latin, arti) VALUES (?, ?, ?, ?)',
            [nama_doa, isi_doa, latin, arti]
        );
        res.status(201).json({ 
            message: 'Prayer created successfully',
            id: result.insertId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /doa/{id}:
 *   put:
 *     summary: Update a prayer
 *     tags: [Prayers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prayer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Doa'
 *     responses:
 *       200:
 *         description: Prayer updated successfully
 *       404:
 *         description: Prayer not found
 *       500:
 *         description: Server error
 */

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nama_doa, isi_doa, latin, arti } = req.body;
    try {
        const [result] = await db.execute(
            'UPDATE doa SET nama_doa = ?, isi_doa = ?, latin = ?, arti = ? WHERE id_doa = ?',
            [nama_doa, isi_doa, latin, arti, id]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Prayer not found' });
        } else {
            res.json({ message: 'Prayer updated successfully' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /doa/{id}:
 *   delete:
 *     summary: Delete a prayer
 *     tags: [Prayers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prayer ID
 *     responses:
 *       200:
 *         description: Prayer deleted successfully
 *       404:
 *         description: Prayer not found
 *       500:
 *         description: Server error
 */

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM doa WHERE id_doa = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Prayer not found' });
        } else {
            res.json({ message: 'Prayer deleted successfully' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;