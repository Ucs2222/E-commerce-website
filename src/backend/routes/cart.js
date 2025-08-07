const express = require('express');
const pool = require('../db');
const router = express.Router();

// Add item to cart
router.post('/add', async (req, res) => {
   const user_id = req.body.user_id; // from decoded JWT
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
      await pool.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [
        user_id,
        product_id,
        quantity,
      ]);
    }
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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


// Get cart items
// Get cart items with full product details
const fs = require('fs');
const path = require('path');

// Get cart items with full product details + image in Base64
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

    // Convert image paths to Base64
    const itemsWithBase64 = items.map((item) => {
      try {
        const imagePath = path.join(__dirname, '..',  'assets', item.image_url); // adjust path if needed
        const imageData = fs.readFileSync(imagePath);
        const base64Image = `data:image/jpeg;base64,${imageData.toString('base64')}`;
        return { ...item, image_base64: base64Image };
      } catch (e) {
        return { ...item, image_base64: null }; // fallback if image not found
      }
    });

    res.json(itemsWithBase64);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: err.message });
  }
});


router.put('/update', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  try {
    // Optional: Check stock in database before updating
    const [product] = await pool.query('SELECT quantity FROM products WHERE id = ?', [product_id]);
    if (product.length === 0) return res.status(404).json({ error: 'Product not found' });

    const stock = product[0].quantity;
    if (quantity > stock) return res.status(400).json({ error: 'Not enough stock' });

    await pool.query(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, user_id, product_id]
    );
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
