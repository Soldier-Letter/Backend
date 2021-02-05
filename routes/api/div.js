const express = require('express');
const mysqlUtil = require('../../utils/mysqlUtils');
const router = new express.Router();
const { auth, hash, emailValidator } = require('../middleware/auth');

const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

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

router.get('/div/info', async function (req, res, next) {
  try {
    const params = req.query;
    if (!paramCheck(params, 'uid')) {
      res.status(400).send('uid 파라미터 확인');
    }
    const divInfo = await mysqlUtil('call proc_select_div_info(?)', [
      params['uid'],
    ]);
    res.status(200).send(divInfo[0]);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.get('/div/rating', async function (req, res, next) {
  try {
    const params = req.query;
    if (!paramCheck(params, 'uid')) {
      res.status(400).send('uid 파라미터 확인');
    }
    if (!paramCheck(params, 'status')) {
      res.status(400).send('status 파라미터 확인');
    }
    if (!paramCheck(params, 'type')) {
      res.status(400).send('type 파라미터 확인');
    }
    const divRatingInfo = await mysqlUtil(
      'call proc_select_div_rating_info(?)',
      [params['uid']],
    );

    let divRatingList = [];
    switch (Number(params['type'])) {
      case 2: // 평점 높은 순
        divRatingList = await mysqlUtil(
          'call proc_select_div_rating_list_high(?,?)',
          [params['uid'], params['status']],
        );
        break;
      case 3: // 평점 낮은 순
        divRatingList = await mysqlUtil(
          'call proc_select_div_rating_list_low(?,?)',
          [params['uid'], params['status']],
        );
        break;
      case 4: // 추천 순
        divRatingList = await mysqlUtil(
          'call proc_select_div_rating_list_high_like(?,?)',
          [params['uid'], params['status']],
        );
        break;
      default:
        // 기본 최신 순
        divRatingList = await mysqlUtil(
          'call proc_select_div_rating_list_new(?,?)',
          [params['uid'], params['status']],
        );
        break;
    }
    const rating = {
      info: divRatingInfo[0],
      list: divRatingList,
    };
    res.status(200).send(rating);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.get('/div/community/search', async function (req, res, next) {
  try {
    const params = req.query;
    if (!paramCheck(params, 'uid')) {
      res.status(400).send('uid 파라미터 확인');
    }
    if (!paramCheck(params, 'keyword')) {
      res.status(400).send('keyword 파라미터 확인');
    }
    const searchList = await mysqlUtil(
      'call proc_select_search_community_list_by_div(?,?)',
      [params['uid'], params['keyword']],
    );
    res.status(200).send(searchList);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.get('/div/community', async function (req, res, next) {
  try {
    const params = req.query;
    if (!paramCheck(params, 'uid')) {
      res.status(400).send('uid 파라미터 확인');
    }
    if (!paramCheck(params, 'type')) {
      res.status(400).send('type 파라미터 확인');
    }
    let communityList = [];
    if (Number(params['type']) === 2) {
      // 추천순
      communityList = await mysqlUtil(
        'call proc_select_div_community_list_high_like(?)',
        [params['uid']],
      );
    } else {
      communityList = await mysqlUtil(
        'call proc_select_div_community_list(?)',
        [params['uid']],
      );
    }
    res.status(200).send(communityList);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.get('/div/local', async function (req, res, next) {
  try {
    const params = req.query;
    if (!paramCheck(params, 'uid')) {
      res.status(400).send('uid 파라미터 확인');
    }
    if (!paramCheck(params, 'type')) {
      res.status(400).send('type 파라미터 확인');
    }
    let localList = [];
    if (Number(params['type']) === 2) {
      // 추천순
      localList = await mysqlUtil(
        'call proc_select_div_local_list_high_like(?)',
        [params['uid']],
      );
    } else {
      localList = await mysqlUtil('call proc_select_div_local_list_new(?)', [
        params['uid'],
      ]);
    }
    res.status(200).send(localList);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.get('/div/local/search', async function (req, res, next) {
  try {
    const params = req.query;
    if (!paramCheck(params, 'uid')) {
      res.status(400).send('uid 파라미터 확인');
    }
    if (!paramCheck(params, 'keyword')) {
      res.status(400).send('keyword 파라미터 확인');
    }
    const searchList = await mysqlUtil(
      'call proc_select_search_local_list_by_div(?,?)',
      [params['uid'], params['keyword']],
    );
    res.status(200).send(searchList);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post('/div/local', auth, async function (req, res, next) {
  try {
    const user = req.user;
    const params = req.body;
    if (!paramCheck(params, 'div_uid')) {
      res.status(400).send('div_uid 파라미터 확인');
    }
    if (!paramCheck(params, 'name')) {
      res.status(400).send('name 파라미터 확인');
    }
    if (!paramCheck(params, 'address')) {
      res.status(400).send('address 파라미터 확인');
    }
    if (!paramCheck(params, 'content')) {
      res.status(400).send('content 파라미터 확인');
    }
    if (!paramCheck(params, 'type')) {
      res.status(400).send('type 파라미터 확인');
    }

    const phoneNumber = params['phone_number'] ? params['phone_number'] : null;
    const price = params['price'] ? params['price'] : null;
    const information = params['information'] ? params['information'] : null;

    const divFacility = await mysqlUtil(
      'call proc_insert_div_local(?,?,?,?,?,?,?,?,?)',
      [
        user['uid'],
        params['div_uid'],
        params['type'],
        params['name'],
        phoneNumber,
        params['address'],
        price,
        params['content'],
        information,
      ],
    );
    res.status(200).send(divFacility[0]);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post('/div/rating', auth, async function (req, res, next) {
  try {
    const user = req.user;
    const params = req.body;
    if (!paramCheck(params, 'div_uid')) {
      res.status(400).send('div_uid 파라미터 확인');
    }
    if (!paramCheck(params, 'rating')) {
      res.status(400).send('rating 파라미터 확인');
    }
    if (!paramCheck(params, 'px_rating')) {
      res.status(400).send('px_rating 파라미터 확인');
    }
    if (!paramCheck(params, 'domitory_rating')) {
      res.status(400).send('domitory_rating 파라미터 확인');
    }
    if (!paramCheck(params, 'shower_rating')) {
      res.status(400).send('shower_rating 파라미터 확인');
    }
    if (!paramCheck(params, 'meal_rating')) {
      res.status(400).send('meal_rating 파라미터 확인');
    }
    if (!paramCheck(params, 'location_rating')) {
      res.status(400).send('location_rating 파라미터 확인');
    }
    if (!paramCheck(params, 'comment')) {
      res.status(400).send('comment 파라미터 확인');
    }
    if (!paramCheck(params, 'pros')) {
      res.status(400).send('pros 파라미터 확인');
    }
    if (!paramCheck(params, 'cons')) {
      res.status(400).send('cons 파라미터 확인');
    }
    if (!paramCheck(params, 'content')) {
      res.status(400).send('content 파라미터 확인');
    }
    const ratingInfo = await mysqlUtil(
      'call proc_insert_div_rating(?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        user['uid'],
        params['div_uid'],
        params['rating'],
        params['px_rating'],
        params['domitory_rating'],
        params['shower_rating'],
        params['meal_rating'],
        params['location_rating'],
        params['comment'],
        params['pros'],
        params['cons'],
        params['content'],
      ],
    );

    const divInfo = await mysqlUtil('call proc_update_div_rating(?)', [
      params['div_uid'],
    ]);
    const item = {
      rating: ratingInfo[0],
      division: divInfo[0],
    };
    res.status(200).send(item);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post(
  '/div/local/image',
  [auth, upload.single('image')],
  async function (req, res, next) {
    try {
      const params = req.body;
      if (!paramCheck(params, 'uid')) {
        res.status(400).send('uid 파라미터 확인');
      }
      if (!req.file) {
        res.status(400).send('이미지 파일 확인');
      }
      const divLocalInfo = await mysqlUtil(
        'call proc_update_div_local_image(?,?)',
        [
          params['uid'],
          `https://hackathonbootcamp.s3.ap-northeast-2.amazonaws.com/${imageName}`,
        ],
      );
      res.status(200).send(divLocalInfo[0]);
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  },
);

// eslint-disable-next-line require-jsdoc
function paramCheck(params, key) {
  if (!params[key] && Number(params[key]) !== 0) {
    return false;
  }
  return true;
}
module.exports = router;
