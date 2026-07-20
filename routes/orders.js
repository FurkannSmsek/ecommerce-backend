const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const sql = require('mssql');

console.log("✅ orders.js aktif");

// 🔍 Test endpoint
router.get('/ping', (req, res) => {
  res.send('pong 🏓');
});

// 📦 Sipariş oluşturma
router.post('/', async (req, res) => {
  console.log("📦 POST /api/orders isteği geldi!");
  console.log("Gelen veri:", req.body);

  try {
    const pool = await poolPromise;
    const { userId = 1, address, totalPrice, items } = req.body;

    const result = await pool.request()
      .input('UserId', sql.Int, userId)
      .input('Address', sql.NVarChar, address)
      .input('TotalPrice', sql.Decimal(18, 2), totalPrice)
      .input('Status', sql.NVarChar, 'Onaylandı')
      .query(`
        INSERT INTO Orders (UserId, OrderDate, TotalPrice, Address, Status)
        OUTPUT INSERTED.OrderId
        VALUES (@UserId, GETDATE(), @TotalPrice, @Address, @Status)
      `);

    const orderId = result.recordset[0].OrderId;

    for (const item of items) {
      await pool.request()
        .input('OrderId', sql.Int, orderId)
        .input('ProductId', sql.Int, item.id)
        .input('Quantity', sql.Int, item.count)
        .input('Price', sql.Decimal(18, 2), item.price)
        .query(`
          INSERT INTO OrderItems (OrderId, ProductId, Quantity, Price)
          VALUES (@OrderId, @ProductId, @Quantity, @Price)
        `);
    }

    res.status(201).json({ message: "Sipariş başarıyla oluşturuldu", orderId });
  } catch (err) {
    console.error("❌ Sipariş oluşturulurken hata:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// 🧾 Tüm siparişleri listeleme (kullanıcıya göre)
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const pool = await poolPromise;

    const ordersResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT * FROM Orders
        WHERE UserId = @userId
        ORDER BY OrderDate DESC
      `);

    const orders = ordersResult.recordset;
    const fullOrders = [];

    for (const order of orders) {
      const itemsResult = await pool.request()
        .input('orderId', sql.Int, order.OrderId)
        .query(`
          SELECT oi.ProductId, oi.Quantity, oi.Price,
                 p.Name AS Title, p.ImageUrl AS Image
          FROM OrderItems oi
          JOIN Products p ON oi.ProductId = p.ProductId
          WHERE oi.OrderId = @orderId
        `);

      fullOrders.push({
        ...order,
        items: itemsResult.recordset
      });
    }

    res.json(fullOrders);
  } catch (error) {
    console.error("❌ Siparişleri getirirken hata:", error);
    res.status(500).json({ message: "Siparişler yüklenemedi" });
  }
});

// 📄 Sipariş detayı (tek sipariş)
router.get('/detail/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    const pool = await poolPromise;

    const orderResult = await pool.request()
      .input('orderId', sql.Int, orderId)
      .query(`SELECT * FROM Orders WHERE OrderId = @orderId`);

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ message: "Sipariş bulunamadı" });
    }

    const order = orderResult.recordset[0];

    const itemsResult = await pool.request()
      .input('orderId', sql.Int, orderId)
      .query(`
        SELECT oi.ProductId, oi.Quantity, oi.Price,
               p.Name AS Title, p.ImageUrl AS Image
        FROM OrderItems oi
        JOIN Products p ON oi.ProductId = p.ProductId
        WHERE oi.OrderId = @orderId
      `);

    res.json({
      ...order,
      items: itemsResult.recordset
    });
  } catch (error) {
    console.error("❌ Sipariş detayı alınamadı:", error);
    res.status(500).json({ message: "Sipariş detayı alınamadı" });
  }
});

module.exports = router;
