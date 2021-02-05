const express = require('express');
const mysqlUtil = require('../../utils/mysqlUtils');
const paramUtil = require('../../utils/paramUtil');
const router = new express.Router();
const { auth, hash, emailValidator } = require('../middleware/auth');

// 메인 검색
router.get('/main/search', async function (req, res, next) {
  try {
    const params = req.query;
    if (!paramUtil.paramCheck(params, 'keyword')) {
      res.status(400).send('파라미터 확인');
    }
    const divisionList = await mysqlUtil(
      'call proc_select_search_division(?)',
      [params['keyword']],
    );
    const localList = await mysqlUtil('call proc_select_search_local(?)', [
      params['keyword'],
    ]);
    const communityList = await mysqlUtil(
      'call proc_select_search_community(?)',
      [params['keyword']],
    );
    const qnaList = await mysqlUtil('call proc_select_search_qna(?)', [
      params['keyword'],
    ]);

    // console.log(communityList, divisionList, qnaList, localList);
    let searchList = divisionList.concat(localList);
    searchList = searchList.concat(communityList);
    searchList = searchList.concat(qnaList);
    // console.log(searchList);
    // 최신 순
    searchList.sort(function (a, b) {
      return b['created_time'] - a['created_time'];
    });
    // console.log(searchList);
    res.status(200).send(searchList);
  } catch (e) {
    res.status(500).send(e);
  }
});

// 많이 찾는 qna
router.get('/main/qna', async function (req, res, next) {
  try {
    const qnaList = await mysqlUtil('call proc_select_qna_best()', []);
    res.status(200).send(qnaList);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

// 사단 평점 랭킹
router.get('/main/div-rank', async function (req, res, next) {
  try {
    const rankList = await mysqlUtil('call proc_select_div_rank()', []); // 가져온 후
    // console.log(rankList.length);
    for (let i = 0; i < rankList.length; i++) {
      // console.log(rankList[i]['uid'], rankList[i]['ranking']);
      await mysqlUtil('call proc_update_division_rank(?,?)', [
        rankList[i]['uid'],
        rankList[i]['ranking'],
      ]); // 가져온 랭킹으로 업데이트
    }
    res.status(200).send(rankList);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

router.post('/main/like', auth, async function (req, res, next) {
  try {
    const params = req.body;
    const user = req.user;
    if (!paramUtil.paramCheck(params, 'target_uid')) {
      res.status(400).send('target_uid 파라미터 확인');
    }
    if (!paramUtil.paramCheck(params, 'type')) {
      res.status(400).send('type 파라미터 확인');
    }
    const likeInfo = await mysqlUtil('call proc_insert_log_like(?,?,?)', [
      user['uid'],
      params['target_uid'],
      params['type'],
    ]);
    await mysqlUtil('call proc_update_user_rank(?)', [
      likeInfo[0]['writer_uid'],
    ]); // 작성자에 대해서 레벨 업데이트

    res.status(200).send(likeInfo[0]);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

module.exports = router;
