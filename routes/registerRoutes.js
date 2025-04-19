const express = require('express');
const router = express.Router();
const db = require('../config/db');
const axios = require('axios');

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
