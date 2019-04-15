const events = require('events');

module.exports = new function() {

    var the = this;

    this.emitter = new events.EventEmitter();

    this.eventTable = {
        'delete' : function (data) {

        },

        'add' : function(data) {

        },

        'update' : function(data) {

        }
    };

    this.pub = function (event_name, data) {
        the.emitter.emit('content', event_name, data);
    };

    this.sub = function () {
        the.emitter.on('content', the.dispatch);
    };

    this.dispatch = function(event_name, data = null) {
        switch(event_name) {
            case 'add':
            case 'delete':
            case 'update':
            //case 'trash':
            //case 'untrash':
            //case 'clear-trash':
                the.eventTable[event_name](data);
            default:;
        }
    };

};

