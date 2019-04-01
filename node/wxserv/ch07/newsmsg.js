const awy = require('awy');
const parsexml = require('xml2js').parseString;
const fs = require('fs');

var ant = new awy();

var imageLog = new function() {
    var the = this;

    this.list = [];

    this.randImage = function() {
        if (the.list.length == 0) {
            return null;
        }
        var ind = Math.random() * 1024;
        ind = parseInt(ind % the.list.length);
        console.log(ind);
        return the.list[ ind ];
    };
};

//ant.config.daemon = true;

function formatTpl(data) {

    //尽管只处理文本消息，这样写的目的是为了后续添加更多的消息类型。
    switch(data.msgtype) {
        case 'text':
            return `
                <xml>
                    <ToUserName><![CDATA[${data.touser}]]></ToUserName>
                    <FromUserName><![CDATA[${data.fromuser}]]></FromUserName>
                    <MsgType><![CDATA[text]]></MsgType>
                    <Content><![CDATA[${data.msg}]]></Content>
                    <CreateTime>${data.msgtime}</CreateTime>
                </xml>
            `;

        case 'image':
            return `
                <xml>
                    <ToUserName><![CDATA[${data.touser}]]></ToUserName>
                    <FromUserName><![CDATA[${data.fromuser}]]></FromUserName>
                    <MsgType><![CDATA[image]]></MsgType>
                    <Image>
                        <MediaId><![CDATA[${data.msg}]]></MediaId>
                    </Image>
                    <CreateTime>${data.msgtime}</CreateTime>
                </xml>
            `;
        
        case 'voice':
            return `
                <xml>
                    <ToUserName><![CDATA[${data.touser}]]></ToUserName>
                    <FromUserName><![CDATA[${data.fromuser}]]></FromUserName>
                    <MsgType><![CDATA[voice]]></MsgType>
                    <Voice>
                        <MediaId><![CDATA[${data.msg}]]></MediaId>
                    </Voice>
                    <CreateTime>${data.msgtime}</CreateTime>
                </xml>
            `;
        case 'news':
            return `<xml>
              <ToUserName><![CDATA[${data.touser}]]></ToUserName>
              <FromUserName><![CDATA[${data.fromuser}]]></FromUserName>
              <CreateTime>${data.msgtime}</CreateTime>
              <MsgType><![CDATA[news]]></MsgType>
              <ArticleCount>1</ArticleCount>
              <Articles>
                <item>
                  <Title><![CDATA[${data.title}]]></Title>
                  <Description><![CDATA[${data.description}]]></Description>
                  <PicUrl><![CDATA[${data.picurl}]]></PicUrl>
                  <Url><![CDATA[${data.news_url}]]></Url>
                </item>
              </Articles>
            </xml>
            `;
        default: 
            return '';
    }
}

function userMsgHandle(wxmsg, retmsg) {
    if (wxmsg.MsgType === 'text') {
        switch (wxmsg.Content) {
            case 'help':
            case '?':
                retmsg.msgtype = 'text';
                retmsg.msg = '这是一个测试号，输入help获取帮助信息，其他消息原样返回';
                return formatTpl(retmsg);

            case '关于':
            case 'about':
                retmsg.msgtype = 'text';
                retmsg.msg = '我们是程序员';
                return formatTpl(retmsg);
            case 'image':
                var img = imageLog.randImage();
                if (img === null) {
                    retmsg.msgtype = 'text';
                    retmsg.msg = '没有图片';
                } else {
                    retmsg.msgtype = 'image';
                    retmsg.msg = img;
                }
                return formatTpl(retmsg);
            case 'news':

                try {
                    var news_org_data = fs.readFileSync('./my_news/a.news', {encoding:'utf8'});
                    var news_data = JSON.parse(news_org_data).news_item[0];
                    retmsg.msgtype = 'news';
                    retmsg.title = news_data.title;
                    retmsg.description = news_data.digest;
                    retmsg.picurl = news_data.thumb_url;
                    retmsg.news_url = news_data.url;
                    return formatTpl(retmsg);
                } catch(err) {
                    retmsg.msgtype = 'text';
                    retmsg.msg = '未发现图文素材';
                    return formatTpl(retmsg);
                }
                
            default:;
        }
    }

    switch(wxmsg.MsgType) {
        case 'text':
            retmsg.msg = wxmsg.Content;
            break;
        case 'image':
            retmsg.msg = wxmsg.MediaId;
            break;
        case 'voice':
            retmsg.msg = wxmsg.MediaId;
            break;

        default:
            retmsg.msg = '不支持的消息类型';
            retmsg.msgtype = 'text';
    }
    if (retmsg.msgtype === '') {
        retmsg.msgtype = wxmsg.MsgType;
    }
    return formatTpl(retmsg);
}

