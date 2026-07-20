const sql = require('mssql');
console.log("DB.JS YÜKLENDİ");
const config = {
    user: 'sa',
    password: '12345',
    server: 'localhost',
    port: 1453,
    database: 'E-ticaret',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ SQL Server bağlantısı başarılı');
        return pool;
    })
    .catch(err => {
    console.error("❌ Veritabanına bağlanılamadı:");
    console.error(err);
    throw err;
});

module.exports = {
    sql,
    poolPromise
};
