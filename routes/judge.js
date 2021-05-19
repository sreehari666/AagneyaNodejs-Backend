var express = require('express');
var router = express.Router();
const session = require('express-session');
const eventFunctions = require('../functions/event-functions');
const judgeFunctions = require('../functions/judge-functions')

const verifyLoginJudge = (req, res, next) => {
  if (req.session.judgeloggedIn) {
    next()
  } else {
    res.redirect('/judge/judge-login/')
  }
}

/* GET home page. */
router.get('/', verifyLoginJudge, function (req, res, next) {
  eventFunctions.getAllItems().then((response) => {
    console.log(response)
    var disable_chest = "yes"
    res.render('judge/judge', { response, disable_chest });
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
      req.session.loginJudgeErr = "Invalid email or password"
      res.redirect('/judge/judge-login')
    }
  })
})
router.get('/judge-logout', (req, res) => {
  req.session.judgeloggedIn = null
  res.redirect('/')
})

router.post('/add_marks',verifyLoginJudge, (req, res) => {
  
  console.log(req.body)
  var chestno = req.body.chessno;

  console.log(chestno)
  if (req.body.itemname == "no" && req.body.prize == "no") {
    var display = "yes"
    judgeFunctions.checkUserChest(chestno).then((response) => {

      
      if (response ) {
        console.log(response)
        var chestM = response.chessno[0];
        var itemsList = response.itemname;
        console.log(itemsList)
        if(chestM && itemsList){
          res.render('judge/judge', { display, chestM, itemsList })

        }
       

      } else {
        var Err = 'User not found'
        var disable_chest = "yes"
        res.render('judge/judge', { Err, disable_chest })
      }


    })

  } else {

    judgeFunctions.checkUserChest(chestno).then((rest) => {
      if (rest.marks) {
        console.log(rest.marks)
        var markList = rest.marks
        console.log(markList[0].itemname)
        console.log(req.body.itemname)
        console.log(markList.length)
        
        var item_;
        for (var i = 0; i < markList.length; i++) {
          if (markList[i].itemname == req.body.itemname) {
            
            item_=markList[i].itemname;
          }
        }
        if (item_==req.body.itemname) {
          var disable_chest = "yes"
          var Err = "Evaluation already done"
          res.render('judge/judge', { Err, disable_chest })
        }else{
          judgeFunctions.addMarks(chestno, req.body).then((data) => {
            if (data) {
              var disable_chest = "yes"
              var done = "Evaluation Completed"
              res.render('judge/judge', { done, disable_chest })
            }
  
          })
        }
      } else {
        
        judgeFunctions.addMarks(chestno, req.body).then((data) => {
          if (data) {
            var disable_chest = "yes"
            var done = "Evaluation Completed"
            res.render('judge/judge', { done, disable_chest })
          }

        })
      }




    })


  }
})

router.post('/add-marks', (req, res) => {
  console.log(req.body)
  var chessno = req.body.chessno
  judgeFunctions.addMarks(chessno, req.body).then((data) => {
    res.render('judge/judge')
  })


})

module.exports = router;
