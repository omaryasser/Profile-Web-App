//require depenciess
var express         = require('express');
var router          = require('./app/routes');
var bodyParser      = require('body-parser');
var mongoose        = require('mongoose');
var passport        = require('passport');
var session         = require('express-session');
var RedisStore      = require('connect-redis')(session);
var port            = 8080;
var passport        = require('passport');
var flash           = require('connect-flash');
var morgan          = require('morgan');
var cookieParser    = require('cookie-parser');
var app             = express();

require('./config/passport')(passport);
mongoose.connect("mongodb://localhost:27017/portfolio");

app.use(cookieParser());
app.use(bodyParser());
app.set('view engine', 'ejs');
app.use(session({ secret: 'omaryasser' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use( express.static( "public" ) );




// routes
require('./app/routes.js')(app, passport);

app.listen(port);
console.log('Server is listening on port : ' + port);
