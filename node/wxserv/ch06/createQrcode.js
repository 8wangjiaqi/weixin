const awyhttp = require('awyhttp');
const wxcall = require('./weixinToken.js');

wxcall.getToken()
.then(ret => {
    if (!ret.status) {
        throw new Error(ret.data);
    }
    
    var qrcode_api = `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${ret.data}`;

    var post_data = `{"expire_seconds": 60000, "action_name": "QR_LIMIT_STR_SCENE", "action_info": {"scene": {"scene_str": "helo_1001"}}}`;

    return awyhttp.post(qrcode_api, {
        headers :{
            'Content-Type' : 'text/plain'
        },
        data : post_data
    }).then(retdata =>  {
        var ret = JSON.parse(retdata);
        if (ret.ticket == undefined) {
            throw new Error(retdata);
        }
        return ret.ticket;
    }, err => {
        throw err;
    });

}, err => {
    throw err;
})
.then(ticket => {
    var down_qrcode_api = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(ticket)}`;

    return awyhttp.download(down_qrcode_api, {
        method : 'GET',
        target : './qrcode-'+( (new Date()).getTime() )+'.jpg'
    })
    .then(ret => {
        console.log('ok');
    }, err => {
        throw err;
    });

})
.catch(err => {
    console.log(err.message);
});

