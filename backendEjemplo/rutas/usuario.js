const {
  Router
} = require('express');
const router = Router();
const md5 = require('md5');
let nodemailer = require("nodemailer");

const mysqlConnection = require("../database.js");

router.get('/', (req, res) => {
  const sql = `SELECT * FROM usuario WHERE estado = 1`;
  mysqlConnection.query(sql, (err, rows) => {
    if (!err) {
      if (rows.length > 0) {
        res.json(rows)
      }
      res.json({});
    } else {
      res.json(err);
    }
  });
});

router.get('/rut/:rut', (req, res) => {
  const {
    rut
  } = req.params;

  const sql = `
        SELECT  USR.id,
                USR.nombre, 
                USR.apellidoPaterno, 
                USR.apellidoMaterno,
                USR.correo,
                USR.direccion,
                COM.id AS comuna_id,
                USR.estado
        FROM    usuario USR 
        LEFT OUTER JOIN comuna COM ON USR.comuna_id = COM.id
        WHERE   USR.rut = '${rut}'`;

  mysqlConnection.query(sql, (err, rows) => {
    if (!err) {
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.json({});
      }
    } else {
      res.json({});
    }
  });
});

router.get('/correo/:correo', (req, res) => {

  let mensaje = "";
  let estado = "";

  const {
    correo
  } = req.params;
  let sql = `SELECT rut, nombre, estado FROM usuario WHERE correo = '${correo}'`;

  mysqlConnection.query(sql, (err, rows) => {
    if (!err) {
      if (rows.length > 0 && rows[0].estado == 1) {
        let nombre = rows[0].nombre;
        let rut = rows[0].rut;
        let password = rows[0].rut

        let veces = Math.floor(Math.random() * (100 - 1)) + 1

        for (let i = 0; i < veces; i++) {
          password = md5(password).substr(0, 7)
        }

        sql = `UPDATE usuario SET password = MD5('${(password)}') WHERE correo = '${correo}'`;

        mysqlConnection.query(sql, (err, rows) => {
          if (!err) {
            let asunto = 'Reestablecer Contraseña'
            let html = `
              <font style='font-family: verdana; font-size: 10pt'>
              <b>Hola ${nombre}</b>
              <br><br>
              Tus credenciales para ingresar al sistema son:
              <br><br>
              <br>
              <b>rut:</b>&nbsp;${rut}
              <br>
              <b>Password:</b>&nbsp;${password}
              <br><br>
              <b>Saludos,</b>
              <br><br>
              <b>Funeraria Muerto Alegre</b>
            </font>`

            var transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "nombre@gmail.com",
                pass: "tuPass"
              }
            });

            var mailOptions = {
              from: '"Mensaje que saldra en la bandeja de correos" <nombre@gmail.com>',
              to: correo,
              subject: asunto,
              html: html
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                estado = false;
                mensaje = error;
              } else {
                estado = true;
                mensaje = "Correo enviado";
              }
              res.json({
                estado: estado,
                mensaje: mensaje
              });
            });

          } else {
            console.log(err)
            res.json({});
          }
        });
      } else {
        res.json({});
      }
    } else {
      res.json({});
    }
  });
});

router.post('/', (req, res) => {

  var mensaje = "";
  var estado = "";

  const {
    rut,
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    direccion,
    comuna_id,
    correo
  } = req.body;

  let password = rut

  let veces = Math.floor(Math.random() * (100 - 1)) + 1

  for (let i = 0; i < veces; i++) {
    password = md5(password).substr(0, 7)
  }

  const sql = `
        INSERT  INTO usuario(
                rut, 
                nombre, 
                apellidoPaterno, 
                apellidoMaterno,
                direccion,
                comuna_id, 
                correo, 
                password) 
        VALUES( '${rut}',                 
                '${nombre}', 
                '${apellidoPaterno}', 
                '${apellidoMaterno}', 
                '${direccion}',
                ${comuna_id},
                '${correo}',
                '${md5(password)}');`;

  mysqlConnection.query(sql, (err, rows) => {
    if (!err) {
      estado = true;
      id = rows.insertId;
      mensaje = `Registro Exitoso!`;
      //aqui se envia el mail

      let asunto = 'Bienvenido a la APP!'
      let html = `
        <font style='font-family: verdana; font-size: 10pt'>
        <b>Hola ${nombre}</b>
        <br><br>
        Queremos darte la bienvenida a nuestra App móvil! Es para nosotros un gran placer crear canales de comunicación efectiva con los miembros
        de la familia!
        <br><br>
        Tus credenciales para ingresar al sistema son:
        <br><br>
        <br>
        <b>rut:</b>&nbsp;${rut}
        <br>
        <b>Password:</b>&nbsp;${password}
        <br><br>
        <b>Saludos,</b>
        <br><br>
        <b>Funeraria Muerto Alegre</b>
      </font>`

      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "tuMail@gmail.com",
          pass: "tuContraseña"
        }
      });

      var mailOptions = {
        from: '"Mensaje que saldra en la bandeja de correos" <tuMail@gmail.com>',
        to: correo,
        subject: asunto,
        html: html
      };

      transporter.sendMail(mailOptions, function (error, info) {

        if (error) {
          estado = false;
          mensaje = error;
        } else {
          estado = true;
        }

        res.json({
          estado: estado,
          mensaje: mensaje
        });

      });

    } else {
      estado = false;
      mensaje = err;
      res.json({
        estado: estado,
        mensaje: mensaje
      });
    }
  });
});

router.post('/validar', (req, res) => {

  const {
    rut,
    password
  } = req.body;
  const sql = `
  SELECT  USR.id,
  USR.rut,
  USR.nombre,
  USR.apellidoPaterno,
  USR.apellidoMaterno,
  USR.direccion,
  USR.comuna_id,
  USR.correo,
  USR.cargo_id
  FROM    usuario USR 
      WHERE   rut = '${rut}' AND  password = '${md5(password)}'  AND USR.estado = 1 `;

  mysqlConnection.query(sql, (err, rows) => {
    if (!err) {
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.json([]);
      }
    } else {
      res.json({});
    }
  });
});

router.put('/:id', (req, res) => {

  var mensaje = "";
  var estado = "";

  const {
    id
  } = req.params;

  const {
    rut,
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    direccion,
    comuna_id,
    correo,
    password
  } = req.body;

  const sql = `
        UPDATE  usuario
        SET     nombre = '${nombre}', 
                apellidoPaterno = '${apellidoPaterno}', 
                apellidoMaterno = '${apellidoMaterno}', 
                direccion = '${direccion}',
                comuna_id = '${comuna_id}',
                password = '${md5(password)}'
        WHERE   id = ${id}`;

  mysqlConnection.query(sql, (err) => {

    if (!err) {
      estado = true;
      mensaje = `Usuario ${nombre} modificado`;
    } else {
      estado = false;
      mensaje = err;
    }

    res.json({
      estado: estado,
      mensaje: mensaje
    });
  });

});

router.delete('/:id', (req, res) => {

  var mensaje = "";
  var estado = "";

  const {
    id
  } = req.params;
  const sql = `UPDATE usuario SET estado = 0 WHERE id = '${id}'`;
  mysqlConnection.query(sql, (err) => {
    if (!err) {
      estado = true;
      mensaje = `Usuario N°${id} dada de baja`;
    } else {
      estado = false;
      mensaje = err;
    }
    res.json({
      estado: estado,
      mensaje: mensaje
    });
  });

});

module.exports = router;