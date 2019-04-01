const awyhttp = require('awyhttp');
const wxcall = require('./weixinToken.js');

/**
 * 下载图片素材的示例程序，
 * 你应该把media_id换成你自己上传素材的media_id。
*/

wxcall.getToken()
.then(ret => {
    if (!ret.status) {
        throw ret.data;
    }
    
    var download_media = `https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=${ret.data}`;

    /**
     * 下载涉及到的请求不仅仅是GET，对于微信公众号接口，获取素材是POST请求。
     * data表示POST提交的数据，data字段会自动进行JSON.stringify处理。
     * headers设置Content-Type是表示POST提交的数据不作为表单数据解析，
     * 直接就获取Body部分的数据，也就是data字段的数据。
     * target是要下载的文件路径。
     * download接口内部会使用target自动创建可写流，把获取的数据和可写流对接，
     * 完成后或出错会返回Promise对象，通过then方法接受执行结果。
     */
    return awyhttp.download(download_media, {
        method : 'POST',
        data : {
            //换成你自己的素材MEDIA_ID
            media_id : '上传图片素材返回的MEDIA_ID'
        },
        headers : {
            'Content-Type' : 'text/plain'
        },
        target : './test.jpg'
    });

}, err => {
    throw err;
})
.then(ret => {
    console.log('ok');
}, err => {
    throw err;
})
.catch(err => {
    console.log(err);
});

