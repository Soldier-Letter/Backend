module.exports = {
  // eslint-disable-next-line require-jsdoc
  paramCheck: function (params, key) {
    if (!params[key] && Number(params[key]) !== 0) {
      return false;
    }
    return true;
  },
};
