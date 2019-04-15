const awy = require('awy');
const apiret = require('./apicode');
const fs = require('fs');
const {formatTime, promiseFile, pageCount} = require('./functions/common');
const path = require('path');
const contentEvent = require('./contentEvent');
const loadPage = require('./page.js');

//切换到文件所在目录
process.chdir(path.dirname(process.argv[1]));

var ant = new awy();

//检测如果没有则创建目录
try {
    fs.accessSync('./data', fs.constants.F_OK|fs.constants.X_OK);
} catch (err) {
    fs.mkdirSync('./data');
}

var _data_path = './data/';
var _content_index = {};

//读取目录结构到全局缓存变量
async function init_content_index(content_path, ct) {
    try {
        var clist = fs.readdirSync(content_path);
        for(let i=0; i<clist.length; i++) {
            try {
                var files = fs.readdirSync(content_path+clist[i]);
                ct[clist[i]] = files;
            } catch (err) {
            }
        }
    } catch (err) {

    }
}

setTimeout(async () => {
    await init_content_index(_data_path, _content_index);
}, 20);

//设置add订阅事件的处理函数
contentEvent.eventTable['add'] = function (data) {
    if (_content_index[data.key]===undefined) {
        _content_index[data.key] = [];
    }
    _content_index[data.key].push(data.filename);
};

contentEvent.eventTable['delete'] = function(data) {
    if (!_content_index[data.key]) {
        return ;
    }
    if (data.filename) {
        var ind = _content_index[data.key].indexOf(data.filename);
        if (ind >= 0) {
            _content_index[data.key].splice(ind, 1);
        }
    }
};

/* 
contentEvent.eventTable['update'] = function(data) {

};
 */

//开启事件订阅
contentEvent.sub();
/* 
ant.add(async (rr, next) => {
    await next(rr);
    console.log(_content_index);
});
 */

//中间件实现跨域

ant.add(async (rr, next) => {
    rr.res.setHeader('Access-control-allow-origin', '*');
    await next(rr);
});

//小程序对接的查询接口
ant.get('/ask', async rr => {
    var kwd = rr.req.GetQueryParam('kwd');

    if (!kwd) {
        rr.res.Body = apiret.Ret('ERR_BAD_DATA');
    }

    var reg = new RegExp(kwd, 'i');
    var search_dir = null;

    for(let k in _content_index) {
        if (reg.test(k)) {
            search_dir = _data_path + k + '/';
            break;
        }
    }

    if (!search_dir) {
        rr.res.Body = apiret.Ret('ERR_NOT_FOUND');
        return ;
    }

    var data_list = [];
    var tmp = '';

    try {
        var files = fs.readdirSync(search_dir);
        
        for(let i=0; i<files.length; i++) {
            tmp = fs.readFileSync(search_dir+files[i], {encoding:'utf8'});
            data_list.push(tmp);
        }
    } catch (err) {
    }

    rr.res.Body = apiret.Ret('', {
        data : data_list
    });

});


//后台管理的页面，名称为pages目录下的目录名称
ant.get('/page/:pagename', async rr => {
    try {
        var pagename = rr.req.RequestARGS['pagename'];
        rr.res.Body = await loadPage.pageData('__public/header');
        rr.res.Body += await loadPage.pageData(`${pagename}/${pagename}`);
        rr.res.Body += await loadPage.pageData('__public/footer');
    } catch (err) {
        rr.res.Body = '';
    }
});

//后台获取指定关键字和指定文件名的内容
ant.get('/query', async rr => {
    try {
        var keyword = rr.req.GetQueryParam('keyword');
        var filename = rr.req.GetQueryParam('filename');
        if (_content_index[keyword]
            && _content_index[keyword].indexOf(filename) >= 0
        ) {
            rr.res.Body = fs.readFileSync(
                _data_path+keyword+'/' + filename,
                {encoding: 'utf8'}
            );
        }
    } catch (err) {
        console.log(err);
        rr.res.statusCode = 404;
    }
});

