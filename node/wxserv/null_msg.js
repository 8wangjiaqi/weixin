const awy =require('awy');

var ant =new awy();

//请求的类型一定是post
ant.post('/wx/talk',async rr=>{
	//输出微信服务器转发的功能
        console.log(rr.req.GetBody());
	/*
	不想回复用户消息，也不想提示错误，
	则返回sucess或空字符串
	*/
        rr.res.Body='success';
});

/*
        开启反向代理的情况，请改成自己的端口号
        自己使用一台服务器的情况可以监听；
        0.0.0.0:80
*/

ant.run('localhost',8000);

