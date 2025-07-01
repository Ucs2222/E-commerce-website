// routes/order.js
const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all orders with their items
router.get('/orders/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map(o => o.id);
    const [items] = await pool.query(
      `SELECT oi.order_id, oi.product_id, p.name AS product_name, oi.price, oi.quantity
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    const itemsByOrder = {};
    items.forEach(item => {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    });

    const result = orders.map(o => ({
      ...o,
      items: itemsByOrder[o.id] || []
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Place an order (your existing code)
router.post('/place', async (req, res) => {
  const {
    user_id,
    payment_method,
    transaction_id,
    delivery_name,
    delivery_address,
    delivery_phone,
    items
  } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO orders 
        (user_id, payment_method, payment_status, transaction_id, delivery_name, delivery_address, delivery_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        payment_method,
        payment_method === 'googlepay' ? 'Paid' : 'Pending',
        transaction_id || '',
        delivery_name,
        delivery_address,
        delivery_phone,
      ]
    );

    const order_id = result.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [order_id, item.product_id, item.quantity, item.price]
      );

      await conn.query(
        `UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?`,
        [item.quantity, item.product_id, item.quantity]
      );
    }

    await conn.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

    await conn.commit();
    res.json({ message: 'Order placed successfully', order_id });
  } catch (err) {
    await conn.rollback();
    console.error('Order placement failed:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});


// POST /api/orders/summary
router.post('/summary', async (req, res) => {
  const items = req.body; // Expecting [{ product_id, quantity }]

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Invalid items array' });
  }

  try {
    const results = [];

    for (const item of items) {
      const [rows] = await pool.execute(
        'SELECT id, name, price, image_url FROM products WHERE id = ?',
        [item.product_id]
      );

      if (rows.length === 0) continue;

      const product = rows[0];
      const quantity = item.quantity;
      results.push({
        ...product,
        quantity,
        subtotal: product.price * quantity,
      });
    }

    res.json(results);
  } catch (err) {
    console.error('Error in /orders/summary:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// Track one order with items
router.get('/track/:orderId', async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });

    const order = orders[0];

    const [items] = await pool.query(
      `SELECT 
         oi.product_id,
         p.name AS product_name,
         oi.price,
         oi.quantity
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    order.items = items;

    res.json(order);
  } catch (err) {
    console.error('Error tracking order:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
