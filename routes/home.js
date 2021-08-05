var express = require('express');
const session = require('express-session');

const { registerEvent } = require('../functions/event-functions');
var router = express.Router();
var db = require('../config/connection')
var collection = require('../config/collection')
var eventFunctions = require('../functions/event-functions')
const userFunctions = require('../functions/user-functions')
const judgeFunctions = require('../functions/judge-functions');
const { response } = require('express');
var cors = require('cors')
const fs = require('fs')


router.use(cors())

const nodemailer = require('nodemailer'),

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "teamartfest@gmail.com",
      pass: "Drishyam3@varun123",
    },
  }),
  EmailTemplate = require('email-templates').EmailTemplate,
  path = require('path'),
  Promise = require('bluebird');

const key = "@fdjjjJHDMNXZHHhVXGA899XBHHN^878(&?wshdhshGhghBVDD"

const verifyLogin = (req, res, next) => {
  if (req.session.user.loggedIn) {
    next()
  } else {
    res.send({ success: logout })
  }
}


router.get('/logout', function (req, res) {
  req.session.user = null
  res.send({ success: true })
})

router.get('/', function (req, res, next) {
  res.render('home')
})
router.get('/app-get-item-list', function (req, res) {
  eventFunctions.getAllItems().then((data) => {
    console.log(data)

    res.send(data)
  })
})

router.get('/app-winner-announce', function (req, res) {
  var winnerAnnounce = true;
  judgeFunctions.announceWinners(winnerAnnounce).then((data) => {
    res.redirect('/admin')
  })

})

router.get('/app-winner-stop-announce', function (req, res) {
  var winnerAnnounce = false;
  judgeFunctions.announceWinners(winnerAnnounce).then((data) => {
    res.redirect('/admin')
  })

})

router.get('/app-get-winner', function (req, res) {

  judgeFunctions.getAnnounceWinner().then((A_winner) => {

    console.log(A_winner.winners)
    if (A_winner.winners == true) {

      eventFunctions.getAllwinners().then((data) => {
        console.log(data)
        console.log("-------reversed array------")
        console.log(data.reverse())
        var shuffledArray = [];

        shuffledArray = data.sort((a, b) => 0.5 - Math.random());

        res.send(shuffledArray)
      })

    } else {
      var winnerList = []
      var winnerObj = {
        _id: 'default_landing_image',
        name: 'Welcome',
        department: 'Athene Arts',
        semester: ' ',
        description: 'From IES College of Engineering'

      }
      winnerList.push(winnerObj)
      res.send(winnerList)

    }

  })

})

router.get('/app-get-gallery-photos', function (req, res) {
  eventFunctions.getAllimages().then((response) => {
    console.log(response);
    var shuffledArray = [];

    shuffledArray = response.sort((a, b) => 0.5 - Math.random());

    res.send(shuffledArray)
  })
})


router.get('/app-open-registration', function (req, res) {
  var value = true
  judgeFunctions.openRegistration(value).then((data) => {
    res.redirect('/admin')
  })
})

router.get('/app-close-registration', function (req, res) {
  var value = false
  judgeFunctions.openRegistration(value).then((data) => {
    res.redirect('/admin')
  })
})

router.get('/app-event-register/:id', function (req, res) {

  judgeFunctions.get_oc_registration().then((data) => {

    if (data.registration == true) {

      console.log(req.params.id)
      var userid = req.params.id
      eventFunctions.getAllItems().then((response) => {
        console.log(response);
        userFunctions.getUserData(req.params.id).then((data) => {
          console.log(data)
          var dataObj = {
            name: data.name,
            email: data.email,
            regno: data.regno,
          }
          console.log(dataObj)
          var OffStageList = []
          var onStageGroupList = []
          var onStageSoloList = []
          for (var i = 0; i < response.length; i++) {
            var tempData = response[i]
            if (tempData.itemtype == 'offstage') {
              OffStageList.push(tempData.itemname)
            } else {
              if (tempData.itemtype == 'onstage' && tempData.grouporsolo == 'group') {
                onStageGroupList.push(tempData.itemname)
              }
              if (tempData.itemtype == 'onstage' && tempData.grouporsolo == 'solo') {
                onStageSoloList.push(tempData.itemname)
              }
            }
          }
          console.log(OffStageList)

          res.render('event-registration', { response, userid, dataObj, OffStageList, onStageGroupList, onStageSoloList })
        })

      })

    } else {
      res.render('register_close')
    }
  })



})

//kalaprathibha



router.get('/app-find-kalaprathibha', (req, res) => {
  var awardList_final = []
  eventFunctions.getAllRegisteredDetails().then((R_data) => {
    for (var i = 0; i < R_data.length; i++) {
      console.log("its here")
      if (R_data[i].marks) {
        console.log("loop2")
        var _chestno = R_data[i].chessno
        var chestno = _chestno[0]
        if (R_data[i].gender == 'male') {
          console.log("male loop")
          var markList = R_data[i].marks
          for (var j = 0; j < markList.length; j++) {
            if (markList[j].itemtype == 'onstage' && markList[j].grouporsolo == 'solo') {
              var markSumList = []
              var _mark = markList[j].mark
              markSumList.push(_mark)
              var final_sum = markSumList
                .reduce((a, b) => {
                  return a + b;
                });

              var awardListObj = {
                "chestno": chestno,
                "tmark": final_sum,
              }
              awardList_final.push(awardListObj)
              console.log(markSumList)
              console.log(final_sum)
            }
          }

        }
      }
    }

    console.log(R_data)
    console.log("----------------------------")
    console.log(awardList_final)
    awardList_final.sort((firstItem, secondItem) => firstItem.tmark - secondItem.tmark);
    console.log(awardList_final)

    var finalObj_ = awardList_final[awardList_final.length - 1]
    var _awardList = []
    for (var i = 0; i < awardList_final.length; i++) {
      var tempMark = awardList_final[i].tmark
      var tempChest = awardList_final[i].chestno
      if (tempMark == finalObj_.tmark) {
        var tempObj = {
          "chestno": tempChest,
          "tmark": tempMark,
        }
        _awardList.push(tempObj)
      }
    }
    console.log("------------award list-------------")
    console.log(_awardList)

    var final_List_ = []
    // if(_awardList.lenght==0){
    //   res.redirect('/admin')
    // }
    for (var i = 0; i < _awardList.length; i++) {
      var _tempChest = _awardList[i].chestno
      var _tempMark = _awardList[i].tmark
      judgeFunctions.checkUserChest([_tempChest]).then((__data) => {

        console.log(__data)
        console.log(_tempMark)
        var final_Obj_ = {
          "name": __data.name,
          "email": __data.email,
          "department": __data.department,
          "semester": __data.semester,
          "regno": __data.regno,
          "chestno": __data.chessno,
          "gender": __data.gender,
          "tmark": _tempMark,
          "award": "Kalaprathibha",
        }
        final_List_.push(final_Obj_)
        res.render('award-winners', { final_List_ })


      })
    }

  })
})
//kalathilakam

