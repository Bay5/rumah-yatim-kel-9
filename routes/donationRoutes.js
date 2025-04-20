const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Donations
 *   description: Donation management endpoints
 */

/**
 * @swagger
 * /donation:
 *   get:
 *     summary: Get all donations
 *     tags: [Donations]
 *     responses:
 *       200:
 *         description: List of donations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Donation'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new donation
 *     tags: [Donations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Donation'
 *     responses:
 *       201:
 *         description: Donation created successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /donation/{id}:
 *   get:
 *     summary: Get donation by ID
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Donation ID
 *     responses:
 *       200:
 *         description: Donation details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Donation'
 *       404:
 *         description: Donation not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update donation status
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Donation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Completed, Failed]
 *     responses:
 *       200:
 *         description: Donation status updated successfully
 *       404:
 *         description: Donation not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /donation/user/{userId}:
 *   get:
 *     summary: Get all donations by user ID
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user's donations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Donation'
 *       404:
 *         description: No donations found for user
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /donation/orphanage/{orphanageId}:
 *   get:
 *     summary: Get all donations by orphanage ID
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: orphanageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Orphanage ID
 *     responses:
 *       200:
 *         description: List of orphanage's donations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Donation'
 *       404:
 *         description: No donations found for orphanage
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /donation/{id}:
 *   delete:
 *     summary: Delete a donation
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Donation ID
 *     responses:
 *       200:
 *         description: Donation deleted successfully
 *       404:
 *         description: Donation not found
 *       500:
 *         description: Server error
 */

// Get all donations
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM donation');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new donation
router.post('/', async (req, res) => {
  const {
    user_id,
    rumah_yatim_id,
    amount,
    payment_method,
    status,
    transaction_id
  } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO donation (user_id, rumah_yatim_id, amount, payment_method, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, rumah_yatim_id, amount, payment_method, status, transaction_id]
    );
    res.status(201).json({ 
      message: 'Donation created successfully',
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get donation by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM donation WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Donation not found' });
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update donation status
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE donation SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Donation not found' });
    } else {
      res.json({ message: 'Donation status updated successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get donations by user ID
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await db.query(
      `SELECT d.*, u.name, u.email, ry.nama_panti 
       FROM donation d 
       JOIN users u ON d.user_id = u.id 
       JOIN rumah_yatim ry ON d.rumah_yatim_id = ry.id 
       WHERE d.user_id = ?`,
      [userId]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: 'No donations found for user' });
    } else {
      res.json(rows);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get donations by orphanage ID
router.get('/orphanage/:orphanageId', async (req, res) => {
  const orphanageId = req.params.orphanageId;
  try {
    const [rows] = await db.query('SELECT * FROM donation WHERE rumah_yatim_id = ?', [orphanageId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No donations found for orphanage' });
    }
    res.json(rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 13 Donasi berdasarkan metode pembayaran
router.get('/payment-trends', async (req, res) => {
    try {
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
        
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 3 donasi + nama email
router.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT d.*, u.name, u.email 
            FROM donation d
            JOIN users u ON d.user_id = u.id
            WHERE d.user_id = ?
        `;
        const [results] = await db.query(query, [id]);
        if (results.length === 0) {
            res.status(404).json({ message: 'Donation not found' });
        } else {
            res.json(results);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete donation
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM donation WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Donation not found' });
    } else {
      res.json({ message: 'Donation deleted successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14 Efek donasi terhadap panti
router.get('/impact-analysis/:orphanageId', async (req, res) => {
    try {
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
        
        const [results] = await db.query(query, [req.params.orphanageId]);
        if (results.length === 0) {
            res.status(404).json({ message: 'Orphanage not found' });
        } else {
            res.json(results[0]);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 15 Timeline donasi panti
router.get('/timeline/:orphanageId', async (req, res) => {
    const { orphanageId } = req.params;
    try {
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
        
        const [results] = await db.query(query, [orphanageId]);
        if (results.length === 0) {
            res.status(404).json({ message: 'No donation data found for this orphanage' });
        } else {
            res.json(results);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;