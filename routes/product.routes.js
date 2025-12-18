const express = require('express');
const db = require('../db');

const router = express.Router();

/* ===================== GET PRODUCTS ===================== */
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT product_id, product_name, rate, unit FROM product_master'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

module.exports = router;