
const sql = require('mssql');
const db = require('../db');

const getOrdersByUserId = async (userId) => {
  const pool = await db;
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT o.OrderId, o.OrderDate, o.TotalPrice, o.Address, o.Status,
             oi.ProductId, oi.Count, oi.Price, p.Title, p.Image
      FROM Orders o
      JOIN OrderItems oi ON o.OrderId = oi.OrderId
      JOIN Products p ON oi.ProductId = p.ProductId
      WHERE o.UserId = @userId
      ORDER BY o.OrderDate DESC
    `);
  return result.recordset;
};

module.exports = { getOrdersByUserId };
