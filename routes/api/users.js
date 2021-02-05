const express = require('express');
const dbconfig = require('../../config/database');
const mysql = require('mysql2/promise');
const router = new express.Router();
// const { auth, hash, emailValidator } = require('../middleware/auth');

// const conn = mysql.createPool(dbconfig);

// router.get('/users', async (req, res) => {
//   try {
//     const [rows] = await conn.query('SELECT * from User');
//     res.status(200).send(rows[0]);
//   } catch (e) {
//     console.log(e);
//   }
// });

// router.post('/user')
// router.post('/user/login')
// router.post('/user/logout')

// 유저 회원가입
// router.post('/user', [emailValidator, hash], async (req, res) => {
//   try {
//     const user = req.body;
//     await conn
//     const result = await conn.query(
//       'INSERT INTO tbl_user(email, password, name, nickname, status, position, division, brigade) VALUES (?, ?, ?, ?, ? ,? ,? ,?)',
//       [
//         user.email,
//         user.password,
//         user.name,
//         user.nickname,
//         user.status,
//         user.position,
//         user.division,
//         user.brigade,
//       ],
//     );
//     res.status(200).send(result);
//     console.log()
//   } catch (e) {
//     res.status(400).send(e);
//   }
// });

// router.post('/user/login', emailValidator, async (req, res) => {
//   try {
//     const inputUser = req.body;
//     if (!inputUser.email || !inputUser.password) {
//       return res.status(400).send();
//     }

//     const [user] = await conn.query('SELECT * from User WHERE email = ?', [
//       inputUser.email,
//     ]);
//     // const result =
//   } catch (e) {}
// });

module.exports = router;