router.get('/app-find-kalathilakam', (req, res) => {
  var awardList_final = []
  eventFunctions.getAllRegisteredDetails().then((R_data) => {
    for (var i = 0; i < R_data.length; i++) {
      console.log("its here")
      if (R_data[i].marks) {
        console.log("loop2")
        var _chestno = R_data[i].chessno
        var chestno = _chestno[0]
        if (R_data[i].gender == 'female') {

          console.log("female loop")
          var markList = R_data[i].marks
          for (var j = 0; j < markList.length; j++) {
            if (markList[j].itemtype == 'onstage' && markList[j].grouporsolo == 'solo') {
              var markSumList = []
              var _mark = markList[j].mark
              markSumList.push(_mark)
              var final_sum = markSumList
                .reduce((a, b) => {
                  return a + b;
                });

              var awardListObj = {
                "chestno": chestno,
                "tmark": final_sum,
              }
              awardList_final.push(awardListObj)
              console.log(markSumList)
              console.log(final_sum)
            }
          }

        }
      }
    }

    console.log(R_data)
    console.log("----------------------------")
    console.log(awardList_final)
    awardList_final.sort((firstItem, secondItem) => firstItem.tmark - secondItem.tmark);
    console.log(awardList_final)

    var finalObj_ = awardList_final[awardList_final.length - 1]
    var _awardList = []
    for (var i = 0; i < awardList_final.length; i++) {
      var tempMark = awardList_final[i].tmark
      var tempChest = awardList_final[i].chestno
      if (tempMark == finalObj_.tmark) {
        var tempObj = {
          "chestno": tempChest,
          "tmark": tempMark,
        }
        _awardList.push(tempObj)
      }
    }
    console.log("------------award list-------------")
    console.log(_awardList.length)
    var final_List_ = []
    // if(_awardList.lenght==Number(0)){
    //   res.redirect('/admin')
    // }
    for (var i = 0; i < _awardList.length; i++) {
      var _tempChest = _awardList[i].chestno
      var _tempMark = _awardList[i].tmark
      judgeFunctions.checkUserChest([_tempChest]).then((__data) => {

        console.log(__data)
        console.log(_tempMark)
        var final_Obj_ = {
          "name": __data.name,
          "email": __data.email,
          "department": __data.department,
          "semester": __data.semester,
          "regno": __data.regno,
          "chestno": __data.chessno,
          "gender": __data.gender,
          "tmark": _tempMark,
          "award": "Kalathilakam",
        }
        final_List_.push(final_Obj_)
        res.render('award-winners', { final_List_ })


      })
    }

  })
})


//sargaprathibha

router.get('/app-find-sargaprathibha', (req, res) => {
  var awardList_final = []
  eventFunctions.getAllRegisteredDetails().then((R_data) => {
    for (var i = 0; i < R_data.length; i++) {
      console.log("its here")
      if (R_data[i].marks) {
        console.log("loop2")
        var _chestno = R_data[i].chessno
        var chestno = _chestno[0]
        if (R_data[i].gender == 'female' || R_data[i].gender == 'male' || R_data[i].gender == 'others') {

          console.log("female loop")
          var markList = R_data[i].marks
          for (var j = 0; j < markList.length; j++) {
            if (markList[j].itemtype == 'offstage' && markList[j].subtype == 'literature') {
              var markSumList = []
              var _mark = markList[j].mark
              markSumList.push(_mark)
              var final_sum = markSumList
                .reduce((a, b) => {
                  return a + b;
                });

              var awardListObj = {
                "chestno": chestno,
                "tmark": final_sum,
              }
              awardList_final.push(awardListObj)
              console.log(markSumList)
              console.log(final_sum)
            }
          }

        }
      }
    }

    console.log(R_data)
    console.log("----------------------------")
    console.log(awardList_final)
    awardList_final.sort((firstItem, secondItem) => firstItem.tmark - secondItem.tmark);
    console.log(awardList_final)

    var finalObj_ = awardList_final[awardList_final.length - 1]
    var _awardList = []
    for (var i = 0; i < awardList_final.length; i++) {
      var tempMark = awardList_final[i].tmark
      var tempChest = awardList_final[i].chestno
      if (tempMark == finalObj_.tmark) {
        var tempObj = {
          "chestno": tempChest,
          "tmark": tempMark,
        }
        _awardList.push(tempObj)
      }
    }
    console.log("------------award list-------------")
    console.log(_awardList.length)
    var final_List_ = []
    // if(_awardList.lenght==Number(0)){
    //   res.redirect('/admin')
    // }
    for (var i = 0; i < _awardList.length; i++) {
      var _tempChest = _awardList[i].chestno
      var _tempMark = _awardList[i].tmark
      judgeFunctions.checkUserChest([_tempChest]).then((__data) => {

        console.log(__data)
        console.log(_tempMark)
        var final_Obj_ = {
          "name": __data.name,
          "email": __data.email,
          "department": __data.department,
          "semester": __data.semester,
          "regno": __data.regno,
          "chestno": __data.chessno,
          "gender": __data.gender,
          "tmark": _tempMark,
          "award": "Sargaprathibha",
        }
        final_List_.push(final_Obj_)
        res.render('award-winners', { final_List_ })


      })
    }

  })
})

