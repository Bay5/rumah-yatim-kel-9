const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Username already exists
 *       500:
 *         description: Server error
 */

router.post('/', async (req, res) => {
    const { id, username, name, email, password } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO users (id, username, name, email, password) VALUES (?, ?, ?, ?, ?)',
            [id, username, name, email, password]
        );
        res.status(201).json({ message: 'User added successfully', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE id=?', [id]);
        if (rows.length === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.json(rows[0]);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { username, name, email, password } = req.body;
    try {
        const [result] = await db.execute(
            "UPDATE users SET username=?, name=?, email=?, password=? WHERE id=?",
            [username, name, email, password, id]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.json({ message: 'User updated successfully' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.json({ message: 'User deleted successfully' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// 4. profile user dengan ringkasan donasi
router.get('/profile/:userId', async (req, res) => {
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
    
    try {
        const [results] = await db.query(query, [req.params.userId]);
        if (results.length === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.json(results[0]);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6 Donasi user bulanan
router.get('/monthly-donations/:userId', async (req, res) => {
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
    
    try {
        const [results] = await db.query(query, [req.params.userId]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9 ringkasan aktivitas user
router.get('/activity/:userId', async (req, res) => {
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
    
    try {
        const [results] = await db.query(query, [req.params.userId]);
        if (results.length === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.json(results[0]);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 10 user engagement
router.get('/engagement/:userId', async (req, res) => {
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
    
    try {
        const [results] = await db.query(query, [req.params.userId]);
        if (results.length === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.json(results[0]);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;