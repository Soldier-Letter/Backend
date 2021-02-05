const dbconfig = require('../../config/database');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const trim = require('trim');
const conn = mysql.createPool(dbconfig);

const emailValidator = (req, res, next) => {
  try {
    req.body.email = trim(req.body.email);
    if (validator.isEmail(req.body.email)) {
      next();
    } else {
      throw new Error('Bad Request');
    }
  } catch (e) {
    return res.status(400).send(e);
  }
};

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await conn.execute('SELECT * FROM USER WHERE token = ?')

    if (!user) {
      throw new Error('No user');
    }

    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

const hash = async (req, res, next) => {
  try {
    req.body.password = await bcrypt.hash(req.body.password, 8);
  } catch (e) {
    throw new Error('Hashing problem');
  }
  next();
};

module.exports = { auth, hash, emailValidator };
