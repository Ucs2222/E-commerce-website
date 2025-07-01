// routes/products.js

const express = require('express');
const pool = require('../db'); // MySQL connection pool
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ NEW: Get single product by ID
router.get('/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
