const express = require('express');
const router = new express.Router();

router.use('/', require('./users'));

module.exports = router;
