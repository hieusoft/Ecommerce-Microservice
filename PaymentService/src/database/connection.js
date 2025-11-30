const sql = require("mssql");
const dotenv = require("dotenv");
dotenv.config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, // ví dụ: "13.229.146.92"
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // nếu Azure
        trustServerCertificate: true // nếu self-signed certificate
    }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on("error", err => {
    console.error("SQL Pool Error", err);
});

module.exports = { sql, pool, poolConnect };
