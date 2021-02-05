const express = require('express');
const mysqlUtil = require('../../utils/mysqlUtils');
const paramUtil = require('../../utils/paramUtil');
const router = new express.Router();
const { auth } = require('../middleware/auth');

router.get('/qna/search', async (req, res) => {
  try {
    const params = req.query;
    if (
      !paramUtil.paramCheck(params, 'keyword') ||
      !paramUtil.paramCheck(params, 'type')
    ) {
      res.status(400).send('파라미터 확인');
    }

    let qnaList;

    if (params['type'] == '1') {
      qnaList = await mysqlUtil('CALL proc_select_qna_search_new(?)', [
        params['keyword'],
      ]);
    } else {
      qnaList = await mysqlUtil('CALL proc_select_qna_search_best(?)', [
        params['keyword'],
      ]);
    }

    res.status(200).send(qnaList);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.get('/qna/list', async (req, res) => {
  try {
    const params = req.query;
    if (!paramUtil.paramCheck(params, 'type')) {
      return res.status(400).send('파라미터 확인');
    }

    let qnaList;
    if (params['type'] == '1') {
      qnaList = await mysqlUtil('CALL proc_select_qna_new()');
    } else {
      qnaList = await mysqlUtil('CALL proc_select_qna_best_all()');
    }
    res.status(200).send(qnaList);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.post('/qna', auth, async (req, res) => {
  try {
    const params = req.body;
    if (
      !paramUtil.paramCheck(params, 'title') ||
      !paramUtil.paramCheck(params, 'content')
    ) {
      return res.status(400).send('파라미터 확인');
    }

    const [result] = await mysqlUtil('CALL proc_insert_qna(?, ?, ?)', [
      req.user.uid,
      params.title,
      params.content,
    ]);
    console.log(result);
    res.status(200).send(result);
  } catch (e) {
    res.status(401).send(e);
  }
});

module.exports = router;
