const express = require('express');
const router = express.Router();
const db = require('../db'); // Update path as needed

// Route to update 3 addresses
router.post('/users/:id/addresses', async (req, res) => {
  const userId = req.params.id;
  const { address, address1, address2 } = req.body;

  if (!address || !address1 || !address2) {
    return res.status(400).json({ message: 'All three addresses are required' });
  }

  try {
    const [result] = await db.execute(
      'UPDATE users SET address = ?, address1 = ?, address2 = ? WHERE id = ?',
      [address, address1, address2, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Addresses updated successfully' });
  } catch (err) {
    console.error('Error updating addresses:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
