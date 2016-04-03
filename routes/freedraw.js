var express = require('express');
var router = express.Router();
var app = require('../app');

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log(req.cookies['connect.sid']);
    res.render('index', {title: 'PictoFriends | Freedraw', name: ''});
});

module.exports = router;