const express = require('express');
const router = new express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysqlUtils = require('../../utils/mysqlUtils');
const { auth, hash, emailValidator } = require('../middleware/auth');

// 유저 회원가입
router.post('/user', [emailValidator, hash], async (req, res) => {
  try {
    const user = req.body;

    const [isUser] = await mysqlUtils('CALL isUser(?)', [user.email]);

    if (isUser['COUNT'] != '0') {
      return res.status(400).send();
    }

    const [result] = await mysqlUtils('CALL registerUser(?,?,?,?,?,?,?,?)', [
      user.email,
      user.password,
      user.name,
      user.nickname,
      user.status,
      user.position,
      user.division,
      user.brigade,
    ]);

    res.status(200).send(result);
  } catch (e) {
    res.status(400).send(e);
  }
});

// 유저 로그인
router.post('/user/login', emailValidator, async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send();
    }
    const [user] = await mysqlUtils('CALL getUserByEmail(?)', [req.body.email]);

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (isMatch) {
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '12h',
      });

      const [userWithToken] = await mysqlUtils('CALL login(?, ?)', [
        user.uid,
        token,
      ]);
      res.status(200).send(userWithToken);
    } else {
      throw new Error('Wrong Password');
    }
  } catch (e) {
    res.status(400).send();
  }
});

// 유저 로그아웃
router.post('/user/logout', auth, async (req, res) => {
  try {
    await mysqlUtils('CALL logout(?)', [req.user.token]);
    res.status(204).send();
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
