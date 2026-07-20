const sql = require("mssql");

console.log("DB.JS YÜKLENDİ");

const config = {
    user: "saadmin",
    password: "FurkanSql2026!Azure",
    server: "furkan-ecommerce-sql-2026.database.windows.net",
    port: 1433,
    database: "E-ticaret-live_2",
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log("✅ Azure SQL bağlantısı başarılı");
        return pool;
    })
    .catch(err => {
        console.error("❌ Azure SQL bağlantı hatası:");
        console.error(err);
        throw err;
    });

module.exports = {
    sql,
    poolPromise
};