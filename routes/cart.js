const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const sql = require('mssql');

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Cart');
    res.json(result.recordset);
  } catch (err) {
    console.error('Sepet verileri alınamadı:', err);
    res.status(500).send('Sunucu hatası')
  }
});

module.exports = router;
