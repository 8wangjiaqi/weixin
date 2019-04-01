const awyhttp = require('awyhttp');
const wxcall = require('./weixinToken.js');

var video_file = 'chicken-and-dog.mp4';


wxcall.getToken()
.then(ret => {
    if (!ret.status) {
        throw ret.data;
    }
    var upload_api = `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${ret.data}&type=video`;
    return awyhttp.upload(upload_api, {
        file : video_file,
        upload_name : 'media',
        //上传视频接口要求附加此字段
        form : {
            description : JSON.stringify({
                title : '鸡狗大战',
                introduction : '搞笑视频'
            })
        }
    });
}, err => {
    throw err;
})
.then(ret => {
    console.log(ret);
}, err => {
    throw err;
})
.catch(err => {
    console.log(err);
});
