const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * tags:
 *   name: Bookmarks
 *   description: Bookmark management endpoints
 */

/**
 * @swagger
 * /bookmark:
 *   get:
 *     summary: Get all bookmarks
 *     tags: [Bookmarks]
 *     responses:
 *       200:
 *         description: List of bookmarks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bookmark'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new bookmark
 *     tags: [Bookmarks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - rumah_yatim_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: User ID
 *               rumah_yatim_id:
 *                 type: integer
 *                 description: Orphanage ID
 *     responses:
 *       201:
 *         description: Bookmark created successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /bookmark/{id}:
 *   get:
 *     summary: Get bookmark by ID
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bookmark ID
 *     responses:
 *       200:
 *         description: Bookmark details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bookmark'
 *       404:
 *         description: Bookmark not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a bookmark
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bookmark ID
 *     responses:
 *       200:
 *         description: Bookmark deleted successfully
 *       404:
 *         description: Bookmark not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a bookmark
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bookmark ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: User ID
 *               rumah_yatim_id:
 *                 type: integer
 *                 description: Orphanage ID
 *     responses:
 *       200:
 *         description: Bookmark updated successfully
 *       404:
 *         description: Bookmark not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /bookmark/user/{userId}:
 *   get:
 *     summary: Get bookmarks by user ID
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User's bookmarks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bookmark'
 *       404:
 *         description: No bookmarks found for user
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /bookmark/orphanage/{orphanageId}:
 *   get:
 *     summary: Get bookmarks by orphanage ID
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: orphanageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Orphanage ID
 *     responses:
 *       200:
 *         description: Orphanage's bookmarks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bookmark'
 *       404:
 *         description: No bookmarks found for orphanage
 *       500:
 *         description: Server error
 */

// Get all bookmarks
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM bookmark');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new bookmark
router.post('/', async (req, res) => {
  const { user_id, rumah_yatim_id } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO bookmark (user_id, rumah_yatim_id) VALUES (?, ?)',
      [user_id, rumah_yatim_id]
    );
    res.status(201).json({ 
      message: 'Bookmark created successfully',
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bookmark by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM bookmark WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Bookmark not found' });
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete bookmark
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM bookmark WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Bookmark not found' });
    } else {
      res.json({ message: 'Bookmark deleted successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bookmarks by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT b.*, ry.nama_panti, ry.alamat FROM bookmark b JOIN rumah_yatim ry ON b.rumah_yatim_id = ry.id WHERE b.user_id = ?',
      [req.params.userId]
    );
    if (rows.length === 0) {
      res.status(404).json({ message: 'No bookmarks found for user' });
    } else {
      res.json(rows);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bookmarks by orphanage ID
router.get('/orphanage/:orphanageId', async (req, res) => {
  const orphanageId = req.params.orphanageId;
  try {
    const [rows] = await db.query('SELECT * FROM bookmark WHERE rumah_yatim_id = ?', [orphanageId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No bookmarks found for orphanage' });
    }
    res.json(rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update bookmark
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, rumah_yatim_id } = req.body;
  
  try {
    const [result] = await db.execute(
      'UPDATE bookmark SET user_id = ?, rumah_yatim_id = ? WHERE id = ?',
      [user_id, rumah_yatim_id, id]
    );
    
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Bookmark not found' });
    } else {
      res.json({ message: 'Bookmark updated successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;