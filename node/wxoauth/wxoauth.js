const awy = require('awy');
const fs = require('fs');
const awyhttp = require('awyhttp');
const ejs = require('ejs');
const wxkey = require('./weixinkey.js');

//请先运行npm i awy获取更新

var ant = new awy();

//开启守护进程模式
ant.config.daemon = true;

/*
 *服务启动后，会在pid_file设置的文件写入程序的PID，
 *可以运行 kill `cat ./weixin_oauth.pid` 终止服务
 * */
ant.config.pid_file = './weixin_oauth.pid';

//请填写你自己的URL，此URL是对接微信的域名
user_host = 'http://second.wangjiaqi.top';

//处理静态请求
ant.get('/static/css/:cssfile', async rr => {
    try {
        var {cssfile} = rr.req.RequestARGS;

        rr.res.setHeader('Content-Type', 'text/css');
        rr.res.Body = fs.readFileSync(`./static/css/${cssfile}`, {encoding:'utf8'});
    } catch (err) {
        rr.res.statusCode = 404;
    }
});

//获取授权码
ant.get('/wx/oauth/code', async rr => {
    var redirect_uri = `${user_host}/wx/oauth/login`;

    var oauth_code_api = 'https://open.weixin.qq.com/connect/oauth2/authorize'
            + '?appid=' + wxkey.appid
            + '&redirect_uri=' + encodeURIComponent(redirect_uri)
            + '&response_type=code'
            + '&scope=snsapi_userinfo'
            + '&state=login#wechat_redirect';

    rr.res.statusCode = 301;
    rr.res.setHeader('Location', oauth_code_api);
});

//微信授权：获取用户信息
ant.get('/wx/oauth/login', async rr => {

    var oauth_token_api = 'https://api.weixin.qq.com/sns/oauth2/access_token'
        + '?appid=' + wxkey.appid
        + '&secret=' + wxkey.appsecret
        + '&code=' + rr.req.GetQueryParam('code')
        + '&grant_type=authorization_code';

    //获取授权的access_token，注意这和之前的access_token不同
    try {
        var retdata = await awyhttp.get(oauth_token_api);
        var ret = JSON.parse(retdata);
        if (ret.errcode && parseInt(ret.errcode) > 0) {
            rr.res.Body = 'Error: get token';
            return ;
        }
    } catch (err) {
        rr.res.Body = 'Error: get token';
        return ;
    }

    //获取用户信息
    var oauth_api = 'https://api.weixin.qq.com/sns/userinfo'
        + '?access_token=' + ret.access_token
        + '&openid=' + ret.openid
        + '&lang=zh_CN';

    try {
        var user_str_data = await awyhttp.get(oauth_api);
        var udata = JSON.parse(user_str_data);

        console.log(udata.openid, 
            udata.sex, 
            udata.country,
            udata.province,
            udata.city,
            udata.headimgurl
        );

        rr.res.Body = await new Promise ((rv, rj) => {
                //使用ejs渲染模板文件
                ejs.renderFile('pages/oauth.html', 
                    {user : udata},
                    (err, data) => {
                        if (err) {
                            rj(err);
                        } else {
                            rv(data);
                        }
                    });
            });

    } catch (err) {
        rr.res.Body = 'Error: render html';
    }

});

/*
    请把8200换成自己的端口号，2表示创建两个子进程处理请求，默认会根据CPU核心数量创建。
*/
ant.run('127.0.0.1', 8005);

