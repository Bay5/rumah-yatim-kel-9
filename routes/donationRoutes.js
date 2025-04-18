const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', (req, res) => {
    const { id, user_id, rumah_yatim_id, amount, payment_method, status, transaction_id } = req.body;
    const query = 'INSERT INTO donation (id, user_id, rumah_yatim_id, amount, payment_method, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [id, user_id, rumah_yatim_id, amount, payment_method, status, transaction_id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ message: 'Donation added successfully', id: result.insertId });
        }
    });
});

router.get('/', (req, res) => {
    db.query('SELECT * FROM donation', (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result)
        }
    });
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM donation WHERE id=?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.length === 0) {
            res.status(404).json({ message: 'Donation not found' });
        } else {
            res.json(result)
        }
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { user_id, rumah_yatim_id, amount, payment_method, status, transaction_id } = req.body;
    const query = "UPDATE donation SET user_id=?, rumah_yatim_id=?, amount=?, payment_method=?, status=?, transaction_id=? WHERE id=?";
    db.query(query, [user_id, rumah_yatim_id, amount, payment_method, status, transaction_id, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Donation not found' });
        } else{
            res.json({ message: 'Donation updated successfully' });
        }
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM donation WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Donation not found' });
        } else {
            res.json({ message: 'Donation deleted successfully' });
        }
    });
});

module.exports = router;