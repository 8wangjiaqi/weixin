const awyhttp = require('awyhttp');
const wxcall = require('./weixinToken.js');
const fs = require('fs');

var media_id = 'lGGw7fnOqxp0vsYeVx45sIxfv45oMmDtCv7FzNg8bJk';

wxcall.getToken()
.then(ret => {
    if (!ret.status) {
        throw ret.data;
    }

    var get_news_api = `https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=${ret.data}`;

    return awyhttp.post(get_news_api,{
        headers : {
            'Content-Type' : 'text/plain'
        },
        data : {
            media_id : media_id
        }
    });


}, err => {
    throw err;
})
.then(data => {
    var ret = JSON.parse(data);
    if (ret.errcode !== undefined) {
        throw data;
    }

    console.log(ret);

    return new Promise((rv, rj) => {
        fs.writeFile('./my_news/'+media_id, JSON.stringify(ret), {encoding:'utf8'}, err => {
            if (err) {
                rj(err);
            } else {
                rv('ok');
            }
        });
    });

}, err => {
    throw err;
})
.then(data => {
    console.log(data);
}, err => {
    throw err;
})
.catch(err => {
    console.log(err.message);
});