function clickEventMsg(wxmsg, retmsg) {
    switch (wxmsg.EventKey) {
        case 'about-us':
            // retmsg.msg = fs.readFileSync('./about_us', {encoding:'utf8'});
            // 或者读取数据库
            // retmsg.msg = seql.query('....');
            retmsg.msg = '我们是一些技术爱好者';
            retmsg.msgtype = 'text';
            return formatTpl(retmsg);

        default : 
            retmsg.msgtype = 'text';
            retmsg.msg = '未知操作';
            return formatTpl(retmsg);
    }
}

function eventMsgHandle(wxmsg, retmsg) {
    switch (wxmsg.Event) {
        case 'subscribe':
            console.log('用户关注：', wxmsg.FromUserName);
            retmsg.msgtype = 'text';
            retmsg.msg = '欢迎关注本公众号';
            return formatTpl(retmsg);

        case 'unsubscribe':
            console.log('取消订阅：', wxmsg.FromUserName);
            return '';

        case 'LOCATION':
            console.log(wxmsg.Latitude,wxmsg.Longitude);
            return '';

        case 'SCAN':
            return '';
        case 'VIEW':
            console.log(wxmsg.EventKey);
            //此处可以做统计处理
            return '';

        case 'CLICK':
            return clickEventMsg(wxmsg, retmsg);

        default: return '';
    }

}

function msgHandle(wxmsg, retmsg) {
    if (wxmsg.MsgType === 'event') {
        return eventMsgHandle(wxmsg, retmsg);
    } else {
        return userMsgHandle(wxmsg, retmsg);
    } 
}


ant.add(async (rr, next) => {
    if (rr.weixinMsg.wxmsg.MsgType == 'image') {
        imageLog.list.push(rr.weixinMsg.wxmsg.MediaId);
    }
    await next(rr);
}, '/wx/talk');

ant.add(async (rr, next) => {
    
    await new Promise((rv, rj) => {
        parsexml(rr.req.GetBody(), {explicitArray : false}, (err, result) => {
            if (err) {
                rr.res.Body = '';
                rj(err);
            } else {
                var xmlmsg = result.xml;

                var data = {
                    touser      : xmlmsg.FromUserName,
                    fromuser    : xmlmsg.ToUserName,
                    msg         : '',
                    msgtime     : parseInt((new Date()).getTime() / 1000),
                    msgtype     : ''
                };

                rv({
                    wxmsg : xmlmsg,
                    retmsg : data
                });
            }
        });
    }).then((data) => {
        rr.weixinMsg = data;
    }, err=> {
        throw err;
    }).catch(err => {
        console.log(err);
    });

    await next(rr);

}, '/wx/talk');

ant.post('/wx/talk', async rr => {
    
    console.log(rr.req.GetBody());
    
    if (rr.weixinMsg !== undefined) {
        rr.res.Body = msgHandle(
                        rr.weixinMsg.wxmsg,
                        rr.weixinMsg.retmsg
                      );
    } else {
        rr.res.Body = '';
    }

});

ant.run('localhost', 8000);


