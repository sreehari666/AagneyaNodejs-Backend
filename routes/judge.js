var express = require('express');
var router = express.Router();
const session = require('express-session');
const eventFunctions = require('../functions/event-functions');
const judgeFunctions = require('../functions/judge-functions')

const verifyLoginJudge = (req, res, next) => {
  if (req.session.judgeloggedIn) {
    next()
  } else {
    res.redirect('judge/judge-login')
  }
}

/* GET home page. */
router.get('/',verifyLoginJudge, function(req, res, next) {
  eventFunctions.getAllItems().then((response)=>{
    console.log(response)
    res.render('judge/judge',{response});
  })
  
});

router.get('/judge-login', function (req, res) {
  if (req.session.judgeloggedIn) {
    res.redirect('/')
  } else {
    res.render('judge/judge-login', { "loginErr": req.session.loginJudgeErr })
    req.session.loginJudgeErr = false
  }
  
})
router.post('/judge-login', (req, res) => {
  console.log(req.body)
  console.log("login call")
  judgeFunctions.doLogin(req.body).then((response) => {
    console.log(response)
    if (response.status) {
      req.session.judgeloggedIn = true
      req.session.judge = response.judge
      // console.log(req.session.judge);
      // console.log(req.session.judge.judgeloggedIn);
      res.redirect('/judge')
    } else {
      req.session.loginJudgeErr = "Invalid username or password"
      res.redirect('/judge/judge-login')
    }
  })
})
router.get('/judge-logout', (req, res) => {
  req.session.judgeloggedIn=null
  res.redirect('/')
})
router.post('/add-marks',(req,res)=>{
  console.log(req.body)
  var chessno=req.body.chessno
  judgeFunctions.addMarks(chessno,req.body)
  
  res.render('judge/judge')
})

module.exports = router;
