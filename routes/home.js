var express = require('express');
const session = require('express-session');
var nodemailer = require('nodemailer');
const { registerEvent } = require('../functions/event-functions');
var router = express.Router();
var db = require('../config/connection')
var collection = require('../config/collection')
var eventFunctions = require('../functions/event-functions')
const userFunctions = require('../functions/user-functions')
const judgeFunctions = require('../functions/judge-functions');
const { response } = require('express');

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

router.get('/app-winner-announce', function (req, res){
  var winnerAnnounce=true;
  judgeFunctions.announceWinners(winnerAnnounce).then((data)=>{
    res.redirect('/admin')
  })

})

router.get('/app-winner-stop-announce', function (req, res){
  var winnerAnnounce=false;
  judgeFunctions.announceWinners(winnerAnnounce).then((data)=>{
    res.redirect('/admin')
  })

})

router.get('/app-get-winner', function (req, res) {
  judgeFunctions.getAnnounceWinner().then((A_winner)=>{
    console.log(A_winner.winners)
    if(A_winner.winners == true){

      eventFunctions.getAllwinners().then((data) => {
        console.log(data)
        console.log("-------reversed array------")
        console.log(data.reverse())
    
        res.send(data)
      })

    }else{
      var winnerList=[]
      var winnerObj={
        _id:'default_landing_image',
        name:'Welcome to Aagneya',
        department:' ',
        semester:' ',
        description:'From IES College of Engineering'

      }
      winnerList.push(winnerObj)
      res.send(winnerList)

    }
    
  })
  
})

router.get('/app-get-gallery-photos', function (req, res) {
  eventFunctions.getAllimages().then((response) => {
    console.log(response);

    res.send(response)
  })
})

router.get('/app-open-registration', function(req,res){
  var value=true
  judgeFunctions.openRegistration(value).then((data)=>{
    res.redirect('/admin')
  })
})

router.get('/app-close-registration', function(req,res){
  var value=false
  judgeFunctions.openRegistration(value).then((data)=>{
    res.redirect('/admin')
  })
})

router.get('/app-event-register/:id', function (req, res) {

  judgeFunctions.get_oc_registration().then((data)=>{
    if(data.registration == true){

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

    }else{
      res.render('register_close')
    }
  })

  

})


router.get('/app-find-kalaprathibha',(req,res)=>{
  var awardList_final=[]
  eventFunctions.getAllRegisteredDetails().then((R_data)=>{
    for(var i=0;i<R_data.length;i++){
      console.log("its here")
      if(R_data[i].marks){
        console.log("loop2")
        var _chestno=R_data[i].chessno
        var chestno=_chestno[0]
        if(R_data[i].gender == 'male'){
          console.log("male loop")
          var markList=R_data[i].marks
          for(var j=0;j<markList.length;j++){
            if(markList[j].itemtype == 'onstage' && markList[j].grouporsolo == 'solo'){
              var markSumList=[]
              var _mark=markList[j].mark
              markSumList.push(_mark)
              var final_sum = markSumList
              .reduce((a, b) => {
                return a + b;
              });

              var awardListObj={
                "chestno":chestno,
                "tmark":final_sum,
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

    var finalObj_=awardList_final[awardList_final.length - 1]
    var _awardList=[]
    for(var i=0;i<awardList_final.length;i++){
      var tempMark=awardList_final[i].tmark
      var tempChest=awardList_final[i].chestno
      if(tempMark == finalObj_.tmark){
        var tempObj={
          "chestno":tempChest,
          "tmark":tempMark,
        }
        _awardList.push(tempObj)
      }
    }
    console.log("------------award list-------------")
    console.log(_awardList)
    var final_List_=[]
    for(var i=0;i<_awardList.length;i++){
      var _tempChest=_awardList[i].chestno
      var _tempMark=_awardList[i].tmark
      judgeFunctions.checkUserChest([_tempChest]).then((__data)=>{
      
        console.log(__data)
        console.log(_tempMark)
        var final_Obj_={
          "name":__data.name,
          "email":__data.email,
          "department":__data.department,
          "semester":__data.semester,
          "regno":__data.regno,
          "chestno":__data.chessno,
          "gender":__data.gender,
          "tmark":_tempMark,
          "award":"Kalaprathibha",
        }
        final_List_.push(final_Obj_)
        res.render('award-winners',{final_List_})
        

      })
    }
    
  })
})

//TODO 

// router.get('/upload-award-winner/:chest/:tmark/:award',(req,res)=>{
//   console.log(req.params.chest)
//   console.log(req.params.tmark)
//   console.log(req.params.award)
//   var t_mark=Number(req.params.tmark)
//   var award_string=req.params.award
  
//   judgeFunctions.checkUserChest([Number(req.params.chest)]).then((register_d)=>{
//       awardObj={
//         "name":register_d.name,
//         "email":register_d.email,
//         "department":register_d.department,
//         "semester":register_d.semester,
        
//       }
//   })

// })



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
    if (checkList == '') {
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
                      if (checkList == '') {
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
                                    if (checkList == '') {
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
                                      if (checkList == '') {
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
                                        if (checkList == '') {
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
                  
                                         
                                          //send
                                          // res.send({ civilPoints,csePoints,ecePoints,eeePoints,mechPoints,
                                          // civilPercent,csePercent,ecePercent,eeePercent,mechPercent});


                                          res.send({ "civilpoints":civilPoints,"csepoints":csePoints,"ecepoints":ecePoints,"eeepoints":eeePoints,"mechpoints":mechPoints,
                                        "civilpercent":civilPercent,"csepercent":csePercent,"ecepercent":ecePercent,"eeepercent":eeePercent,"mechpercent":mechPercent});
                              
                              
                                })
                                       
                            
                            
                              })
                                     
                          
                          
                            })
        
                             
                  
                  
                    })



  })


})

