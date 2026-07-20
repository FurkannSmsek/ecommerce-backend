const { poolPromise } = require('../db');
const sql = require('mssql');

const getAllProducts = async (req, res) => {
  try {
    console.log("poolPromise:", poolPromise);
    const pool = await poolPromise;
    console.log("pool:", pool);
    const result = await pool.request().query(`
      SELECT 
        p.*, 
        u.username AS SellerName, 
        c.Name AS CategoryName
      FROM Products p
      LEFT JOIN Users u ON p.SellerId = u.UserId
      LEFT JOIN Categories c ON p.CategoryId = c.CategoryId
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası', detail: err.message });
  }
};


const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, imageUrl, sellerId } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('Name', sql.NVarChar, name)
      .input('Description', sql.NVarChar, description)
      .input('Price', sql.Decimal(18, 2), price)
      .input('Stock', sql.Int, stock)
      .input('CategoryId', sql.Int, categoryId)
      .input('ImageUrl', sql.NVarChar, imageUrl)
      .input('SellerId', sql.Int, sellerId)
      .query(`
        INSERT INTO Products (Name, Description, Price, Stock, CategoryId, ImageUrl, SellerId)
        VALUES (@Name, @Description, @Price, @Stock, @CategoryId, @ImageUrl, @SellerId)
      `);

    res.status(201).json({ message: 'Product added successfully' });
  } catch (err) {
    console.error('Product insert error:', err);
    res.status(500).json({ error: 'Product insert failed', detail: err.message });
  }
};

const getProductsBySellerId = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
  .input("SellerId", sql.Int, id)
  .query(`
    SELECT
      p.*, c.Name AS CategoryName, u.username AS SellerName,
      ISNULL(SUM(oi.Quantity), 0) AS TotalSold
    FROM Products p
    LEFT JOIN Categories c ON p.CategoryId = c.CategoryId
    LEFT JOIN OrderItems oi ON p.ProductId = oi.ProductId
    JOIN Users u ON p.SellerId = u.UserId
    WHERE p.SellerId = @SellerId
    GROUP BY 
      p.ProductId, p.Name, p.Description, p.Price, p.Stock,
      p.CategoryId, p.ImageUrl, p.CreatedAt, p.SellerId, c.Name, u.username
  `);


    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Satıcının ürünleri alınamadı', detail: err.message });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  getProductsBySellerId,
};
