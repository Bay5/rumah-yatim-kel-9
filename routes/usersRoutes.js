const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', (req, res) => {
    const { id, username, name, email, password } = req.body;
    const query = 'INSERT INTO users (id, username, name, email, password) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [id, username, name, email, password], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ message: 'User added successfully', id: result.insertId });
        }
    });
});

router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result)
        }
    });
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM users WHERE id=?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.length === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.json(result)
        }
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { username, name, email, password } = req.body;
    const query = "UPDATE users SET username=?, name=?, email=?, password=? WHERE id=?";
    db.query(query, [username, name, email, password, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User not found' });
        } else{
            res.json({ message: 'User updated successfully' });
        }
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.json({ message: 'User deleted successfully' });
        }
    });
});

module.exports = router;