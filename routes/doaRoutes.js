const express = require('express');
const router = express.Router();
const db = require('../config/db');

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

router.get('/', (req, res) => {
    db.query('SELECT * FROM doa', (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

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