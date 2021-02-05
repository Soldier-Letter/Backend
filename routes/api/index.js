const express = require('express');
const router = new express.Router();

router.use('/', require('./users'));
router.use('/', require('./div'));
router.use('/', require('./community'));
router.use('/', require('./qna'));
router.use('/', require('./main'));

module.exports = router;
