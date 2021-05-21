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

router.post('/add_marks', verifyLoginJudge, (req, res) => {
  var userGS = '';
  console.log(req.body)
  judgeFunctions.getGroup_or_Solo(req.body.itemname).then((_gsData) => {
    console.log(_gsData)
    
    userGS = _gsData.grouporsolo
    item_type=_gsData.itemtype
  })
  var chestno = req.body.chessno;

  console.log(chestno)
  if (req.body.itemname == "no" && req.body.prize == "no") {
    var display = "yes"
    judgeFunctions.checkUserChest(chestno).then((response) => {


      if (response) {
        console.log(response)
        var chestM = response.chessno[0];
        var itemsList = response.itemname;

        console.log(itemsList)
        if (chestM && itemsList) {
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

            item_ = markList[i].itemname;
          }
        }
        if (item_ == req.body.itemname) {
          var disable_chest = "yes"
          var Err = "Evaluation already done"
          res.render('judge/judge', { Err, disable_chest })
        } else {
          judgeFunctions.addMarks(chestno, req.body, userGS,item_type).then((data) => {

            if (data) {
              var disable_chest = "yes"
              var done = "Evaluation Completed"
              judgeFunctions.getWinnerData(chestno).then((winner_d) => {
                console.log("----------------------------------------------")
                var winnerDescription = winner_d.description
                judgeFunctions.checkUserChest(chestno).then((registerDetails) => {

                  var descriptionList = []
                  var descriptionString = '';
                  var prizeString = '';

                  var mark_List = registerDetails.marks
                  console.log("its here")
                  console.log(mark_List)
                  for (var i = 0; i < mark_List.length; i++) {

                    var _item_name = mark_List[i].itemname
                    var _item_gs = mark_List[i].grouporsolo
                    var _item_mark = mark_List[i].mark
                    if (_item_mark == 10 && _item_gs == 'group') {
                      prizeString = "First Prize"
                    }
                    if (_item_mark == 5 && _item_gs == 'group') {
                      prizeString = "Second Prize"
                    }
                    if (_item_mark == 3 && _item_gs == 'group') {
                      prizeString = "Third Prize"
                    }


                    if (_item_mark == 5 && _item_gs == 'solo') {
                      prizeString = "First"
                    }
                    if (_item_mark == 3 && _item_gs == 'solo') {
                      prizeString = "Second"
                    }
                    if (_item_mark == 1 && _item_gs == 'solo') {
                      prizeString = "Third"
                    }
                    console.log(prizeString)
                    descriptionString = prizeString + " prize in " + _item_name
                    console.log(descriptionString)
                    descriptionList.push(descriptionString)

                  }
                  console.log(descriptionList)
                  var finalString=descriptionList.join()
                  console.log(finalString)
                  judgeFunctions.pushWinnerDescription(chestno,finalString).then((data)=>{
                    console.log(data)
                    console.log("updated winner description")
                  })

                })

              })



              res.render('judge/judge', { done, disable_chest })
            }

          })
        }
      } else {

        judgeFunctions.addMarks(chestno, req.body, userGS,item_type).then((data) => {

          if (data) {
            var disable_chest = "yes"
            var done = "Evaluation Completed"

            res.render('judge/judge', { done, disable_chest })

            judgeFunctions.checkUserChest(chestno).then((registeredData) => {
              var descriptionList = []
              var descriptionString = '';
              var prizeString = '';

              var mark_List = registeredData.marks
              console.log("its here")
              console.log(mark_List)
              for (var i = 0; i < mark_List.length; i++) {
                var _item_name = mark_List[i].itemname
                var _item_gs = mark_List[i].grouporsolo
                var _item_mark = mark_List[i].mark
                if (_item_mark == 10 && _item_gs == 'group') {
                  prizeString = "First Prize"
                }
                if (_item_mark == 5 && _item_gs == 'group') {
                  prizeString = "Second Prize"
                }
                if (_item_mark == 3 && _item_gs == 'group') {
                  prizeString = "Third Prize"
                }


                if (_item_mark == 5 && _item_gs == 'solo') {
                  prizeString = "First"
                }
                if (_item_mark == 3 && _item_gs == 'solo') {
                  prizeString = "Second"
                }
                if (_item_mark == 1 && _item_gs == 'solo') {
                  prizeString = "Third"
                }
                console.log(prizeString)
                descriptionString = prizeString + " prize in " + _item_name
                console.log(descriptionString)
                descriptionList.push(descriptionString)

              }
              console.log(descriptionList)


              console.log(descriptionList[0])

              var winner_Obj = {
                "name": registeredData.name,
                "email":registeredData.email,
                "department": registeredData.department,
                "semester": registeredData.semester,
                "chessno": chestno,
                "description": descriptionList[0],
              }

              eventFunctions.addWinner(winner_Obj).then((_data__) => {

                if (_data__) {
                  console.log("new winner added to winner collection but photo is not uploaded")
                }
              })

            })


          }

        })
      }




    })


  }
})



module.exports = router;
