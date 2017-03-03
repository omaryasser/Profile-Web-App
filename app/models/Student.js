var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Work = require('./Work');

var studentSchema = mongoose.Schema({
    username : String,
    password : String,
    profile_pic : String,
    works : [{type: mongoose.Schema.Types.ObjectId, ref: 'Work'}]
});

// methods ======================
// generating a hash
studentSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
studentSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Student', studentSchema);
