const express = require('express');
const router = express.Router();
const db = require('../config/db');

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

router.get('/', (req, res) => {
    db.query('SELECT * FROM bookmark', (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result)
        }
    });
});

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