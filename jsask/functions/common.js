const fs = require('fs');

exports.formatTime = function (fmtstr = '', tim = null) {
    var tm = (tim===null) ? new Date() : new Date(tim);

    fstr = fmtstr.toLowerCase();
    var join_char = '-';
    if (fstr.indexOf('.') >= 0) {
        join_char = '.';
    }

    let month_str = (tm.getMonth() > 9 ? tm.getMonth() : '0' + (tm.getMonth()+1));
    let day_str = (tm.getDate() > 9 ? tm.getDate() : '0' + tm.getDate());
    let hours_str = (tm.getHours() > 9 ? tm.getHours() : '0' + tm.getHours());

    var default_time = `${tm.getFullYear()}${join_char}${month_str}${join_char}${day_str}`;

    switch (fstr) {
        case 'y-m-d':
        case 'y.m.d':
            return default_time;

        case 'y-m-d-h':
        case 'y.m.d.h':
            return `${default_time}${join_char}${hours_str}`;

        case 'y-m-d h:m:s':
            return `${default_time} ${hours_str}:${tm.getMinutes()}:${tm.getSeconds()}`;
        
        case 'y-m-d-h_m_s':
            return `${default_time}-${hours_str}_${tm.getMinutes()}_${tm.getSeconds()}`;

        default:
            return default_time;
    }

};

exports.checkAndMkdir = async function (dir_name) {
    let st = await new Promise((rv, rj) => {
        let mode_flag = fs.constants.F_OK|fs.constants.W_OK|fs.constants.X_OK;

        fs.access(dir_name, mode_flag, err => {
            if (err) {
                rv(false);
            } else {
                rv(true);
            }
        });
    });

    if (st) {
        return 'ok';
    }

    try {
        st = await new Promise((rv, rj) => {
            fs.mkdir(dir_name, err =>  {
                if (err) {
                    rj(err);
                } else {
                    rv('ok');
                }
            });
        });
        return 'ok';
    } catch (err) {
        return err;
    }
};

exports.promiseFile = async function(filename, encoding = 'utf8') {
    return await new Promise((rv, rj) => {
        fs.readFile(filename, {encoding:encoding}, (err, data) => {
            if (err) {
                rj(err);
            } else {
                rv(data);
            }
        });
    });
};

exports.pageCount = function(total, pagesize) {
    return (total%pagesize == 0) ? parseInt(total/pagesize) : (parseInt(total/pagesize)+1);
};

exports.getDirContent = async function(dir_path) {
    try {
        let files = await new Promise((rv, rj) => {
            fs.readdir(dir_path, (err, files) => {
                if (err) {
                    rj(err);
                } else {
                    rv(files);
                }
            });
        });
        return files;
    } catch (err) {
        throw err;
    }
};

exports.removeDirAll = async function(dir_path, isRecur = true) {

    var CoreCall = new function (){};

    CoreCall.rd = async (dirp) => {
        try {
            let files = await new Promise((rv, rj) => {
                fs.readdir(dirp, {withFileTypes:true}, (err, files) => {
                    if(err) {
                        rj(err);
                    } else {
                        rv(files);
                    }
                });
            });

            for(var i=0; i<files.length; i++) {
                if (files[i].isDirectory()) {
                    if (isRecur) {
                        await CoreCall.rd(dirp+'/'+files[i].name);
                    } else {
                        await new Promise((rv, rj) => {
                            fs.rmdir(dirp+'/'+files[i].name, err => {
                                if (err) {
                                    rj(err);
                                } else {
                                    rv(true);
                                }
                            });
                        });
                    }
                } else {
                    await new Promise((rv, rj) => {
                        fs.unlink(dirp+'/'+files[i].name, err => {
                            if (err) {
                                rj(err);
                            } else {
                                rv(true);
                            }
                        });
                    });
                }
            }

            await new Promise((rv, rj) => {
                fs.rmdir(dirp, err => {
                    if (err) {
                        rj(err);
                    } else {
                        rv(true);
                    }
                });
            });
        } catch (err) {
            throw err;
        }
    };

    return CoreCall.rd(dir_path);
};

