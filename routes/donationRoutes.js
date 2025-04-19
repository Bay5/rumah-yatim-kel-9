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

// 13 Donasi berdasarkan metode pembayaran
router.get('/payment-trends', (req, res) => {
    console.log('Payment trends endpoint called');
    const query = `
        SELECT 
            payment_method,
            COUNT(*) as total_transactions,
            SUM(amount) as total_amount,
            AVG(amount) as average_amount,
            DATE_FORMAT(created_at, '%Y-%m') as month
        FROM donation
        GROUP BY payment_method, DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC, total_amount DESC
    `;
    
    console.log('Executing query:', query);
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: err.message });
        } else {
            console.log('Query results:', results);
            res.json(results);
        }
    });
});

// 3 donasi + nama email
router.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT d.*, u.name, u.email 
        FROM donation d
        JOIN users u ON d.user_id = u.id
        WHERE d.user_id = ?
    `;
    db.query(query, [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.length === 0) {
            res.status(404).json({ message: 'Donation not found' });
        } else {
            res.json(result);
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
        } else {
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

// 14 Efek donasi terhadap panti
router.get('/impact-analysis/:orphanageId', (req, res) => {
    const query = `
        SELECT 
            ry.id,
            ry.nama_panti,
            ry.jumlah_anak,
            COUNT(DISTINCT d.id) as total_donations,
            SUM(d.amount) as total_donated,
            COUNT(DISTINCT d.user_id) as unique_donors,
            AVG(d.amount) as average_donation,
            MIN(d.created_at) as first_donation_date,
            MAX(d.created_at) as last_donation_date,
            DATEDIFF(MAX(d.created_at), MIN(d.created_at)) as donation_period_days,
            SUM(d.amount) / ry.jumlah_anak as donation_per_child,
            COUNT(DISTINCT CASE WHEN d.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN d.id END) as donations_last_30_days,
            SUM(CASE WHEN d.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN d.amount ELSE 0 END) as amount_last_30_days
        FROM rumah_yatim ry
        LEFT JOIN donation d ON ry.id = d.rumah_yatim_id
        WHERE ry.id = ?
        GROUP BY ry.id, ry.nama_panti, ry.jumlah_anak
    `;
    
    db.query(query, [req.params.orphanageId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Orphanage not found' });
        } else {
            res.json(results[0]);
        }
    });
});

// 15 Timeline donasi panti
router.get('/timeline/:orphanageId', (req, res) => {
    const { orphanageId } = req.params;
    const query = `
        SELECT 
            MONTH(d.created_at) as month,
            YEAR(d.created_at) as year,
            COUNT(d.id) as donation_count,
            SUM(d.amount) as total_amount,
            AVG(d.amount) as average_amount,
            COUNT(DISTINCT d.user_id) as unique_donors,
            GROUP_CONCAT(DISTINCT d.payment_method) as payment_methods
        FROM donation d
        WHERE d.rumah_yatim_id = ?
        GROUP BY YEAR(d.created_at), MONTH(d.created_at)
        ORDER BY year DESC, month DESC
    `;
    
    db.query(query, [orphanageId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'No donation data found for this orphanage' });
        } else {
            res.json(results);
        }
    });
});

module.exports = router;