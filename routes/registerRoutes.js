const express = require('express');
const router = express.Router();
const db = require('../config/db');
const axios = require('axios');

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Mendaftarkan user baru
 *     tags: [register]
 *     description: Menggunakan reCAPTCHA untuk verifikasi dan menambahkan user baru ke database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username user yang akan didaftarkan
 *               password:
 *                 type: string
 *                 description: Password user yang akan didaftarkan
 *               token:
 *                 type: string
 *                 description: Token reCAPTCHA yang dikirimkan dari frontend
 *     responses:
 *       201:
 *         description: User berhasil didaftarkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User berhasil didaftarkan
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1001
 *                     username:
 *                       type: string
 *                       example: johndoe
 *       403:
 *         description: Verifikasi captcha gagal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verifikasi captcha gagal
 *       500:
 *         description: Terjadi kesalahan pada server saat memproses registrasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Terjadi kesalahan pada server saat memproses registrasi
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */


router.post('/', async (req, res) => {
  let { username, password, token } = req.body;

  try {
    const captchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: '6LeHdBwrAAAAALQjRXZFQC6S16iyOJ4NaIIY4ZZr', 
          response: token
        }
      }
    );

    const { success } = captchaResponse.data;
    if (!success) {
      return res.status(403).json({ message: 'Verifikasi captcha gagal' });
    }

    let newId = 1001;
    let idExists = true;

    while (idExists) {
      const [rows] = await db.execute('SELECT id FROM users WHERE id = ?', [newId]);
      if (rows.length === 0) {
        idExists = false;
      } else {
        newId++;
      }
    }

    await db.execute(
      'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
      [newId, username, password]
    );

    res.status(201).json({
      message: 'User berhasil didaftarkan',
      user: {
        id: newId,
        username
      }
    });

  } catch (error) {
    console.error('Error saat registrasi user:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan pada server saat memproses registrasi',
      error: error.message
    });
  }
});

module.exports = router;
