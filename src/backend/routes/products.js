const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../db'); // MySQL connection pool
const router = express.Router();

// Get all products and return Base64 image
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products');

    const updatedRows = await Promise.all(
      rows.map(async (product) => {
        if (product.image_url) {
          const imageFullPath = path.join(__dirname, '..',  'assets', path.basename(product.image_url));

          try {
            const imageBuffer = fs.readFileSync(imageFullPath);
            const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
            return { ...product, image_base64: base64Image };
          } catch (err) {
            console.error(`Error reading image for product ID ${product.id}:`, err);
            return { ...product, image_base64: null };
          }
        } else {
          return { ...product, image_base64: null };
        }
      })
    );

    res.json(updatedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get single product by ID with Base64 image
// Get single product by ID with Base64 image
router.get('/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = rows[0];

    if (product.image_url) {
      // Handle relative asset path
      const imageFileName = path.basename(product.image_url);
      const imageFullPath = path.join(__dirname, '..', 'assets', imageFileName);

      try {
        const imageBuffer = fs.readFileSync(imageFullPath);
        const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
        product.image_base64 = base64Image;
      } catch (err) {
        console.error(`❌ Failed to read image for product ID ${product.id}:`, err);
        product.image_base64 = null;
      }
    } else {
      product.image_base64 = null;
    }

    res.json(product);
  } catch (err) {
    console.error(`❌ Error in /:id route:`, err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

