const awyhttp = require('awyhttp');

var appid = 'wx896570c843ebc541';
var appsecret = '5e231c87ce3c6a33b88f41cc90823ba2';

var token_api = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`;

awyhttp.get(token_api).then(data => {
    console.log(data);
}, err => {
    console.log(err);
});
