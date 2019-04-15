module.exports = new function () {

    var the = this;

    this.errcode_table = {
        'SUCCESS' : [
            0, 'ok'
        ],

        'ERR_BAD_DATA' :[
            4001, 'bad data'
        ],

        'ERR_NOT_FOUND' : [
            4004, 'not found'
        ],

        'ERR_PERM_DENY' : [
            4003, 'permission deny'
        ],

        'ERR_SYS' : [
            5005, 'system wrong'
        ],

        'ERR_UDEF' : [
            4006, ''
        ],

        'ERR_UNKNOW' : [
            10001, 'unknow error'
        ]
    };

    this.Ret = function(name, data = null) {
        if (data !== null && name !== 'ERR_UDEF') {
            if (data instanceof Array || typeof data === 'string') {
                return {
                    status : 'ok',
                    data : data
                };
            } else if (typeof data === 'object') {
                data.status = 'ok';
                return data;
            } else {
                return {
                    status : 'ok',
                    data : data
                };
            }   
        }

        if (the.errcode_table[name] !== undefined) {
            if (name === 'ERR_UDEF') {
                return {
                    status : '!ok',
                    errcode : the.errcode_table[name][0],
                    errmsg : data
                };
            } else if (name === 'SUCCESS') {
                return {
                    status : 'ok',
                    errcode : the.errcode_table[name][0],
                    errmsg : the.errcode_table[name][1]
                };
            }
            return {
                status : '!ok',
                errcode : the.errcode_table[name][0],
                errmsg : the.errcode_table[name][1]
            };
        }

        return {
            status : '!ok',
            errcode : 40404,
            errmsg : 'Error: unknow'
        };
    };

};

