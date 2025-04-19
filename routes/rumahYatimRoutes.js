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

// 2 list panti dengan bookmark terbanyak
router.get('/popular', (req, res) => {
    const query = `
        SELECT r.*, COUNT(b.id) as bookmark_count 
        FROM rumah_yatim r 
        LEFT JOIN bookmark b ON r.id = b.rumah_yatim_id 
        GROUP BY r.id 
        ORDER BY bookmark_count DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// 8 ringkasan donasi per area
router.get('/locations-summary', (req, res) => {
    console.log('Fetching locations summary...');
    db.query('SELECT COUNT(*) as count FROM rumah_yatim', (error, countResult) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: error.message });
        }

        if (countResult[0].count === 0) {
            return res.status(404).json({ message: 'No orphanages found in database' });
        }

        db.query(`
            SELECT 
                r.nama_kota,
                COUNT(r.id) as total_orphanages,
                COALESCE(SUM(r.jumlah_anak), 0) as total_children,
                COUNT(d.id) as total_donations,
                COALESCE(SUM(d.amount), 0) as total_amount
            FROM rumah_yatim r
            LEFT JOIN donation d ON r.id = d.rumah_yatim_id
            GROUP BY r.nama_kota
            ORDER BY total_orphanages DESC
        `, (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: error.message });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({ message: 'No orphanage locations found' });
            }

            res.json(results);
        });
    });
});

// GET - Rumah Yatim by ID (restricted to alphanumeric IDs only)
router.get('/:id([a-zA-Z0-9-_]+)', (req, res) => {
    console.log('Fallback /:id triggered with:', req.params.id);
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

// 5 donasi terbaru
router.get('/donation/:orphanageId', (req, res) => {
    db.query('SELECT * FROM rumah_yatim WHERE id = ?', [req.params.orphanageId], (err, orphanageResults) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (orphanageResults.length === 0) {
            return res.status(404).json({ error: 'Rumah Yatim not found' });
        }

        const orphanage = orphanageResults[0];

        db.query(`
            SELECT 
                d.amount,
                d.created_at as donation_date,
                u.name as donor_name
            FROM donation d
            LEFT JOIN users u ON d.user_id = u.id
            WHERE d.rumah_yatim_id = ?
            ORDER BY d.created_at DESC
            LIMIT 10
        `, [req.params.orphanageId], (err, donationResults) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json({
                ...orphanage,
                recent_donations: donationResults
            });
        });
    });
});

// 11 performa rumah yatim
router.get('/performance/:id', (req, res) => {
    const query = `
        SELECT 
            ry.id,
            ry.nama_panti,
            ry.nama_kota,
            COUNT(DISTINCT d.id) as total_donations,
            SUM(d.amount) as total_donated,
            COUNT(DISTINCT d.user_id) as unique_donors,
            COUNT(DISTINCT b.id) as total_bookmarks,
            AVG(d.amount) as average_donation,
            MAX(d.created_at) as last_donation_date
        FROM rumah_yatim ry
        LEFT JOIN donation d ON ry.id = d.rumah_yatim_id
        LEFT JOIN bookmark b ON ry.id = b.rumah_yatim_id
        WHERE ry.id = ?
        GROUP BY ry.id, ry.nama_panti, ry.nama_kota
    `;
    
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Orphanage not found' });
        } else {
            res.json(results[0]);
        }
    });
});

// 12 performa rumah panti berdasarkan kota
router.get('/performance/:city(*)', (req, res) => {
    // Replace hyphens with spaces in the city name
    const cityName = req.params.city.replace(/-/g, ' ');
    
    const query = `
        SELECT 
            ry.nama_kota,
            COUNT(DISTINCT ry.id) as total_orphanages,
            SUM(ry.jumlah_anak) as total_children,
            COUNT(DISTINCT d.id) as total_donations,
            SUM(d.amount) as total_donated,
            COUNT(DISTINCT d.user_id) as unique_donors,
            COUNT(DISTINCT b.id) as total_bookmarks,
            AVG(d.amount) as average_donation,
            MAX(d.created_at) as last_donation_date
        FROM rumah_yatim ry
        LEFT JOIN donation d ON ry.id = d.rumah_yatim_id
        LEFT JOIN bookmark b ON ry.id = b.rumah_yatim_id
        WHERE ry.nama_kota LIKE ?
        GROUP BY ry.nama_kota
    `;
    
    db.query(query, [`%${cityName}%`], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'No orphanages found in this city' });
        } else {
            res.json(results[0]);
        }
    });
});

module.exports = router;