//chithraprathibha

router.get('/app-find-chithraprathibha', (req, res) => {
  var awardList_final = []
  eventFunctions.getAllRegisteredDetails().then((R_data) => {
    for (var i = 0; i < R_data.length; i++) {
      console.log("its here")
      if (R_data[i].marks) {
        console.log("loop2")
        var _chestno = R_data[i].chessno
        var chestno = _chestno[0]
        if (R_data[i].gender == 'female' || R_data[i].gender == 'male' || R_data[i].gender == 'others') {

          console.log("female loop")
          var markList = R_data[i].marks
          for (var j = 0; j < markList.length; j++) {
            if (markList[j].itemtype == 'offstage' && markList[j].subtype == 'drawing') {
              var markSumList = []
              var _mark = markList[j].mark
              markSumList.push(_mark)
              var final_sum = markSumList
                .reduce((a, b) => {
                  return a + b;
                });

              var awardListObj = {
                "chestno": chestno,
                "tmark": final_sum,
              }
              awardList_final.push(awardListObj)
              console.log(markSumList)
              console.log(final_sum)
            }
          }

        }
      }
    }

    console.log(R_data)
    console.log("----------------------------")
    console.log(awardList_final)
    awardList_final.sort((firstItem, secondItem) => firstItem.tmark - secondItem.tmark);
    console.log(awardList_final)

    var finalObj_ = awardList_final[awardList_final.length - 1]
    var _awardList = []
    for (var i = 0; i < awardList_final.length; i++) {
      var tempMark = awardList_final[i].tmark
      var tempChest = awardList_final[i].chestno
      if (tempMark == finalObj_.tmark) {
        var tempObj = {
          "chestno": tempChest,
          "tmark": tempMark,
        }
        _awardList.push(tempObj)
      }
    }
    console.log("------------award list-------------")
    console.log(_awardList.length)
    var final_List_ = []
    // if(_awardList.lenght==Number(0)){
    //   res.redirect('/admin')
    // }
    for (var i = 0; i < _awardList.length; i++) {
      var _tempChest = _awardList[i].chestno
      var _tempMark = _awardList[i].tmark
      judgeFunctions.checkUserChest([_tempChest]).then((__data) => {

        console.log(__data)
        console.log(_tempMark)
        var final_Obj_ = {
          "name": __data.name,
          "email": __data.email,
          "department": __data.department,
          "semester": __data.semester,
          "regno": __data.regno,
          "chestno": __data.chessno,
          "gender": __data.gender,
          "tmark": _tempMark,
          "award": "Chithraprathibha",
        }
        final_List_.push(final_Obj_)
        res.render('award-winners', { final_List_ })


      })
    }

  })
})

router.get('/upload-award-winner/:chest/:tmark/:award', (req, res) => {
  console.log(req.params.chest)
  console.log(req.params.tmark)
  console.log(req.params.award)
  var t_mark = Number(req.params.tmark)
  var award_string = req.params.award
  var chest_no = req.params.chest
  var d = new Date();
  var year_ = d.getFullYear();
  var description_ = award_string + " of " + year_

  judgeFunctions.checkUserChest([Number(req.params.chest)]).then((register_d) => {
    awardObj = {
      "name": register_d.name,
      "email": register_d.email,
      "department": register_d.department,
      "semester": register_d.semester,
      "chessno": chest_no,
      "award": award_string,
      "tmark": t_mark,
      "image_": "pending",
      "description": description_,

    }
    eventFunctions.addWinner(awardObj).then((_data) => {
      res.redirect('/admin')
    })
  })

})



router.get('/app-get-youtube-links', function (req, res) {
  eventFunctions.getAllLinks().then((response) => {
    console.log(response);

    res.send(response)
  })
})

