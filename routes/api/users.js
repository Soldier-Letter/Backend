const express = require('express');
const router = new express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const mysqlUtils = require('../../utils/mysqlUtils');
const paramUtil = require('../../utils/paramUtil');
const { auth, hash, emailValidator } = require('../middleware/auth');

const s3 = new AWS.S3({
  accessKeyId: process.env.KEYID,
  secretAccessKey: process.env.KEY,
  region: process.env.REGION,
});

let imageName = '';

const upload = multer({
  storage: multerS3({
    s3: s3,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    bucket: process.env.BUCKET,
    key: function (req, file, cb) {
      imageName = Date.now() + file.originalname;
      cb(null, imageName);
    },
    acl: 'public-read-write',
  }),
});

// 유저 회원가입
router.post('/user', [emailValidator, hash], async (req, res) => {
  try {
    const user = req.body;

    if (!paramUtil.paramCheck(user, 'email')) {
      res.status(400).send('email 파라미터 확인');
    }
    if (!paramUtil.paramCheck(user, 'password')) {
      res.status(400).send('keyword 파라미터 확인');
    }
    if (!paramUtil.paramCheck(user, 'name')) {
      res.status(400).send('keyword 파라미터 확인');
    }
    if (!paramUtil.paramCheck(user, 'status')) {
      res.status(400).send('keyword 파라미터 확인');
    }
    if (!paramUtil.paramCheck(user, 'position')) {
      res.status(400).send('keyword 파라미터 확인');
    }
    if (!paramUtil.paramCheck(user, 'division')) {
      res.status(400).send('keyword 파라미터 확인');
    }
    if (!paramUtil.paramCheck(user, 'brigade')) {
      res.status(400).send('keyword 파라미터 확인');
    }

    const [isUser] = await mysqlUtils('CALL proc_select_user_exist(?)', [
      user.email,
    ]);

    if (isUser['COUNT'] != '0') {
      return res.status(400).send('이미 존재하는 email 입니다.');
    }

    const [result] = await mysqlUtils(
      'CALL proc_insert_user(?,?,?,?,?,?,?,?)',
      [
        user.email,
        user.password,
        user.name,
        user.nickname,
        user.status,
        user.position,
        user.division,
        user.brigade,
      ],
    );

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
    const [user] = await mysqlUtils('CALL proc_select_user_email(?)', [
      req.body.email,
    ]);

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (isMatch) {
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '12h',
      });

      const [
        userWithToken,
      ] = await mysqlUtils('CALL proc_update_user_token(?, ?)', [
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
    await mysqlUtils('CALL proc_update_user_token_null(?)', [req.user.token]);
    res.status(204).send();
  } catch (e) {
    res.status(404).send();
  }
});

router.post(
  '/user/certificate',
  [auth, upload.single('image')],
  async (req, res) => {
    try {
      const user = req.user;

      if (!req.file) {
        res.status(400).send('이미지 파일 확인');
      }

      const userCertificate = await mysqlUtils(
        'CALL proc_update_user_certificate(?,?)',
        [
          user['uid'],
          `https://hackathonbootcamp.s3.ap-northeast-2.amazonaws.com/${imageName}`,
        ],
      );

      res.status(200).send(userCertificate[0]);
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  },
);

module.exports = router;
