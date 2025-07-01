const express = require('express');
const router = express.Router();
const pool = require('../db'); // MySQL pool from mysql2/promise

// GET /api/address/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log('Fetching addresses for user:', userId);

  try {
    // ✅ MySQL-style query with proper destructuring
    const [rows] = await pool.query(
      'SELECT address, address1, address2 FROM users WHERE id = ?',
      [userId]
    );

    console.log('Query result:', rows);

    const user = rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const addressList = [user.address, user.address1, user.address2]
      .filter(addr => addr && addr.trim() !== '')
      .map((addr, index) => ({
        id: index + 1,
        address: addr
      }));

    res.json(addressList);
  } catch (error) {
    console.error('Error fetching addresses:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
