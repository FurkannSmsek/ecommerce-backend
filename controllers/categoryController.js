const db = require("../db");

// Tüm kategorileri getir
exports.getCategories = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM Categories");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: "Kategoriler alınamadı" });
  }
};

// Kategori sil
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM Categories WHERE CategoryId = ${id}`);
    res.json({ message: "Kategori silindi" });
  } catch (error) {
    res.status(500).json({ error: "Kategori silinirken hata oluştu" });
  }
};

// Kategori güncelle
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await db.query(`UPDATE Categories SET CategoryName = '${name}' WHERE CategoryId = ${id}`);
    res.json({ message: "Kategori güncellendi" });
  } catch (error) {
    res.status(500).json({ error: "Kategori güncellenirken hata oluştu" });
  }
};
