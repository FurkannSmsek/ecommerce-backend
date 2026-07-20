const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const sql = require('mssql');

// 🔐 LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, password)
      .query(`
        SELECT * FROM Users
        WHERE Email = @email AND password = @password
      `);

    const user = result.recordset[0];

    if (user) {
      res.json({
        userId: user.UserId,
        email: user.Email,
        username: user.UserName,
        role: user.Role // 🆕 Kullanıcı rolünü frontend'e gönderiyoruz
      });
    } else {
      res.status(401).json({ message: "Kullanıcı bulunamadı" });
    }
  } catch (err) {
    console.error("Login hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});


// 📝 REGISTER
router.post('/register', async (req, res) => {
  const { email, username, password, role } = req.body;

  console.log("Gelen kayıt verisi:", req.body);


  // Role gelmediyse default olarak "user" ata
  const userRole = role || 'user';

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('email', sql.NVarChar, email)
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .input('role', sql.VarChar, userRole) // 🆕 yeni role alanı
      .query(`
        INSERT INTO Users (Email, UserName, Password, Role, CreatedAt)
        VALUES (@email, @username, @password, @role, GETDATE())
      `);

    res.status(201).json({ message: 'Kayıt başarılı' });
  } catch (error) {
    console.error('Register hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
