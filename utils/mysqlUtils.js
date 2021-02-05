const mysql2 = require('mysql2/promise');
const cf = require('../config/database');
const pool = mysql2.createPool(cf);
const dBquery = async (query, params) => {
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query(query, params);
      console.log(rows);
      await connection.commit();
      connection.release();
      return rows;
    } catch (e) {
      await connection.rollback();
      connection.release();
      console.log(e);
      throw e;
    } finally {
      connection.release();
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
};
module.exports = dBquery;
