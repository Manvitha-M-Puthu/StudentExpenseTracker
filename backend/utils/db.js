import mysql from "mysql2";

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Minnuvinchusista@123",
    database: "dbmsproject",
});

export default db;