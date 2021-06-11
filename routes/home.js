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
  //console.log(req.body)
  if (key == req.body.key) {
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
                eventFunctions.getRegisteredDetails(req.params.id).then((register_data_)=>{
                  
                  


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
                  var users=[]
                  if(Array.isArray(register_data_.itemname) == false){
                    
                     var list_obj = {
                        name: register_data_.name,
                        email: register_data_.email,
                        chestno: register_data_.chessno,
                        itemname: register_data_.itemname,
                      }
                      users.push(list_obj)
    
                    
                  }else{
                    
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
                  var users=[]
                  if(Array.isArray(register_data_.itemname) == false){
                    
                     var list_obj = {
                        name: register_data_.name,
                        email: register_data_.email,
                        chestno: register_data_.chessno,
                        itemname: register_data_.itemname,
                      }
                      users.push(list_obj)
    
                    
                  }else{
                    
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
router.get('/app-upload-entries/:id',(req,res)=>{

  eventFunctions.getRegisteredDetails(req.params.id).then((k)=>{
    var items=[]
    var items_list=[]
    if(Array.isArray(k.itemname) == false){
      items.push(k.itemname)
    }else{
      items=k.itemname
    }
    sum=0
    for(var i=0;i<items.length;i++){
      judgeFunctions.getGroup_or_Solo(items[i]).then((m)=>{
        sum=sum+1
        console.log("sum")
        console.log(sum)
        if(m.subtype == "drawing" || m.subtype == "literature" || m.subtype == "craft"){
          var obj_={
            itemname:m.itemname,
            time:m.time,
            date:m.date,
            duration:m.duration,
          }
          items_list.push(obj_)
          // console.log(items_list)
        }
        if(sum==items.length){
          var today = new Date();
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
          var yyyy = today.getFullYear();
          var timeNow=String(today.getHours)+':'+String(today.getMinutes)
          var todayDate = yyyy + '-' + mm + '-' + dd;
          console.log(todayDate)
          var final_list=[]
          for(var j=0;j<items_list.length;j++){
            if(items_list[j].date == todayDate && items_list[j].time == timeNow){
              var finalObj={
                itemname:items_list[j].itemname,
                time:items_list[j].time,
                date:items_list[j].date,
                duration:items[j].duration,
              }
              final_list.push(finalObj)
            }
          }
          console.log(items_list)
          console.log("time list")
          console.log(final_list)
          res.send({items_list,final_list})
        }
      })
    }

  })

})

router.post('/app-upload-entries-post',(req,res)=>{

})

module.exports = router;