router.get('/app-get-score', function (req, res) {
  const totalPoints = 1000
  var civilPoints = 0.0;
  var csePoints = 0.0;
  var ecePoints = 0.0;
  var eeePoints = 0.0;
  var mechPoints = 0.0;

  var civilPercent = 0.0;
  var csePercent = 0.0;
  var ecePercent = 0.0;
  var eeePercent = 0.0;
  var mechPercent = 0.0;

  eventFunctions.getScoreCIVIL().then((details) => {
    var markObj = []
    var final_List = []
    var checkList = []

    for (var i = 0; i < details.length; i++) {
      checkList.push(details.marks)
    }
    console.log(checkList)
    console.log(details)
    if (checkList.length == 0) {
      console.log("list is empty")
      civilPoints = 0.0
      civilPercent = 0.0
    } else {

      for (var i = 0; i < details.length; i++) {

        if (details[i].marks) {
          markObj.push(details[i].marks)


        }
      }
      //console.log(markObj[0])
      for (var i = 0; i < markObj.length; i++) {
        console.log("--------")
        console.log(markObj[i])

        console.log("--------")
        var tempList = markObj[i]
        for (var j = 0; j < tempList.length; j++) {
          final_List.push(tempList[j].mark)
        }

      }
      console.log(final_List)
      for (var i = 0; i < final_List.length; i++) {
        civilPoints = civilPoints + final_List[i]
      }
      console.log(civilPoints)

      civilPercent = (civilPoints / totalPoints) * 100
      console.log(civilPercent)
    }
    // ------------cse-----------
    eventFunctions.getScoreCSE().then((details) => {
      var markObj = []
      var final_List = []
      var checkList = []

      for (var i = 0; i < details.length; i++) {
        checkList.push(details.marks)
      }
      console.log(checkList)
      console.log(details)
      if (checkList.length == 0) {
        console.log("list is empty")
        csePoints = 0.0
        csePercent = 0.0
      } else {

        for (var i = 0; i < details.length; i++) {

          if (details[i].marks) {
            markObj.push(details[i].marks)


          }
        }
        //console.log(markObj[0])
        for (var i = 0; i < markObj.length; i++) {
          console.log("--------")
          console.log(markObj[i])

          console.log("--------")
          var tempList = markObj[i]
          for (var j = 0; j < tempList.length; j++) {
            final_List.push(tempList[j].mark)
          }

        }
        console.log(final_List)
        for (var i = 0; i < final_List.length; i++) {
          csePoints = csePoints + final_List[i]
        }
        console.log(csePoints)

        csePercent = (csePoints / totalPoints) * 100
        console.log(csePercent)
      }

      // ----------------ece-----------------

      eventFunctions.getScoreECE().then((details) => {

        var markObj = []
        var final_List = []
        var checkList = []

        for (var i = 0; i < details.length; i++) {
          checkList.push(details.marks)
        }
        console.log(checkList)
        console.log(details)
        if (checkList.length == 0) {
          console.log("list is empty")
          ecePoints = 0.0
          ecePercent = 0.0
        } else {

          for (var i = 0; i < details.length; i++) {

            if (details[i].marks) {
              markObj.push(details[i].marks)


            }
          }
          //console.log(markObj[0])
          for (var i = 0; i < markObj.length; i++) {
            console.log("--------")
            console.log(markObj[i])

            console.log("--------")
            var tempList = markObj[i]
            for (var j = 0; j < tempList.length; j++) {
              final_List.push(tempList[j].mark)
            }

          }
          console.log(final_List)
          for (var i = 0; i < final_List.length; i++) {
            ecePoints = ecePoints + final_List[i]
          }
          console.log(ecePoints)

          ecePercent = (ecePoints / totalPoints) * 100
          console.log(ecePercent)
        }

        // ----------------eee-----------------

        eventFunctions.getScoreEEE().then((details) => {

          var markObj = []
          var final_List = []
          var checkList = []

          for (var i = 0; i < details.length; i++) {
            checkList.push(details.marks)
          }
          console.log(checkList)
          console.log(details)
          if (checkList.length == 0) {
            console.log("list is empty")
            eeePoints = 0.0
            eeePercent = 0.0
          } else {

            for (var i = 0; i < details.length; i++) {

              if (details[i].marks) {
                markObj.push(details[i].marks)


              }
            }
            //console.log(markObj[0])
            for (var i = 0; i < markObj.length; i++) {
              console.log("--------")
              console.log(markObj[i])

              console.log("--------")
              var tempList = markObj[i]
              for (var j = 0; j < tempList.length; j++) {
                final_List.push(tempList[j].mark)
              }

            }
            console.log(final_List)
            for (var i = 0; i < final_List.length; i++) {
              eeePoints = eeePoints + final_List[i]
            }
            console.log(eeePoints)

            eeePercent = (eeePoints / totalPoints) * 100
            console.log(eeePercent)
          }

          // ----------------mech-----------------
          eventFunctions.getScoreMECH().then((details) => {

            var markObj = []
            var final_List = []
            var checkList = []

            for (var i = 0; i < details.length; i++) {
              checkList.push(details.marks)
            }
            console.log(checkList)
            console.log(details)
            if (checkList.length == 0) {
              console.log("list is empty")
              mechPoints = 0.0
              mechPercent = 0.0
            } else {

              for (var i = 0; i < details.length; i++) {

                if (details[i].marks) {
                  markObj.push(details[i].marks)


                }
              }
              //console.log(markObj[0])
              for (var i = 0; i < markObj.length; i++) {
                console.log("--------")
                console.log(markObj[i])

                console.log("--------")
                var tempList = markObj[i]
                for (var j = 0; j < tempList.length; j++) {
                  final_List.push(tempList[j].mark)
                }

              }
              console.log(final_List)
              for (var i = 0; i < final_List.length; i++) {
                mechPoints = mechPoints + final_List[i]
              }
              console.log(mechPoints)

              mechPercent = (mechPoints / totalPoints) * 100
              console.log(mechPercent)
            }



            res.send({
              "civilpoints": civilPoints, "csepoints": csePoints, "ecepoints": ecePoints, "eeepoints": eeePoints, "mechpoints": mechPoints,
              "civilpercent": civilPercent, "csepercent": csePercent, "ecepercent": ecePercent, "eeepercent": eeePercent, "mechpercent": mechPercent
            });


          })



        })



      })




    })



  })


})




