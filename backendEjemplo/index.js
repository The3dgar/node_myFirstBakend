// Librerías

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const app = express();

// Asignación de puerto
const puerto = 3210;

// Middlewares

app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());

// Rutas API

app.use('/api/usuario', require('./rutas/usuario'));
app.use('/api/comuna', require('./rutas/comuna'));

// Archivos públicos y web server
app.use("/public", express.static(path.join(__dirname, 'public')));
app.use("/", express.static(path.join(__dirname, '../frontend')));

// Ejecución del servidor
app.listen(puerto, () => {
  console.log(`Servidor corriendo en el puerto ${puerto}`)
});