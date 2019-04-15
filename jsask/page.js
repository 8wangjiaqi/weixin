const fs = require('fs');

module.exports = new function() {

    var the = this;

    this.page_dir = './pages/';

    this.pageData = async function (page) {
        return await new Promise((rv, rj) => {
            fs.readFile(`${the.page_dir}${page}.html`, 
            {encoding:'utf8'}, 
            (err, data) => {
                if (err) {
                    rj(err);
                } else {
                    rv(data);
                }
            });
        });
    };


};

