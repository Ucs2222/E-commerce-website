const express = require('express');
const pool = require('../db');  // Ensure this points to your MySQL pool
const router = express.Router();

router.post('/add', async (req, res) => {
  console.log('POST /api/wishlist/add', req.body);
  const { user_id, product_id } = req.body;

  if (!user_id || !product_id) {
    return res.status(400).json({ message: 'user_id and product_id are required' });
  }

  try {
    await pool.execute(
      'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [user_id, product_id]
    );
    return res.json({ message: 'Added to wishlist' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const [items] = await pool.execute(
      `SELECT *
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?`,
      [userId]
    );
    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});
router.delete('/remove', async (req, res) => {
  const { user_id, product_id } = req.body;

  if (!user_id || !product_id) {
    return res.status(400).json({ message: 'user_id and product_id are required' });
  }

  try {
    const [result] = await pool.query(
      'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    res.json({ message: 'Item removed from wishlist' });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
module.exports = router;
