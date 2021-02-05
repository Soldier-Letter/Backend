const express = require('express');
const mysqlUtil = require('../../utils/mysqlUtils');
const router = new express.Router();

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

// eslint-disable-next-line require-jsdoc
function paramCheck(params, key) {
  if (!params[key] && Number(params[key]) !== 0) {
    return false;
  }
  return true;
}
module.exports = router;
