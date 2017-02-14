var mongoose = require('mongoose');

module.exports = function () {
    var schema = mongoose.Schema({
        email: {
            type: String,
            required: true
        },
        name: {
            type: String,
            require: true
        },
        password: {
            type: String,
            require: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        forgotPassword: {
            token: {
                type: String,
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    });

    return mongoose.model('User', schema);
};
