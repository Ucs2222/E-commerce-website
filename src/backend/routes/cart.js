const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../db');
const router = express.Router();

 const getBase64Image = (imageUrl) => {
  try {
    // ✅ Remove any "assets/" prefix from database values
    const filename = path.basename(imageUrl); // example: "hand.jpg"
    const imagePath = path.join(__dirname, '..', 'assets', filename);

    const ext = path.extname(filename).toLowerCase();
    const mimeType =
      ext === '.png' ? 'image/png' :
      ext === '.webp' ? 'image/webp' :
      ext === '.gif' ? 'image/gif' :
      'image/jpeg'; // default

    // ✅ DEBUG
   
    const imageData = fs.readFileSync(imagePath);
    return `data:${mimeType};base64,${imageData.toString('base64')}`;
  } catch (err) {
    console.error('❌ Error reading image:', err.message);
    return null;
  }
};


// Add item to cart
router.post('/add', async (req, res) => {
  const user_id = req.body.user_id;
  const { product_id, quantity } = req.body;

  try {
    const [exists] = await pool.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (exists.length > 0) {
      await pool.query(
        'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
        [quantity, user_id, product_id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [user_id, product_id, quantity]
      );
    }

    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
router.delete('/remove', async (req, res) => {
  const { user_id, product_id } = req.body;

  if (!user_id || !product_id) {
    return res.status(400).json({ message: 'user_id and product_id are required' });
  }

  try {
    const [result] = await pool.execute(
      'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get cart items with Base64 images
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [items] = await pool.query(
      `SELECT 
        c.product_id, 
        c.quantity AS cart_quantity, 
        p.name, 
        p.price, 
        p.quantity AS stock_quantity,
        p.quality,
        p.rating,
        p.delivery_option,
        p.image_url,
        p.description
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [userId]
    );

    const itemsWithBase64 = items.map((item) => {
      return {
        ...item,
        image_base64: getBase64Image(item.image_url),
      };
    });

    res.json(itemsWithBase64);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update quantity in cart
router.put('/update', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  try {
    const [product] = await pool.query(
      'SELECT quantity FROM products WHERE id = ?',
      [product_id]
    );

    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const stock = product[0].quantity;
    if (quantity > stock) {
      return res.status(400).json({ error: 'Not enough stock' });
    }

    await pool.query(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, user_id, product_id]
    );

    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get cart count
router.get('/count/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM cart WHERE user_id = ?',
      [userId]
    );

    res.json({ count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
