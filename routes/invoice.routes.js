const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

/* ===================== VALIDATION ===================== */
const invoiceValidation = [
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required'),

  body('totalAmount')
    .trim()
    .notEmpty()
    .withMessage('Total Amount is required'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one product is required'),

  body('items.*.product_id')
    .isInt({ gt: 0 })
    .withMessage('Product is required'),

  body('items.*.rate')
    .isFloat({ min: 0 })
    .withMessage('Rate must be valid'),

  body('items.*.unit')
    .notEmpty()
    .withMessage('Unit is required'),

  body('items.*.qty')
    .isInt({ min: 1 })
    .withMessage('Qty must be greater than 0'),

  body('items.*.discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100'),

  body('items.*.netAmount')
    .isFloat({ min: 0 })
    .withMessage('Net amount must be valid'),

  body('items.*.totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be valid')
];

/* ===================== SAVE INVOICE ===================== */
router.post('/', invoiceValidation, async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }

  const { customerName, items, totalAmount } = req.body;
  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Invoice No
    const [[last]] = await conn.execute(
      'SELECT MAX(invoice_no) AS lastNo FROM invoice_master'
    );
    const nextInvoiceNo = `INV-${Date.now()}`;

    // Insert master
    const [result] = await conn.execute(
      `INSERT INTO invoice_master
       (invoice_no, invoice_date, customer_name, total_amount)
       VALUES (?, CURDATE(), ?, ?)`,
      [nextInvoiceNo, customerName, totalAmount]
    );

    const invoiceId = result.insertId;

    // Insert details
    for (const item of items) {
      await conn.execute(
        `INSERT INTO invoice_detail
         (invoice_id, product_id, rate, unit, qty, disc_percentage, net_amount, total_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoiceId,
          item.product_id,
          item.rate,
          item.unit,
          item.qty,
          item.discount,
          item.netAmount,
          item.totalAmount
        ]
      );
    }

    await conn.commit();
    res.json({ message: 'Invoice saved successfully', invoiceId });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Invoice save failed' });

  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;