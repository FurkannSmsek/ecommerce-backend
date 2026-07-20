const express = require('express');
const router = express.Router();
const { getAllProducts, addProduct, getProductsBySellerId } = require('../controllers/productController');
const { poolPromise } = require('../db');
const sql = require('mssql');

// Belirli bir kategoriye göre ürünleri getir
router.get('/category/:categoryName', async (req, res) => {
  try {
    const pool = await poolPromise;
    const { categoryName } = req.params;
    const decodedCategoryName = decodeURIComponent(categoryName);

    console.log('Gelen kategori:', categoryName);

    const categoryResult = await pool
      .request()
      .input('categoryName', sql.NVarChar, decodedCategoryName)
      .query('SELECT CategoryId FROM Categories WHERE LOWER(Name) = LOWER(@categoryName)');

    if (categoryResult.recordset.length === 0) {
      console.log('Kategori bulunamadı');
      return res.status(404).send('Kategori bulunamadı');
    }

    const categoryId = categoryResult.recordset[0].CategoryId;
    console.log('Bulunan categoryId:', categoryId);

    const result = await pool
      .request()
      .input('categoryId', sql.Int, categoryId)
      .query('SELECT * FROM Products WHERE CategoryId = @categoryId');

    res.json(result.recordset);
  } catch (err) {
    console.error('Kategoriye göre ürün alınırken hata oluştu:', err);
    res.status(500).send('Sunucu hatası');
  }
});


router.get('/seller/:id', getProductsBySellerId);


router.post('/', addProduct);

router.get('/', getAllProducts);

router.get('/seller/:id', getProductsBySellerId);

router.delete('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const { id } = req.params;
    await pool.request()
      .input('ProductId', sql.Int, id)
      .query('DELETE FROM Products WHERE ProductId = @ProductId');
    res.status(200).json({ message: 'Ürün silindi' });
  } catch (err) {
    console.error('Silme hatası:', err);
    res.status(500).send('Sunucu hatası');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, price, stock, categoryId, imageUrl } = req.body;
    const { id } = req.params;

    const pool = await poolPromise;
    await pool.request()
      .input('Name', name)
      .input('Price', price)
      .input('Stock', stock)
      .input('CategoryId', categoryId)
      .input('ImageUrl', imageUrl)
      .input('ProductId', id)
      .query(`
        UPDATE Products 
        SET Name = @Name, Price = @Price, Stock = @Stock, 
            CategoryId = @CategoryId, ImageUrl = @ImageUrl
        WHERE ProductId = @ProductId
      `);

    res.status(200).json({ message: 'Ürün güncellendi' });
  } catch (err) {
    console.error("Güncelleme hatası:", err);
    res.status(500).json({ error: "Sunucu hatası", detail: err.message });
  }
});

// Satıcının ürünlerinin toplam satış adetini getir
router.get('/sold-count/:sellerId', async (req, res) => {
  const { sellerId } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("SellerId", sql.Int, sellerId)
      .query(`
        SELECT 
          p.ProductId,
          p.Name,
          SUM(oi.Quantity) AS TotalSold
        FROM Products p
        JOIN OrderItems oi ON p.ProductId = oi.ProductId
        WHERE p.SellerId = @SellerId
        GROUP BY p.ProductId, p.Name
        ORDER BY TotalSold DESC;
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Satış verileri alınamadı:", err);
    res.status(500).send("Sunucu hatası");
  }
});


module.exports = router;
