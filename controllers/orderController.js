
const { getOrdersByUserId } = require('../models/orderModel');

const getUserOrders = async (req, res) => {
  const userId = req.params.userId;

  try {
    const orders = await getOrdersByUserId(userId);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Siparişler alınamadı' });
  }
};

module.exports = { getUserOrders };
