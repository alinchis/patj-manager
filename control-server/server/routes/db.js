// routes/db.js


var express = require('express');
var router = express.Router();


var db = require('../dbinit/index');

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now());
  next();
});
// define the home page route
router.get('/', function (req, res) {
  res.send('DataBase home page');
});
// define the about route
router.get('/regions/init', db);


module.exports = router;
