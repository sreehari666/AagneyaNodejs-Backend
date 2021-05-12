var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors =require('cors')
var indexRouter = require('./routes/home');
var adminRouter = require('./routes/admin');
var judgeRouter=require('./routes/judge')
var session=require('express-session')

// var registerRouter=require('./routes/register');


var app = express();
var fileUpload=require('express-fileupload')
var db=require('./config/connection');

const bodyParser = require('body-parser')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

db.connect((err)=>{
  if(err) console.log("connection error"+err);
  else console.log("Database connected");
})
app.use(fileUpload())
app.use('/',session({
  name:'homeCookie',
  secret:"Key",
  resave:false,
  saveUninitialized:false,
  cookie:{maxAge:600000}
}))
app.use('/admin',session({
  name:'adminCookie',
  secret:"Key",
  resave:false,
  saveUninitialized:false,
  cookie:{maxAge:600000}
}))
app.use('/judge',session({
  name:'judgeCookie',
  secret:"Key",
  resave:false,
  saveUninitialized:false,
  cookie:{maxAge:600000}
}))
app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/judge',judgeRouter);
app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

// app.use('/register',registerRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



module.exports = app;
