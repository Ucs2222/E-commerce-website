const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret';
const authenticate = require('../middleware/authenticate');

router.put('/address', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { address } = req.body;

  if (!address || address.trim() === '') {
    return res.status(400).json({ message: 'Address is required' });
  }

  try {
    const [result] = await db.execute(
      'UPDATE users SET address = ? WHERE id = ?',
      [address, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Register user
router.post('/register', async (req, res) => {
  const { name, email, password, address } = req.body;
  if (!name || !email || !password) return res.status(400).json({ msg: 'Missing fields' });

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(400).json({ msg: 'User exists' });

    const hashed = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (name, email, password, address) VALUES (?, ?, ?, ?)', [name, email, hashed, address]);
    res.json({ msg: 'User registered' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Missing fields' });

  try {
    const [userArr] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!userArr.length) return res.status(400).json({ msg: 'Invalid credentials' });

    const user = userArr[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, address: user.address } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user profile (requires token)
router.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [userArr] = await db.query('SELECT id, name, email, address FROM users WHERE id = ?', [decoded.id]);
    if (!userArr.length) return res.status(404).json({ msg: 'User not found' });

    res.json(userArr[0]);
  } catch {
    res.status(401).json({ msg: 'Invalid token' });
  }
});

module.exports = router;
