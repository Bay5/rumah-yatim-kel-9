const express = require('express');
const router = express.Router();
const db = require('../config/db');
const axios = require('axios');

/**
 * @swagger
 * tags:
 *   name: Registration
 *   description: User registration endpoints
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Registration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - token
 *             properties:
 *               username:
 *                 type: string
 *                 description: Desired username
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *               token:
 *                 type: string
 *                 description: reCAPTCHA token
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Generated user ID
 *                     username:
 *                       type: string
 *                       description: Registered username
 *       403:
 *         description: CAPTCHA verification failed
 *       500:
 *         description: Server error
 */

router.post('/', async (req, res) => {
  let { username, password, token } = req.body;

  try {
    const captchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token
        }
      }
    );

    const { success } = captchaResponse.data;
    if (!success) {
      return res.status(403).json({ message: 'CAPTCHA verification failed' });
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
      message: 'User registered successfully',
      user: {
        id: newId,
        username
      }
    });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({
      message: 'Server error during registration',
      error: error.message
    });
  }
});

module.exports = router;
