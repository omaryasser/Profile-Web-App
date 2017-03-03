var LocalStrategy = require('passport-local').Strategy;
var Student       = require('../app/models/Student');
var Client        = require('../app/models/Client');
var isStudent = true;

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        if (isStudent) {
          Student.findById(id, function(err, user) {
              done(err, user);
          });
        }
        else {
          Client.findById(id, function(err, user) {
              done(err, user);
          });
        }
    });

    // STUDENT SIGN UP
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        process.nextTick(function() {
        Student.findOne({ 'username' :  username }, function(err, student) {
            if (err)
                return done(err);

            if (student) {
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } else {

                var new_user = new Student();
                new_user.username = username;
                new_user.password = new_user.generateHash(password);
                new_user.profile_pic = "";
                // save the user
                new_user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, new_user);
                });
            }

        });

        });

    }));

    // STUDENT LOGIN
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        Student.findOne({ 'username' :  username }, function(err, student) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!student)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!student.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            isStudent = true;
            return done(null, student);
        });

    }));

    // CLIENT SIGN UP
    passport.use('local-signup-client', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        process.nextTick(function() {
        Client.findOne({ 'username' :  username }, function(err, client) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            if (client) {
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } else {

                var new_user = new Client();
                new_user.username = username;
                new_user.password = new_user.generateHash(password);
                // save the user
                new_user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, new_user);
                });
            }

        });

        });

    }));

    // CLIENT LOGIN
    passport.use('local-login-client', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        Client.findOne({ 'username' :  username }, function(err, client) {
            if (err)
                return done(err);

            if (!client)
                return done(null, false, req.flash('loginMessage', 'No user found.'));

            if (!client.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                isStudent = false;
                return done(null, client);
          });

    }));

};
