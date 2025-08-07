const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../db');

const router = express.Router();

// ✅ Helper: Convert image to base64
const getBase64Image = (imageUrl) => {
  try {
    const filename = path.basename(imageUrl); // removes any folder like "assets/"
    const imagePath = path.join(__dirname, '..', 'assets', filename); // adjust path if needed

    const ext = path.extname(filename).toLowerCase();
    const mimeType =
      ext === '.png' ? 'image/png' :
      ext === '.webp' ? 'image/webp' :
      ext === '.gif' ? 'image/gif' :
      'image/jpeg'; // default

    const imageBuffer = fs.readFileSync(imagePath);
    return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
  } catch (err) {
    console.error('❌ Error reading image:', err.message);
    return null;
  }
};

// ✅ Add to wishlist
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

// ✅ Get wishlist with base64 images
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [items] = await pool.execute(
      `SELECT w.*, p.id as product_id, p.name, p.price, p.image_url, p.description,p.quantity,p.quality
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?`,
      [userId]
    );

    const updatedItems = items.map((item) => ({
      ...item,
      image_base64: getBase64Image(item.image_url)
    }));

    return res.json(updatedItems);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

// ✅ Remove from wishlist
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
