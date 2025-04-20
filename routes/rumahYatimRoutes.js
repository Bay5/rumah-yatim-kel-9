const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * /rumah_yatim:
 *   post:
 *     summary: Tambahkan rumah yatim baru
 *     tags: [rumah-yatim]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               nama_panti:
 *                 type: string
 *               nama_kota:
 *                 type: string
 *               nama_pengurus:
 *                 type: string
 *               alamat:
 *                 type: string
 *               foto:
 *                 type: string
 *               deskripsi:
 *                 type: string
 *               jumlah_anak:
 *                 type: integer
 *               kapasitas:
 *                 type: integer
 *               kontak:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longtitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Rumah Yatim berhasil ditambahkan
 */

/**
 * @swagger
 * /rumah_yatim:
 *   get:
 *     summary: Ambil semua data rumah yatim
 *     tags: [rumah-yatim]
 *     responses:
 *       200:
 *         description: Berhasil mengambil data
 */

/**
 * @swagger
 * /rumah_yatim/popular:
 *   get:
 *     summary: Ambil daftar rumah yatim dengan jumlah bookmark terbanyak
 *     tags: [rumah-yatim]
 *     responses:
 *       200:
 *         description: Daftar rumah yatim terpopuler
 */

/**
 * @swagger
 * /rumah_yatim/locations-summary:
 *   get:
 *     summary: Ambil ringkasan jumlah rumah yatim dan donasi per kota
 *     tags: [rumah-yatim]
 *     responses:
 *       200:
 *         description: Ringkasan berhasil diambil
 */

/**
 * @swagger
 * /rumah_yatim/{id}:
 *   get:
 *     summary: Ambil data rumah yatim berdasarkan ID
 *     tags: [rumah-yatim]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data rumah yatim ditemukan
 *       404:
 *         description: Rumah yatim tidak ditemukan
 */

/**
 * @swagger
 * /rumah_yatim/{id}:
 *   put:
 *     summary: Perbarui data rumah yatim berdasarkan ID
 *     tags: [rumah-yatim]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               nama_panti:
 *                 type: string
 *               nama_kota:
 *                 type: string
 *               nama_pengurus:
 *                 type: string
 *               alamat:
 *                 type: string
 *               foto:
 *                 type: string
 *               deskripsi:
 *                 type: string
 *               jumlah_anak:
 *                 type: integer
 *               kapasitas:
 *                 type: integer
 *               kontak:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longtitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Berhasil diperbarui
 *       404:
 *         description: Rumah yatim tidak ditemukan
 */

/**
 * @swagger
 * /rumah_yatim/{id}:
 *   delete:
 *     summary: Hapus rumah yatim berdasarkan ID
 *     tags: [rumah-yatim]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Berhasil dihapus
 *       404:
 *         description: Rumah yatim tidak ditemukan
 */

/**
 * @swagger
 * /rumah_yatim/donation/{orphanageId}:
 *   get:
 *     summary: Ambil donasi terbaru untuk rumah yatim tertentu
 *     tags: [rumah-yatim]
 *     parameters:
 *       - in: path
 *         name: orphanageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Donasi terbaru berhasil diambil
 *       404:
 *         description: Rumah yatim tidak ditemukan
 */

/**
 * @swagger
 * /rumah_yatim/performance/{id}:
 *   get:
 *     summary: Ambil performa rumah yatim berdasarkan ID
 *     tags: [rumah-yatim]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Performa ditemukan
 *       404:
 *         description: Rumah yatim tidak ditemukan
 */

/**
 * @swagger
 * /rumah_yatim/performance/{city}:
 *   get:
 *     summary: Ambil performa rumah yatim berdasarkan kota
 *     tags: [rumah-yatim]
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: Nama kota, gunakan tanda hubung untuk spasi
 *     responses:
 *       200:
 *         description: Performa berdasarkan kota ditemukan
 *       404:
 *         description: Tidak ditemukan rumah yatim di kota ini
 */


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