//后台获取列表的接口
ant.get('/list', async rr => {
    try {
        var pagesize = 12;
        var kwd = rr.req.GetQueryParam('kwd', '');
        var page = rr.req.GetQueryParam('page', 1);
        if (isNaN(page) || page <= 0) {
            page = 1;
        }

        var key_list = []; 

        if (kwd) {
            var reg = new RegExp(kwd, i);
            for(let k in _content_index) {
                if (reg.test(k)) {
                    key_list.push(k);
                }
            }
        } else {
            key_list = Object.keys(_content_index);
        }

        var start_ind = (page-1) * pagesize;
        var end_ind = start_ind + pagesize;

        var total_page = pageCount(key_list.length, pagesize);

        var ret_list = key_list.slice(start_ind, end_ind);

        var val_list = {};
        var tmp = '';
        for(let k=0; k<ret_list.length; k++) {
            tmp = ret_list[k];
            val_list[tmp] = {};
            if (_content_index[tmp]) {
                
                for(let i=0; i< _content_index[tmp].length; i++) {
                    try {
                        val_list[tmp][_content_index[tmp][i]] = fs.readFileSync(
                            _data_path + tmp +'/'+_content_index[tmp][i],
                            {encoding : 'utf8'}
                        );
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        }

        rr.res.Body = apiret.Ret('',{
            total : key_list.length,
            total_page : total_page,
            cur_page : page,
            list : val_list
        });

    } catch (err) {
        console.log(err);
    }
});

//提交数据接口
ant.post('/submit', async rr => {
    try {
        var post_data = rr.req.GetBody();
        var post_obj = JSON.parse(post_data);
        var kwd_dir = _data_path+post_obj.keyword+'/';
        try {
            fs.accessSync(kwd_dir, fs.constants.F_OK);
        } catch (err) {
            fs.mkdirSync(kwd_dir);
        }

        var filename = formatTime('y-m-d-h_m_s')+'_';
        fs.writeFileSync(kwd_dir+filename, post_obj.content, {encoding : 'utf8'});
        
        contentEvent.pub('add', {
            key : post_obj.keyword,
            filename : filename
        });

        rr.res.Body = apiret.Ret('SUCCESS');
    } catch(err) {
        rr.res.Body = apiret.Ret('ERR_UDEF', err.message);
    }
});

//更新数据接口
ant.put('/submit', async rr => {
    try {
        var post_data = rr.req.GetBody();
        var post_obj = JSON.parse(post_data);
        var kwd_file = _data_path+post_obj.keyword+'/' + post_obj.filename;
        try {
            fs.accessSync(kwd_file, fs.constants.F_OK);
        } catch (err) {
            rr.res.Body = apiret.Ret('ERR_NOT_FOUND');
            return ;
        }

        try {
            fs.writeFileSync(kwd_file, post_obj.content, {encoding:'utf8'});
        } catch (err) {
            rr.res.Body = apiret.Ret('ERR_UDEF', err.message);
            return ;
        }

        rr.res.Body = apiret.Ret('SUCCESS');

    } catch (err) {
        rr.res.Body = apiret.Ret('ERR_UDEF', err.message);
    }
});

//静态资源处理
ant.get('/static/*', async rr => {
    try {
        let stpath = rr.req.RequestARGS['starPath'];
        var encoding = 'utf8';
        var content_type = '';
        if (stpath.indexOf('css') == 0 || stpath.indexOf('.css') > 0) {
            content_type = 'text/css';
        } else if (stpath.indexOf('javascript') == 0  
            || stpath.indexOf('.js') > 0
        ) {
            content_type = 'text/javascript';
        } else {
            //content_type = 'application/octet-stream';
            content_type = '';
            encoding = 'binary';
        }
        rr.res.setHeader('Content-Type', content_type);

        rr.res.Body = await promiseFile('./static/' + stpath, encoding); 
        if (content_type === 'application/octet-stream'
            || content_type === ''
        ) {
            rr.res.setHeader('Content-Length', Buffer.byteLength(rr.res.Body, 'binary'));
        }
    } catch (err) {
        rr.res.statusCode = 404;
        //console.log(err.message);
    };
});


ant.run('localhost', 8005);
