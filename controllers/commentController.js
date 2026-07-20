const { poolPromise } = require('../db');
const sql = require('mssql');

// ✅ Yorum ekle
const addComment = async (req, res) => {
  try {
    const { productId, userId, content,rating } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input("ProductId", sql.Int, productId)
      .input("UserId", sql.Int, userId)
      .input("Content", sql.NVarChar, content)
      .input("Rating",sql.Int,rating)
      .query(`
        INSERT INTO Comments (ProductId, UserId, Content,Rating)
        VALUES (@ProductId, @UserId, @Content,@Rating)
      `);

    res.status(201).json({ message: 'Yorum eklendi' });
  } catch (err) {
    console.error("Yorum ekleme hatası:", err);
    res.status(500).json({ error: "Yorum eklenemedi", detail: err.message });
  }
};

// ✅ Ürüne ait yorumları getir
const getCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input("ProductId", sql.Int, productId)
      .query(`
        SELECT c.*, u.username 
        FROM Comments c
        JOIN Users u ON c.UserId = u.UserId
        WHERE c.ProductId = @ProductId
        ORDER BY c.CreatedAt DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Yorum çekme hatası:", err);
    res.status(500).json({ error: "Yorumlar alınamadı", detail: err.message });
  }
};

// ✅ Satıcının ürünlerine gelen yorumları getir
const getCommentsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input("SellerId", sql.Int, sellerId)
      .query(`
         SELECT 
          c.*, 
          u.username, 
          p.Name AS ProductName, 
          p.ImageUrl AS ProductImageUrl -- ✅ Görsel buradan geliyor
        FROM Comments c
        JOIN Users u ON c.UserId = u.UserId
        JOIN Products p ON c.ProductId = p.ProductId
        WHERE p.SellerId = @SellerId
        ORDER BY c.CreatedAt DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Satıcı yorumları hatası:", err);
    res.status(500).json({ error: "Yorumlar alınamadı", detail: err.message });
  }
};

// ✅ Kullanıcının yaptığı yorumları getir (yeni eklendi)
const getCommentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT c.*, p.Name AS ProductName
        FROM Comments c
        JOIN Products p ON c.ProductId = p.ProductId
        WHERE c.UserId = @UserId
        ORDER BY c.CreatedAt DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Kullanıcı yorumları hatası:", err);
    res.status(500).json({ error: "Yorumlar alınamadı", detail: err.message });
  }
};

// Yorum sil
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input("CommentId", sql.Int, commentId)
      .query("DELETE FROM Comments WHERE CommentId = @CommentId");

    res.status(200).json({ message: "Yorum silindi" });
  } catch (err) {
    console.error("Yorum silme hatası:", err);
    res.status(500).json({ error: "Yorum silinemedi", detail: err.message });
  }
};

module.exports = {
  addComment,
  getCommentsByProduct,
  getCommentsBySeller,
  getCommentsByUser, 
  deleteComment
};
