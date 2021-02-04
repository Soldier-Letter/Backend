const express = require('express');
const dbconfig = require('../../config/database');
const mysql = require('mysql2/promise');
const router = new express.Router();

const conn = mysql.createPool(dbconfig);

router.get('/users', async (req, res) => {
  try {
    const [rows] = await conn.execute('SELECT * from User');
    res.status(200).send(rows);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
