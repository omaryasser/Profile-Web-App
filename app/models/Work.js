
var mongoose = require('mongoose');

var workSchema = mongoose.Schema({
    work_name : String,
    work_link : String,
    work_pic : String,
    student_username : String
});

module.exports = mongoose.model('Work', workSchema);
