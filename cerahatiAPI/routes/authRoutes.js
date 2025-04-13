const express = require('express');
const router = express.Router();
const db = require('../config/db');
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 5 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', apiLimiter, (req, res) => {
    const { username, password } = req.body;
    db.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.status(401).json({ message: 'Username atau password salah' });
  
        const user = results[0];
        res.json({ username: user.username });
      }
    );
  });
  

module.exports = router;