router.get('/app-getAllEvents', function (req, res) {
  eventFunctions.getAllEventLogs().then((log_values) => {
    var dateInPast = function (firstDate, secondDate) {
      if (firstDate.setHours(0, 0, 0, 0) <= secondDate.setHours(0, 0, 0, 0)) {
        return true;
      }

      return false;
    };
    var sum=0
    for (var i = 0; i < log_values.length; i++) {

      var _date = log_values[i].date
      var __date = new Date(_date);
      var today = new Date();
      console.log(today.getTime())


      console.log(log_values[i].time)

      var date_is_pf = dateInPast(__date, today)
      console.log(dateInPast(__date, today))
      if (date_is_pf == true) {
        eventFunctions.deleteEvent(log_values[i].eventid).then((value__) => {
          console.log(value__.deletedCount)
          if (value__.deletedCount == 0) {
            console.log("Nothing to delete")

          } else {
            console.log("event deleted")
          }

        })
      }



    }
    eventFunctions.getAllEvents().then((eventDetails) => {
      console.log("call is here")
      console.log(eventDetails.length)
      if(eventDetails.length == 0){
        var final_eventList=[]
        var event_obj = {
          "_id": "default_landing_image",
          "eventname": "Events not scheduled yet",
          "date": " ",
          "time": " ",

        }
        final_eventList.push(event_obj)
        res.json(final_eventList)
      }
      var final_eventList = []
      for (var i = 0; i < eventDetails.length; i++) {
        
        console.log(eventDetails[i])
        var monthString;
        var final_date;
        var day;
        var date = new Date(eventDetails[i].date)
        var year = date.getFullYear()
        var month = date.getMonth() + 1
        var _day = date.getDay()

        console.log(month.toString())
        console.log(day)
        console.log((eventDetails[i].date).slice(-2))
        switch (month) {
          case 1:
            monthString = "January";
            break;
          case 2:
            monthString = "February";
            break;
          case 3:
            monthString = "March";
            break;
          case 4:
            monthString = "April";
            break;
          case 5:
            monthString = "May";
            break;
          case 6:
            monthString = "June";
            break;
          case 7:
            monthString = "July";
            break;
          case 8:
            monthString = "August";
            break;
          case 9:
            monthString = "September";
            break;
          case 10:
            monthString = "October";
            break;
          case 11:
            monthString = "November";
            break;
          case 12:
            monthString = "December";
            break;
          default:
            monthString = "Error";
        }

        switch (_day) {
          case 0:
            day = "Sunday";
            break;
          case 1:
            day = "Monday";
            break;
          case 2:
            day = "Tuesday";
            break;
          case 3:
            day = "Wednesday";
            break;
          case 4:
            day = "Thursday";
            break;
          case 5:
            day = "Friday";
            break;
          case 6:
            day = "Saturday";
            break;
        }

        final_date = (eventDetails[i].date).slice(-2) + " " + monthString + " " + year.toString() + " ( " + day + " )";
        console.log(final_date)

        function tConvert(time) {
          // Check correct time format and split into components
          time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

          if (time.length > 1) { // If time format correct
            time = time.slice(1);  // Remove full string match value
            time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
            time[0] = +time[0] % 12 || 12; // Adjust hours
          }
          return time.join(''); // return adjusted time or original string
        }
        console.log(tConvert(eventDetails[i].time))

        var event_obj = {
          "_id": eventDetails[i]._id,
          "eventname": eventDetails[i].eventname,
          "date": final_date,
          "time": tConvert(eventDetails[i].time),

        }
        final_eventList.push(event_obj)

      }

      console.log(final_eventList)
      res.json(final_eventList)
    })
  })

})




router.post('/app-student-login', (req, res) => {
  console.log(req.body)
  if (key == req.body.key) {
    userFunctions.doLogin(req.body).then((response) => {
      console.log('response')
      console.log(response)
      if (response.status) {

        req.session.user = response.user
        req.session.user.loggedIn = true
        res.send({ success: true, token: response.user._id })
      } else {
        req.session.loginUserErr = "Invalid username or password"
        console.log("error in login")
        res.send({ success: false, msg: 'Login failed, wrong password' })
      }
    })
  } else {
    console.log("Unauthorized request")
  }
})
router.post('/app-student-signup', (req, res) => {
  console.log(req.body)
  
  if (key == req.body.key) {
    var reg_no=req.body.regno.toUpperCase()
    console.log(reg_no)
    if(reg_no.substring(0,3) == "IES"){
      console.log("access to create account")
      userFunctions.checkUser(req.body).then((response) => {

        if (response) {
          res.send({ successs: false, msg: "You already have an account" })
        } else {
          userFunctions.doSignup(req.body).then((response) => {
  
            console.log("do login")
            console.log(response)
  
            req.session.user = response
            req.session.user.loggedIn = true
  
            if (response) {
              res.send({ success: true, msg: 'Signup Success' })
            } else {
              res.send({ success: false, msg: 'Failed to Signup' })
            }
          })
        }
  
      })
    }else{
      console.log("no access to create account")
      res.send({ success: false, msg: 'Failed to Signup, please check your register number' })
    }
    
    // userFunctions.doSignup(req.body).then((response) => {
    //   console.log(response)
    //   if(response){
    //     res.send({success: true, msg: 'Signup Success'})
    //   }else{
    //     res.send({success: false, msg: 'Failed to Signup'})
    //   }
    // })
  } else {
    console.log("Unauthorized request")
  }
})




router.post('/app-getUserData', (req, res) => {


  console.log(req.body.token)

  userFunctions.getUserData(req.body.token).then((response) => {

    userFunctions.getUserRegister(req.body.token).then((details) => {

      // console.log(details)
      // 
      // console.log(response)
      if (details == null) {
        res.send({ name: response.name, email: response.email, chessno: null, regno: null, department: null, semester: null, itemnames: null })
      } else {
        res.send({ name: response.name, email: response.email, chessno: details.chessno[0], regno: details.regno, department: details.department, semester: details.semester, itemnames: details.itemname })
      }

      //res.send({name:response.name,email:response.email,chessno:details.chessno[0],regno:details.regno,department:details.department,semester:details.semester,itemnames:details.itemname})
    })



  })
})


