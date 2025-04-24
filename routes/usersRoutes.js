const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Menambahkan user baru
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - username
 *               - name
 *               - email
 *               - password
 *             properties:
 *               id:
 *                 type: string
 *               username:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User berhasil ditambahkan
 */


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

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Mendapatkan semua user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Daftar user berhasil diambil
 */

router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result)
        }
    });
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Mendapatkan user berdasarkan ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data user ditemukan
 *       404:
 *         description: User tidak ditemukan
 */

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

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Mengupdate data user berdasarkan ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Data user berhasil diperbarui
 *       404:
 *         description: User tidak ditemukan
 */

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { username, name, email, password } = req.body;
    const query = "UPDATE users SET username=?, name=?, email=?, password=? WHERE id=?";
    db.query(query, [username, name, email, password, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.json({ message: 'User updated successfully' });
        }
    });
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Menghapus user berdasarkan ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 *       404:
 *         description: User tidak ditemukan
 */

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

/**
 * @swagger
 * /users/profile/{userId}:
 *   get:
 *     summary: Mendapatkan profil user lengkap dengan ringkasan donasi
 *     tags: [Users]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profil user berhasil diambil
 *       404:
 *         description: User tidak ditemukan
 */

// 4. profile user dengan ringkasan donasi
router.get('/profile/:userId', (req, res) => {
    const query = `
        SELECT 
            u.*,
            COUNT(d.id) as total_donations,
            SUM(d.amount) as total_amount,
            COUNT(DISTINCT d.rumah_yatim_id) as orphanages_supported
        FROM users u
        LEFT JOIN donation d ON u.id = d.user_id
        WHERE u.id = ?
        GROUP BY u.id
    `;
    
    db.query(query, [req.params.userId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.json(results[0]);
        }
    });
});

/**
 * @swagger
 * /users/monthly-donations/{userId}:
 *   get:
 *     summary: Mendapatkan data donasi bulanan user
 *     tags: [Users]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data donasi bulanan berhasil diambil
 */

// 6 Donasi user bulanan
router.get('/monthly-donations/:userId', (req, res) => {
    const query = `
        SELECT 
            DATE_FORMAT(d.created_at, '%Y-%m') as month,
            COUNT(d.id) as donation_count,
            SUM(d.amount) as total_amount,
            COUNT(DISTINCT d.rumah_yatim_id) as orphanages_supported
        FROM donation d
        WHERE d.user_id = ?
        GROUP BY DATE_FORMAT(d.created_at, '%Y-%m')
        ORDER BY month DESC
    `;
    
    db.query(query, [req.params.userId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

/**
 * @swagger
 * /users/activity/{userId}:
 *   get:
 *     summary: Mendapatkan ringkasan aktivitas user
 *     tags: [Users]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Aktivitas user berhasil diambil
 *       404:
 *         description: User tidak ditemukan
 */

// 9 ringkasan aktivitas user
router.get('/activity/:userId', (req, res) => {
    const query = `
        SELECT 
            u.id,
            u.name,
            u.email,
            COUNT(DISTINCT d.id) as total_donations,
            COUNT(DISTINCT b.id) as total_bookmarks,
            COUNT(DISTINCT d.rumah_yatim_id) as orphanages_supported,
            MAX(d.created_at) as last_donation_date,
            MAX(b.created_at) as last_bookmark_date
        FROM users u
        LEFT JOIN donation d ON u.id = d.user_id
        LEFT JOIN bookmark b ON u.id = b.user_id
        WHERE u.id = ?
        GROUP BY u.id, u.name, u.email
    `;
    
    db.query(query, [req.params.userId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.json(results[0]);
        }
    });
});

/**
 * @swagger
 * /users/engagement/{userId}:
 *   get:
 *     summary: Mendapatkan statistik keterlibatan (engagement) user
 *     tags: [Users]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statistik engagement user berhasil diambil
 *       404:
 *         description: User tidak ditemukan
 */

// 10 user engagement
router.get('/engagement/:userId', (req, res) => {
    const query = `
        SELECT 
            u.id,
            u.name,
            COUNT(DISTINCT d.id) as donation_count,
            COUNT(DISTINCT b.id) as bookmark_count,
            COUNT(DISTINCT d.rumah_yatim_id) as orphanages_supported,
            SUM(d.amount) as total_donated,
            DATEDIFF(NOW(), MIN(d.created_at)) as days_since_first_donation,
            DATEDIFF(NOW(), MAX(d.created_at)) as days_since_last_donation,
            COUNT(DISTINCT CASE WHEN d.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN d.id END) as donations_last_30_days,
            COUNT(DISTINCT CASE WHEN b.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN b.id END) as bookmarks_last_30_days
        FROM users u
        LEFT JOIN donation d ON u.id = d.user_id
        LEFT JOIN bookmark b ON u.id = b.user_id
        WHERE u.id = ?
        GROUP BY u.id, u.name
    `;
    
    db.query(query, [req.params.userId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.json(results[0]);
        }
    });
});

module.exports = router;