const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({info: 'Welcome to the home page'})
});

// router.use('/', )
// router.use('/', )
// router.use('/', )
// router.use('/', )


module.exports = router;