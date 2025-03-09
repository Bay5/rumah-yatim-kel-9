const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cerahati'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Create - rumah_yatim
app.post('/rumah_yatim', (req, res) => {
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

// Read - rumah_yatim
app.get('/rumah_yatim', (req, res) => {
    db.query('SELECT * FROM rumah_yatim', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Read a single rumah_yatim entry by ID
app.get('/rumah_yatim/:id', (req, res) => {
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

// Update - rumah_yatim
app.put('/rumah_yatim/:id', (req, res) => {
    const { id } = req.params;
    const { nama_panti, nama_kota, nama_pengurus, alamat, foto, deskripsi, jumlah_anak, kapasitas, kontak, latitude, longtitude } = req.body;
    const query = 'UPDATE rumah_yatim SET nama_panti=?, nama_kota=?, nama_pengurus=?, alamat=?, foto=?, deskripsi=?, jumlah_anak=?, kapasitas=?, kontak=?, latitude=?, longtitude=? WHERE id=?';
    db.query(query, [nama_panti, nama_kota, nama_pengurus, alamat, foto, deskripsi, jumlah_anak, kapasitas, kontak, latitude, longtitude, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Rumah Yatim updated successfully' });
        }
    });
});

// Delete - rumah_yatim
app.delete('/rumah_yatim/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM rumah_yatim WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Rumah Yatim deleted successfully' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});