router.post('/register-for-events/:id', function (req, res) {

  console.log(req.params.id)
  console.log(req.body)

  eventFunctions.checkRegister(req.params.id).then((response) => {
    console.log(response)
    if (response != null) {

      var msg = 'You are already registered'
      res.render('event-registration', { msg })
    } else {

      eventFunctions.findLast().then((res_) => {

        console.log('last document')
        console.log(res_)
        if (res_ == null) {

          eventFunctions.registerEvent(req.body).then((response) => {
            console.log(response)
            const _num = 100;
            if (response) {
              eventFunctions.pushChessno(req.params.id, _num).then((res1) => {
                eventFunctions.getRegisteredDetails(req.params.id).then((register_data_) => {




                  function sendEmail(obj) {
                    return transporter.sendMail(obj);
                  }

                  function loadTemplate(templateName, contexts) {
                    let template = new EmailTemplate(path.join(__dirname, 'templates', templateName));
                    return Promise.all(contexts.map((context) => {
                      return new Promise((resolve, reject) => {
                        template.render(context, (err, result) => {
                          if (err) reject(err);
                          else resolve({
                            email: result,
                            context,
                          });
                        });
                      });
                    }));
                  }
                  var users = []
                  if (Array.isArray(register_data_.itemname) == false) {

                    var list_obj = {
                      name: register_data_.name,
                      email: register_data_.email,
                      chestno: register_data_.chessno,
                      itemname: register_data_.itemname,
                    }
                    users.push(list_obj)


                  } else {

                    var list_obj = {
                      name: register_data_.name,
                      email: register_data_.email,
                      chestno: register_data_.chessno,
                      itemname: (register_data_.itemname).join(),
                    }
                    users.push(list_obj)

                  }



                  loadTemplate('register-done-template', users).then((results) => {
                    return Promise.all(results.map((result) => {
                      sendEmail({
                        to: result.context.email,
                        from: 'Team Athene Arts :)',
                        subject: result.email.subject,
                        html: result.email.html,
                        text: result.email.text,
                      });
                    }));
                  }).then(() => {
                    console.log('Registration done, email successfully sent');
                  });
                })

                var success = 'Registration done'
                res.render('event-registration', { success })
              })

            }

          })
        } else {

          console.log(res_.chessno[0])
          var chestNew = Number(res_.chessno[0]) + 1
          eventFunctions.registerEvent(req.body).then((response1) => {
            if (response1) {
              eventFunctions.pushChessno(req.params.id, chestNew).then((res1) => {

                eventFunctions.getRegisteredDetails(req.body.userid).then((register_data_) => {

                  function sendEmail(obj) {
                    return transporter.sendMail(obj);
                  }

                  function loadTemplate(templateName, contexts) {
                    let template = new EmailTemplate(path.join(__dirname, 'templates', templateName));
                    return Promise.all(contexts.map((context) => {
                      return new Promise((resolve, reject) => {
                        template.render(context, (err, result) => {
                          if (err) reject(err);
                          else resolve({
                            email: result,
                            context,
                          });
                        });
                      });
                    }));
                  }
                  var users = []
                  if (Array.isArray(register_data_.itemname) == false) {

                    var list_obj = {
                      name: register_data_.name,
                      email: register_data_.email,
                      chestno: register_data_.chessno,
                      itemname: register_data_.itemname,
                    }
                    users.push(list_obj)


                  } else {

                    var list_obj = {
                      name: register_data_.name,
                      email: register_data_.email,
                      chestno: register_data_.chessno,
                      itemname: (register_data_.itemname).join(),
                    }
                    users.push(list_obj)

                  }

                  loadTemplate('register-done-template', users).then((results) => {
                    return Promise.all(results.map((result) => {
                      sendEmail({
                        to: result.context.email,
                        from: 'Team Aagneya :)',
                        subject: result.email.subject,
                        html: result.email.html,
                        text: result.email.text,
                      });
                    }));
                  }).then(() => {
                    console.log('Registration done, email successfully sent');
                  });


                  var success = 'Registration done'
                  res.render('event-registration', { success })

                })


              })
            }

          })
        }

      })
    }

  })

})
//upload entries from user
router.get('/app-upload-entries/:id', (req, res) => {
  function tConvert(time) {
    // Check correct time format and split into components
    time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) { // If time format correct
      time = time.slice(1);  // Remove full string match value
      time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join(''); // return adjusted time or original string
  }
  function timeToMins(time) {
    var b = time.split(':');
    return b[0] * 60 + +b[1];
  }

  // Convert minutes to a time in format hh:mm
  // Returned value is in range 00  to 24 hrs
  function timeFromMins(mins) {
    function z(n) { return (n < 10 ? '0' : '') + n; }
    var h = (mins / 60 | 0) % 24;
    var m = mins % 60;
    return z(h) + ':' + z(m);
  }

  // Add two times in hh:mm format
  function addTimes(t0, t1) {
    return timeFromMins(timeToMins(t0) + timeToMins(t1));
  }



  eventFunctions.getRegisteredDetails(req.params.id).then((k) => {
    var items = []
    var items_list = []
    if (Array.isArray(k.itemname) == false) {
      items.push(k.itemname)
    } else {
      items = k.itemname
    }
    sum = 0
    for (var i = 0; i < items.length; i++) {





      judgeFunctions.getGroup_or_Solo(items[i]).then((m) => {


        var monthString_;
        console.log(m.date)
        var __date_ = m.date.split("-")
        var __time_ = m.time + ':00'

        //get month
        switch (Number(__date_[1])) {
          case 1:
            monthString_ = "January";
            break;
          case 2:
            monthString_ = "February";
            break;
          case 3:
            monthString_ = "March";
            break;
          case 4:
            monthString_ = "April";
            break;
          case 5:
            monthString_ = "May";
            break;
          case 6:
            monthString_ = "June";
            break;
          case 7:
            monthString_ = "July";
            break;
          case 8:
            monthString_ = "August";
            break;
          case 9:
            monthString_ = "September";
            break;
          case 10:
            monthString_ = "October";
            break;
          case 11:
            monthString_ = "November";
            break;
          case 12:
            monthString_ = "December";
            break;
          default:
            monthString_ = "Error";
        }
        var dateString_ = monthString_ + " " + __date_[2] + ", " + __date_[0] + " " + __time_
        console.log("date string")
        console.log(dateString_)

        var myDate__ = new Date(dateString_); // Your timezone!
        var myEpoch__ = myDate__.getTime();

        var todayEpoch_ = new Date().getTime()
        console.log(todayEpoch_)

        sum = sum + 1
        console.log("sum")
        console.log(sum)
        if (m.subtype == "drawing" || m.subtype == "literature" || m.subtype == "craft") {
          var durationString = m.duration.split(":")
          var final_d_string;
          if (durationString[1] == '00') {
            final_d_string = durationString[0] + " hour"
          } else {
            final_d_string = durationString[0] + " hour " + durationString[1] + " min"
          }
          if (myEpoch__ >= todayEpoch_) {
            var obj_ = {
              itemname: m.itemname,
              ntime: tConvert(m.time),
              time: m.time,
              date: m.date,
              ndate: (__date_[2] + ' ' + monthString_ + ' ' + __date_[0]),
              sduration: final_d_string,
              duration: m.duration,

            }
            items_list.push(obj_)
          } else {
            var obj_ = {
              itemname: m.itemname,
              ntime: tConvert(m.time),
              time: m.time,
              date: m.date,
              ndate: (__date_[2] + ' ' + monthString_ + ' ' + __date_[0]),
              sduration: final_d_string,
              duration: m.duration,
              past: "yes",

            }
            items_list.push(obj_)
          }


          // console.log(items_list)
        }
        if (sum == items.length) {
          console.log(items_list)
          var today = new Date();
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
          var yyyy = today.getFullYear();

          var todayDate = yyyy + '-' + mm + '-' + dd;
          console.log(todayDate)
          var final_list = []

          for (var j = 0; j < items_list.length; j++) {
            var monthString;

            var __date = items_list[j].date.split("-")
            var __time = items_list[j].time + ':00'



            //get month
            switch (Number(__date[1])) {
              case 1:
                monthString = "January";
                break;
              case 2:
                monthString = "February";
                break;
              case 3:
                monthString = "March";
                break;
              case 4:
                monthString = "April";
                break;
              case 5:
                monthString = "May";
                break;
              case 6:
                monthString = "June";
                break;
              case 7:
                monthString = "July";
                break;
              case 8:
                monthString = "August";
                break;
              case 9:
                monthString = "September";
                break;
              case 10:
                monthString = "October";
                break;
              case 11:
                monthString = "November";
                break;
              case 12:
                monthString = "December";
                break;
              default:
                monthString = "Error";
            }
            var dateString = monthString + " " + __date[2] + ", " + __date[0] + " " + __time
            console.log("date string")
            console.log(dateString)

            var myDate = new Date(dateString); // Your timezone!
            var myEpoch = myDate.getTime();

            console.log(myEpoch)
            var todayEpoch = new Date().getTime()
            console.log(todayEpoch)



            var end_String = monthString + " " + __date[2] + ", " + __date[0] + " " + addTimes(items_list[j].time, items_list[j].duration) + ":00"
            var __myDate = new Date(end_String); // Your timezone!
            var end_epoch = __myDate.getTime();

            if (todayEpoch >= myEpoch && todayEpoch <= end_epoch) {
              console.log(" epoch is true ")
              var finalObj = {
                itemname: items_list[j].itemname,
                time: items_list[j].time,
                date: items_list[j].date,
                ntime: items_list[j].ntime,
                sduration: items_list[j].sduration,
                duration: items_list[j].duration,
                time_end: addTimes(items_list[j].time, items_list[j].duration),
                start_epoch: myEpoch,
                end_epoch: end_epoch,
                id: req.params.id,
              }
              final_list.push(finalObj)
            }
          }
          console.log(items_list)
          console.log("time list")
          console.log(final_list.length)
          console.log(final_list)
          if (final_list.length == 0) {
            res.render("entries", { items_list })
          } else {
            res.render("entries", { items_list, final_list })
          }

        }
      })
    }

  })

})

