const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const sql = require('mssql');

// ✅ Satıcının ürünlerine ait siparişleri getir
router.get('/:sellerId', async (req, res) => {
  const { sellerId } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('SellerId', sql.Int, sellerId)
      .query(`
        SELECT 
          o.OrderId,
          o.Address,
          o.TotalPrice,
          o.OrderDate,
          u.FullName AS CustomerName,
          p.Name AS ProductTitle,
           p.ImageUrl,  
          oi.Quantity,
          oi.Price
        FROM Orders o
        JOIN OrderItems oi ON o.OrderId = oi.OrderId
        JOIN Products p ON oi.ProductId = p.ProductId
        JOIN Users u ON o.UserId = u.UserId
        WHERE p.SellerId = @SellerId
        ORDER BY o.OrderDate DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Satıcı siparişleri alınamadı:', err);
    res.status(500).json({ error: 'Siparişler alınamadı' });
  }
});

module.exports = router;