router.get('/app-get-score-new', function (req, res, next) {

  let user = req.session.user
  console.log('my    ')
  console.log(user)

  eventFunctions.getAllEvents().then((eventDetails) => {
    eventFunctions.getRegisteredDetails().then((registerDetails) => {

      eventFunctions.getScoreCSE().then((details) => {
        console.log(details)
        console.log("marks")

        var length = details.reduce((a, obj) => a + Object.keys(obj).length, 0)
        console.log(length / 12)
        var totalCSE = 0
        for (var i = 0; i < length / 12; i++) {
          if (details[i].marks != null) {
            try {
              var scoreObj = details[i].marks[0].marks
              totalCSE = Number(totalCSE) + Number(scoreObj)
            } catch (error) {
              console.log(error)
            }
          }

        }
        console.log(totalCSE)
        var percentCSE = totalCSE * totalCSE / 100
        console.log(percentCSE)
        // res.render('home', { title: 'Express', user, eventDetails, registerDetails,totalCSE });
        eventFunctions.getScoreECE().then((details) => {
          console.log(details)
          var length = details.reduce((a, obj) => a + Object.keys(obj).length, 0)
          console.log(length / 12)
          var totalECE = 0
          for (var i = 0; i < length / 12; i++) {

            var scoreObj = details[i].marks[0].marks
            totalECE = Number(totalECE) + Number(scoreObj)
          }
          console.log(totalECE)
          var percentECE = totalECE * totalECE / 100
          console.log(percentECE)

          eventFunctions.getScoreMECH().then((details) => {
            console.log(details)
            var length = details.reduce((a, obj) => a + Object.keys(obj).length, 0)
            console.log(length / 12)
            var totalMECH = 0

            for (var i = 0; i < length / 12; i++) {

              var scoreObj = details[i].marks[0].marks
              totalMECH = Number(totalMECH) + Number(scoreObj)
            }
            console.log(totalMECH)
            var percentMECH = totalMECH * totalMECH / 100
            console.log(percentMECH)
            eventFunctions.getScoreEEE().then((details) => {
              console.log(details)
              var length = details.reduce((a, obj) => a + Object.keys(obj).length, 0)
              console.log(length / 12)
              var totalEEE = 0
              for (var i = 0; i < length / 12; i++) {

                var scoreObj = details[i].marks[0].marks
                totalEEE = Number(totalEEE) + Number(scoreObj)
              }
              console.log(totalEEE)
              var percentEEE = totalEEE * totalEEE / 100
              console.log(percentEEE)
              // res.render('home', { title: 'Express', user, eventDetails, registerDetails, totalCSE, totalECE,totalMECH,totalEEE });
              eventFunctions.getScoreCIVIL().then((details) => {
                console.log(details)
                var length = details.reduce((a, obj) => a + Object.keys(obj).length, 0)
                console.log(length / 12)
                var totalCIVIL = 0
                for (var i = 0; i < length / 12; i++) {

                  var scoreObj = details[i].marks[0].marks
                  totalCIVIL = Number(totalCIVIL) + Number(scoreObj)
                }
                console.log(totalCIVIL)
                var percentCIVIL = totalCIVIL * totalCIVIL / 100
                console.log(percentCIVIL)
                res.send({ totalCSE, totalECE, totalMECH, totalEEE, totalCIVIL, percentCSE, percentECE, percentMECH, percentEEE, percentCIVIL });

              })
            })
          })
        })
      })




    })


  })

});


router.get('/app-getAllEvents', function (req, res) {
  eventFunctions.getAllEvents().then((eventDetails) => {
    console.log(eventDetails)
    //console.log(eventDetails.length)   
    res.json(eventDetails)
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


// router.post('/register-for-events/:id', function (req, res) {

//   console.log(req.body)

//   eventFunctions.checkRegister(req.params.id).then((response) => {
//    console.log(response)
//     if(response != null) {

//       var msg='You are already registered'
//       res.render('event-registration',{msg})
//     } else {
//       eventFunctions.registerEvent(req.body).then((response)=>{
//         eventFunctions.getChessNo(req.params.id).then((chessno)=>{
//           eventFunctions.pushChessno(req.params.id,chessno).then((_res)=>{
//             console.log(response)
//             var success='Registration done'
//             res.render('event-registration',{success})
//           })
//         })

//       })
//     }

//   })

// })
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
                var success = 'Registration done'
                res.render('event-registration', { success })
              })
            }

          })
        }

      })
    }

  })

})

module.exports = router;

