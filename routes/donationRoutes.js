const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * @swagger
 * /donation:
 *   post:
 *     summary: Menambahkan donasi baru
 *     description: Menambahkan data donasi baru ke dalam database
 *     tags:
 *       - Donasi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               user_id:
 *                 type: string
 *               rumah_yatim_id:
 *                 type: string
 *               amount:
 *                 type: number
 *               payment_method:
 *                 type: string
 *               status:
 *                 type: string
 *               transaction_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Donasi berhasil ditambahkan
 *       500:
 *         description: Terjadi kesalahan pada server
 */
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

/**
 * @swagger
 * /donation:
 *   get:
 *     summary: Mendapatkan semua data donasi
 *     description: Mengambil semua data donasi dari database
 *     tags:
 *       - Donasi
 *     responses:
 *       200:
 *         description: Daftar donasi
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.get('/', (req, res) => {
    db.query('SELECT * FROM donation', (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result)
        }
    });
});

/**
 * @swagger
 * /donation/payment-trends:
 *   get:
 *     summary: Mendapatkan tren pembayaran donasi berdasarkan metode pembayaran
 *     description: Menampilkan tren pembayaran donasi berdasarkan metode pembayaran dan bulan
 *     tags:
 *       - Donasi
 *     responses:
 *       200:
 *         description: Daftar tren pembayaran
 *       500:
 *         description: Terjadi kesalahan pada server
 */
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

/**
 * @swagger
 * /donation/users/{id}:
 *   get:
 *     summary: Mendapatkan data donasi oleh pengguna
 *     description: Mengambil data donasi oleh pengguna berdasarkan ID
 *     tags:
 *       - Donasi
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daftar donasi oleh pengguna
 *       404:
 *         description: Donasi tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server
 */
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

/**
 * @swagger
 * /donation/{id}:
 *   get:
 *     summary: Mendapatkan data donasi berdasarkan ID
 *     description: Mengambil data donasi berdasarkan ID
 *     tags:
 *       - Donasi
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data donasi ditemukan
 *       404:
 *         description: Donasi tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server
 */
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

/**
 * @swagger
 * /donation/{id}:
 *   put:
 *     summary: Mengupdate data donasi berdasarkan ID
 *     description: Mengupdate informasi donasi berdasarkan ID
 *     tags:
 *       - Donasi
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
 *               user_id:
 *                 type: string
 *               rumah_yatim_id:
 *                 type: string
 *               amount:
 *                 type: number
 *               payment_method:
 *                 type: string
 *               status:
 *                 type: string
 *               transaction_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Donasi berhasil diperbarui
 *       404:
 *         description: Donasi tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server
 */
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

/**
 * @swagger
 * /donation/{id}:
 *   delete:
 *     summary: Menghapus data donasi berdasarkan ID
 *     description: Menghapus data donasi berdasarkan ID
 *     tags:
 *       - Donasi
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Donasi berhasil dihapus
 *       404:
 *         description: Donasi tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan pada server
 */
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

/**
 * @swagger
 * /donation/impact-analysis/{orphanageId}:
 *   get:
 *     summary: Mendapatkan analisis dampak donasi terhadap panti asuhan
 *     description: Menghasilkan berbagai metrik statistik tentang donasi yang diterima panti asuhan tertentu
 *     tags:
 *       - Donasi
 *     parameters:
 *       - in: path
 *         name: orphanageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID panti asuhan yang ingin dianalisis
 *     responses:
 *       '200':
 *         description: Data analisis dampak donasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID panti asuhan
 *                 nama_panti:
 *                   type: string
 *                   description: Nama panti asuhan
 *                 jumlah_anak:
 *                   type: integer
 *                   description: Jumlah anak di panti
 *                 total_donations:
 *                   type: integer
 *                   description: Total jumlah donasi yang diterima
 *                 total_donated:
 *                   type: number
 *                   format: double
 *                   description: Total nominal uang yang didonasikan
 *                 unique_donors:
 *                   type: integer
 *                   description: Jumlah donor unik
 *                 average_donation:
 *                   type: number
 *                   format: double
 *                   description: Rata-rata nominal donasi
 *                 first_donation_date:
 *                   type: string
 *                   format: date-time
 *                   description: Tanggal donasi pertama kali diterima
 *                 last_donation_date:
 *                   type: string
 *                   format: date-time
 *                   description: Tanggal donasi terakhir diterima
 *                 donation_period_days:
 *                   type: integer
 *                   description: Rentang hari antara donasi pertama dan terakhir
 *                 donation_per_child:
 *                   type: number
 *                   format: double
 *                   description: Rata-rata donasi per anak
 *                 donations_last_30_days:
 *                   type: integer
 *                   description: Jumlah donasi dalam 30 hari terakhir
 *                 amount_last_30_days:
 *                   type: number
 *                   format: double
 *                   description: Total nominal donasi dalam 30 hari terakhir
 *       '404':
 *         description: Panti asuhan tidak ditemukan
 *       '500':
 *         description: Kesalahan server
 */
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

/**
 * @swagger
 * /donation/timeline/{orphanageId}:
 *   get:
 *     summary: Mendapatkan timeline donasi per bulan untuk panti asuhan
 *     description: Menampilkan data donasi yang dikelompokkan per bulan beserta berbagai metriknya
 *     tags:
 *       - Donasi
 *     parameters:
 *       - in: path
 *         name: orphanageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID panti asuhan yang ingin dilihat timeline donasinya
 *     responses:
 *       '200':
 *         description: Data timeline donasi per bulan
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   month:
 *                     type: integer
 *                     description: Bulan (1-12)
 *                   year:
 *                     type: integer
 *                     description: Tahun
 *                   donation_count:
 *                     type: integer
 *                     description: Jumlah donasi pada bulan tersebut
 *                   total_amount:
 *                     type: number
 *                     format: double
 *                     description: Total nominal donasi pada bulan tersebut
 *                   average_amount:
 *                     type: number
 *                     format: double
 *                     description: Rata-rata nominal donasi pada bulan tersebut
 *                   unique_donors:
 *                     type: integer
 *                     description: Jumlah donor unik pada bulan tersebut
 *                   payment_methods:
 *                     type: string
 *                     description: Metode pembayaran yang digunakan (dipisahkan koma)
 *       '404':
 *         description: Tidak ada data donasi untuk panti asuhan ini
 *       '500':
 *         description: Kesalahan server
 */
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