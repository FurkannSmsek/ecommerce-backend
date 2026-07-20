const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const sql = require('mssql');

// ✅ Yeni kategori ekle
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('Name', sql.NVarChar, name)
      .query('INSERT INTO Categories (Name) VALUES (@Name)');
    res.status(201).json({ message: 'Kategori eklendi' });
  } catch (err) {
    console.error("Kategori ekleme hatası:", err);
    res.status(500).json({ error: 'Sunucu hatası', detail: err.message });
  }
});

// ✅ Mevcut kategorileri getir
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Categories');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası', detail: err.message });
  }
});

// ✅ Kategori sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    await pool.request()
      .input('CategoryId', sql.Int, id)
      .query('DELETE FROM Categories WHERE CategoryId = @CategoryId');
    res.json({ message: 'Kategori silindi' });
  } catch (err) {
    console.error("Kategori silme hatası:", err);
    res.status(500).json({ error: 'Sunucu hatası', detail: err.message });
  }
});

// ✅ Kategori güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('CategoryId', sql.Int, id)
      .input('Name', sql.NVarChar, name)
      .query('UPDATE Categories SET Name = @Name WHERE CategoryId = @CategoryId');
    res.json({ message: 'Kategori güncellendi' });
  } catch (err) {
    console.error("Kategori güncelleme hatası:", err);
    res.status(500).json({ error: 'Sunucu hatası', detail: err.message });
  }
});

module.exports = router;
