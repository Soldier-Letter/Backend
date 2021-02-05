const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const mysqlUtils = require('../../utils/mysqlUtils');
const trim = require('trim');

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

    const [isUser] = await mysqlUtils('CALL proc_select_user_exist(?)', [decoded.email]);
    console.log(isUser['COUNT']);
    if (isUser['COUNT'] != '1') {
      throw new Error();
    }

    const [user] = await mysqlUtils('CALL proc_select_user_token(?)', [decoded.email]);
    const resultUser = { ...user };

    req.user = resultUser;
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
