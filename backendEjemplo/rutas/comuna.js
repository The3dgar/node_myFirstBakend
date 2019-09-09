const { Router } = require('express');
const router = Router();

const mysqlConnection = require("../database.js");

router.get('/', (req, res) => {
    const sql = `
    SELECT	REG.id AS region_id,
	REG.nombre AS regionNombre,
	COM.id,
	COM.nombre
FROM    comuna AS COM INNER JOIN region AS REG
ON      COM.region_id = REG.id
ORDER	BY COM.nombre`;
    mysqlConnection.query(sql, (err, rows) => {
        if (!err) {
            res.json(rows);
        } else {
            res.json([]);
        }
    });
});

module.exports = router;