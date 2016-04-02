var express = require('express');
var router = express.Router();
var app = require('../app');

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log(req.cookies['connect.sid']);
    res.render('home', {title: 'PictoFriends'});
});

module.exports = router;