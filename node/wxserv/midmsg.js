const awy = require('awy');
const parsexml = require('xml2js').parseString;

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

function clickEventMsg(wxmsg,retmsg){
	switch (wxmsg.EventKey){
		case 'about-us':
			retmsg.msgtype = 'text';
			retmsg.msg = '我们是一群技术爱好者';
			return formatTpl(retmsg);
		default:
			retmsg.msgtype="text";
			retmsg.msg="未知操作";
			return formatTpl(retmsg);
	}
}

function eventMsgHandle(wxmsg,retmsg){
	switch(wxmsg.Event){
		case 'subscribe':   //首次关注，提示信息
			if(wxmsg.EventKey !==undefined){
				console.log('用户关注，场景值：',wxmsg.EventKey);
			}
			console.log('用户OpenID：',wxmsg.FromUserName);
			retmsg.msgmsgtype ='text';
			retmsg.msg='欢迎关注本公众号';
			return formatTpl(retmsg);
		
		case 'unsubscribe':
			console.log('取消订阅:',wxmsg.FromUserName);
			return '';
	
		case 'SCAN':  //已经关注后，再扫码的提示信息
			console.log('用户扫码，Key:',wxmsg.EventKey);
			retmsg.msg=wxmsg.EventKey;
			retmsg.msgtype='text';
			return formatTpl(retmsg);
	
		case 'VIEW':
		case 'LOCATION':
			console.log(wxmsg.Latitude,wxmsg.Longitude);
			return '';
		case 'CLICK':
			console.log('关于我们');
			return clickEventMsg(wxmsg, retmsg);


		default:return '';
	}
}

function msgHandle(wxmsg,retmsg){
	if (wxmsg.MsgType === 'event'){
		return eventMsgHandle(wxmsg,retmsg);
	}else {
		return userMsgHandle(wxmsg,retmsg);
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
