const mysql = require("mysql");

var mysqlConnection = mysql.createPool({
  connectionLimit: 100,
  waitForConnections: true,
  queueLimit: 0,
  host: '127.0.0.1',
  user: 'root',
  password: 'LaContraseña',
  database: 'LaDB',
  port: 3306,
  debug: false,
  wait_timeout: 28800,
  connect_timeout: 10
});

mysqlConnection.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.')
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.')
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.')
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Acceso denegado')
    }
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('Base de datos no existe')
    }
    if (err.code === 'ENOTFOUND') {
      console.error('Servidor no se encuentra')
    }
    else {
      console.log(err);
    }
  }
  if (connection) {
    console.log("Base de datos conectada");
    connection.release()
  }
  return
});

module.exports = mysqlConnection;