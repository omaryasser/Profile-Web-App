var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var clientSchema = mongoose.Schema({
    username : String,
    password : String
})

clientSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
clientSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('Client', clientSchema);