router.post('/app-upload-entries-post', (req, res) => {
  console.log(req.body)
  console.log(req.files)
  var fileList = []
  var userObj;
  if (Array.isArray(req.files) == true) {

    if (req.files.file) {
      for (var i = 0; i < req.files.file.length; i++) {

        userObj = {
          userid: req.body.id[i],
          itemname: req.body.itemname[i],

        }


        var lis_ = []
        lis_.push(userObj)
        let file_ = req.files.file[i]
        file_["userData"] = lis_
        var msg;
        if (file_.mimetype == "application/pdf" || file_.mimetype == "image/png" || file_.mimetype == "image/jpeg" || file_.mimetype == "image/jpg") {
          judgeFunctions.insertWorkEntries(file_).then((d) => {
            msg = "Done !"
            res.render("upload_done", { msg })

            console.log(d)
          })
        } else {
          msg = "Something went wrong, Try again"
          res.render("upload_done", { msg })
        }


      }

    }
  }else{
    console.log("files not an array")
    userObj={
      userid:req.body.id,
      itemname:req.body.itemname,
    }
    console.log(userObj)
    var files_=req.files.file
    var lis__=[]
    lis__.push(userObj)
    console.log(files_)
    files_["userData"]=lis__
    console.log(files_)

    if (files_.mimetype == "application/pdf" || files_.mimetype == "image/png" || files_.mimetype == "image/jpeg" || files_.mimetype == "image/jpg") {
      judgeFunctions.insertWorkEntries(files_).then((d) => {
        msg = "Done !"
        res.render("upload_done", { msg })

        console.log(d)
      })
    } else {
      msg = "Something went wrong, Try again"
      res.render("upload_done", { msg })
    }


  }
})
router.get('/get-entries/:chestno', (req, res) => {
  const directoryPath = './public/work_entries/';

  var userid;
  var chestno = req.params.chestno
  judgeFunctions.checkUserChest(req.params.chestno).then((dd) => {
    userid = dd.userid
  })
  judgeFunctions.getAllEntries().then((details) => {
    var sum = 0
    for (var i = 0; i < details.length; i++) {
      console.log(details[i])
      var user_id = details[i].userData[0].userid
      var item_name = details[i].userData[0].itemname
      var data = details[i].data

      console.log(data.buffer)

      if (user_id == userid) {

        if (details[i].mimetype == "application/pdf") {
          fs.writeFile("./public/work_entries/" + "@" + item_name + "@" + chestno + "@" + ".pdf", data.buffer, function (err) {
            if (err) {
              return console.log(err);
            }

            sum = sum + 1
            console.log("The file was saved!");
            if (sum == details.length) {
              var item_lis_ = []
              fs.readdir(directoryPath, function (err, files) {
                //handling error
                if (err) {
                  return console.log('Unable to scan directory: ' + err);
                }

                //listing all files using forEach
                files.forEach(function (file) {

                  var file_string_List = file.split("@")
                  var tempObj = {
                    itemname: file_string_List[1],
                    filename: file,
                  }
                  item_lis_.push(tempObj)
                  console.log(file_string_List)
                  // Do whatever you want to do with the file
                  console.log(file);
                });
              });

              res.render("work_list", { item_lis_, chestno })
            }
          });
        }
        if (details[i].mimetype == "image/png") {
          fs.writeFile("./public/work_entries/" + "@" + item_name + "@" + chestno + "@" + ".png", data.buffer, function (err) {
            if (err) {
              return console.log(err);
            }

            sum = sum + 1
            console.log("The file was saved!");
            if (sum == details.length) {
              var item_lis_ = []
              fs.readdir(directoryPath, function (err, files) {
                //handling error
                if (err) {
                  return console.log('Unable to scan directory: ' + err);
                }

                //listing all files using forEach
                files.forEach(function (file) {

                  var file_string_List = file.split("@")
                  var tempObj = {
                    itemname: file_string_List[1],
                    filename: file,
                  }
                  item_lis_.push(tempObj)
                  console.log(file_string_List)
                  // Do whatever you want to do with the file
                  console.log(file);
                });
              });
              res.render("work_list", { item_lis_, chestno })
            }
          });
        }
        if (details[i].mimetype == "image/jpeg") {
          fs.writeFile("./public/work_entries/" + "@" + item_name + "@" + chestno + "@" + ".jpeg", data.buffer, function (err) {
            if (err) {
              return console.log(err);
            }

            sum = sum + 1
            console.log("The file was saved!");
            if (sum == details.length) {
              var item_lis_ = []
              fs.readdir(directoryPath, function (err, files) {
                //handling error
                if (err) {
                  return console.log('Unable to scan directory: ' + err);
                }

                //listing all files using forEach
                files.forEach(function (file) {

                  var file_string_List = file.split("@")
                  var tempObj = {
                    itemname: file_string_List[1],
                    filename: file,
                  }
                  item_lis_.push(tempObj)
                  console.log(file_string_List)
                  // Do whatever you want to do with the file
                  console.log(file);
                });
              });
              res.render("work_list", { item_lis_, chestno })
            }
          });
        }
        if (details[i].mimetype == "image/jpg") {
          fs.writeFile("./public/work_entries/" + "@" + item_name + "@" + chestno + "@" + ".jpg", data.buffer, function (err) {
            if (err) {
              return console.log(err);
            }

            sum = sum + 1
            console.log("The file was saved!");
            if (sum == details.length) {
              var item_lis_ = []
              fs.readdir(directoryPath, function (err, files) {
                //handling error
                if (err) {
                  return console.log('Unable to scan directory: ' + err);
                }

                //listing all files using forEach
                files.forEach(function (file) {

                  var file_string_List = file.split("@")
                  var tempObj = {
                    itemname: file_string_List[1],
                    filename: file,
                  }
                  item_lis_.push(tempObj)
                  console.log(file_string_List)
                  // Do whatever you want to do with the file
                  console.log(file);
                });
              });
              res.render("work_list", { item_lis_, chestno })
            }
          });
        }

        //details[i].mv('./public/work_entries/'+userid+"@"+item_name+"@"+chestno+"@"+details[i].name)
      }else{
        console.log("else block")
        var workNotFound="yes"
        res.render("work_list", {workNotFound})
      }
    }

  })
})
router.get('/delete-works/:id', (req, res) => {
  console.log(req.params.id)
  var directoryPath = './public/work_entries/'
  fs.readdir(directoryPath, function (err, files) {
    console.log(files.length)
    //handling error
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    if (files.length == 0) {
      res.redirect("/judge")
    } else {
      sum = 0
      //listing all files using forEach
      files.forEach(function (file) {
        var file_lis = file.split("@")
        console.log(file_lis)
        if (file_lis[2] == req.params.id) {
          fs.unlink(path.join(directoryPath, file), function (err) {
            if (err) throw err;
            // if no error, file has been deleted successfully
            sum = sum + 1
            console.log('File deleted!');

            if (files.length == sum) {
              res.redirect('/judge')
            }
          });

        }
        // Do whatever you want to do with the file
        console.log(file);
      });
    }

  });

})

router.get('/back-home', (req, res) => {
  res.redirect("/judge")
})
module.exports = router;

