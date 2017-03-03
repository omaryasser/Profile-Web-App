var Work             = require('./models/Work');
var Student          = require('./models/Student');
var Db               = require('mongodb').Db;
var Server           = require('mongodb').Server;
var ObjectID         = require('mongodb').ObjectID;
var mongo            = require('mongodb');
var MongoClient      = require('mongodb').MongoClient;
var assert           = require('assert');
var db               = new Db('portfolio', new Server('localhost', 27017));
var url              = 'mongodb://localhost:27017/portfolio';
var multer           = require('multer');
var upload           = multer();

module.exports = function(app, passport) {

    var upload = multer({ dest: "public/uploads/" });

    app.post('/uploadProfile', upload.single('avatar'), function (req, res, next) {

      MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        updatePP(db, req.file.filename, req, function() {
            db.close();
        });
      });
        res.redirect('/profile');
    })

    app.get('/uploadProfile', function(req, res) {
       res.render('uploadProfile.ejs', { message: req.flash('signupMessage') });
    });

    // HOME
    app.get('/', function(req, res) {
       res.render('index.ejs');
    });

    // STUDENT SIGN UP
    app.get('/signup', function(req, res) {
       res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/signup',
        failureFlash : true
    }));

    // STUDENT LOGIN
    app.get('/login', function(req, res) {
      res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile',
            failureRedirect : '/login',
            failureFlash : true
    }));

    // STUDENT PROFILE
    app.get('/profile', isLoggedIn, function(req, res) {
      MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        getPP(db, req.user.username, res, req, function() {
            db.close();
        });
      });


    });

    // STUDENT LOGOUT
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    app.get('/visitor', function(req, res) {
      Work.find(function(err, works){
            if(err)
                res.send(err.message);
            else {
                var totalWorks = works.length,
                  pageSize = 10,
                  pageCount = (works.length + 9) / 10,
                  currentPage = 1,
                  workss = [],
                  worksArrays = [],
                  worksList = [];

                var map = {};

                for (var i = 0; i < totalWorks; i++) {
                  if (map[works[i].student_username] == undefined) {
                    workss.push(works[i]);
                    map[works[i].student_username] = 1;
                  }
                  else if (map[works[i].student_username] == 1) {
                    workss.push(works[i]);
                    map[works[i].student_username] = 2;
                  }
                }
                pageCount = (workss.length + 9) / 10;
                var tmp = totalWorks;
                while (tmp > 0) {
                    worksArrays.push(workss.splice(0, pageSize));
                    tmp -= pageSize;
                }
                if (typeof req.query.page !== 'undefined') {
                  currentPage = req.query.page;
                }
                worksList = worksArrays[currentPage - 1];
                res.render('visitor.ejs', {
                  works: worksList,
                  pageSize: pageSize,
                  totalWorks: totalWorks,
                  pageCount: pageCount,
                  currentPage: currentPage
                });
            }
        })
    });


    // CLIENT SIGN UP
    app.get('/clientsignup', function(req, res) {
       res.render('clientsignup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/clientsignup', passport.authenticate('local-signup-client', {
        successRedirect : '/client',
        failureRedirect : '/clientsignup',
        failureFlash : true
    }));

    // CLIENT LOGIN
    app.get('/clientlogin', function(req, res) {
      res.render('clientlogin.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/clientlogin', passport.authenticate('local-login-client', {
            successRedirect : '/client',
            failureRedirect : '/clientlogin',
            failureFlash : true
    }));

    app.post('/profile', upload.single('avatar'), function (req, res) {
      var work = new Work();
      work.work_name = req.body.work_name;
      work.work_link = req.body.work_link;
      work.student_username = req.user.username;
      if (req.file == undefined) work.work_pic = "";
      else work.work_pic  = req.file.filename;
      MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        insertWork(db, work, req, function() {
            db.close();
        });
      });
      res.redirect('/profile');
    });


    // CLIENT PAGE
    app.get('/client', isLoggedIn, function(req, res) {
      Work.find(function(err, works){
            if(err)
                res.send(err.message);
            else {

                var totalWorks = works.length,
                  pageSize = 10,
                  pageCount = (works.length + 9) / 10,
                  currentPage = 1,
                  workss = [],
                  worksArrays = [],
                  worksList = [];

                var map = {};

                for (var i = 0; i < totalWorks; i++) {
                  if (map[works[i].student_username] == undefined) {
                    workss.push(works[i]);
                    map[works[i].student_username] = 1;
                  }
                  else if (map[works[i].student_username] == 1) {
                    workss.push(works[i]);
                    map[works[i].student_username] = 2;
                  }
                }
                pageCount = (workss.length + 9) / 10;

                var tmp = totalWorks;
                while (tmp > 0) {
                    worksArrays.push(workss.splice(0, pageSize));
                    tmp -= pageSize;
                }
                if (typeof req.query.page !== 'undefined') {
                  currentPage = req.query.page;
                }
                worksList = worksArrays[currentPage - 1];
                res.render('client.ejs', {
                  works: worksList,
                  pageSize: pageSize,
                  totalWorks: totalWorks,
                  pageCount: pageCount,
                  currentPage: currentPage
                });
            }
        })
    });
    var workss =[];
    var worksss = [];
    function addWo (i, callback) {
      if (i < workss.length) {
        var o_id = new mongo.ObjectID(workss[i]);
        Work.findOne({'_id' : o_id}, function (err, work) {
          worksss.push(work);
          addWo(i + 1, callback);
        });
      }
      else {
        callback();
      }
    }
    app.get('/studentProfile', function(req, res) {
      var current_username;
      if (typeof req.query.page !== 'undefined') {
        current_username = req.query.page;
      }
      Student.findOne({'username' : current_username}, function (err, student) {
        if (err)
          res.send(err.message);
          else {

            workss = student.works;
            addWo (0, function () {
              var workssss = [];
              for (var i = 0; i < worksss.length; i++)
                workssss.push(worksss[i]);
                worksss = [];
                res.render('viewprofile.ejs', {
                  username: student.username,
                  works: workssss
                });
            });



          }
      })


    });
    function insertWork(db, work, req, callback) {
      db.collection('works').insertOne(work);
      var username = req.user.username;
      db.collection('students').updateOne( { "username" : username },{ $push: { "works": work._id } });
    }


    function getPP (db, username, res,  req, callback) {

      var student_image = "";
        Student.findOne({'username' : username}, function(err, student){
           if (err){
             console.log("error");
           }  else {
             student_image = student.profile_pic ;
             res.render('profile.ejs', {
                 user : req.user,
                 profile_pic : student_image
             });
           }
            student.save
        });
          // res.render('profile.ejs', {
          //     user : req.user,
          // });

    }

    function updatePP(db, filename, req, callback) {
      var username = req.user.username;
      db.collection('students').updateOne( { "username" : username },{ $set: { "profile_pic": filename } });
    }

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) return next();
        req.flash("error", "You must be logged in");
        res.redirect('/');
    }
};
