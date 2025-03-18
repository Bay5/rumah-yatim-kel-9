const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', (req, res) => {
    const { id, nama_panti, nama_kota, nama_pengurus, alamat, foto, deskripsi, jumlah_anak, kapasitas, kontak, latitude, longtitude } = req.body;
    const query = 'INSERT INTO rumah_yatim (id, nama_panti, nama_kota, nama_pengurus, alamat, foto, deskripsi, jumlah_anak, kapasitas, kontak, latitude, longtitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [id, nama_panti, nama_kota, nama_pengurus, alamat, foto, deskripsi, jumlah_anak, kapasitas, kontak, latitude, longtitude], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ message: 'Rumah Yatim added successfully', id: result.insertId });
        }
    });
});

router.get('/', (req, res) => {
    db.query('SELECT * FROM rumah_yatim', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM rumah_yatim WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.length === 0) {
            res.status(404).json({ message: 'Rumah Yatim not found' });
        } else {
            res.json(result[0]);
        }
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nama_panti, nama_kota, nama_pengurus, alamat, foto, deskripsi, jumlah_anak, kapasitas, kontak, latitude, longtitude } = req.body;
    const query = 'UPDATE rumah_yatim SET nama_panti=?, nama_kota=?, nama_pengurus=?, alamat=?, foto=?, deskripsi=?, jumlah_anak=?, kapasitas=?, kontak=?, latitude=?, longtitude=? WHERE id=?';
    db.query(query, [nama_panti, nama_kota, nama_pengurus, alamat, foto, deskripsi, jumlah_anak, kapasitas, kontak, latitude, longtitude, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Rumah Yatim not found' });
        } else {
            res.json({ message: 'Rumah Yatim updated successfully' });
        }
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM rumah_yatim WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Rumah Yatim not found' });
        } else {
            res.json({ message: 'Rumah Yatim deleted successfully' });
        }
    });
});

module.exports = router;
